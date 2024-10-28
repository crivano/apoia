import { CoreMessage } from "ai";

export type TextoType = { descr: string; slug: string; pTexto?: Promise<string>; texto?: string }
export type PromptData = { textos: TextoType[] }
export type PromptTypeParams = {
    structuredOutputs?: { schemaName: string, schemaDescription: string, schema: any },
    format?: (s: string) => string,
    cacheControl?: boolean | number
}
export type PromptType = {
    message: CoreMessage[], params?: PromptTypeParams
}

export type PromptConfigType = { prompt_slug?: string, prompt_name?: string, model_slug?: string, model_name?: string, extra?: string }

export type PromptOptions = {
    overrideSystemPrompt?: string
    overridePrompt?: string
    overrideJsonSchema?: string
    overrideFormat?: string
    overrideModel?: string
    cacheControl?: boolean | number
}

