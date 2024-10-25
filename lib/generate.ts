'use server'

import { generateText, CoreTool, streamText, StreamTextResult, LanguageModel, streamObject, StreamObjectResult, DeepPartial } from 'ai'
import { IAGenerated } from './mysql-types'
import { Dao } from './mysql'
import { SHA256 } from 'crypto-js'
import { canonicalize } from 'json-canonicalize'
import { createStreamableValue, StreamableValue } from 'ai/rsc'
import { assertCurrentUser } from './user'
import { buildMessages } from './build-messages'
import { PromptOptions } from '@/lib/prompt-types'
import { getModel } from './model'

function calcSha256(messages: any): string {
    return SHA256(canonicalize(messages)).toString()
}

export async function retrieveFromCache(sha256: string, model: string, prompt: string, attempt: number | null): Promise<IAGenerated | undefined> {
    const cached = await Dao.retrieveIAGeneration(null, { sha256, model, prompt, attempt })
    if (cached) return cached
    return undefined
}

export async function saveToCache(sha256: string, model: string, prompt: string, generated: string, attempt: number | null): Promise<number | undefined> {
    const inserted = await Dao.insertIAGeneration(null, { sha256, model, prompt, generation: generated, attempt })
    if (!inserted) return undefined
    return inserted.id
}

export async function generateContent(prompt: string, data: any, attempt?: number): Promise<IAGenerated> {
    // const user = await getCurrentUser()
    // if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })

    const { model, modelRef } = getModel()
    const buildPrompt = await buildMessages(prompt, data)
    const messages = buildPrompt.message
    const structuredOutputs = buildPrompt.params?.structuredOutputs
    const sha256 = calcSha256(messages)

    // write response to a file for debugging
    if (process.env.NODE_ENV === 'development') {
        const fs = require('fs')
        fs.writeFileSync(`/tmp/generating-${prompt}.txt`, `${messages[0].content}\n\n${messages[1]?.content}\n\n---\n\n`)
    }


    // try to retrieve cached generations
    const cached = await retrieveFromCache(sha256, model, prompt, attempt || null)
    if (cached) {
        console.log('cached', prompt)
        return cached
    }

    // Start generating texts
    console.log('generating', prompt)
    const pResult = generateText({
        model: modelRef as LanguageModel,
        messages,
        maxRetries: 1,
        // temperature: 1.5,
    })

    const result = await pResult
    const generated = result.text

    // save to cache
    const id = await saveToCache(sha256, model, prompt, generated, attempt || null) || -1
    return { id, sha256, model, prompt, generation: generated, attempt: attempt || null }
}

export async function streamContent(prompt: string, data: any, date: Date, options?: PromptOptions):

    Promise<StreamTextResult<Record<string, CoreTool<any, any>>> | StreamObjectResult<DeepPartial<any>, any, never> | string> {
    // const user = await getCurrentUser()
    // if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })
    console.log('will build prompt', prompt, data, options)
    const buildPrompt = await buildMessages(prompt, data, options)
    const { model, modelRef } = getModel({ structuredOutputs: !!buildPrompt.params?.structuredOutputs, overrideModel: options?.overrideModel })
    const messages = buildPrompt.message
    const structuredOutputs = buildPrompt.params?.structuredOutputs
    const sha256 = calcSha256(messages)
    const attempt = options?.cacheControl !== true && options?.cacheControl || null

    // try to retrieve cached generations
    if (buildPrompt.params?.cacheControl !== false) {
        const cached = await retrieveFromCache(sha256, model, prompt, attempt)
        if (cached) {
            return cached.generation
        }
    }

    if (!structuredOutputs) {
        // console.log('streaming text', prompt, messages, modelRef)
        const pResult = streamText({
            model: modelRef as LanguageModel,
            messages,
            maxRetries: 1,
            // temperature: 1.5,
            onFinish: async ({ text }) => {
                if (buildPrompt.params?.cacheControl !== false) {
                    await saveToCache(sha256, model, prompt, text, attempt || null)
                }
                // write response to a file for debugging
                if (process.env.NODE_ENV === 'development') {
                    const fs = require('fs')
                    const currentDate = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').split('.')[0]
                    fs.writeFileSync(`/tmp/${currentDate}-${prompt}.txt`, `${messages[0].content}\n\n${messages[1]?.content}\n\n---\n\n${text}`)
                }
            }
        })
        return pResult
    } else {
        // console.log('streaming object', prompt, messages, modelRef, structuredOutputs.schema)
        const pResult = streamObject({
            model: modelRef as LanguageModel,
            messages,
            maxRetries: 1,
            // // temperature: 1.5,
            onFinish: async ({ object }) => {
                if (buildPrompt.params?.cacheControl !== false) {
                    await saveToCache(sha256, model, prompt, JSON.stringify(object), attempt || null)
                }
                // write response to a file for debugging
                if (process.env.NODE_ENV === 'development') {
                    const fs = require('fs')
                    const currentDate = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').split('.')[0]
                    fs.writeFileSync(`/tmp/${currentDate}-${prompt}.txt`, `${messages[0].content}\n\n${messages[1].content}\n\n---\n\n${object}`)
                }
            },
            schemaName: `schema${prompt}`,
            schemaDescription: `A schema for the prompt ${prompt}`,
            schema: structuredOutputs.schema,
        })
        // @ts-ignore-next-line
        return pResult
    }

}

export async function streamValue(prompt: string, data: any, date: Date):
    Promise<StreamableValue> {
    const result = await streamContent(prompt, data, date)
    if (typeof result === 'string') {
        const stream = createStreamableValue()
        stream.append(result)
        stream.done()
        return stream.value
    }
    const stream = createStreamableValue(result.textStream)
    return stream.value
}

export async function evaluate(prompt: string, data: any, evaluation_id: number, evaluation_descr: string | null):
    Promise<boolean> {
    const user = await assertCurrentUser()
    const user_id = await Dao.assertIAUserId(null, user.name)

    if (!user_id) throw new Error('Unauthorized')

    const { model } = getModel()
    const messages = await buildMessages(prompt, data)
    const sha256 = calcSha256(messages)

    // try to retrieve cached generations
    const cached = await retrieveFromCache(sha256, model, prompt, null)
    if (!cached) throw new Error('Generation not found')

    await Dao.evaluateIAGeneration(null, user_id, cached.id, evaluation_id, evaluation_descr)

    return true
}