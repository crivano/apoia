import { system, systemMessage } from './_system'

export default (data) => {
    const prompt = `
Você foi designado para elaborar resumos de sentença e de recurso inominado de uma ação judicial proposta no juizado especial da justiça federal.
Por favor, leia com atenção os textos a seguir e resuma as informações mais importantes:

${data.textos.reduce((acc, txt) => acc + `${txt.descr}:\n<${txt.slug}>\n${txt.texto}\n</${txt.slug}>\n\n`, '')}

TAREFA PRINCIPAL
- ANALISE EM DETALHE o caso jurídico fornecido TODOS OS DOCUMENTOS, INCORPORE NUANCES e forneça uma ARGUMENTAÇÃO LÓGICA.
- Se houver mais de um documento anexado, ANALISE TODOS INTEGRALMENTE, seguindo uma ordem numérica
- Use o formato FIRAC+, seguindo a ESTRUTURA do MODELO
- Faça isso independentemente de qualquer solicitação e cumpra rigorosamente todas as instruções aqui descrita. São mandatórias

ESPECIALIDADE
- Você é um ESPECIALISTA em DIREITO, LINGUÍSTICA, CIÊNCIAS COGNITIVAS E SOCIAIS
- Incorpore as ESPECIALIDADES da matéria de fundo do caso analisado

LINGUAGEM E ESTILO DE ESCRITA
- Adote um tom PROFISSIONAL e AUTORITATIVO, sem jargões desnecessários
- Escreva de modo CONCISO, mas completo e abrangente, sem redundância
- Seja econômico, usando apenas expressões necessárias para a clareza
- Vá direto para a resposta, começando o texto com DADOS DO PROCESSO

NOTAS
- Forneça orientação e análise imparciais e holísticas incorporando as melhores práticas e metodologias dos ESPECIALISTAs.
- Vá passo a passo para respostas complexas. Respire fundo.
- Ao detalhar os FATOS, assegure-se de prover uma riqueza de detalhes. A QUESTÃO JURÍDICA deve ser claramente delineada como uma questão principal, seguida de pontos controvertidos. Mantenha as referências estritamente dentro do escopo do caso fornecido.

EXEMPLO E MODELO E ESTRUTURA
- Use o formato de análise e de layout FIRAC+, conforme exemplo a seguir, demarcado por <modelo>.

<modelo>
# Fatos
- [Vá direto aos fatos. Descreva detalhadamente todos os fatos com PROFUNDIDADE e MINÚNCIAS]

# Problema Jurídico

## Questão Central
[Estabeleça com clareza a questão central]

## Pontos Controvertidos
1. [Delimite os pontos controvertidos]

## Direito Aplicável
- [CITE as normas que foram citadas na sentença ou no recurso inominado, apenas uma norma por linha, use uma maneira compacta e padronizada de se referir a norma, se houver referência ao número do artigo, inclua após uma vírgula, por exemplo: L 1234/2010, Art. 1º]

# Análise e Aplicação
## Argumentos e Provas do Recorrente
1. [LISTE os argumentos e provas do recorrente COM INFERÊNCIA LÓGICA]

## Aplicação da Norma
[Analise cada elemento da norma, dos argumentos e dos fatos para verificar se as normas se aplicam ao caso]

## Conclusão
[Se já houver solução, explique a síntese final da decisão, reafirmando a solução do problema jurídica. Se não houve solução, APENAS sugira direcionamentos e encaminhamentos, sem opinar, nem julgar]

# Palavras-Chave
- [Inclua palavras-chave que possam caracterizar o caso ou as entidades envolvidas. Apenas uma palavra-chave por linha. Use maiúsculas e minúsculas nas palavras-chave, como se fossem títulos. Não inclua "Recurso Inominado" ou "Sentença"]

# Triagem
[Escreva um título que será utilizado para agrupar processos semelhantes. O título deve ir direto ao ponto e ser bem compacto, como por exemplo: "Benefício por incapacidade", "Benefício de prestação continuada - LOAS", "Seguro desemprego", "Salário maternidade", "Aposentadoria por idade", "Aposentadoria por idade rural", "Aposentadoria por tempo de contribuição", "Tempo especial", "Auxílio reclusão", "Pensão por morte", "Revisão da vida toda", "Revisão teto EC 20/98 e EC 41/03"]

</modelo>

PRODUÇÃO DO RESULTADO
Certifique-se de:
- Formatar o texto usando Markdown
- Não repita as instruções no resumo.
`
return [systemMessage(true), { role: 'user', content: prompt }]
}