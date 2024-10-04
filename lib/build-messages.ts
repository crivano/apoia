import prompts, { PromptType } from '../prompts/_prompts'

export type PromptOptions = {
    overrideSystemPrompt?: string
    overridePrompt?: string
    overrideJsonSchema?: string
    overrideFormat?: string
}

function(data: any, options: PromptOptions): PromptType {
    let structuredOutputs: {
        schemaName: string;
        schemaDescription: string;
        schema: any;
    } | undefined = undefined
    if (options.overrideJsonSchema) {
        structuredOutputs = { schemaName: 'test', schemaDescription: 'test', schema: options.overrideJsonSchema }
    }

    let format: ((s: string) => string) | undefined = undefined
    if (options.overrideFormat) {
        format = (s: string) => options.overrideFormat as string
    }

    const result: PromptType = {
        message: [],
        params: { structuredOutputs, format }
    }

    if (options.overrideSystemPrompt) {
        (result.message as any[]).push({ role: 'system', content: options.overrideSystemPrompt })
    }

    let promptText = options.overridePrompt as string
    const prompt: string = promptText.replace('{{textos}}', `${data.textos.reduce((acc, txt) => acc + `${txt.descr}:\n<${txt.slug}>\n${txt.texto}\n</${txt.slug}>\n\n`, '')}`)
    if (prompt) {
        (result.message as any[]).push({ role: 'user', content: prompt })
    }

    return result
}

export function getPromptIdentifier(prompt: string) {
    let promptUnderscore = prompt.replace(/-/g, '_')
    let buildPrompt = prompts[promptUnderscore]
    if (!buildPrompt && prompt.startsWith('resumo-')) {
        promptUnderscore = 'resumo_peca'
    }
    return promptUnderscore

}

function getBuildPrompt(prompt: string) {
    return prompts[getPromptIdentifier(prompt)]
}

export async function buildMessages(prompt: string, data: any, options?: PromptOptions): Promise<PromptType> {
    if (data?.textos) {
        for (const texto of data.textos) {
            if (!texto.pTexto) continue
            texto.texto = await texto.pTexto
        }
    }
    if (options?.overridePrompt) {
        prompt = options.overridePrompt
    }
    let buildPrompt = getBuildPrompt(prompt)
    return (await buildPrompt(data))
}

export function getFormatter(prompt: string, options?: PromptOptions): ((s: string) => string) | undefined {
    const buildPrompt = getBuildPrompt(prompt)
    const builtPrompt = buildPrompt({ textos: [] })
    const formatter = builtPrompt.params?.format
    return formatter
}