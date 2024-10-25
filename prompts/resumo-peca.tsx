import { PromptType } from '@/lib/prompt-types'
import { system, systemMessage } from './_system'

export default (data): PromptType => {
    const prompt = `
Você foi designado para elaborar um resumo de uma peça de uma ação judicial proposta na justiça federal.
Por favor, leia com atenção a peça a seguir e resuma as informações mais importantes:

${data.textos.reduce((acc, txt) => acc + `${txt.descr}:\n<${txt.slug}>\n${txt.texto}\n</${txt.slug}>\n\n`, '')}

Antes de escrever o resumo final, organize seus pensamentos em um <scratchpad>, anotando os pontos chave que você precisa incluir.

Depois de organizar o esboço, escreva o resumo final dentro das tags <result>. Certifique-se de:
- Escrever o resumo em texto corrido, sem utilizar tópicos, marcadores ou listas, apenas dividindo em parágrafos
- Quando for se referir a alguma das partes, use o nome ao invés de "réu" ou "autor"
- Algumas siglas muito comuns não precisar ser explicadas, por exemplo, "INSS", "STF" ou "STJ"
- Usar uma linguagem jurídica formal
- Formatar o texto usando Markdown

Escreva somente dentro das tags <scratchpad> e <result>, não inclua nenhum outro texto fora delas. Não repita as instruções no resumo.
`
    return { message: [systemMessage(true), { role: 'user', content: prompt }] }
}