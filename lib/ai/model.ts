import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createAzure } from '@ai-sdk/azure'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { getPrefs } from '../utils/prefs'
import { LanguageModelV1 } from '@ai-sdk/provider'
import { createGroq } from '@ai-sdk/groq'
import { EMPTY_PREFS_COOKIE, PrefsCookieType } from '@/lib/utils/prefs-types';
import { ModelProvider } from './model-types'
import { envString } from '../utils/env'

export function getEnvKeyByModel(model: string): string {
    if (model.startsWith('claude-')) {
        return ModelProvider.ANTHROPIC.apiKey
    } else if (model.startsWith('gpt-')) {
        return ModelProvider.OPENAI.apiKey
    } else if (model.startsWith('gemini-')) {
        return ModelProvider.GOOGLE.apiKey
    } else if (model.startsWith('azure-')) {
        return ModelProvider.AZURE.apiKey
    } else if (model.startsWith('llama-')) {
        return ModelProvider.GROQ.apiKey
    } else if (model.startsWith('deepseek-')) {
        return ModelProvider.DEEPSEEK.apiKey
    }
    throw new Error('Invalid model')
}

export function getApiKeyByModel(model: string, prefs: PrefsCookieType): string {
    const envKey = getEnvKeyByModel(model)
    let s = prefs?.env[envKey]
    if (s) return s
    const s2 = process.env[envKey]
    if (s2) return s2
    throw new Error(`API Key ${envKey} not found for model ${model}`)
}

export async function getModel(params?: { structuredOutputs: boolean, overrideModel?: string }): Promise<{ model: string, modelRef: LanguageModelV1 }> {
    const prefs = await getPrefs()
    let model: string
    let azureResourceName: string
    if (prefs) {
        model = prefs.model
        azureResourceName = prefs.env[ModelProvider.AZURE.resourceName]
    } else {
        model = envString('MODEL') as string
        azureResourceName = envString(ModelProvider.AZURE.resourceName) as string
    }

    if (params?.overrideModel) model = params.overrideModel

    const apiKey = getApiKeyByModel(model, prefs || EMPTY_PREFS_COOKIE)

    if (getEnvKeyByModel(model) === ModelProvider.ANTHROPIC.apiKey) {
        const anthropic = createAnthropic({ apiKey: apiKey })
        return { model, modelRef: anthropic(model) }
    }
    if (getEnvKeyByModel(model) === ModelProvider.OPENAI.apiKey) {
        const openai = createOpenAI({ apiKey: apiKey })
        return { model, modelRef: openai(model, { structuredOutputs: params?.structuredOutputs }) as unknown as LanguageModelV1 }
    }
    if (getEnvKeyByModel(model) === ModelProvider.GOOGLE.apiKey) {
        const google = createGoogleGenerativeAI({ apiKey: apiKey })
        return { model, modelRef: google(model, { structuredOutputs: params?.structuredOutputs }) }
    }
    if (getEnvKeyByModel(model) === ModelProvider.AZURE.apiKey) {
        const azure = azureResourceName?.startsWith('https')
            ? createAzure({ apiKey: apiKey, baseURL: azureResourceName })
            : createAzure({ apiKey: apiKey, resourceName: azureResourceName })
        return { model, modelRef: azure(model.replace('azure-', ''), { structuredOutputs: params?.structuredOutputs }) as unknown as LanguageModelV1 }
    }
    if (getEnvKeyByModel(model) === ModelProvider.GROQ.apiKey) {
        const groq = createGroq({ apiKey: apiKey })
        return { model, modelRef: groq(model, {}) }
    }
    if (getEnvKeyByModel(model) === ModelProvider.DEEPSEEK.apiKey) {
        const deepseek = createDeepSeek({ apiKey: apiKey })
        return { model, modelRef: deepseek(model, {}) }
    }
    throw new Error(`Model ${model} not found`)
}

