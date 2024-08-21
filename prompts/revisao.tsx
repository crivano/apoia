import { PromptType } from './_prompts'
import { system, systemMessage } from './_system'

export default (data): PromptType => {
    const prompt = `
Você foi designado para revisar um texto a ser inserido em ação judicial.

Por favor, leia com atenção o texto a seguir:

${data.textos.reduce((acc, txt) => acc + `${txt.descr}:\n<${txt.slug}>\n${txt.texto}\n</${txt.slug}>\n\n`, '')}

Certifique-se de:
- Indicar claramente os erros encontrados
- Justificar a correção dos erros
- Fazer sugestões de melhoria
- Usar uma linguagem jurídica formal
- Não repita as instruções na resposta
- Não repita o texto original na resposta
- Não inclua o texto revisado na resposta
- Sua resposta deve conter única e exclusivamente uma lista numerada com as correções e sugestões de melhoria, ou o texto "Nenhuma correção ou sugestão de melhoria foi encontrada."
- Formatar sua resposta usando Markdown, na forma de uma lista numerada, seguindo o modelo abaixo
- Esta versão do Markdown requer 4 espaços de intentação para as lista numeradas

Modelo de resposta:

1.  **[descrição do erro ou sugestão de melhoria]**
    - **Correção:** [correção sugerida]
    - **Justificativa:** [justificativa da correção]
    - **Trecho original:** [trecho original do texto, se houver]
    - **Trecho corrigido:** [trecho corrigido do texto, se houver]
`
    return { message: [systemMessage(false), { role: 'user', content: prompt }] }
}