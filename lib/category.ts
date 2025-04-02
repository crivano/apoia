import { generateContent } from "./ai/generate"
import { getInternalPrompt } from "./ai/prompt"
import { PromptDataType } from "./ai/prompt-types"

export async function inferirCategoriaDaPeca(dossier_id: number, id: number | undefined, conteudo: string, anteriores: string[]): Promise<string> {
    const definition = getInternalPrompt('int-identificar-categoria-de-peca')
    const data: PromptDataType = { textos: [{ descr: 'CÓDIGOS DOS TIPOS DOCUMENTAIS ANTERIORES', slug: 'anteriores', texto: '- ' + anteriores.join('\n- ') }, { descr: 'TEXTO', slug: 'texto', texto: conteudo }] }
    const result = await generateContent(definition, data)
    const json = JSON.parse(result.generation)
    // console.log('Identificação de Peça - código: ', json.codigo)
    // console.log('Identificação de Peça - código: ', json.codigo, 'justificativa: ', json.justificativa)
    return json.codigo
}