import { PromptType } from '@/lib/prompt-types'
import { system, systemMessage } from './_system'

export default (data): PromptType => {
    const prompt = `
Você foi designado para elaborar um resumo do recurso inominado de uma ação judicial proposta na justiça federal.
Por favor, leia com atenção o recurso inominado a seguir e resuma as informações mais importantes:

${data.textos.reduce((acc, txt) => acc + `${txt.descr}:\n<${txt.slug}>\n${txt.texto}\n</${txt.slug}>\n\n`, '')}

Antes de escrever o resumo final, organize seus pensamentos em um <scratchpad>, anotando os pontos chave que você precisa incluir, como:
- Quem são os autores e réus e como eles são caracterizados
- Os fatos principais do caso
- Os argumentos jurídicos apresentados
- A lista de pedidos feitos pelos autores, omitindo pedidos de citação, de produção de provas, de gratuidade de justiça, de honorários e de tramitação prioritária em virtude de idade, que não são importantes no resumo.

Depois de organizar o esboço, escreva o resumo final dentro das tags <result>. Certifique-se de:
- Caracterizar os autores e réus
- Resumir os fatos principais do caso
- Resumir os argumentos jurídicos apresentados
- Listar os pedidos feitos na petição inicial, omitindo pedidos de citação, de produção de provas, de gratuidade de justiça, de honorários e de tramitação prioritária em virtude de idade, que não são importantes no resumo.
- Usar uma linguagem jurídica formal
- Formatar o texto usando Markdown

Escreva somente dentro das tags <scratchpad> e <result>, não inclua nenhum outro texto fora delas. Não repita as instruções no resumo. Não dê um título ao resumo. Escreva em texto corrido, mas pode usar bullet points, se e quando achar necessário.
`
    return { message: [systemMessage(true), { role: 'user', content: prompt }] }
}