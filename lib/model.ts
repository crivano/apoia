import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { getModelAndApiKeyCookieValue } from '../app/model/cookie'
import { LanguageModelV1 } from '@ai-sdk/provider'
import { createGroq } from '@ai-sdk/groq'

export function getEnvKeyByModel(model: string): string {
    if (model.startsWith('claude-')) {
        return 'ANTHROPIC_API_KEY'
    } else if (model.startsWith('gpt-')) {
        return 'OPENAI_API_KEY'
    } else if (model.startsWith('gemini-')) {
        return 'GOOGLE_API_KEY'
    } else if (model.startsWith('llama-')) {
        return 'GROQ_API_KEY'
    }
    throw new Error('Invalid model')
}

export function getApiKeyByModel(model: string): string {
    const envKey = getEnvKeyByModel(model)
    const s = process.env[envKey]
    if (s)
        return s
    throw new Error(`API Key ${envKey} not found for model ${model}`)
}

export function getModel(params?: { structuredOutputs: boolean, overrideModel?: string }): { model: string, modelRef: LanguageModelV1 } {
    const byCookie = getModelAndApiKeyCookieValue()
    let model: string, apiKey: string
    if (byCookie) {
        model = byCookie.model
        apiKey = byCookie.apiKey
    } else {
        model = process.env.MODEL as string
        apiKey = getApiKeyByModel(model)
    }

    if (params?.overrideModel && model !== params?.overrideModel) {
        if (getEnvKeyByModel(model) === getEnvKeyByModel(params.overrideModel)) {
            model = params.overrideModel // just replace the model
        } else {
            model = params.overrideModel // replace the model
            apiKey = getApiKeyByModel(model)
        }
    }
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

