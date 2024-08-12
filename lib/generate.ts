'use server'

import prompts, { PromptData } from '../prompts/_prompts'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText, GenerateTextResult, CoreTool, streamText, StreamTextResult, LanguageModel } from 'ai'
import { getModelAndApiKeyCookieValue } from '../app/model/cookie'
import { retrieveIAGeneration, insertIAGeneration, IAGenerated, assertIAUserId, evaluateIAGeneration } from './mysql'
import { SHA256 } from 'crypto-js'
import { canonicalize } from 'json-canonicalize'
import { createStreamableValue, StreamableValue } from 'ai/rsc'
import { assertCurrentUser } from './user'
import build from 'next/dist/build'

function getModel() {
    const { model, apiKey, automatic } = getModelAndApiKeyCookieValue()
    if (model.startsWith('claude-')) {
        const anthropic = createAnthropic({ apiKey: apiKey })
        return { model, modelRef: anthropic(model === 'claude-3-5-sonnet' ? 'claude-3-5-sonnet-20240620' : model) }
    }
    const openai = createOpenAI({ apiKey: apiKey })
    return { model, modelRef: openai(model) }
}

export async function buildMessages(prompt: string, data: any) {
    if (data?.textos) {
        for (const texto of data.textos) {
            if (!texto.pTexto) continue
            texto.texto = await texto.pTexto
        }
    }
    const promptUnderscore = prompt.replace(/-/g, '_')
    let buildPrompt = prompts[promptUnderscore]
    if (!buildPrompt && prompt.startsWith('resumo-')) {
        prompt = 'resumo_peca'
        buildPrompt = prompts[prompt]
    }
    const messages = buildPrompt(data)
    return messages
}

function calcSha256(messages: any): string {
    return SHA256(canonicalize(messages)).toString()
}

export async function retrieveFromCache(sha256: string, model: string, prompt: string): Promise<IAGenerated | undefined> {
    const cached = await retrieveIAGeneration({ sha256, model, prompt })
    if (cached) return cached
    return undefined
}

export async function saveToCache(sha256: string, model: string, prompt: string, generated: string): Promise<number | undefined> {
    const inserted = await insertIAGeneration({ sha256, model, prompt, generation: generated })
    if (!inserted) return undefined
    return inserted.id
}

export async function generateContent(prompt: string, data: any): Promise<IAGenerated> {
    // const user = await getCurrentUser()
    // if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })

    const { model, modelRef } = getModel()
    const messages = await buildMessages(prompt, data)
    const sha256 = calcSha256(messages)

    // write response to a file for debugging
    if (process.env.NODE_ENV === 'development') {
        const fs = require('fs')
        fs.writeFileSync(`/tmp/generating-${prompt}.txt`, `${messages[0].content}\n\n${messages[1].content}\n\n---\n\n`)
    }


    // try to retrieve cached generations
    const cached = await retrieveFromCache(sha256, model, prompt)
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
    const id = await saveToCache(sha256, model, prompt, generated) || -1
    return { id, sha256, model, prompt, generation: generated }
}

export async function streamContent(prompt: string, data: any, date: Date):
    Promise<StreamTextResult<Record<string, CoreTool<any, any>>> | string> {
    // const user = await getCurrentUser()
    // if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })

    const { model, modelRef } = getModel()
    const messages = await buildMessages(prompt, data)
    const sha256 = calcSha256(messages)

    // try to retrieve cached generations
    const cached = await retrieveFromCache(sha256, model, prompt)
    if (cached) {
        return cached.generation
    }

    // Start generating texts
    console.log('streaming', prompt)

    const pResult = streamText({
        model: modelRef as LanguageModel,
        messages,
        maxRetries: 1,
        // temperature: 1.5,
        onFinish: async ({ text }) => {
            await saveToCache(sha256, model, prompt, text)
            // write response to a file for debugging
            if (process.env.NODE_ENV === 'development') {
                const fs = require('fs')
                fs.writeFileSync(`/tmp/${prompt}.txt`, `${messages[0].content}\n\n${messages[1].content}\n\n---\n\n${text}`)
            }
        }
    })

    return pResult
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
    const user_id = await assertIAUserId(user.name)

    if (!user_id) throw new Error('Unauthorized')

    const { model } = getModel()
    const messages = await buildMessages(prompt, data)
    const sha256 = calcSha256(messages)

    // try to retrieve cached generations
    const cached = await retrieveFromCache(sha256, model, prompt)
    if (!cached) throw new Error('Generation not found')

    await evaluateIAGeneration(user_id, cached.id, evaluation_id, evaluation_descr)

    return true
}