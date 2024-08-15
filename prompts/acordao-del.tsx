import { system, systemMessage } from './_system'

export default (data) => {
    const prompt = `
Você foi designado para elaborar uma ementa e um acórdão em ação judicial proposta na justiça federal.
Por favor, leia com atenção os textos a seguir:

${data.textos.reduce((acc, txt) => acc + `${txt.descr}:\n<${txt.slug}>\n${txt.texto}\n</${txt.slug}>\n\n`, '')}

Antes de escrever a ementa e o acórdão, organize seus pensamentos em um <scratchpad>, anotando os pontos chave que você precisa incluir.
- É importante incluir no scratchpad a lista completa de pontos controvertidos e teses jurídicas aplicadas no voto.
- Inclua um tópico para cada ponto controvertido, com a tese jurídica aplicada no voto.

Depois de organizar o esboço, escreva o resultado final dentro das tags <result>. Certifique-se de:
- Criar um resumo da sentença sob o título de EMENTA
- Escrever, também, uma lista de tópicos numerados resumindo os principais pontos do relatório e do voto.
- Escrever a decisão final do tribunal sob o título de ACÓRDÃO
- Algumas siglas muito comuns não precisar ser explicadas, por exemplo, "INSS", "STF" ou "STJ"
- Não incluir a data nem o número do processo nem o nome do subscritor
- Usar uma linguagem jurídica formal
- Formatar o texto usando Markdown conforme o modelo abaixo delimitado <modelo> e </modelo>

<modelo>
# EMENTA

[Inclua um resumo do voto, em formato de palavras-chave, com todas letras em maiúsculo, separadas por ponto final. Comece informando o(s) ramo(s) do direito e depois informe o nome do recurso. Atenção: não informe se a sentença foi validada ou invalidada, pois isso será feito no acórdão]

1. [Para cada ponto controvertido constante do voto, incluir um tópico na lista resumindo a tese jurídica aplicada no voto. Escreva no formato de orações completas, inclua a fundamentação legal se houver]

1. [Indique o resultado final do julgamento, conforme último parágrafo do voto, indique o nome do instrumento e diga se foi provido, parcialmente provido ou não provido]

# ACÓRDÃO

[Inclua apenas decisão final do tribunal, sem explicar detalhes do caso, visto que isso já foi feito na ementa, nem encaminhamentos futuros]
</modelo>

Um exemplo de ementa e acórdão pode ser visto abaixo, mas lembre-se de que o conteúdo deve ser adaptado ao caso em questão:

<exemplo>
# EMENTA

PROCESSUAL CIVIL. CONSTITUCIONAL. INCRA. FUNDAÇÃO CULTURAL PALMARES. AÇÃO CIVIL PÚBLICA. DEFESA DE INTERESSES DE COLETIVIDADE COM STATUS DE REMANESCENTE DE COMUNIDADE DE QUILOMBO. LEGITIMIDADE AD CAUSAM PASSIVA. INTERESSE DE AGIR NA MODALIDADE ADEQUAÇÃO DA VIA ELEITA.

1. Tanto o INCRA quanto a FCP - Fundação Cultural Palmares têm legitimidade ad causam ativa para o ajuizamento de ação civil pública para a defesa de interesses de coletividade com status de remanescente de comunidade de quilombo, conforme o art. 5º, caput, IV, da Lei nº 7.347/1985.
2. Há interesse de agir na modalidade adequação da via eleita, enquanto escolhida a ação civil pública para veicular pretensões em um espectro cumulativo de caráter predominantemente real, e também (dentre outros) econômico, cultural, ambiental e moral, conforme o art. 1º, caput, IV, da Lei nº 7.347/1985.

1. Apelações parcialmente providas. Agravo interno declarado prejudicado.

# ACÓRDÃO

Vistos e relatados estes autos em que são partes as acima indicadas, a Egrégia 7ª Turma Especializada do Tribunal Regional Federal da 2ª Região decidiu, por unanimidade, dar parcial provimento às apelações, invalidando in totum a sentença, e declarar prejudicado o agravo interno, nos termos do relatório, votos e notas de julgamento que ficam fazendo parte integrante do presente julgado.
</exemplo>

Escreva somente dentro das tags <scratchpad> e <result>, não inclua nenhum outro texto fora delas. Não repita as instruções no resumo.

`
return [systemMessage(true), { role: 'user', content: prompt }]
}