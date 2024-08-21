import { PromptType } from './_prompts'
import { system, systemMessage } from './_system'

export default (data): PromptType => {
    const prompt = `
Você foi designado para elaborar um resumo da peça de informações da autoridade coatora em mandado de segurança impetrado na justiça federal.
Por favor, leia com atenção a peça a seguir e resuma as os pontos mais importantes:

${data.textos.reduce((acc, txt) => acc + `${txt.descr}:\n<${txt.slug}>\n${txt.texto}\n</${txt.slug}>\n\n`, '')}

Antes de escrever o resumo final, organize seus pensamentos em um <scratchpad>, anotando os pontos chave que você precisa incluir, como:
- Defesa processual, com os correspondentes argumentos de fato e de direito e os artigos de lei apontados na peça, se houver.
- Defesa de mérito, com os correspondentes argumentos de fato e de direito e os artigos de lei apontados na peça, se houver.

Depois de organizar o esboço, escreva o resumo final dentro das tags <result>. Certifique-se de:
- Resumir a defesa processual (se houver)
- Resumir a defesa de mérito (se houver)
- Usar uma linguagem jurídica formal
- Formatar o texto usando Markdown

Escreva somente dentro das tags <scratchpad> e <result>, não inclua nenhum outro texto fora delas. Não repita as instruções no resumo.
`
    return { message: [systemMessage(true), { role: 'user', content: prompt }] }
}