'use server'

import { redirect } from "next/navigation"
import { enumSortById, enumSorted, Model, ModelProvider, ModelProviderType } from "./model-types"
import { getPrefs } from "../utils/prefs"
import { envString } from "../utils/env"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createAzure } from "@ai-sdk/azure"
import { createGroq } from "@ai-sdk/groq"
import { createDeepSeek } from "@ai-sdk/deepseek"
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock'
import { LanguageModelV1 } from "ai"
import { EMPTY_PREFS_COOKIE, PrefsCookieType } from '@/lib/utils/prefs-types'
import { getCurrentUser } from "../user"

function getEnvKeyByModel(model: string): string {
    if (model.startsWith('claude-')) {
        return ModelProvider.ANTHROPIC.apiKey
    } else if (model.startsWith('gpt-')) {
        return ModelProvider.OPENAI.apiKey
    } else if (model.startsWith('gemini-')) {
        return ModelProvider.GOOGLE.apiKey
    } else if (model.startsWith('azure-')) {
        return ModelProvider.AZURE.apiKey
    } else if (model.startsWith('aws-')) {
        return ModelProvider.AWS.apiKey
    } else if (model.startsWith('llama-')) {
        return ModelProvider.GROQ.apiKey
    } else if (model.startsWith('deepseek-')) {
        return ModelProvider.DEEPSEEK.apiKey
    }
    throw new Error('Invalid model')
}

function getApiKeyByModel(model: string, prefs: PrefsCookieType, seqTribunalPai?: string): string {
    const envKey = getEnvKeyByModel(model)
    let s = prefs?.env[envKey]
    if (s) return s
    const s2 = envStringPrefixed(envKey, seqTribunalPai)
    if (s2) return s2
    throw new Error(`API Key ${envKey} not found for model ${model}`)
}

export const assertModel = async () => {
    if (!await getSelectedModelName()) {
        redirect('/prefs')
    }
}

function getEnvStringPrefixedIfUserIsAllowed(username: string, key: string, seqTribunalPai?: string): string {
    const usernames = envStringPrefixed('MODEL_ALLOWED_USERS', seqTribunalPai)
    if (usernames && !usernames.includes(username)) return undefined
    const apiKey = envStringPrefixed(key, seqTribunalPai)
    if (!apiKey) return undefined
    return apiKey
}

function envStringPrefixed(key: string, seqTribunalPai: string): string {
    let s: string
    if (seqTribunalPai)
        s = envString(`TRIBUNAL_${seqTribunalPai}_${key}`)
    if (!s)
        s = envString(key)
    return s
}
export type ModelParams = { model: string, apiKey: string, availableApiKeys: string[], apiKeyFromEnv: boolean, defaultModel?: string, selectableModels?: string[], userMayChangeModel: boolean, azureResourceName: string, awsRegion?: string, awsAccessKeyId?: string }
export async function getSelectedModelParams(): Promise<ModelParams> {
    const prefs = await getPrefs()
    const user = await getCurrentUser()
    const seqTribunalPai = user?.corporativo?.[0]?.seq_tribunal_pai

    let model: string
    let azureResourceName: string
    let awsRegion: string
    let awsAccessKeyId: string

    let defaultModel = getEnvStringPrefixedIfUserIsAllowed(user?.preferredUsername, 'MODEL', seqTribunalPai) as string
    let selectableModels = undefined as string[]
    let userMayChangeModel = false

    // user may change model if the MODEL env variable ends with * or if it is a list of models
    // if it is a list of models, the first one is the default model
    if (defaultModel?.includes(',')) {
        selectableModels = defaultModel.split(',')
        defaultModel = selectableModels[0]
    }

    // if it is a single model, the user may change it if it ends with *
    if (defaultModel && defaultModel.endsWith('*')) {
        defaultModel = defaultModel.slice(0, -1)
        userMayChangeModel = true
    }

    azureResourceName = getEnvStringPrefixedIfUserIsAllowed(user?.preferredUsername, ModelProvider.AZURE.resourceName, seqTribunalPai) as string
    awsRegion = getEnvStringPrefixedIfUserIsAllowed(user?.preferredUsername, ModelProvider.AWS.region, seqTribunalPai) as string
    awsAccessKeyId = getEnvStringPrefixedIfUserIsAllowed(user?.preferredUsername, ModelProvider.AWS.accessKeyId, seqTribunalPai) as string

    if (prefs?.model) model = prefs.model
    if (prefs?.env[ModelProvider.AZURE.resourceName]) azureResourceName = prefs.env[ModelProvider.AZURE.resourceName]
    if (prefs?.env[ModelProvider.AWS.region]) awsRegion = prefs.env[ModelProvider.AWS.region]
    if (prefs?.env[ModelProvider.AWS.accessKeyId]) awsAccessKeyId = prefs.env[ModelProvider.AWS.accessKeyId]

    if (!model) model = defaultModel

    const availableApiKeys = Object.values(ModelProvider).filter((model) => getEnvStringPrefixedIfUserIsAllowed(user?.preferredUsername, model.apiKey, seqTribunalPai)).map((model) => model.apiKey)

    let apiKey: string
    if (model) {
        apiKey = getApiKeyByModel(model, prefs || EMPTY_PREFS_COOKIE, seqTribunalPai)
    } else {
        // try to find an available api key
        let provider: ModelProviderType
        for (const p of enumSortById(ModelProvider)) {
            provider = p.value
            apiKey = getEnvStringPrefixedIfUserIsAllowed(user?.preferredUsername, p.value.apiKey, seqTribunalPai)
            if (apiKey) break
            apiKey = prefs?.env[p.value.apiKey]
            if (apiKey) break
        }
        // try to find a model for the api key
        if (apiKey) {
            for (const m of enumSorted(Model)) {
                if (m.value.provider.apiKey === provider.apiKey) {
                    model = m.value.name
                    break
                }
            }
        }
    }

    const envKey = getEnvKeyByModel(model)
    const apiKeyFromEnv = apiKey === getEnvStringPrefixedIfUserIsAllowed(user?.preferredUsername, envKey, seqTribunalPai)

    return { model, apiKey, availableApiKeys, apiKeyFromEnv, defaultModel, selectableModels, userMayChangeModel, azureResourceName, awsRegion, awsAccessKeyId }
}

