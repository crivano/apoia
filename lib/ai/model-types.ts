import { StatusDeLancamento } from "../proc/process-types"
import { slugify } from "../utils/utils"

export type EnumOfObjectsValueType = { id: number, name: string, sort: number }
export type EnumOfObjectsType = { [key: string]: EnumOfObjectsValueType }

const ModelProviderArray = [
    { id: 2, name: 'OpenAI', apiKey: 'OPENAI_API_KEY', apiKeyRegex: /^sk-proj-[a-zA-Z0-9_]{48,164}$/, status: StatusDeLancamento.PUBLICO },
    { id: 1, name: 'Anthropic', apiKey: 'ANTHROPIC_API_KEY', apiKeyRegex: /^sk-[a-zA-Z0-9_-]{100,110}$/, status: StatusDeLancamento.PUBLICO },
    { id: 3, name: 'Google', apiKey: 'GOOGLE_API_KEY', apiKeyRegex: /^AI[a-zA-Z0-9]{37}$/, status: StatusDeLancamento.PUBLICO },
    { id: 4, name: 'Azure', apiKey: 'AZURE_API_KEY', resourceName: 'AZURE_RESOURCE_NAME', apiKeyRegex: /^[a-zA-Z0-9]{84}$/, status: StatusDeLancamento.PUBLICO },
    { id: 5, name: 'Groq', apiKey: 'GROQ_API_KEY', apiKeyRegex: /^gsk_[a-zA-Z0-9]{52}$/, status: StatusDeLancamento.EM_DESENVOLVIMENTO },
    { id: 6, name: 'DeepSeek', apiKey: 'DEEPSEEK_API_KEY', apiKeyRegex: /^sk-[a-zA-Z0-9]{32}$/, status: StatusDeLancamento.EM_DESENVOLVIMENTO },
]

export type ModelProviderValueType = EnumOfObjectsValueType & { apiKey: string, resourceName?: string, apiKeyRegex: RegExp, status: StatusDeLancamento }
export type ModelProviderType = { [key: string]: ModelProviderValueType }

// export const ModelProvider: ModelProviderType = {
//     OPENAI: { sort: 1, id: 2, name: 'OpenAI', apiKey: 'OPENAI_API_KEY', apiKeyRegex: /^sk-proj-[a-zA-Z0-9_]{48,164}$/ },
//     ANTHROPIC: { sort: 2, id: 1, name: 'Anthropic', apiKey: 'ANTHROPIC_API_KEY', apiKeyRegex: /^sk-[a-zA-Z0-9_-]{100,110}$/ },
//     GOOGLE: { sort: 3, id: 3, name: 'Google', apiKey: 'GOOGLE_API_KEY', apiKeyRegex: /^AI[a-zA-Z0-9]{37}$/ },
//     GROQ: { sort: 4, id: 4, name: 'Groq', apiKey: 'GROQ_API_KEY', apiKeyRegex: /^gsk_[a-zA-Z0-9]{52}$/ },
//     DEEPSEEK: { sort: 5, id: 5, name: 'DeepSeek', apiKey: 'DEEPSEEK_API_KEY', apiKeyRegex: /^sk-[a-zA-Z0-9]{32}$/ },
// }

export const ModelProvider: ModelProviderType = ModelProviderArray.reduce((acc, cur, idx) => {
    acc[slugify(cur.name).replaceAll('-', '_').toUpperCase()] = { ...cur, sort: idx + 1 }
    return acc
}, {} as ModelProviderType)

const ModelArray = [
    { id: 3, name: 'gpt-4o-mini-2024-07-18', provider: ModelProvider.OPENAI, status: StatusDeLancamento.PUBLICO },
    { id: 7, name: 'gpt-4o-2024-11-20', provider: ModelProvider.OPENAI, status: StatusDeLancamento.PUBLICO },
    { id: 1, name: 'gpt-4o-2024-08-06', provider: ModelProvider.OPENAI, status: StatusDeLancamento.PUBLICO },
    { id: 13, name: 'claude-3-7-sonnet-20250219', provider: ModelProvider.ANTHROPIC, status: StatusDeLancamento.PUBLICO },
    { id: 2, name: 'claude-3-5-sonnet-20241022', provider: ModelProvider.ANTHROPIC, status: StatusDeLancamento.PUBLICO },
    { id: 14, name: 'claude-3-5-haiku-20241022', provider: ModelProvider.ANTHROPIC, status: StatusDeLancamento.PUBLICO },
    { id: 9, name: 'gemini-2.0-flash', provider: ModelProvider.GOOGLE, status: StatusDeLancamento.PUBLICO },
    { id: 10, name: 'gemini-2.0-pro-exp-02-05', provider: ModelProvider.GOOGLE, status: StatusDeLancamento.PUBLICO },
    { id: 4, name: 'gemini-1.5-pro-002', provider: ModelProvider.GOOGLE, status: StatusDeLancamento.PUBLICO },
    { id: 5, name: 'llama-3.2-90b-text-preview', provider: ModelProvider.GROQ, status: StatusDeLancamento.EM_DESENVOLVIMENTO },
    { id: 6, name: 'llama-3.1-70b-versatile', provider: ModelProvider.GROQ, status: StatusDeLancamento.EM_DESENVOLVIMENTO },
    { id: 8, name: 'deepseek-chat', provider: ModelProvider.DEEPSEEK, status: StatusDeLancamento.EM_DESENVOLVIMENTO },
    { id: 11, name: 'azure-gpt-4o', provider: ModelProvider.AZURE, status: StatusDeLancamento.PUBLICO },
    { id: 12, name: 'azure-gpt-4o-mini', provider: ModelProvider.AZURE, status: StatusDeLancamento.PUBLICO },
]

