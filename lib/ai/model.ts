import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { getPrefs } from '../utils/prefs'
import { LanguageModelV1 } from '@ai-sdk/provider'
import { createGroq } from '@ai-sdk/groq'
import { EMPTY_PREFS_COOKIE, PrefsCookieType } from '@/lib/utils/prefs-types';
import { EMPTY_FORM_STATE } from '../ui/form-support'
import { enumSortById, ModelProvider } from './model-types'
import { redirect } from 'next/navigation'

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

export function getApiKeyByModel(model: string, prefs: PrefsCookieType): string {
    const envKey = getEnvKeyByModel(model)
    let s = prefs?.env[envKey]
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

    const apiKey = getApiKeyByModel(model, prefs || EMPTY_PREFS_COOKIE)

    if (getEnvKeyByModel(model) === ModelProvider.ANTHROPIC.apiKey) {
        const anthropic = createAnthropic({ apiKey: apiKey })
        return { model, modelRef: anthropic(model) }
    }
    if (getEnvKeyByModel(model) === ModelProvider.OPENAI.apiKey) {
        const openai = createOpenAI({ apiKey: apiKey })
        return { model, modelRef: openai(model, { structuredOutputs: params?.structuredOutputs }) }
    }
    if (getEnvKeyByModel(model) === ModelProvider.GOOGLE.apiKey) {
        const google = createGoogleGenerativeAI({ apiKey: apiKey })
        return { model, modelRef: google(model, { structuredOutputs: params?.structuredOutputs }) }
    }
    if (getEnvKeyByModel(model) === ModelProvider.GROQ.apiKey) {
        const groq = createGroq({ apiKey: apiKey })
        return { model, modelRef: groq(model, {}) }
    }
    throw new Error(`Model ${model} not found`)
}

