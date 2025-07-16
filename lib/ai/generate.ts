'use server'

import { CoreTool, streamText, StreamTextResult, LanguageModel, streamObject, StreamObjectResult, DeepPartial, CoreMessage, generateText } from 'ai'
import { IAGenerated } from '../db/mysql-types'
import { Dao } from '../db/mysql'
import { assertCourtId, assertCurrentUser, UserType } from '../user'
import { PromptDataType, PromptDefinitionType, PromptExecutionResultsType, PromptOptionsType, TextoType } from '@/lib/ai/prompt-types'
import { formatText, promptExecuteBuilder, waitForTexts } from './prompt'
import { calcSha256 } from '../utils/hash'
import { envString } from '../utils/env'
import { anonymizeText } from '../anonym/anonym'
import { getModel } from './model-server'
import { modelCalcUsage } from './model-types'
import { z } from 'zod'
import { tool } from 'ai'
import { CargaDeConteudoEnum, obterDadosDoProcesso } from '../proc/process'
import { slugify } from '../utils/utils'
import { getPieceContentTool as getPiecesTextTool, getProcessMetadataTool } from './tools'

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
function writeResponseToFile(kind: string, messages: CoreMessage[], text: string) {
    const path: string = envString('SAVE_PROMPT_RESULTS_PATH') || ''
    if (envString('NODE_ENV') === 'development' && path) {
        const fs = require('fs')
        const currentDate = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').split('.')[0]
        fs.writeFileSync(`${path}/${currentDate}-${kind}.txt`, `${messages[0].content}\n\n${messages[1]?.content}\n\n---\n\n${text}`)
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

export async function writeUsage(usage, model: string, user_id: number | undefined, court_id: number | undefined) {
    const { promptTokens, completionTokens } = usage
    const calculedUsage = modelCalcUsage(model, promptTokens, completionTokens)
    if (user_id && court_id)
        await Dao.addToIAUserDailyUsage(user_id, court_id, calculedUsage.input_tokens, calculedUsage.output_tokens, calculedUsage.approximate_cost)
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
    const { model, modelRef, apiKeyFromEnv } = await getModel({ structuredOutputs: !!structuredOutputs, overrideModel: definition.model })
    if (results) results.model = model
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

    return generateAndStreamContent(model, structuredOutputs, definition?.cacheControl, definition?.kind, modelRef, messages, sha256, results, attempt, apiKeyFromEnv)
}

export async function generateAndStreamContent(model: string, structuredOutputs: any, cacheControl: number | boolean, kind: string, modelRef: LanguageModel, messages: CoreMessage[], sha256: string, results?: PromptExecutionResultsType, attempt?: number | null, apiKeyFromEnv?: boolean):
    Promise<StreamTextResult<Record<string, CoreTool<any, any>>, any> | StreamObjectResult<DeepPartial<any>, any, never> | string> {
    const pUser = assertCurrentUser()
    const user = await pUser
    const user_id = await Dao.assertIAUserId(user.preferredUsername || user.name)
    const court_id = await assertCourtId(user)
    if (!structuredOutputs) {//} || model.startsWith('aws-')) {
        console.log('streaming text', kind) //, messages, modelRef)
        if (apiKeyFromEnv) {
            await Dao.assertIAUserDailyUsageId(user_id, court_id)
        }
        writeResponseToFile(kind, messages, 'antes de executar')
        // if (model.startsWith('aws-')) {
        //     const { text, usage } = await generateText({
        //         model: modelRef as LanguageModel,
        //         messages,
        //         maxRetries: 0,
        //         // temperature: 1.5,
        //     })
        //     writeUsage(usage, model, results?.user_id, results?.court_id)
        //     if (cacheControl !== false) {
        //         const generationId = await saveToCache(sha256, model, kind, text, attempt || null)
        //         if (results) results.generationId = generationId
        //     }
        //     writeResponseToFile(kind, messages, text)
        //     return text
        // } else {
        const pResult = streamText({
            model: modelRef as LanguageModel,
            messages,
            maxRetries: 0,
            onStepFinish: ({ text, usage }) => {
                process.stdout.write(text)
            },
            onFinish: async ({ text, usage }) => {
                if (apiKeyFromEnv)
                    writeUsage(usage, model, user_id, court_id)
                if (cacheControl !== false) {
                    const generationId = await saveToCache(sha256, model, kind, text, attempt || null)
                    if (results) results.generationId = generationId
                }
                writeResponseToFile(kind, messages, text)
            },
            tools: {
                getProcessMetadata: getProcessMetadataTool(pUser),
                getPiecesText: getPiecesTextTool(pUser),
            },
            maxSteps: 5, // Limit the number of steps to avoid infinite loops
        })
        return pResult as any
        // }
    } else {
        console.log('streaming object', kind) //, messages, modelRef, structuredOutputs.schema)
        if (apiKeyFromEnv) {
            await Dao.assertIAUserDailyUsageId(user_id, court_id)
        }
        const pResult = streamObject({
            model: modelRef as LanguageModel,
            messages,
            maxRetries: 1,
            onFinish: async ({ object, usage }) => {
                if (apiKeyFromEnv)
                    writeUsage(usage, model, user_id, court_id)
                if (cacheControl !== false) {
                    const generationId = await saveToCache(sha256, model, kind, JSON.stringify(object), attempt || null)
                    if (results) results.generationId = generationId
                }
                writeResponseToFile(kind, messages, JSON.stringify(object))
            },
            schemaName: `schema${kind}`,
            schemaDescription: `A schema for the prompt ${kind}`,
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