export type ModelValeuType = EnumOfObjectsValueType & { provider: ModelProviderValueType, status: StatusDeLancamento }
export type ModelType = { [key: string]: ModelValeuType }

export const Model: ModelType = ModelArray.reduce((acc, cur, idx) => {
    acc[slugify(cur.name).replaceAll('-', '_').toUpperCase()] = { ...cur, sort: idx + 1 }
    return acc
}, {} as ModelType)

// export const Model: ModelType = {
//     GPT_4_O_MINI_2024_07_18:
//         { sort: 1, id: 3, name: 'gpt-4o-mini-2024-07-18', provider: ModelProvider.OPENAI, status: StatusDeLancamento.PUBLICO },
//     GPT_4_O_2024_11_20:
//         { sort: 2, id: 7, name: 'gpt-4o-2024-11-20', provider: ModelProvider.OPENAI, status: StatusDeLancamento.PUBLICO },
//     GPT_4_O_2024_08_06:
//         { sort: 3, id: 1, name: 'gpt-4o-2024-08-06', provider: ModelProvider.OPENAI, status: StatusDeLancamento.PUBLICO },
//     CLAUDE_3_5_SONNET_20241022:
//         { sort: 4, id: 2, name: 'claude-3-5-sonnet-20241022', provider: ModelProvider.ANTHROPIC, status: StatusDeLancamento.PUBLICO },
//     GEMINI_1_5_PRO_002:
//         { sort: 5, id: 4, name: 'gemini-1.5-pro-002', provider: ModelProvider.GOOGLE, status: StatusDeLancamento.PUBLICO },
//     LLAMA_3_2_90B_TEXT_PREVIEW:
//         { sort: 6, id: 5, name: 'llama-3.2-90b-text-preview', provider: ModelProvider.GROQ, status: StatusDeLancamento.EM_DESENVOLVIMENTO },
//     LLAMA_3_1_70B_VERSATILE:
//         { sort: 7, id: 6, name: 'llama-3.1-70b-versatile', provider: ModelProvider.GROQ, status: StatusDeLancamento.EM_DESENVOLVIMENTO },
//     DEEPSEEK_CHAT:
//         { sort: 8, id: 8, name: 'deepseek-chat', provider: ModelProvider.DEEPSEEK, status: StatusDeLancamento.EM_DESENVOLVIMENTO },
//     // DEEPSEEK_REASONER:
//     //     { id: 9, name: 'deepseek-reasoner', provider: ModelProvider.DEEPSEEK }
// }

// export const ModelArray: ModelValeuType[] = [
//     { sort: 1, id: 3, name: 'gpt-4o-mini-2024-07-18', provider: ModelProvider.OPENAI },
//     { sort: 2, id: 7, name: 'gpt-4o-2024-11-20', provider: ModelProvider.OPENAI },
//     { sort: 3, id: 1, name: 'gpt-4o-2024-08-06', provider: ModelProvider.OPENAI },
//     { sort: 4, id: 2, name: 'claude-3-5-sonnet-20241022', provider: ModelProvider.ANTHROPIC },
//     { sort: 5, id: 4, name: 'gemini-1.5-pro-002', provider: ModelProvider.GOOGLE },
//     { sort: 6, id: 5, name: 'llama-3.2-90b-text-preview', provider: ModelProvider.GROQ },
//     { sort: 7, id: 6, name: 'llama-3.1-70b-versatile', provider: ModelProvider.GROQ },
//     { sort: 8, id: 8, name: 'deepseek-chat', provider: ModelProvider.DEEPSEEK },
//     // { id: 9, name: 'deepseek-reasoner', provider: ModelProvider.DEEPSEEK },
// ]

export function enumSortById(e: EnumOfObjectsType): any[] {
    const r: { key: string, value: EnumOfObjectsValueType }[] = Object.entries(e).map(([key, value]) => ({ key, value }))
    return r.sort((a, b) => a.value.id - b.value.id)
}

export function enumSorted(e: EnumOfObjectsType): any[] {
    const r: { key: string, value: EnumOfObjectsValueType }[] = Object.entries(e).map(([key, value]) => ({ key, value }))
    return r.sort((a, b) => a.value.sort - b.value.sort)
}
