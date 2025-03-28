'use server'

import { redirect } from "next/navigation"
import { enumSortById, ModelProvider } from "./model-types"
import { getPrefs } from "../utils/prefs"

export const hasApiKey = async (): Promise<boolean> => {
    const prefs = getPrefs()
    for (const provider of enumSortById(ModelProvider)) {
        if (process.env[provider.value.apiKey] || prefs?.env[provider.value.apiKey])
            return true
    }
    return false
}

export const hasApiKeyAndModel = async (): Promise<{hasApiKey: boolean, model: string}> => {
    const prefs = getPrefs()
    let hasApiKey = false
    for (const provider of enumSortById(ModelProvider)) {
        if (process.env[provider.value.apiKey] || prefs?.env[provider.value.apiKey])
            hasApiKey = true
    }
    return {hasApiKey, model: prefs?.model}
}

export const assertModel = async () => {
    if (!await hasApiKey()) {
        redirect('/prefs')
    }
}

