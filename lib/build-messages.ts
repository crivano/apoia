import prompts, { PromptType } from '../prompts/_prompts'

export function getPromptIdentifier(prompt: string) {
    let promptUnderscore = prompt.replace(/-/g, '_')
    let buildPrompt = prompts[promptUnderscore]
    if (!buildPrompt && prompt.startsWith('resumo-')) {
        promptUnderscore = 'resumo_peca'
    }
    return promptUnderscore

}

export function getBuildPrompt(prompt: string) {
    return prompts[getPromptIdentifier(prompt)]
}

export async function buildMessages(prompt: string, data: any): Promise<PromptType> {
    if (data?.textos) {
        for (const texto of data.textos) {
            if (!texto.pTexto) continue
            texto.texto = await texto.pTexto
        }
    }
    let buildPrompt = getBuildPrompt(prompt)
    return (await buildPrompt(data))
}

export function getFormatter(prompt: string): ((s: string) => string) | undefined {
    const buildPrompt = getBuildPrompt(prompt)
    const builtPrompt = buildPrompt({ textos: [] })
    const formatter = builtPrompt.params?.format
    return formatter
}