export async function getSelectedModelName(): Promise<string> {
    return (await getSelectedModelParams()).model
}

export async function getModel(params?: { structuredOutputs: boolean, overrideModel?: string }): Promise<{ model: string, modelRef: LanguageModelV1, apiKeyFromEnv: boolean }> {
    let { model, apiKey, azureResourceName, awsRegion, awsAccessKeyId, apiKeyFromEnv } = await getSelectedModelParams()
    if (params?.overrideModel) model = params.overrideModel


    if (getEnvKeyByModel(model) === ModelProvider.ANTHROPIC.apiKey) {
        const anthropic = createAnthropic({ apiKey })
        return { model, modelRef: anthropic(model), apiKeyFromEnv }
    }
    if (getEnvKeyByModel(model) === ModelProvider.OPENAI.apiKey) {
        const openai = createOpenAI({ apiKey, compatibility: 'strict' })
        return { model, modelRef: openai(model, { structuredOutputs: params?.structuredOutputs }) as unknown as LanguageModelV1, apiKeyFromEnv }
    }
    if (getEnvKeyByModel(model) === ModelProvider.GOOGLE.apiKey) {
        const google = createGoogleGenerativeAI({ apiKey })
        return { model, modelRef: google(model, { structuredOutputs: params?.structuredOutputs }), apiKeyFromEnv }
    }
    if (getEnvKeyByModel(model) === ModelProvider.AZURE.apiKey) {
        const azure = azureResourceName?.startsWith('https')
            ? createAzure({ apiKey, baseURL: azureResourceName })
            : createAzure({ apiKey, resourceName: azureResourceName })
        return { model, modelRef: azure(model.replace('azure-', ''), { structuredOutputs: params?.structuredOutputs }) as unknown as LanguageModelV1, apiKeyFromEnv }
    }
    if (getEnvKeyByModel(model) === ModelProvider.AWS.apiKey) {
        const bedrock = createAmazonBedrock({ region: awsRegion, accessKeyId: awsAccessKeyId, secretAccessKey: apiKey })
        const modelRef = bedrock(model.replace('aws-', ''), {}) as unknown as LanguageModelV1

        // const { text } = await generateText({
        //     model: modelRef,
        //     prompt: 'Write a vegetarian lasagna recipe for 4 people.',
        //   });
        // console.log(text)

        // const result = streamText({
        //     model: modelRef,
        //     messages: [{
        //         role: 'user',
        //         content: 'Write a vegetarian lasagna recipe for 4 people.',
        //     }],
        // });
        // for await (const textPart of result.textStream) 
        //     console.log(textPart);

        return { model, modelRef, apiKeyFromEnv }
    }
    if (getEnvKeyByModel(model) === ModelProvider.GROQ.apiKey) {
        const groq = createGroq({ apiKey })
        return { model, modelRef: groq(model, {}), apiKeyFromEnv }
    }
    if (getEnvKeyByModel(model) === ModelProvider.DEEPSEEK.apiKey) {
        const deepseek = createDeepSeek({ apiKey })
        return { model, modelRef: deepseek(model, {}), apiKeyFromEnv }
    }
    throw new Error(`Model ${model} not found`)
}


