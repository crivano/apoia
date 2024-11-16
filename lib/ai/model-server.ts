'use server'

import { redirect } from "next/navigation"
import { enumSortById, ModelProvider } from "./model-types"
import { getPrefs } from "../utils/prefs"

export const assertModel = async () => {
    const prefs = getPrefs()
    for (const provider of enumSortById(ModelProvider)) {
        if (process.env[provider.value.apiKey] || prefs?.env[provider.value.apiKey]) 
            return
    }
    redirect('/prefs')
    return
}

