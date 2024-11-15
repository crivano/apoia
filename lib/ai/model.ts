import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { getModelAndApiKeyCookieValue as getPrefs } from '../utils/prefs'
import { LanguageModelV1 } from '@ai-sdk/provider'
import { createGroq } from '@ai-sdk/groq'
import { EMPTY_MODEL_COOKIE, ModelCookieType, ModelProvider } from './model-types'
import { EMPTY_FORM_STATE } from '../ui/form-support'

export function getEnvKeyByModel(model: string): string {
    if (model.startsWith('claude-')) {
        return ModelProvider.ANTHROPIC.apiKey
    } else if (model.startsWith('gpt-')) {
        return ModelProvider.OPENAI.apiKey
    } else if (model.startsWith('gemini-')) {
        return ModelProvider.GOOGLE.apiKey
    } else if (model.startsWith('llama-')) {
        return ModelProvider.GROQ.apiKey
    }
    throw new Error('Invalid model')
}

export function getApiKeyByModel(model: string, cookie: ModelCookieType): string {
    const envKey = getEnvKeyByModel(model)
    let s = cookie?.params[envKey]
    if (s) return s
    const s2 = process.env[envKey]
    if (s2) return s2
    throw new Error(`API Key ${envKey} not found for model ${model}`)
}

export function getModel(params?: { structuredOutputs: boolean, overrideModel?: string }): { model: string, modelRef: LanguageModelV1 } {
    const prefs = getPrefs()
    let model: string
    if (prefs) {
        model = prefs.model
    } else {
        model = process.env.MODEL as string
    }

    if (params?.overrideModel) model = params.overrideModel

    const apiKey = getApiKeyByModel(model, prefs || EMPTY_MODEL_COOKIE)

    if (getEnvKeyByModel(model) === 'ANTHROPIC_API_KEY') {
        const anthropic = createAnthropic({ apiKey: apiKey })
        return { model, modelRef: anthropic(model) }
    }
    if (getEnvKeyByModel(model) === 'OPENAI_API_KEY') {
        const openai = createOpenAI({ apiKey: apiKey })
        return { model, modelRef: openai(model, { structuredOutputs: params?.structuredOutputs }) }
    }
    if (getEnvKeyByModel(model) === 'GOOGLE_API_KEY') {
        const google = createGoogleGenerativeAI({ apiKey: apiKey })
        return { model, modelRef: google(model, { structuredOutputs: params?.structuredOutputs }) }
    }
    if (getEnvKeyByModel(model) === 'GROQ_API_KEY') {
        const groq = createGroq({ apiKey: apiKey })
        return { model, modelRef: groq(model, {}) }
    }
    throw new Error(`Model ${model} not found`)
}

