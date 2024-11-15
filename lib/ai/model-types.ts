
export type EnumOfObjectsValueType = { id: number, name: string }
export type EnumOfObjectsType = { [key: string]: EnumOfObjectsValueType }

export type ModelProviderValueType = EnumOfObjectsValueType & { apiKey: string }
export type ModelProviderType = { [key: string]: ModelProviderValueType }
export const ModelProvider: ModelProviderType = {
    ANTHROPIC: { id: 1, name: 'Anthropic', apiKey: 'ANTHROPIC_API_KEY' },
    OPENAI: { id: 2, name: 'OpenAI', apiKey: 'OPENAI_API_KEY' },
    GOOGLE: { id: 3, name: 'Google', apiKey: 'GOOGLE_API_KEY' },
    GROQ: { id: 4, name: 'Groq', apiKey: 'GROQ_API_KEY' }
}

export type ModelValeuType = EnumOfObjectsValueType & { provider: ModelProviderValueType }
export type ModelType = { [key: string]: ModelValeuType }
export const Model: ModelType = {
    GPT_4_O_2024_08_06:
        { id: 1, name: 'gpt-4o-2024-08-06', provider: ModelProvider.OPENAI },
    CLAUDE_3_5_SONNET_20241022:
        { id: 2, name: 'claude-3-5-sonnet-20241022', provider: ModelProvider.ANTHROPIC },
    GPT_4_O_MINI_2024_07_18:
        { id: 3, name: 'gpt-4o-mini-2024-07-18', provider: ModelProvider.OPENAI },
    GEMINI_1_5_PRO_002:
        { id: 4, name: 'gemini-1.5-pro-002', provider: ModelProvider.GOOGLE },
    LLAMA_3_2_90B_TEXT_PREVIEW:
        { id: 5, name: 'llama-3.2-90b-text-preview', provider: ModelProvider.GROQ },
}

export const ModelArray: ModelValeuType[] = [
    { id: 1, name: 'gpt-4o-2024-08-06', provider: ModelProvider.OPENAI },
    { id: 2, name: 'claude-3-5-sonnet-20241022', provider: ModelProvider.ANTHROPIC },
    { id: 3, name: 'gpt-4o-mini-2024-07-18', provider: ModelProvider.OPENAI },
    { id: 4, name: 'gemini-1.5-pro-002', provider: ModelProvider.GOOGLE },
    { id: 5, name: 'llama-3.2-90b-text-preview', provider: ModelProvider.GROQ },
]

export function enumSortById(e: EnumOfObjectsType): any[] {
    const r: { key: string, value: EnumOfObjectsValueType }[] = Object.entries(e).map(([key, value]) => ({ key, value }))
    return r.sort((a, b) => a.value.id - b.value.id)
}

export const EMPTY_MODEL_COOKIE: ModelCookieType = { model: '', params: {} }
export type ModelCookieType = { model: string, params: { [key: string]: string } }

