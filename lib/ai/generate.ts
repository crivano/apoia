'use server'

import { CoreTool, streamText, StreamTextResult, LanguageModel, streamObject, StreamObjectResult, DeepPartial, CoreMessage } from 'ai'
import { IAGenerated } from '../db/mysql-types'
import { Dao } from '../db/mysql'
import { assertCurrentUser } from '../user'
import { PromptDataType, PromptDefinitionType, PromptExecutionResultsType, PromptOptionsType } from '@/lib/ai/prompt-types'
import { promptExecuteBuilder, waitForTexts } from './prompt'
import { calcSha256 } from '../utils/hash'
import { envString } from '../utils/env'
import { anonymizeNames } from '../anonym/name-anonymizer'
import { anonymizeText } from '../anonym/anonym'
import { getModel } from './model-server'

export async function retrieveFromCache(sha256: string, model: string, prompt: string, attempt: number | null): Promise<IAGenerated | undefined> {
    const cached = await Dao.retrieveIAGeneration({ sha256, model, prompt, attempt })
    if (cached) return cached
    return undefined
}

export async function saveToCache(sha256: string, model: string, prompt: string, generated: string, attempt: number | null): Promise<number | undefined> {
    const inserted = await Dao.insertIAGeneration({ sha256, model, prompt, generation: generated, attempt })
    if (!inserted) return undefined
    return inserted.id
}

// write response to a file for debugging
function writeResponseToFile(definition: PromptDefinitionType, messages: CoreMessage[], text: string) {
    const path: string = envString('SAVE_PROMPT_RESULTS_PATH') || ''
    if (envString('NODE_ENV') === 'development' && path) {
        const fs = require('fs')
        const currentDate = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').split('.')[0]
        fs.writeFileSync(`${path}/${currentDate}-${definition.kind}.txt`, `${messages[0].content}\n\n${messages[1]?.content}\n\n---\n\n${text}`)
    }
}

export async function generateContent(definition: PromptDefinitionType, data: PromptDataType): Promise<IAGenerated> {
    const results: PromptExecutionResultsType = {}
    const pResult = await streamContent(definition, data, results)
    const stream = await pResult

    let text: string
    if (typeof stream === 'string') {
        text = stream
    } else {
        text = ''
        for await (const textPart of stream.textStream) {
            process.stdout.write(textPart)
            text += textPart
        }
    }

    return {
        id: results.generationId as number,
        sha256: results.sha256 as string,
        model: results.model as string,
        prompt: definition.kind,
        generation: text,
        attempt: definition?.cacheControl !== true && definition?.cacheControl || null
    }
}

export async function streamContent(definition: PromptDefinitionType, data: PromptDataType, results?: PromptExecutionResultsType):
    Promise<StreamTextResult<Record<string, CoreTool<any, any>>, any> | StreamObjectResult<DeepPartial<any>, any, never> | string> {
    // const user = await getCurrentUser()
    // if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })
    console.log('will build prompt', definition.kind)
    await waitForTexts(data)

    if (envString('ANONIMYZE')) {
        data.textos = data.textos.map((datum: any) => {
            let l = datum.label
            if (l) {
                l = anonymizeText(l).text
            }
            let t = datum.texto
            if (t) {
                t = anonymizeText(t).text
            }
            return { ...datum, label: l, texto: t }
        })
    }

    const exec = promptExecuteBuilder(definition, data)
    const messages = exec.message
    const structuredOutputs = exec.params?.structuredOutputs
    const { model, modelRef } = await getModel({ structuredOutputs: !!structuredOutputs, overrideModel: definition.model })
    const sha256 = calcSha256(messages)
    if (results) results.sha256 = sha256
    const attempt = definition?.cacheControl !== true && definition?.cacheControl || null

    // try to retrieve cached generations
    if (definition?.cacheControl !== false) {
        const cached = await retrieveFromCache(sha256, model, definition.kind, attempt)
        if (cached) {
            if (results) results.generationId = cached.id
            return cached.generation
        }
    }

    // writeResponseToFile(definition, messages, "antes de executar")
    // if (1 == 1) throw new Error('Interrupted')

    if (!structuredOutputs) {
        console.log('streaming text', definition.kind) //, messages, modelRef)
        const pResult = streamText({
            model: modelRef as LanguageModel,
            messages,
            maxRetries: 0,
            // temperature: 1.5,
            onFinish: async ({ text }) => {
                if (definition?.cacheControl !== false) {
                    const generationId = await saveToCache(sha256, model, definition.kind, text, attempt || null)
                    if (results) results.generationId = generationId
                }
                writeResponseToFile(definition, messages, text)
            }
        })
        return pResult
    } else {
        console.log('streaming object', definition.kind) //, messages, modelRef, structuredOutputs.schema)
        const pResult = streamObject({
            model: modelRef as LanguageModel,
            messages,
            maxRetries: 1,
            // // temperature: 1.5,
            onFinish: async ({ object }) => {
                if (definition?.cacheControl !== false) {
                    const generationId = await saveToCache(sha256, model, definition.kind, JSON.stringify(object), attempt || null)
                    if (results) results.generationId = generationId
                }
                writeResponseToFile(definition, messages, JSON.stringify(object))
            },
            schemaName: `schema${definition.kind}`,
            schemaDescription: `A schema for the prompt ${definition.kind}`,
            schema: structuredOutputs.schema,
        })
        // @ts-ignore-next-line
        return pResult
    }

}

export async function evaluate(definition: PromptDefinitionType, data: PromptDataType, evaluation_id: number, evaluation_descr: string | null):
    Promise<boolean> {
    const user = await assertCurrentUser()
    const user_id = await Dao.assertIAUserId(user.preferredUsername || user.name)

    if (!user_id) throw new Error('Unauthorized')

    const { model } = await getModel()
    await waitForTexts(data)
    const exec = promptExecuteBuilder(definition, data)
    const messages = exec.message
    const sha256 = calcSha256(messages)

    // try to retrieve cached generations
    const cached = await retrieveFromCache(sha256, model, definition.kind, null)
    if (!cached) throw new Error('Generation not found')

    await Dao.evaluateIAGeneration(user_id, cached.id, evaluation_id, evaluation_descr)

    return true
}