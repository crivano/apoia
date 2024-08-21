import { PromptType } from './_prompts'
import { system, systemMessage } from './_system'

export default (data): PromptType => {
    const prompt = `
Você foi designado para elaborar a análise de uma ação judicial proposta na justiça federal.
Por favor, leia com atenção os textos a seguir:

${data.textos.reduce((acc, txt) => acc + `${txt.descr}:\n<${txt.slug}>\n${txt.texto}\n</${txt.slug}>\n\n`, '')}

Formate sua análise de acordo com o modelo a seguir, demarcado por <modelo> e </modelo>:

<modelo>
# Questão Central
[Estabeleça com clareza a questão central]

# Pontos Controvertidos
1. [Delimite os pontos controvertidos]

# Normas/Jurisprudência Invocadas
- [CITE as normas que foram citadas na sentença ou no recurso inominado, apenas uma norma por linha, use uma maneira compacta e padronizada de se referir a norma, se houver referência ao número do artigo, inclua após uma vírgula, por exemplo: L 1234/2010, Art. 1º]

# Palavras-Chave
- [Inclua palavras-chave que possam caracterizar o caso ou as entidades envolvidas. Apenas uma palavra-chave por linha. Comece com a primeira letra maiúscula, como se fosse um título. Não inclua "Recurso Inominado" ou "Sentença". Não inclua referências à normas legais.]

# Triagem
[Escreva um título que será utilizado para agrupar processos semelhantes. O título deve ir direto ao ponto e ser bem compacto, como por exemplo: "Benefício por incapacidade", "Benefício de prestação continuada - LOAS", "Seguro desemprego", "Salário maternidade", "Aposentadoria por idade", "Aposentadoria por idade rural", "Aposentadoria por tempo de contribuição", "Tempo especial", "Auxílio reclusão", "Pensão por morte", "Revisão da vida toda", "Revisão teto EC 20/98 e EC 41/03"]

</modelo>

Certifique-se de:
- Formatar o texto usando Markdown
- Não repita as instruções na análise.

`
    return { message: [systemMessage(true), { role: 'user', content: prompt }] }
}