import { PromptType } from './_prompts'
import { system, systemMessage } from './_system'

export default (data): PromptType => {
    const prompt = `
Você foi designado para refinar um texto a ser inserido em ação judicial.
Por favor, leia com atenção o texto a seguir demarcado por crases triplas:

${data.textos.reduce((acc, txt) => acc + `\`\`\`\n${txt.texto}\n\`\`\`\n\n`, '')}

Reescreva o texto de forma mais clara e objetiva, mantendo o conteúdo original.

Certifique-se de:
- Reveja a redação, usando linguagem simples.
- Usar uma linguagem jurídica formal
- Organize os fatos e fundamentos jurídicos na ordem que for mais lógica. 
- Não faça nenhuma alteração na redação dos parágrafos que estiverem com recuo, pois são citações.
- Formatar sua resposta em MarkDown, mantendo todas as características da formatação original
- Não repita as instruções na resposta
- Não inclua crases triplas para informar que se trata de Markdown na resposta
- Responda apenas com o testo refinado e mais nada
`
    return { message: [systemMessage(false), { role: 'user', content: prompt }] }
}