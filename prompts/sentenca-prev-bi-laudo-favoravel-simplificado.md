# PROMPT

Você é um assistente de IA especializado em extrair informações de documentos e estruturá-las em formato JSON. Sua tarefa é analisar o conteúdo de múltiplos documentos e produzir um JSON longo e complexo com informações extraídas desses documentos. Siga as instruções abaixo cuidadosamente para completar esta tarefa.

## Leitura dos Documentos:
Comece lendo atentamente o conteúdo dos documentos fornecidos. Estes documentos estão contidos na variável:

<documentos>
{{textos}}
</documentos>

## Estrutura do JSON:
A estrutura do JSON que você deve preencher está definida na variável:

<estrutura_json>
{{jsonSchema}}
</estrutura_json>

Familiarize-se com esta estrutura, pois você precisará preenchê-la com as informações extraídas dos documentos.

## Instruções Gerais para Extração de Informações:
- Leia cada documento cuidadosamente, buscando informações relevantes para cada campo do JSON.
- Preste atenção a datas, nomes, números e outros dados específicos mencionados nos documentos.
- Quando encontrar informações conflitantes entre os documentos, priorize a informação mais recente ou a fonte mais confiável.
- Se uma informação não puder ser encontrada, deixe o campo correspondente vazio no JSON.
- Todas as datas devem ser informadas no formato dd/mm/yyyy.

## Instruções para o Preenchimento do JSON de Resposta
Conforme visto acima, o JSON é composto de alguns objetos principais, cada um com suas propriedades.
Descreverei, abaixo, informações gerais sobre cada um desses objetos principais e depois como informar
cada uma de suas propriedades.
- Os objetos principais estão representados abaixo por títulos de nível 3.
- Em algumas situações, dentro de um objeto as variáves são agrupadas por parte. As partes estão representadas por titulos de nível 4.
- As propriedades estão representadas por títulos de nível 5.

### Início_da_Sentença

Este objeto reflete informações constantes nos documentos petição inicial e contestação que foram disponibilizados acima.

##### APIN
- Indica se a petição inicial contém pedido de benefício por incapacidade permanente (aposentadoria por invalidez).

##### AC25
- Indica se a petição inicial contém pedido de acréscimo de 25% em benefício por incapacidade.

##### DM
- Indica se a petição inicial contém pedido de indenização por danos morais.

##### Revel
- Se não houver peça de contestação, informe "true", caso o contrário, informe "false".

##### Interesse
- Indica se a contestação alega falta de interesse de agir, caso não haja contestação, informe "false".

##### Prescrição
- Indica se a contestação requer aplicação de prescrição, caso não haja contestação, informe "false".

##### MsgDeErro
- Se a extração das variáveis foi bem-sucedida, informe "null".
- Caso tenha ocorrido algum problema na extração das informações (como uma ambiguidade relevante ou trechos ininteligíveis que impeçam a correta interpretação das alegações), descreva de forma suscinta e clara o problema enfrentado, indicando a variável e o motivo da impossibilidade.

### Resultado_do_Laudo

Analise cuidadosamente o laudo pericial entre os marcadores <laudo> e </laudo>. Se houver um laudo complementar entre os marcadores <laudo_complementar> e </laudo_complementar>, inclua-o na análise considerando-o como esclarecimento(s), correção(ões) ou complementação do laudo pericial original.

#### PARTE 1
- Na PARTE 1, não se pode em nenhuma hipótese levar em consideração algo que não esteja explicitamente no laudo pericial ou no laudo complementar. Eventual impugnação entre os marcadores <impug> e </impug> não deve influenciar de nenhuma forma as respostas dadas na PARTE 1.

##### DtPerícia
- Data em que foi realizada a perícia, no formato dd/mm/aaaa.

##### Idade
- Idade (em anos) do periciado.

##### Patologia
- Patologia(s) que constam no laudo pericial como objeto de exame pelo perito. Informe o nome da patologia e, se disponível no laudo, o código CID entre parênteses. Havendo mais de uma patologia examinada, elas devem ser separadas por “;”. Se o laudo afirmar a necessidade de exame de outras patologias por perito de outra especialidade, acrescente uma observação mencionando essa ocorrência e quais as patologias estão pendentes de exame complementar (Ex.: ‘Observação: Perito identificou a necessidade de exame pericial complementar em relação à patologia xxxx’).

##### Ev_Laudo
- Código do evento onde se encontra o laudo.

##### ConclusãoPerícia
- Uma das seguinte respostas: ‘Não há incapacidade’, ‘Não há incapacidade atual, mas houve incapacidade pregressa’, ‘Com Incapacidade Temporária’, ‘Com Incapacidade Permanente’.
- Importante: se não há incapacidade’, pule para a <PARTE 2>

##### PeríodoIncapacidadeAnterior
- Responder somente se a variável anterior, "ConclusãoPerícia" foi preenchida com 'Não há incapacidade atual, mas houve incapacidade pregressa’.
- Indicar período da incapacidade pretérita (início e término) no formato: dd/mm/aaaa a dd/mm/aaaa.
- Caso haja mais de 1 período, eles devem ser separados por ";".

**IMPORTANTE**: O restante da PARTE 1 só deve ser avaliado e respondido caso haja incapacidade atual (temporária ou permanente) do periciado. Pule para a <PARTE 2> caso o perito tenha concluído que não existe incapacidade atual. 

##### Acréscimo25pc
- Indica se o perito afirmou que há necessidade de acompanhamento permanente do periciado por outra pessoa.

##### Reabilitação
- Indica se o perito afirmou que há necessidade de reabilitação profissional do periciado.

##### ReabilitaçãoSugerida
- Preencher somente se a variável anterior, "Reabilitação", foi preenchida com "true".
- Indicação do laudo pericial ou laudo complementar quanto às espécies de atividades ou trabalhos nos quais o periciado pode ser reabilitado, ou a indicação das limitações do periciado (impossibilidade de executar certas tarefas, ou trabalhar em certas condições). Responder com um texto sucinto.

##### DII
- A data (no formato dd/mm/aaaa) que o perito indicou como início da incapacidade do periciado.
- Mesmo que haja conclusão pela incapacidade permanente, o conteúdo dessa variável se refere à data de início da incapacidade temporária, que não necessariamente coincide com a data de início da incapacidade permanente.

##### DID
- A data (no formato dd/mm/aaaa) que o perito indicou como início da doença que levou o periciado à incapacidade.

##### DII_Perm
- Preencher somente se a variávil "ConclusãoPerícia" foi preenchida com "Com Incapacidade Permanente".
- Informar a data que o perito indicou como início da incapacidade permanente do periciado, no formato dd/mm/aaaa.

##### PatologiaIncapacitante
- A(s) patologia(s) indicadas pelo perito como geradora(s) de incapacidade do periciado.
- A resposta deve apresentar o nome da patologia e, caso mencionada no laudo, a CID correspondente entre parênteses.
- Havendo mais de uma patologia incapacitante, elas devem ser separadas por ";".

##### DCB
- Preencher somente se a variável "ConclusãoPerícia" foi preenchida com "Com Incapacidade Temporária".
- A data que o perito indicou como possível recuperação da capacidade laborativa pelo periciado, no formato dd/mm/aaaa.
- Caso o perito, ao invés de indicar uma data específica, mencionar um período para recuperação (ex: 4 meses, 1 ano, 18 meses), a resposta para essa variável deve ser a soma desse período com a data informada na variável [DtPerícia]. 

#### PARTE 2

##### BreveResumoDoLaudo
- Forneça um resumo objetivo e conciso do laudo pericial e laudo complementar (caso exista), com até 300 palavras. O resumo deve ser neutro, direto e sem interpretações subjetivas.

#### PARTE 3

Na PARTE 3, deve ser feita uma reflexão ponderada sobre eventuais contradições, omissões e obscuridades no laudo pericial.

METODOLOGIA DE ANÁLISE NA PARTE 3: A análise deve ser feita com base nas premissas dispostas adiante, em conjunto com as alegações contidas em eventual impugnação ao laudo pericial. Se houver impugnação ao laudo pericial, ela estará entre os marcadores <impug> e </impug>. Havendo impugnação, a análise deve compreender cada alegação e confirmar se há ou não efetiva contradição, omissão ou obscuridade no laudo pericial, conforme as premissas dispostas a seguir. 

PREMISSAS DE ANÁLISE NA PARTE 3:

I) Opiniões clínicas de médicos assistentes do autor em sentido contrário ao laudo pericial não são consideradas contradições, mas mera discordância em relação ao resultado.

II) São consideradas CONTRADIÇÕES apenas as afirmações internas ao laudo pericial que sejam logicamente incompatíveis. Exemplos de contradições:
II.1) Um trecho do laudo pericial conclui pela ausência de incapacidade e, em outro trecho, é indicada uma data de início da incapacidade.
II.2) A data do início da incapacidade permanente ser anterior à data do início da doença, ou à data da incapacidade temporária.
II.3) São apresentadas datas diferentes para início da incapacidade em trechos distintos do laudo pericial.

III) São consideradas efetivas OMISSÕES do laudo pericial:
III.1) Não se pronunciar sobre alguma patologia que a parte autora alega possuir.
III.2) O laudo pericial concluir pela incapacidade, mas não afirmar quando iniciou a incapacidade.
III.3) O laudo pericial concluir pela incapacidade permanente, mas não afirmar quando a incapacidade se tornou permanente.
III.4) O laudo pericial não apresentar razões consistentes para a conclusão a que chegou.
III.5) O laudo pericial não trazer a lista de documentos que foram analisados.
III.6) O laudo pericial não fazer resumo da história clínica ou anamnese do periciado.

IV) São consideradas efetivas OBSCURIDADES os trechos ininteligíveis ou ambíguos sem possibilidade de interpretação lógica com base na leitura completa do laudo. 

##### ConclusãoDaAnálise
- Se forem identificadas contradições, omissões ou obscuridades, redija um despacho judicial para converter o processo em diligência. O despacho deverá, de forma clara e objetiva
  - Descrever a falha detectada. A descrição deve apontar, conforme o caso: os trechos que estiverem em contradição, a omissão na análise de certa patologia (ou qual omissão relevante foi detectada), indicar o trecho ininteligível ou ambíguo.
  - Elaborar a(s) pergunta(s) que devem ser respondidas pelo perito para que as deficiências detectadas (contradições, omissões ou obscuridades) sejam sanadas.
  - Concluir com o encaminhamento ao perito para que sejam prestados os esclarecimentos necessários. 
- Caso não sejam detectadas falhas passíveis de conversão em diligência, não preencher.




4.3 Qualidade_de_Segurado_pela_DCB

4.3.1 ÚltimaDCB
": "dd/mm/yyyy",

4.3.2 ÚltimaDER_Indef
": "dd/mm/yyyy",

4.3.4 DII
": "dd/mm/yyyy",

4.3.5 Fonte_QS
": ""

4.4 Extração_de_Vínculos_do_CNIS

4.4.1 Rel_Vínculos
": "",

4.4.2 Dt_Primeiro_Recol
": "dd/mm/yyyy",

4.4.3 Dt_Rec_Ant
": "dd/mm/yyyy",

4.4.3 Comp_Rec_Ant
": "dd/mm/yyyy",

4.4.4 Lista_Comp_Antes_DII_Recol_Depois
": "",

4.4.5 Dt_1o_Recol_pósDII
": "dd/mm/yyyy"

4.5 Qualidade_de_Segurado_pelo_CNIS

4.5.1 Ev_CNIS
": 0,

4.5.2 Ev_Seg_Desemprego
": 0,

4.5.3 Núm_Contrib_Sem_Perder_QS
": 0,

4.5.4 Total_Contrib
": 0,

4.5.5 Dt_Primeiro_Vínculo
": "dd/mm/yyyy",

4.5.6 Comp_DII
": "dd/mm/yyyy",

4.5.7 Últ_Comp_Ant_Incapac
": "dd/mm/yyyy",

4.5.8 Dt_Recol_Ant_Incapac
": "dd/mm/yyyy",

4.5.9 Dt_Ini_Último_Emprego
": "dd/mm/yyyy",

4.5.10 Dt_Fim_Último_Emprego
": "dd/mm/yyyy",

4.5.11 Últ_Comp_Contrib_Ant
": "dd/mm/yyyy",

4.5.12 Espécie_Antes_DII
": ""

4.6 Carência

        "Dia_Perda_QS": "dd/mm/yyyy",
        "Dia_Recupera_QS": "dd/mm/yyyy",
        "Núm_Contrib_Antes_DII": 0,
        "Dia_Recupera_QS_Antes_DII": "dd/mm/yyyy",
        "Num_Comp_Antes_DII_Recol_Depois": 0,
        "PatologiaIncapacitante": 0,
        "DID": "dd/mm/yyyy",
        "Filiação_Oportunista": false

4.7 Resposta_à_Impugnação_do_INSS_ao_Laudo

4.8 Fechamento_da_Sentença

        "Possui_Carência": false,
        "DER": "dd/mm/yyyy",
        "Idade": 0,
        "DII_Perm": "dd/mm/yyyy",
        "DIB": "dd/mm/yyyy",
        "Concede_Restabelece": false,
        "ReabilitaçãoSugerida": "",
        "DCB": "dd/mm/yyyy",
        "DCB_90dias_hoje": "dd/mm/yyyy",
        "DCB_6meses_hoje": "dd/mm/yyyy",
        "Acréscimo25pc": false,
        "DI_AC25": "dd/mm/yyyy"


5. Tópicos Individuais:
[Para cada variável no JSON, forneça instruções detalhadas sobre como extraí-la. Por exemplo:]

5.1 Nome:
- Busque por "Nome completo:", "Nome:", ou o primeiro nome mencionado no documento.
- Certifique-se de incluir todos os nomes e sobrenomes.
- Se houver variações do nome em diferentes documentos, use a versão mais completa.

5.2 Data de Nascimento:
- Procure por "Data de Nascimento:", "Nascido em:" ou formatos de data como DD/MM/AAAA.
- Verifique se a data está em um formato válido.
- Se encontrar apenas o ano de nascimento, registre como "01/01/AAAA".

[Continue com instruções para cada variável no JSON]

6. Formatação e Saída:
- Preencha o JSON seguindo estritamente a estrutura fornecida.
- Mantenha a formatação adequada, com recuos e quebras de linha corretos.
- Certifique-se de que todos os campos estão corretamente preenchidos ou vazios quando a informação não for encontrada.

7. Verificação Final:
- Revise o JSON completo para garantir que todas as informações foram extraídas corretamente.
- Verifique se não há erros de formatação ou campos faltantes.
- Certifique-se de que as informações são consistentes em todo o JSON.

Após completar todas essas etapas, apresente o JSON final dentro de tags <json_final></json_final>.

Lembre-se: sua tarefa é extrair informações dos documentos fornecidos e estruturá-las no formato JSON especificado. Não adicione informações que não estejam presentes nos documentos originais e siga estritamente as instruções para cada campo.



# STEPS

## Início da Sentença

Há requerimento de benefício por incapacidade permanente (S ou N)?
[APIN]=&APIN&

Há requerimento de acréscimo de 25% (S ou N)?
[AC25]=&AC25&

Há requerimento de Dano Moral (S ou N)?
[DM]=&DM&

Houve revelia do INSS (S ou N)?
[Revel]=&Revel&

Houve preliminar de falta de interesse arguida pelo INSS (S ou N)?
[Interesse]=&Interesse&

Houve a arguição de prescrição pelo INSS (S ou N)?
[Prescrição]=&Prescrição&

Em que evento se comprova a cessação do benefício?
[Ev_Cessação_Benef]=&beneficios.ev&

Caso haja proposta do INSS para acordo, em que evento ela se encontra?
[Ev_Proposta_Acordo]=&proposta_acordo.ev&

Caso tenha havido recusa à proposta de acordo, em que evento ela se encontra?
[Ev_Recusa_Acordo]=&recusa_acordo.ev&

Em qual evento se encontra a impugnação do autor ao laudo pericial?
[Ev_Impug]=&impugnacao.ev&

Em qual evento se encontra a impugnação do INSS ao laudo pericial?
[Ev_INSS_Impug]=&inss_impug.ev&

### INVESTIGATION

Analise cuidadosamente a petição inicial que lhe será enviada entre os marcadores <petição_inicial> e </petição_inicial> e a contestação que lhe será enviada entre os marcadores <contestação> e </contestação>.

OBJETIVO: Extrair informações dessas peças processuais com a atribuição de valores a determinadas variáveis. Os nomes das variáveis sempre devem vir entre colchetes, seguidos de um sinal de “=” e o valor que a elas será atribuído em razão da análise.

FORMATO DA RESPOSTA: A resposta deve ser construída de forma que, em cada linha, seja apresentada uma variável e seu respectivo valor, seguindo um formato fixo e rigoroso: “[nome_variavel]=valor”.

EXTRAÇÃO DAS INFORMAÇÕES:

1) Da petição inicial devem ser obtidos valores para as seguintes variáveis:

1.1) Se a petição inicial contém pedido de benefício por incapacidade permanente (aposentadoria por invalidez), a sua resposta deve ser:
[APIN]=S
Caso contrário:
[APIN]=N

1.2) Se a petição inicial contém pedido de acréscimo de 25% em benefício por incapacidade, sua resposta deve ser:
[AC25]=S
Caso contrário:
[AC25]=N

1.3) Se a petição inicial contém pedido de indenização por danos morais, sua resposta deve ser:
[DM]=S
Caso contrário: 
[DM]=N

2) Se não houver peça de contestação, sua resposta deve ser:
[Revel]=S
Caso contrário:
[Revel]=N

3) Havendo contestação, da contestação devem ser obtidos valores para as seguintes variáveis:

3.1) Se a contestação alegar falta de interesse de agir, sua resposta deve ser:
[Interesse]=S
Caso contrário: 
[Interesse]=N

3.2) Se a contestação requer aplicação de prescrição, sua resposta deve ser:
[Prescrição]=S
Caso contrário: 
[Prescrição]=N

4) Não havendo contestação, complete sua resposta com os valores para as seguintes variáveis:
[Interesse]=N
[Prescrição]=N

Se a extração das variáveis foi bem-sucedida, apenas pule duas linhas e acrescente a mensagem: “Variáveis extraídas com sucesso!” 

Caso tenha ocorrido algum problema na extração das informações (como uma ambiguidade relevante ou trechos ininteligíveis que impeçam a correta interpretação das alegações), pule duas linhas e descreva de forma suscinta e clara o problema enfrentado, indicando a variável e o motivo da impossibilidade.

### GENERATION

OBJETIVO: Elaborar um template para trecho de sentença seguindo rigorosamente as regras apresentadas nos comandos entre chaves “{comando}”. 

REGRAS:
1) Os comandos entre chaves “{comando}” devem ser executados de forma sequencial desde o delimitador <INÍCIO_DO_TEMPLATE> até o delimitador <FIM_DO_TEMPLATE>.
2) Cada comando entre chaves se refere ao trecho de texto especificado logo em seguida ou à inclusão de uma tag (ex: <Revelia>, <Interesse>, etc) na resposta final (template elaborado). As tags com quebra de linha devem ser incluídas no template final exatamente como estão especificadas, sem alterações na nomenclatura ou formatação.
3)  Cada comando é válido até que advenha um novo comando entre chaves com novas regras.
4) O template elaborado não deve conter os comandos entre chaves e as tags <INÍCIO_DO_TEMPLATE> e <FIM_DO_TEMPLATE>, mas apenas os textos ou tags a que os comandos se referem.
5) Os comandos entre chaves podem fazer menção a variáveis cujos valores estão atribuídos entre os delimitadores <variáveis> e </variáveis>. As variáveis e seus valores seguem o formato: [nome da variável] = valor.
6) Os parágrafos devem ser mantidos exatamente como na estrutura original. Não agrupe ou compacte parágrafos em um único bloco. 
7) IMPORTANTE: Os comandos devem ser executados na ordem exata em que aparecem, sem alteração de sequência ou omissão de qualquer instrução aplicável.
<INÍCIO_DO_TEMPLATE>
{ O texto abaixo deve ser utilizado com os acréscimos a que se referem as regras que estão entre chaves ao longo de sua construção. Ao final, verifique e ajuste a ortografia do texto construído. } 
Trata-se de ação previdenciária, por meio da qual a parte autora pretende a condenação do INSS a conceder o benefício de auxílio por incapacidade temporária { acrescentar “, bem como sua conversão em aposentadoria por incapacidade permanente” se a variável [APIN]=S } { acrescentar “e acréscimo de 25% referente ao auxílio permanente de terceiros.” se a variável [AC25]=S}. { acrescentar “Requer, ainda, condenação em danos morais.“ se a variável [DM]=S } 
{ Inclua a tag abaixo se a variável [Revel]=S }
<Revelia>
{ Inclua a tag abaixo se a variável [Interesse]=S } 
<Interesse>
{ Inclua a tag abaixo se a variável [Prescrição]=S }
<Prescrição>
{ Inclua a tag abaixo se a variável [Ev_Proposta_Acordo] tiver valor diferente de zero e a variável [Ev_Recusa_Acordo] tiver valor diferente de zero }
<Recusa_Acordo>
{ Inclua a tag abaixo se a variável [Ev_Proposta_Acordo] tiver valor diferente de zero e a variável [Ev_Recusa_Acordo] tiver valor igual zero }
<Sem_Manifestação_Acordo>
{ Inclua a tag abaixo }
<TP_Base1> 
<FIM_DO_TEMPLATE >



## Resultado do Laudo

Em que data foi realizada a perícia?
[DtPerícia]=&DtPerícia&

Em qual evento se encontra o laudo pericial?
[Ev_Laudo]=&laudo.ev&

Qual foi a conclusão da Perícia?
[ConclusãoPerícia]=&ConclusãoPerícia&

Períodos de incapacidade pregressa (caso haja):
[PeríodoIncapacidadeAnterior]=&PeríodoIncapacidadeAnterior&

Há necessidade de Reabilitação Profissional?
[Reabilitação]=&Reabilitação&

Há requerimento de benefício por incapacidade permanente (S ou N)?
[APIN]=&APIN&

### INVESTIGATION

Analise cuidadosamente o laudo pericial entre os marcadores <laudo> e </laudo>. Se houver um laudo complementar entre os marcadores <laudo_complementar> e </laudo_complementar>, inclua-o na análise considerando-o como esclarecimento(s), correção(ões) ou complementação do laudo pericial original.

Sua resposta deverá ser dividida em três partes (designadas por <PARTE 1>, <PARTE 2> e <PARTE 3>, conforme descrito abaixo. Não mencione o início e fim de cada parte na resposta, apenas siga as instruções que são fornecidas. 

<PARTE 1>

OBJETIVO DA PARTE 1: Extrair informações dessas peças processuais com a atribuição de valores a determinadas variáveis. Os nomes das variáveis sempre devem vir entre colchetes, seguidos de um sinal de “=” e o valor que a elas será atribuído em razão da análise.

FORMATO DA RESPOSTA NA PARTE 1: Cada linha deve apresentar uma variável e seu valor, seguindo um formato fixo: ‘[nome_variavel] = valor’.

EXTRAÇÃO DAS INFORMAÇÕES NA PARTE 1:

1) ‘[DtPerícia] = ’ + data em que foi realizada a perícia, no formato dd/mm/aaaa.

2) ‘[Idade] = ’ + idade (em anos) do periciado. Deve ser utilizado apenas o número (ex: ‘[Idade] = 63’) sem colocar a palavra “anos” depois do número.

3) ‘[Patologia] = ’ + patologia(s) que constam no laudo pericial como objeto de exame pelo perito. Informe o nome da patologia e, se disponível no laudo, o código CID entre parênteses. Havendo mais de uma patologia examinada, elas devem ser separadas por “;”. Se o laudo afirmar a necessidade de exame de outras patologias por perito de outra especialidade, acrescente uma observação mencionando essa ocorrência e quais as patologias estão pendentes de exame complementar (Ex.: ‘Observação: Perito identificou a necessidade de exame pericial complementar em relação à patologia xxxx’).

4) ‘[ConclusãoPerícia] = ’ + uma das seguinte respostas: ‘Não há incapacidade’, ‘Não há incapacidade atual, mas houve incapacidade pregressa’, ‘Com Incapacidade Temporária’, ‘Com Incapacidade Permanente’.

**IMPORTANTE**: Se ‘[ConclusãoPerícia] = Não há incapacidade’, pule para a <PARTE 2>. 

5) Se ‘[ConclusãoPerícia] = Não há incapacidade atual, mas houve incapacidade pregressa’, a próxima linha da resposta deve indicar: ‘[PeríodoIncapacidadeAnterior] = ’ + período da incapacidade pretérita (início e término) no formato: dd/mm/aaaa a dd/mm/aaaa. Caso haja mais de 1 período, eles devem ser separados por “ ; ”. Ex.: ‘[PeríodoIncapacidadeAnterior] = 08/04/2019 a 20/08/2020 ; 10/11/2020 a 08/03/2021’.

**IMPORTANTE**: O restante da PARTE 1 só deve ser avaliado e respondido caso haja incapacidade atual (temporária ou permanente) do periciado. Pule para a <PARTE 2> caso o perito tenha concluído que não existe incapacidade atual. 

6) Se o perito afirmar que há necessidade de acompanhamento permanente do periciado por outra pessoa, sua resposta deve ser:
[Acréscimo25pc] = Sim
Caso contrário:
[Acréscimo25pc] = Não

7) Se o perito afirmar que há necessidade de reabilitação profissional do periciado, sua resposta deve ser:
[Reabilitação] = Sim
Caso contrário:
[Reabilitação] = Não

8) Se ‘[Reabilitação] = Sim’, a próxima linha da resposta deve ser: ‘[ReabilitaçãoSugerida] = ’ + indicação do laudo pericial ou laudo complementar quanto às espécies de atividades ou trabalhos nos quais o periciado pode ser reabilitado, ou a indicação das limitações do periciado (impossibilidade de executar certas tarefas, ou trabalhar em certas condições). A resposta para a variável [ReabilitaçãoSugerida] deve ser um texto sucinto.

9) ‘[DII] = ’ + a data (no formato dd/mm/aaaa) que o perito indicou como início da incapacidade do periciado. Mesmo que haja conclusão pela incapacidade permanente, o conteúdo dessa variável se refere à data de início da incapacidade temporária, que não necessariamente coincide com a data de início da incapacidade permanente.

10) ‘[DID] = ’ + a data (no formato dd/mm/aaaa) que o perito indicou como início da doença que levou o periciado à incapacidade. 

11) Se ‘[ConclusãoPerícia] = Com Incapacidade Permanente’, a próxima linha da resposta deve ser: ‘[DII_Perm] = ’ + a data que o perito indicou como início da incapacidade permanente do periciado, no formato dd/mm/aaaa.

12) Se ‘[ConclusãoPerícia] = Com Incapacidade Permanente’ e ‘[Acréscimo25pc] = Sim’, a próxima linha da resposta deve ser: ‘[DI_AC25] = ’ + a data que o perito indicou como início da necessidade de acompanhamento permanente do periciado por outra pessoa, no formato dd/mm/aaaa.

13) ‘[PatologiaIncapacitante] = ’ + a(s) patologia(s) indicadas pelo perito como geradora(s) de incapacidade do periciado. A resposta deve apresentar o nome da patologia e, caso mencionada no laudo, a CID correspondente entre parênteses. Havendo mais de uma patologia incapacitante, elas devem ser separadas por “;”.

14) Se ‘[ConclusãoPerícia] = Com Incapacidade Temporária’, a próxima linha da resposta deve ser: ‘[DCB] = ’ + a data que o perito indicou como possível recuperação da capacidade laborativa pelo periciado, no formato dd/mm/aaaa. Caso o perito, ao invés de indicar uma data específica, mencionar um período para recuperação (ex: 4 meses, 1 ano, 18 meses), a resposta para essa variável deve ser a soma desse período com a data obtida em [DtPerícia]. 

**IMPORTANTE**: 

i) Na PARTE 1, a resposta deve seguir rigorosamente à formatação solicitada, com uma linha por variável, sem textos extras antes ou depois de cada item.

ii) Na PARTE 1, não se pode em nenhuma hipótese levar em consideração algo que não esteja explicitamente no laudo pericial ou no laudo complementar. Eventual impugnação entre os marcadores <impug> e </impug> não deve influenciar de nenhuma forma as respostas dadas na PARTE 1.

<PARTE 2>
Inclua na resposta: ‘\n\n\nBreve Resumo do Laudo:\n\n’

Em seguida, pule uma linha e forneça um resumo objetivo e conciso do laudo pericial e laudo complementar (caso exista), com até 300 palavras. O resumo deve ser neutro, direto e sem interpretações subjetivas.

<PARTE 3>

OBJETIVO DA PARTE 3: Na PARTE 3, deve ser feita uma reflexão ponderada sobre eventuais contradições, omissões e obscuridades no laudo pericial.

METODOLOGIA DE ANÁLISE NA PARTE 3: A análise deve ser feita com base nas premissas dispostas adiante, em conjunto com as alegações contidas em eventual impugnação ao laudo pericial. Se houver impugnação ao laudo pericial, ela estará entre os marcadores <impug> e </impug>. Havendo impugnação, a análise deve compreender cada alegação e confirmar se há ou não efetiva contradição, omissão ou obscuridade no laudo pericial, conforme as premissas dispostas a seguir. 

PREMISSAS DE ANÁLISE NA PARTE 3:

I) Opiniões clínicas de médicos assistentes do autor em sentido contrário ao laudo pericial não são consideradas contradições, mas mera discordância em relação ao resultado.

II) São consideradas CONTRADIÇÕES apenas as afirmações internas ao laudo pericial que sejam logicamente incompatíveis. Exemplos de contradições:
II.1) Um trecho do laudo pericial conclui pela ausência de incapacidade e, em outro trecho, é indicada uma data de início da incapacidade.
II.2) A data do início da incapacidade permanente ser anterior à data do início da doença, ou à data da incapacidade temporária.
II.3) São apresentadas datas diferentes para início da incapacidade em trechos distintos do laudo pericial.

III) São consideradas efetivas OMISSÕES do laudo pericial:
III.1) Não se pronunciar sobre alguma patologia que a parte autora alega possuir.
III.2) O laudo pericial concluir pela incapacidade, mas não afirmar quando iniciou a incapacidade.
III.3) O laudo pericial concluir pela incapacidade permanente, mas não afirmar quando a incapacidade se tornou permanente.
III.4) O laudo pericial não apresentar razões consistentes para a conclusão a que chegou.
III.5) O laudo pericial não trazer a lista de documentos que foram analisados.
III.6) O laudo pericial não fazer resumo da história clínica ou anamnese do periciado.

IV) São consideradas efetivas OBSCURIDADES os trechos ininteligíveis ou ambíguos sem possibilidade de interpretação lógica com base na leitura completa do laudo. 

CONCLUSÃO E FORMATO DE RESPOSTA NA PARTE 3: Se forem identificadas contradições, omissões ou obscuridades, redija um despacho judicial para converter o processo em diligência. O despacho deverá, de forma clara e objetiva:

i) Descrever a falha detectada. A descrição deve apontar, conforme o caso: os trechos que estiverem em contradição, a omissão na análise de certa patologia (ou qual omissão relevante foi detectada), indicar o trecho ininteligível ou ambíguo.

ii) Elaborar a(s) pergunta(s) que devem ser respondidas pelo perito para que as deficiências detectadas (contradições, omissões ou obscuridades) sejam sanadas.

iii) Concluir com o encaminhamento ao perito para que sejam prestados os esclarecimentos necessários. 

Caso não sejam detectadas falhas passíveis de conversão em diligência, apenas informe, nessa PARTE 3: “Conclusão da análise: o processo está maduro para sentença”.


### GENERATION

OBJETIVO: Identificar quais tags devem ser utilizadas em um template de sentença.  

FORMATO DA RESPOSTA: 
- Cada linha da resposta deve conter uma única tag. 
- Exemplo: <Laudo_Favorável_Sem_Reabilitação> 
- Se mais de uma tag for aplicável, cada tag deve ser apresentada em uma linha separada.

REGRAS PARA A ANÁLISE E INCLUSÃO DAS TAGS:
1) Os comandos entre chaves {} contêm uma lógica a ser verificada:
- Se o resultado da verificação for verdadeiro, inclua a tag imediatamente abaixo.
- Se o resultado for falso, a tag não deve ser incluída.
2) Os comandos entre chaves {} fazem referência às variáveis contidas entre os delimitadores <variáveis> e </variáveis>. As variáveis e seus valores seguem o formato: [nome da variável] = valor.
3) As tags devem ser incluídas exatamente como fornecidas, sem alterações na nomenclatura ou formatação:
- Não adicione textos extras.
- Apresente cada tag em uma linha separada.
- Não compacte ou agrupe as tags.
4) Analise os comandos entre chaves {} na ordem em que aparecem, desde <INÍCIO_DO_TEMPLATE> até <FIM_DO_TEMPLATE>.
5) A resposta deve conter apenas as tags aplicáveis. Não inclua os comandos entre chaves {} nem os delimitadores <INÍCIO_DO_TEMPLATE> e <FIM_DO_TEMPLATE>.
<INÍCIO_DO_TEMPLATE>
{ Inclua a tag abaixo se a variável [Reabilitação] = Não e a variável [ConclusãoPerícia] = Com Incapacidade Temporária }
<Laudo_Favorável_Sem_Reabilitação>
{ Inclua a tag abaixo se a variável [ConclusãoPerícia] = Não há incapacidade atual, mas houve incapacidade pregressa }
<Laudo_Favorável_Apenas_Período_Pregresso>
{ Inclua a tag abaixo se a variável [Reabilitação] = Sim e a variável [ConclusãoPerícia] = Com Incapacidade Temporária }
<Laudo_Favorável_Com_Reabilitação>
{ Inclua a tag abaixo se a variável [ConclusãoPerícia] = Com Incapacidade Permanente }
<Laudo_Favorável_APIN>
{ Inclua a tag abaixo se a variável [ConclusãoPerícia] = Com Incapacidade Permanente e a variável [APIN] = N }
<Laudo_Favorável_APIN_Sem_Pedido_APIN>
<FIM_DO_TEMPLATE >



## Qualidade de Segurado pela DCB

Qual evento comprova requerimento ou cessação do benefício?
[Ev_Cessação_Benef]=&beneficios.ev&

Qual a última DCB (Data da Cessação do Benefício)?
[ÚltimaDCB]=&ÚltimaDCB&

Qual a DIB (Data do Início do Benefício) do último benefício concedido?
[ÚltimaDIB]=&ÚltimaDIB&

Qual a DER do último benefício indeferido?
[ÚltimaDER_Indef]=&ÚltimaDER_Indef&

Qual a DII (Data do Início da Incapacidade)?
[DII]=&DII&

Se confirmada a qualidade de segurado, qual a origem?
[Fonte_QS]=&Fonte_QS&

### INVESTIGATION

Você deverá analisar o conteúdo delimitado pelos marcadores <benefícios> e </benefícios> para extrair informações específicas sobre benefícios previdenciários.

I) Estrutura do Texto a Ser Analisado
1.	O texto analisado é oriundo da conversão de uma tabela para formato textual.
2.	A seção relevante do texto começa a partir da linha que contém a expressão “BENEFÍCIOS PREVIDENCIÁRIOS”.
3.	Cada benefício é identificado por três linhas consecutivas:
o	Primeira linha: Tipo de benefício (ex.: "AUXÍLIO POR INCAPACIDADE TEMPORÁRIA").
o	Segunda linha: Número do benefício, precedido da sigla "NB:" (ex.: "NB: 123456789").
o	Terceira linha: Situação do benefício (ex.: "CESSADO" ou "INDEFERIDO").

II) Extração de Informações Relevantes
Para cada benefício identificado, você deve extrair as seguintes informações:
1.	Se o benefício estiver na situação "CESSADO", extraia:
o	Data do Início do Benefício (DIB)
o	Data da Cessação (DCB)
o	Valor da Renda Mensal Inicial (RMI)
2.	Se o benefício estiver na situação "INDEFERIDO", extraia:
o	Data da Entrada do Requerimento (DER)
o	Data do Indeferimento (Dt. Indef.)

III) Formatação da resposta:

A resposta deve seguir um formato fixo e rigoroso, conforme as diretrizes abaixo:

1)  Se houver ao menos um benefício na situação “CESSADO”: i) a primeira linha da resposta deve ser: “[ÚltimaDCB] = ” seguida da maior entre todas as datas de cessação (DCB); ii) a segunda linha da resposta deve ser: “[ÚltimaDIB] = ” seguida da data de início do benefício (DIB) desse benefício.  

2) Se não houver nenhum benefício na situação “CESSADO”, a primeira linha da resposta deve ser: “Não há benefícios concedidos no passado!”

3)  Se houver algum benefício na situação “INDEFERIDO”, a próxima linha da resposta deve ser: “[ÚltimaDER_Indef] = ” seguida da maior entre todas as datas de entrada do requerimento (DER) encontradas entre os benefícios na situação “INDEFERIDO”. Caso contrário, a próxima linha da resposta deve ser: “Não há benefícios indeferidos no passado!”

4) Se a variável [DII] (cujo valor está entre os marcadores <Info_DII> e </Info_DII>) tiver data até 12 meses após a data da [ÚltimaDCB], a próxima linha da resposta deve ser: “[Fonte_QS] = DCB”. Se não tiver sido atribuído valor à [ÚltimaDCB], ou a [DII] for mais de 12 meses posterior à [ÚltimaDCB], a próxima linha da resposta deve ser: “[Fonte_QS] = Não”.

5) Inclua na resposta: “\n\nBenefícios Requeridos:\n\n”.

6) Na sequência, crie uma lista numerada, na qual constará um benefício por linha. A lista deve estar em ordem decrescente da DER - Data da “Entrada do Requerimento” (da data mais recente para a mais antiga) seguindo os formatos abaixo:

6.1) Se a situação do benefício for “CESSADO”, o formato será:
<número> – Situação: Cessado - DIB: <dd/mm/aaaa>; DCB: <dd/mm/aaaa>; RMI = <valor da renda mensal inicial>.
Exemplo de linha para um benefício “CESSADO”: 
‘1 – Situação: Cessado – DIB: 18/04/2025; DCB: 15/08/2025; RMI = 1.045,00.’

6.2) Se a situação do benefício for “INDEFERIDO”, o formato será:
<número> – Situação: Indeferido – DER: <dd/mm/aaaa>; Dt. Indef.: <dd/mm/aaaa>.
Exemplo de linha para um benefício “INDEFERIDO”: 
‘2 – Situação: Indeferido – DER: 18/03/2024; Dt. Indef.: 20/04/2024.’

### GENERATION

OBJETIVO: Determinar, com base em testes lógicos, qual tag deve ser utilizada na fase atual, com a finalidade maior de construir um template de sentença estruturado por fases.

ANÁLISE:
A análise será feita conforme as <REGRAS_LÓGICAS_GERAIS> (aplicáveis a toda e qualquer análise), bem como atendendo às instruções específicas da <<PARTE_1>> e <<PARTE_2>>, conforme o caso.

USO DE VARIÁVEIS:
1) Os testes lógicos entre chaves {} fazem referência às variáveis contidas entre os delimitadores <variáveis> e </variáveis>. 
2) As variáveis [DII], [ÚltimaDIB] e [ÚltimaDCB] armazenam datas no formato dd/mm/aaaa.

<REGRAS_LÓGICAS_GERAIS>

* Usaremos os seguintes operadores lógicos na comparação das variáveis: a) > maior; b) < menor; c) >= maior ou igual; d) <= menor ou igual; e) <> diferente; f) = igual.

* As comparações entre datas (formato dd/mm/aaaa) devem ser feitas dia a dia. 

** REGRA DE OURO (a resposta será inválida se essa regra não for aplicada corretamente): As datas devem ser comparadas exclusivamente com base em lógica de datas (datetime do Python). Não considerar formatos textuais nem aparências. Esta regra é obrigatória e deve ser aplicada antes de qualquer decisão. Comparações válidas dependem de cálculo preciso baseado em lógica de datas ou matemática, e não em interpretação textual. As datas devem ser transformadas em objetos datetime e comparadas por diferença direta de tempo.

<<PARTE_1>>

1) No início da RESPOSTA, inclua o indicador de comentário: “//*”.

2) Nessa primeira parte, os testes lógicos entre chaves {} devem ser analisados sequencialmente mediante a aplicação da REGRA DE OURO. Para cada análise feita, você deve incluir na RESPOSTA uma breve explicação (até 40 palavras) sobre como aplicou a REGRA DE OURO (mas sem mencionar a existência da regra de ouro). Deve mencionar: os valores envolvidos, a comparação realizada e o respectivo resultado lógico. Exemplo: “... \n #R02: [DII] <= [ÚltimaDCB] + 12 meses \n 01/05/2023 <= 08/09/2021 (08/09/2020 + 12 meses) ❌ \n A regra é FALSA \n...”

3) A RESPOSTA deve seguir estritamente o formato definido, sem inserir explicações extras, alterar a ordem ou omitir quaisquer partes das estruturas requeridas.

4) Se o resultado do teste lógico for verdadeiro, inclua na RESPOSTA o indicador de comentário “*//”, seguido de “\n” e da tag imediatamente abaixo do teste lógico (Exemplo: “*//\n<QSEG_Último_Benefício_Menos_12meses>n”) e pule para a <<PARTE_2>>, sem processar os demais testes lógicos da <<PARTE_1>>. 

5) Se o resultado do teste lógico for falso, siga para o próximo teste lógico entre chaves {} sem incluir a tag ou expressão adicional na RESPOSTA.

{ #R01: [DII] <= [ÚltimaDCB] }
<QSEG_Restabelecimento>

{ #R02: [DII] <= [ÚltimaDCB] + 12 meses }
<QSEG_Último_Benefício_Menos_12meses>

<<PARTE_2>>

1) Se nenhuma tag for selecionada para inclusão na RESPOSTA, conforme regras da <<PARTE_1>>, inclua na RESPOSTA: “/*\nA condição de geração de texto para a Fase ‘Qualidade de Segurado pela DCB’ não foi satisfeita.\nCondição de Geração: Data do Início da Incapacidade([DII]) < Data da Cessação do Último Benefício ([ÚltimaDCB]) + 12 meses\n*/”

2) Se for incluída uma das tags, conforme regras da <<PARTE_1>>, verifique, mediante a aplicação da REGRA DE OURO, se [DII] < [ÚltimaDIB], incluindo na RESPOSTA: “//*” + uma breve explicação (até 30 palavras) sobre como aplicou a REGRA DE OURO + “*//”. 
2.1) Caso o teste ([DII] < [ÚltimaDIB]) tenha sido positivo: Inclua na RESPOSTA: “@backblue@ * Atenção: A Data de Início da Incapacidade (DII) foi fixada em momento anterior à Data do Início (DIB) do último benefício concedido, devendo ser averiguada, no caso concreto, a efetiva qualidade de segurado no momento da DII. @default@”
2.2) Caso contrário, nada mais deve ser incluído na RESPOSTA.



## Extração de Vínculos do CNIS ([Fonte_QS] == Não)

Relatório de Vínculos com base nas informações do CNIS:
[Rel_Vínculos]=&Rel_Vínculos&

Primeira data de pagamento entre os recolhimentos feitos pelo segurado:
[Dt_Primeiro_Recol]=&Dt_Primeiro_Recol&

Maior data de pagamento anterior à DII:
[Dt_Rec_Ant]=&Dt_Rec_Ant&

Competência com a maior data de pagamento anterior à DII:
[Comp_Rec_Ant]=&Comp_Rec_Ant&

Lista de Competências anteriores à DII, com recolhimento posterior à DII:
[Lista_Comp_Antes_DII_Recol_Depois]=&Lista_Comp_Antes_DII_Recol_Depois&

Primeiro recolhimento posterior à DII:
[Dt_1o_Recol_pósDII]=&Dt_1o_Recol_pósDII&

### INVESTIGATION

O conteúdo entre os marcadores <CNIS> e </CNIS> é o extrato de vínculos contributivos de um segurado (Extrato_CNIS). Ele será analisado para extrair informações relevantes.

#### I) Estrutura do Extrato_CNIS

1) Ordem dos vínculos:
- Começa com o mais antigo e termina com o mais recente.
- Leitura deve ser sequencial.

2) Cabeçalho e Corpo do vínculo:
- O Cabeçalho (cabeçalho_vínculo) contém os dados gerais do vínculo.
- O Corpo do vínculo (corpo_vínculo) contém as contribuições mensais efetuadas.

3) Cada vínculo possui necessariamente um cabeçalho_vínculo e, opcionalmente, um corpo_vínculo. 

4) Cada cabeçalho_vínculo inicia com “Seq.” e encerra com:
-  Uma linha com a expressão "Contribuições" ou “Remunerações” (indica a existência de um corpo_vínculo); ou
-  Uma linha iniciada por "Seq." (indica um novo vínculo).

5) Cada corpo_vínculo (se existente) inicia numa linha com a expressão "Contribuições" ou “Remunerações” e encerra numa linha iniciada por "Seq." (indica um novo vínculo).

#### II) Informações relevantes no cabeçalho_vínculo:

1) “Data Início” → primeira data em formato dd/mm/aaaa.

2) “Data Fim” → segunda data em formato dd/mm/aaaa (se existir).

3) “Últ. Remun.” → competência no formato mm/aaaa (se existir).

4) “Origem do vínculo” → expressão com uma ou mais palavras.

#### III) Informações relevantes no corpo_vínculo (se existente):

1) Cada contribuição está associada a uma competência (comp_contrib) no formato ‘mm/aaaa’. 

2) O corpo_vínculo contém de uma a três comp_contrib por linha.

3) Cada comp_contrib pode estar associada a uma data de pagamento (dt_pagamento) que, se houver, está no formato ‘dd/mm/aaaa’ logo após a comp_contrib.

#### PROCESSAMENTO: Será dividido em <PARTE_1>, <PARTE_2> e <PARTE_3>, conforme descrito abaixo. 

<PARTE_1>

OBJETIVO DA PARTE_1: Gerar um relatório estruturado a partir de todas as informações relevantes nos diversos cabeçalho_vínculo e atribuí-lo à variável [Rel_Preliminar].

A RESPOSTA da PARTE_1 deve ser: “[Rel_Preliminar] = ” seguido de um formato fixo e rigoroso para cada vínculo: {Seq} – {Origem_vínculo} – {Dt_Início} – {Dt_Início_Efetiva} – {Dt_Fim} – {Núm_Contrib} seguido de “ ; ”. 
Exemplo: “[Rel_Preliminar] = 1 – Empresa ABC – 13/08/1989 – 13/08/1989 – 13/08/1989 – 1 ;  2 – Recolhimentos – 01/09/1990 – 12/10/1990 – 30/08/1994 – 48 ; ...”.

ITENS da PARTE_1:

1) Seq: número sequencial associado ao vínculo.

2) Origem_vínculo: 
2.1) Origem_vínculo = “Recolhimentos”, se houver a palavra “RECOLHIMENTO” no cabeçalho_vínculo.
2.2) Origem_vínculo = “Benefício”, se houver a palavra “Benefício” no cabeçalho_vínculo. 
2.3) Na ausência dessas palavras, Origem_vínculo será o texto localizado depois dos campos numéricos no início da linha (que podem ter espaços, pontos e hífens) e antes da primeira data (no formato dd/mm/aaaa) encontrada no cabeçalho_vínculo.

3) Dt_Início = “Data Início” do cabeçalho_vínculo.

4) Dt_Início_Efetiva:
4.1) Dt_Início_Efetiva = “Data Início” do cabeçalho_vínculo, se Origem_vínculo for diferente de “Recolhimentos”.
4.2) Dt_Início_Efetiva = menor dt_pagamento do corpo_vínculo, se Origem_vínculo = “Recolhimentos”.

5) Dt_Fim:
5.1) Dt_Fim = “Data Fim”, se existente no cabeçalho_vínculo. Se não houver:
5.2) Dt_Fim = último dia do mês indicado como “Últ. Remun.” (se existente no cabeçalho_vínculo). Se não houver: 
5.3) Dt_Fim = Dt_Início

6) Núm_Contrib: quantidade de meses entre Dt_Início e Dt_Fim, incluindo os meses inicial e final (se os meses inicial e final forem iguais, Núm_Contrib = 1). O cálculo deve ser feito para todos os vínculos incluídos no relatório estruturado, independente da Origem_vínculo.

IMPORTANTE: Todos os vínculos devem fazer parte do relatório. ÚNICA EXCEÇÃO: Vínculos com Origem_vínculo = “Benefício” SEM Dt_Início associada.


<PARTE_2>

OBJETIVO DA PARTE_2: Com base no relatório estruturado da PARTE_1, incluir informações adicionais com base em lógica precisa de datas e números, atribuindo, ao final, o resultado à variável [Rel_Vínculos].

REGRAS DA PARTE_2:

** REGRA DE OURO (a resposta será inválida se essa regra não for aplicada corretamente): Calcule cada diferença entre datas (dd/mm/aaaa) ou competências (mm/aaaa) com base na lógica de datas do Python (com datetime). Não considerar formatos textuais nem aparências. Esta regra é obrigatória e deve ser aplicada em qualquer cálculo ou comparação que envolva datas ou competências. A única forma de calcular corretamente com datas ou competências é usando lógica precisa. As datas e competências devem ser transformadas em objetos datetime (atentando para os formatos dd/mm/aaaa e mm/aaaa) e calculadas ou comparadas por diferença direta de tempo.

CÁLCULO DOS ITENS da PARTE_2:

Além dos itens já extraídos no [Rel_Preliminar] (PARTE_1), a PARTE_2 prevê os seguintes itens:

1) QS:
1.1) Se for o primeiro vínculo: QS = “1º Vínculo”.
1.2) Nos demais vínculos, compare, com base na REGRA DE OURO, a Dt_Início_Efetiva do vínculo atual com a Dt_Perda_QS do vínculo anterior.
a) Se Dt_Início_Efetiva atual <= Dt_Perda_QS anterior: QS = “Manteve QS”. 
b) Se Dt_Início_Efetiva atual > Dt_Perda_QS anterior: QS = “Perdeu QS”.

2) Total_Contrib_Sem_Perda_QS: 
2.1) Se QS atual = “Manteve QS”, Total_Contrib_Sem_Perda_QS = Núm_Contrib do vínculo atual + Total_Contrib_Sem_Perda_QS do vínculo anterior.
2.2) Caso contrário, Total_Contrib_Sem_Perda_QS = Núm_Contrib do vínculo atual.

3) Máximo_Sem_Perda_QS: Verifique o maior valor atribuído a Total_Contrib_Sem_Perda_QS até o vínculo atual (considerando todos os vínculos anteriores e o atual no relatório da PARTE_2). IMPORTANTE: Essa verificação deve ser realizada matematicamente (Total_Contrib_Sem_Perda_QS é sempre número inteiro), e não por inferência ou interpretação subjetiva de tempo ou volume. É PROIBIDO o uso de qualquer tipo de lógica textual nessa verificação.

4) P_Graça:
4.1) Se Máximo_Sem_Perda_QS < 120: P_Graça = 12.
4.2) Se Máximo_Sem_Perda_QS  ≥ 120: P_Graça = 24.

5) Dt_Perda_QS: Calcule, com base na REGRA DE OURO, o mês que corresponde à competência da Dt_Fim + quantidade de meses do P_Graça + 2 meses. A Dt_Perda_QS  será o dia 15 do mês calculado.

RESPOSTA DA PARTE_2:

1) Para cada vínculo, inclua na RESPOSTA: 
a) Seq: {Seq atual}
b) Se QS = “1º Vínculo”, inclua uma linha indicando: “1º Vínculo”. Caso contrário, inclua na RESPOSTA uma linha com o formato: Data Limite Anterior: {Dt_Perda_QS anterior} \n Início do Vínculo: {Dt_Início_Efetiva atual} – Portanto: {QS atual}. 
c) Total de Contribuições sem perder a QS após o vínculo: {Total_Contrib_Sem_Perda_QS atual}.
d) Máximo de Contribuições sem perder QS: { Máximo_Sem_Perda_QS atual }
e) Período de Graça após o vínculo = {P_Graça atual} meses.
f) Término do Vínculo: {Dt_Fim atual}
g) Data Limite para o próximo vínculo: {Dt_Perda_QS atual} 

2) Depois de todas as linhas incluídas com as explicações acima, inclua na RESPOSTA: “[Rel_Vínculos] = ” seguido de um formato fixo e rigoroso para cada vínculo: {Seq} – {QS} – {Origem_vínculo} – {Dt_Início} – {Dt_Início_Efetiva} – {Dt_Fim} – {Núm_Contrib} – {Total_Contrib_Sem_Perda_QS} – {P_Graça} – {Dt_Perda_QS} seguido de “ ; ”.
Exemplo: “[Rel_Vínculos] = 1 – 1º Vínculo – Empresa ABC – 13/08/1989 – 13/08/1989 – 13/08/1989 – 1 – 1 – 12 – 15/10/1990 ;  2 – Manteve QS – Recolhimentos – 01/09/1990 – 12/10/1990 – 30/08/1994 – 48 – 49 – 12 – 15/10/1995 ; 3 – Manteve QS – Recolhimentos – 01/10/1994 – 07/10/1994 – 29/02/1996 – 17 – 66 – 12 – 15/04/1997 ; 4 – Perdeu QS – AGRUPAMENTO DE COOPERATIVAS – 01/09/1997 – 01/09/1997 – 01/02/1998 – 6 – 6 ; 5 – ...”.


<PARTE_3>

OBJETIVO DA PARTE_3: Atribuir valores a variáveis com base nas contribuições presentes nos diversos corpo_vínculo do Extrato_CNIS e na data atribuída a [DII] entre os marcadores <Info_DII> e </Info_DII>. 

RESPOSTA DA PARTE_3: 
1) Para cada valor atribuído a cada variável, forneça uma explicação lógica e sucinta (máximo de 30 palavras) sobre a origem e o cálculo efetuado. 
2) Após a explicação lógica, apresente (em outra linha) a variável e seu valor, seguindo um formato fixo e rigoroso: “[nome_variavel] = valor”. Exemplo: “[Dt_Primeira_Contrib] = 03/05/1986”.

REGRAS DA PARTE_3: 

** REGRA DE OURO (a resposta será inválida se essa regra não for aplicada corretamente): Cálculos e testes de condições que envolvam datas (dd/mm/aaaa) ou competências (mm/aaaa) precisam ser feitos com base na lógica de datas do Python (com datetime). Não teste qualquer condição ou calcule com base em datas ou competências no formato texto ou aparência sequencial. Comparações válidas dependem de cálculo preciso baseado em lógica de datas ou matemática, e não em interpretação textual. As datas e competências devem ser transformadas em objetos datetime (atentando para os formatos dd/mm/aaaa e mm/aaaa) e comparadas por diferença direta de tempo.

** Os cálculos e a atribuição de valores para cada item abaixo devem necessariamente obedecer à REGRA DE OURO em todas as operações com datas e competências, bem como observar os seguintes parâmetros:

1) [Dt_Primeiro_Recol] = menor dt_pagamento entre os recolhimentos nos diversos corpo_vínculo.

2) [Dt_Rec_Ant] = maior dt_pagamento menor que a [DII] entre os recolhimentos nos diversos corpo_vínculo. Se não houver nenhum recolhimento, [Dt_Rec_Ant] = 01/01/1900.

3) [Comp_Rec_Ant] = maior comp_contrib cuja dt_pagamento associada é menor que a [DII]. Se não houver nenhum recolhimento, [Comp_Rec_Ant] = 01/1900.

4) [Comp_DII] = competência da [DII], no formato mm/aaaa.

5) Se houver, entre os recolhimentos, ao menos uma comp_contrib anterior à [comp_DII] e dt_pagamento posterior à [DII]:
[Lista_Comp_Antes_DII_Recol_Depois] = lista (no formato mm/aaaaa, separado por vírgulas) contendo todas as comp_contrib anteriores à [comp_DII] e dt_pagamento posterior à [DII]. 
Caso contrário:
[Lista_Comp_Antes_DII_Recol_Depois] = “não há”.

6) Se houver, entre os recolhimentos, ao menos uma dt_pagamento depois da [DII]:
[Dt_1o_Recol_pósDII] = menor dt_pagamento depois da [DII]. 
Caso contrário:
[Dt_1o_Recol_pósDII] = 00/00/0000


### GENERATION

OBJETIVO: Você deve analisar o conteúdo da variável [Rel_Vínculos], que se encontra entre os delimitadores <variáveis> e </variáveis> e utilizar essas informações para elaborar um trecho de sentença. 

#### ESTRUTURA DA VARIÁVEL [Rel_Vínculos]:

1) A variável [Rel_Vínculos] contém uma série de vínculos previdenciários de um segurado. Cada vínculo é separado por ponto e vírgula “;”.

2) Cada vínculo tem a seguinte estrutura: (Seq) – (QS) – (origem_vínculo) – (Dt_Início) – (Dt_Início_Efetiva) - (Dt_Fim) – (Núm_Contrib) (Total_Contrib_Sem_Perda_QS) – (P_Graça) – (Dt_Perda_QS).

##### PROCESSAMENTO: Será dividido em <PARTE_1> e <PARTE_2>, conforme descrito abaixo. 

<PARTE_1>
Objetivo: introduzir a análise com base no primeiro vínculo.

Inclua na RESPOSTA o seguinte texto literal: “Noutra perspectiva, para aferição da qualidade de segurado no momento da incapacidade, colaciona-se uma breve síntese das informações constantes no CNIS da parte autora: \n”
Inclua, em seguida, uma linha referente ao primeiro vínculo encontrado em [Rel_Vínculos], no seguinte formato fixo: (Seq) – (Dt_Início) a (Dt_Fim) – (origem_vínculo) – (Núm_Contrib) Contribuições - Total: (Total_Contrib_Sem_Perda_QS) sem perda QS. 

<PARTE_2> 
Objetivo: processar os vínculos restantes (do segundo até o último).
Para cada vínculo do segundo em diante:
1) Verifique o campo (QS):
a) Se (QS) = “Perdeu QS”:
- inclua uma linha na RESPOSTA com o seguinte formato fixo: 
** Perda da qualidade de segurado - Período de Graça: (P_Graça do vínculo anterior) meses / Manteve QS até: (Dt_Perda_QS do vínculo anterior). 
- em seguida, inclua a linha do vínculo conforme item 2.
b) Se (QS) <> “Perdeu QS”:
 - inclua apenas a linha do vínculo conforme item 2.
2) Linha padrão de descrição do vínculo: 
(Seq) – (Dt_Início) a (Dt_Fim) – (origem_vínculo) – (Núm_Contrib) Contribuições - Total: (Total_Contrib_Sem_Perda_QS) sem perda QS.

Exemplo de trecho da RESPOSTA: “... 3 – 01/10/1994 a 29/02/1996 – Recolhimentos – 17 contribuições – Total: 85 sem perda QS \n ** Perda da qualidade de segurado - Período de Graça: 12 meses / Manteve QS até: 15/04/1997. \n 4 – 10/09/2003 a 15/10/2004 – Empresa ABC - 13 contribuições – Total: 13 sem perda QS ...”



## Qualidade de Segurado pelo CNIS ([Fonte_QS] == Não)

Em qual evento se encontra o CNIS?
[Ev_CNIS]=&cnis.ev&

Em qual evento se encontra o pedido/deferimento do seguro desemprego?
[Ev_Seg_Desemprego]=0

Máximo de contribuições sem perda da qualidade de segurado:
[Núm_Contrib_Sem_Perder_QS]=&Núm_Contrib_Sem_Perder_QS&

Total geral de contribuições:
[Total_Contrib]=&Total_Contrib& 

Data do primeiro vínculo com o RGPS:
[Dt_Primeiro_Vínculo]=&[Dt_Primeiro_Vínculo]& 

Primeira data de pagamento entre os recolhimentos feitos pelo segurado:
[Dt_Primeiro_Recol]=&Dt_Primeiro_Recol&

DII (Data do Início da Incapacidade):
[DII]=&DII&

Competência da DII (Data do início da Incapacidade):
[Comp_DII]=&Comp_DII&

Última competência recolhida pelo segurado antes da Incapacidade:
[Últ_Comp_Ant_Incapac]=&Últ_Comp_Ant_Incapac&

Última data de recolhimento pelo segurado antes da Incapacidade:
[Dt_Recol_Ant_Incapac]=&Dt_Recol_Ant_Incapac&

Início do último vínculo de emprego ou benefício antes da Incapacidade:
[Dt_Ini_Último_Emprego]=&Dt_Ini_Último_Emprego&

Fim do último vínculo de emprego ou benefício antes da Incapacidade:
[Dt_Fim_Último_Emprego]=&Dt_Fim_Último_Emprego&

Última competência de contribuição antes da Incapacidade:
[Últ_Comp_Contrib_Ant]= &[Últ_Comp_Contrib_Ant]&

Espécie do vínculo antes da Incapacidade:
[Espécie_Antes_DII]=&Espécie_Antes_DII&

Dia em que houve a Perda da Qualidade de Segurado:
[Dia_Perda_QS]=&[Dia_Perda_QS]&

Dia em que recuperou a Qualidade de Segurado:
[Dia_Recupera_QS]=&Dia_Recupera_QS&

Primeiro recolhimento feito após a Incapacidade:
[Dt_1o_Recol_pósDII]=&Dt_1o_Recol_pósDII&

Lista de competências antes da DII recolhidas após a Incapacidade:
[Lista_Comp_Antes_DII_Recol_Depois]= &Lista_Comp_Antes_DII_Recol_Depois&

Número de contribuições entre a perda da qualidade de segurado e a DII:
[Núm_Contrib_Antes_DII]=&Núm_Contrib_Antes_DII&

### INVESTIGATION

O conteúdo entre os marcadores <Rel_Vínculos> e </Rel_Vínculos> traz um relatório de vínculos de um segurado (Rel_Vínculos). Esse relatório será analisado para extrair informações relevantes para uma sentença judicial.

#### Estrutura do Rel_Vínculos:

a) Contém todos os vínculos ordenados do mais antigo para o mais recente.

b) Cada vínculo possui a seguinte estrutura: {Seq} – {QS} – {Espécie_Vínculo} – {Dt_Início} – {Dt_Início_Efetiva} – {Dt_Fim} – {Núm_Contrib} – {Contrib_Sem_Perda_QS} – {P_Graça} – {Dt_Perda_QS} 

* {Seq}: número sequencial

* QS: pode ser de três tipos: “1º Vínculo”, “Manteve QS” e “Perdeu QS”.

* Espécie_Vínculo: pode ser de três categorias: “Recolhimentos”, “Benefício” e “Outros” (qualquer valor diferente de “Recolhimentos” e “Benefício” deve ser tratado nas regras lógicas como “Outros”)

* Dt_Início: formato dd/mm/aaaa.

* Dt_Início_Efetiva: formato dd/mm/aaaa.

* Dt_Fim: formato dd/mm/aaaa.

* Num_Contrib: número de contribuições do vínculo.

* Contrib_Sem_perda_QS: número de contribuições sem perda da qualidade de segurado que foram acumuladas até o fim vínculo.

c) Os campos P_Graça e Dt_Perda_QS não são necessários no processamento.
d) Os vínculos são separados por ponto e vírgula “;”.

OBJETIVO: Atribuir valores a variáveis com base nos vínculos (Rel_Vínculos), na data atribuída a [DII] entre os marcadores <Info_DII> e </Info_DII> e no conteúdo das variáveis [Dt_Rec_Ant], [Comp_Rec_Ant] e [Ev_Seg_Desemprego] existentes entre os marcadores <variáveis_anteriores> e </variáveis_anteriores>. 

#### FORMATO DA RESPOSTA: 
1) Para cada valor atribuído a cada variável, forneça uma explicação lógica e sucinta (máximo de 40 palavras) sobre o cálculo feito com base na REGRA DE OURO (mas sem mencionar a existência da regra de ouro). 
2) Após a explicação lógica, apresente (em outra linha) a variável e seu valor, seguindo um formato fixo e rigoroso: “[nome_variavel] = valor”. Exemplo: “[Dt_Primeira_Contrib] = 03/05/1986”.

#### REGRAS:

** REGRA DE OURO (a resposta será inválida se essa regra não for aplicada corretamente): Cálculos e testes de condições que envolvam datas precisam ser feitos exclusivamente com base em lógica de datas (datetime do Python). Não considerar formatos textuais nem aparências. Esta regra é obrigatória e deve ser aplicada em todos os testes e cálculos. Comparações e atribuições válidas dependem de cálculo preciso baseado em lógica de datas ou matemática, e não em interpretação textual.

1) [Núm_Contrib_Sem_Perder_QS] = maior valor para Contrib_Sem_perda_QS entre os vínculos.

2) [Total_Contrib] = soma das Núm_Contrib de todos os vínculos.

3) [Dt_Primeiro_Vínculo] = Dt_Início_Efetiva do primeiro vínculo.

4) [Comp_DII] = competência da [DII], no formato mm/aaaa.

5) [Dt_Ini_Vínculo_Antes_DII] = maior Dt_Início_Efetiva menor que a [DII] entre os vínculos.

6) [Dt_Fim_Vínculo_Antes_DII] = Dt_Fim do vínculo associado à [Dt_Ini_Vínculo_Antes_DII].

7) [Espécie_Antes_DII] = Espécie_Vínculo do vínculo associado à [Dt_Ini_Vínculo_Antes_DII].

8) Se houver ao menos um vínculo com Dt_Fim menor que a [DII] e Espécie_Vínculo <> “Recolhimentos”:
[Dt_Empr_Ant_Aux] = maior Dt_Fim menor que a [DII] com Espécie_Vínculo <> “Recolhimentos”
Caso Contrário:
[Dt_Empr_Ant_Aux] = 01/01/1900

9) Se [Espécie_Antes_DII] <> “Recolhimentos” e [Dt_Fim_Vínculo_Antes_DII] > [DII]: 
[Dt_Empr_Ant] = dia anterior à [DII]
Caso contrário:
[Dt_Empr_Ant] = [Dt_Empr_Ant_Aux]

10) Se [Dt_Rec_Ant] > [Dt_Empr_Ant]:
[Últ_Comp_Ant_Incapac] = [Comp_Rec_Ant]
[Dt_Recol_Ant_Incapac] = [Dt_Rec_Ant]
[Dt_Ini_Último_Emprego] = 01/01/1900
[Dt_Fim_Último_Emprego] = 01/01/1900
[Últ_Comp_Contrib_Ant] = [Comp_Rec_Ant]
Caso contrário:
[Últ_Comp_Ant_Incapac] = 01/1900
[Dt_Recol_Ant_Incapac] = 01/01/1900
[Dt_Ini_Último_Emprego] = [Dt_Ini_Vínculo_Antes_DII]
[Dt_Fim_Último_Emprego] = [Dt_Fim_Vínculo_Antes_DII]
[Últ_Comp_Contrib_Ant] = competência da [Dt_Empr_Ant]

11) Se [Núm_Contrib_Sem_Perder_QS] < 120:
[Dia_Perda_QS] = Dia 15 do décimo quarto mês depois da [Últ_Comp_Contrib_Ant]
Caso contrário:
[Dia_Perda_QS] = Dia 15 do vigésimo sexto mês depois da [Últ_Comp_Contrib_Ant]

12) Se [Ev_Seg_Desemprego] <> 0:
[Dia_Perda_QS] = [Dia_Perda_QS] + 12 meses
Caso contrário: 
[Dia_Perda_QS] mantém seu valor

13) Se algum vínculo possui QS = “Perdeu QS”:
[Dia_Recupera_QS_Antes_DII] = Dt_Início_Efetiva do último vínculo que possuir QS = “Perdeu QS”
Caso contrário:
[Dia_Recupera_QS_Antes_DII] = [Dt_Primeiro_Vínculo]

14) Se [Lista_Comp_Antes_DII_Recol_Depois] <> “não há”
[Num_Comp_Antes_DII_Recol_Depois] = quantidade de competências (formato mm/aaaa) que existirem na [Lista_Comp_Antes_DII_Recol_Depois]
Caso contrário:
[Num_Comp_Antes_DII_Recol_Depois] = 0

15) Se competência da [Dt_Fim_Vínculo_Antes_DII] >= competência da [DII]:
[Num_Comp_Excl_Depois_DII] = número de competências entre a [DII] e a [Dt_Fim_Vínculo_Antes_DII], incluindo a competência de início e de fim (se as competências de início e de fim forem iguais, [Num_Comp_Excl_Depois_DII] = 1).
Caso contrário:
[Num_Comp_Excl_Depois_DII] = 0

16) [Total_Contrib_Vínculo_DII] = Contrib_Sem_perda_QS associado ao vínculo com Dt_Inicio = [Dt_Ini_Vínculo_Antes_DII] 

17) [Núm_Contrib_Antes_DII] = [Total_Contrib_Vínculo_DII] - [Num_Comp_Antes_DII_Recol_Depois] - [Num_Comp_Excl_Depois_DII]


### GENERATION

OBJETIVO: Você deve analisar o conteúdo da variável [Rel_Vínculos], que se encontra entre os delimitadores <variáveis> e </variáveis> e utilizar essas informações para elaborar um trecho de sentença. 

#### ESTRUTURA DA VARIÁVEL [Rel_Vínculos]:

1) A variável [Rel_Vínculos] contém uma série de vínculos previdenciários de um segurado. Cada vínculo é separado por ponto e vírgula “;”.

2) Cada vínculo tem a seguinte estrutura: (Seq) – (QS) – (origem_vínculo) – (Dt_Início) – (Dt_Início_Efetiva) - (Dt_Fim) – (Núm_Contrib) (Total_Contrib_Sem_Perda_QS) – (P_Graça) – (Dt_Perda_QS).

#### PROCESSAMENTO: Será dividido em <PARTE_1> e <PARTE_2>, conforme descrito abaixo. 
<PARTE_1>

Objetivo: introduzir a análise com base no primeiro vínculo.

Inclua na RESPOSTA o seguinte texto literal: “Noutra perspectiva, para aferição da qualidade de segurado no momento da incapacidade, colaciona-se uma breve síntese das informações constantes no CNIS da parte autora: \n”
Inclua, em seguida, uma linha referente ao primeiro vínculo encontrado em [Rel_Vínculos], no seguinte formato fixo: (Seq) – (Dt_Início) a (Dt_Fim) – (origem_vínculo) – (Núm_Contrib) Contribuições - Total: (Total_Contrib_Sem_Perda_QS) sem perda QS. 

<PARTE_2> 
Objetivo: processar os vínculos restantes (do segundo até o último).
Para cada vínculo do segundo em diante:
1) Verifique o campo (QS):
a) Se (QS) = “Perdeu QS”:
- inclua uma linha na RESPOSTA com o seguinte formato fixo: 
** Perda da qualidade de segurado - Período de Graça: (P_Graça do vínculo anterior) meses / Manteve QS até: (Dt_Perda_QS do vínculo anterior). 
- em seguida, inclua a linha do vínculo conforme item 2.
b) Se (QS) <> “Perdeu QS”:
 - inclua apenas a linha do vínculo conforme item 2.
2) Linha padrão de descrição do vínculo: 
(Seq) – (Dt_Início) a (Dt_Fim) – (origem_vínculo) – (Núm_Contrib) Contribuições - Total: (Total_Contrib_Sem_Perda_QS) sem perda QS.
Exemplo de trecho da RESPOSTA: “... 3 – 01/10/1994 a 29/02/1996 – Recolhimentos – 17 contribuições – Total: 85 sem perda QS \n ** Perda da qualidade de segurado - Período de Graça: 12 meses / Manteve QS até: 15/04/1997. \n 4 – 10/09/2003 a 15/10/2004 – Empresa ABC - 13 contribuições – Total: 13 sem perda QS ...”



## Carência ([Fonte_QS] == Não AND [Dia_Perda_QS] > [DII])

Perda da Qualidade de Segurado anterior à Incapacidade:
[Dia_Perda_QS]=&Dia_Perda_QS&

Dia em que recuperou a Qualidade de Segurado pela última vez:
[Dia_Recupera_QS_Antes_DII]=&Dia_Recupera_QS_Antes_DII&

Primeiro recolhimento após a Incapacidade:
[Dt_1o_Recol_pósDII]=&Dt_1o_Recol_pósDII&

Lista de competências antes da DII recolhidas após a Incapacidade:
[Lista_Comp_Antes_DII_Recol_Depois]= &Lista_Comp_Antes_DII_Recol_Depois&

Número de competências anteriores à DII recolhidas após a Incapacidade:
[Num_Comp_Antes_DII_Recol_Depois]= &Num_Comp_Antes_DII_Recol_Depois&

Total geral de contribuições:
[Total_Contrib]=&Total_Contrib& 

Número de contribuições entre a perda da qualidade de segurado e a DII:
[Núm_Contrib_Antes_DII]=&Núm_Contrib_Antes_DII& 

Quais as Patologia que dispensa o cumprimento de Carência?
[PatologiaIncapacitante]=&[PatologiaIncapacitante]&

DII (Data do Início da Incapacidade):
[DII]=&DII&

DID (Data do Início da Doença):
[DID]=&DID&

Houve filiação oportunista em caso de DID desconhecida (mas provavelmente anterior ao primeiro recolhimento após recuperar a qualidade de segurado)?
[Filiação_Oportunista]=N

### GENERATION

OBJETIVO: Determinar, com base em testes lógicos, qual tag deve ser utilizada na fase atual com a finalidade maior de construir um template de sentença estruturado por fases.

#### ANÁLISE:
1) A análise será feita conforme as <REGRAS_LÓGICAS> (aplicáveis a toda e qualquer análise).

#### USO DE VARIÁVEIS:
1) Os testes lógicos entre chaves {} fazem referência às variáveis contidas entre os delimitadores <variáveis> e </variáveis>. 
2) As variáveis [Total_Contrib] e [Núm_Contrib_Antes_DII] armazenam números (quantidade de competências). 
3) A variável [Filiação_Oportunista] pode assumir os valores: ‘S’=‘Sim’ ou ‘N’=‘Não’.
4) As variáveis [DII], [DID], [Dia_Recupera_QS_Antes_DII] e [Dia_Perda_QS] armazenam datas no formato dd/mm/aaaa.
5) A variável [PatologiaIncapacitante] é do tipo texto e indica uma ou mais patologias. Verifique se a(s) patologia(s) indicada(s) está(ão) presente(s) na seguinte lista de patologias: I - tuberculose ativa; II - hanseníase; III - transtorno mental grave, desde que esteja cursando com alienação mental; IV - neoplasia maligna; V - cegueira; VI - paralisia irreversível e incapacitante; VII - cardiopatia grave; VIII - doença de Parkinson; IX - espondilite anquilosante; X - nefropatia grave; XI - estado avançado da doença de Paget (osteíte deformante); XII - síndrome da deficiência imunológica adquirida (AIDS/SIDA); XIII - contaminação por radiação, com base em conclusão da medicina especializada; XIV - hepatopatia grave; XV - esclerose múltipla; XVI - acidente vascular encefálico (agudo); e XVII - abdome agudo cirúrgico. 
A comparação deve considerar equivalência semântica, ou seja, mesmo que os nomes não coincidam exatamente, deve-se reconhecer se a patologia indicada corresponde, de forma substancial, a alguma da lista.
Identificada a presença em lista, considere como nova variável [Patologia_Lista] = Sim. Caso contrário, considere [Patologia_Lista] = Não.

<REGRAS_LÓGICAS >

I) Usaremos os seguintes operadores lógicos na comparação das variáveis: a) > maior; b) < menor; c) >= maior ou igual; d) <= menor ou igual; e) <> diferente; f) = igual.

II) As comparações entre datas (formato dd/mm/aaaa) devem ser feitas dia a dia. 

III) Os testes lógicos entre chaves {} devem ser analisados sequencialmente mediante a aplicação da REGRA DE OURO. 

** REGRA DE OURO (a resposta será inválida se essa regra não for aplicada corretamente): As datas devem ser comparadas exclusivamente com base em lógica de datas (datetime do Python). Não considerar formatos textuais nem aparências. Esta regra é obrigatória e deve ser aplicada antes de qualquer decisão. Comparações válidas dependem de cálculo preciso baseado em lógica de datas ou matemática, e não em interpretação textual. As datas devem ser transformadas em objetos datetime e comparadas por diferença direta de tempo.

#### ESTRUTURA DA RESPOSTA:

1) No início da RESPOSTA, inclua o indicador de comentário: “//*”.

2) Para cada análise feita, você deve incluir na RESPOSTA uma breve explicação (até 70 palavras) sobre como aplicou a REGRA DE OURO (mas sem mencionar a existência da regra de ouro). Deve mencionar: os valores envolvidos, a comparação realizada e o respectivo resultado lógico. Exemplo de RESPOSTA para cada teste lógico: “... #R03:\n [Patologia_Lista] = Sim  ✔️\n [DID] >= [Dia_Recupera_QS_Antes_DII] \n → 22/08/2023 >= 10/10/2024 ❌\n #R03 é FALSA \n ...”

4) A RESPOSTA deve seguir estritamente o formato definido, sem inserir explicações extras, alterar a ordem ou omitir quaisquer partes das estruturas requeridas.

5) Se o resultado do teste lógico for verdadeiro, inclua na RESPOSTA o indicador de comentário “*//”, seguido de “\n” e da tag imediatamente abaixo do teste lógico (Exemplo: “*//\n<Carência_+12ContribTotal_+6AntesDII>\n”) e encerre o processamento. 

6) Se o resultado do teste lógico for falso, siga para o próximo teste lógico entre chaves {} sem incluir a tag ou expressão adicional na RESPOSTA.

{ #R01: [Núm_Contrib_Antes_DII] >= 12 }
<Carência_+12Contrib_AntesDII>

{ #R02: 2 condições cumulativas: 
i) [Total_Contrib] >= 12 
ii) [Núm_Contrib_Antes_DII] >= 6 }
<Carência_+12ContribTotal_+6AntesDII>

{ #R03: 2 condições cumulativas:
i) [Patologia_Lista] = Sim 
ii) [DID] >= [Dia_Recupera_QS_Antes_DII] }
<Carência_Dispensa>
{ #R04: 3 condições cumulativas:
i) [Patologia_Lista] = Não
ii) [Núm_Contrib_Antes_DII]  < 12
iii) [Num_Comp_Antes_DII_Recol_Depois] = 0 }
<SemCarência_Menos_12Contrib_Sem_Lista_AntesDepois >

{ #R05: 3 condições cumulativas:
i) [Patologia_Lista] = Não
ii) [Núm_Contrib_Antes_DII]  < 12
iii) [Num_Comp_Antes_DII_Recol_Depois] <> 0}
<SemCarência_Menos_12Contrib_Com_Lista_AntesDepois >

{ #R06: 4 condições cumulativas:
i) [Patologia_Lista] = Não
ii) [Total_Contrib] >= 12 
iii) [Num_Comp_Antes_DII_Recol_Depois] = 0
iv) [Núm_Contrib_Antes_DII]  < 6 }
<SemCarência_+12Total_-6antesDII_Sem_Lista_AntesDepois>

{ #R07: 4 condições cumulativas:
i) [Patologia_Lista] = Não
ii) [Total_Contrib] >= 12 
iii) [Num_Comp_Antes_DII_Recol_Depois] <> 0
iv) [Núm_Contrib_Antes_DII]  < 6 }
<SemCarência_+12Total_-6antesDII_Com_Lista_AntesDepois>

{ #R08: 2 condições cumulativas:
i) [Patologia_Lista] = Sim
ii) [DID] < [Dia_Recupera_QS_Antes_DII] }
<SemCarência_Moléstia_Isentiva_DID_Anterior_(Re)Ingresso>

{ #R09: [Filiação_Oportunista] = S ou [Filiação_Oportunista] = Sim }
<SemCarência_Filiação_Oportunista_Moléstia_Isentiva_DID_Desconhecida>



## Resposta à Impugnação do(a) Autor(a) ao Laudo ([Ev_Impug] <> 0)

Em qual evento se encontra a impugnação do autor ao laudo pericial?
[Ev_Impug]=&impugnacao.ev&

### GENERATION

Você deve verificar quais os argumentos apresentados entre os delimitadores <arg_TP> e </arg_TP> têm correlação com as alegações e pedidos contidos na impugnação ao laudo pericial entre os delimitadores <impug> e </impug>.

Os argumentos estão numerados e, para cada argumento, sua resposta deve indicar apenas sim, não ou ind, sem explicações adicionais. A resposta deve seguir rigorosamente o formato: número do argumento – sim, não ou ind. Depois de cada argumento analisado, coloque ponto e vírgula (;) para fins de separação. Exemplo de resposta: 1 - sim; 2 - não; 3 – ind; 4 – sim; 5 – não.

Responda “sim” se o argumento apresenta semelhança de significado ou ideia equivalente a alguma alegação ou pedido da impugnação.

Responda “não” se o argumento não tem semelhança de significado ou ideia equivalente com as alegações ou pedidos da impugnação.

Responda “ind” se o argumento abordar alguma alegação ou pedido da impugnação de forma indireta, muito genérica ou se a relação entre o argumento e as alegações ou pedidos da impugnação for ambígua, vaga ou insuficiente para estabelecer uma conexão clara.

IMPORTANTE:
Cada análise deve ser feita de forma independente, sem considerar qualquer outra análise já realizada. Você não deve, sob nenhuma hipótese, reutilizar informações anteriores ou qualquer dado externo à análise em questão.

### OBJECTION

{ Incompatibilidade entre o resultado da perícia judicial e os laudos particulares apresentados, uma vez que os exames e/ou laudos particulares apontam para: i) a incapacidade permanente (enquanto o perito afirma que a incapacidade é temporária); ou ii) existência de incapacidade iniciando em momento anterior ao fixado no laudo pericial. }
Quanto à alegação da parte autora de que o resultado da perícia judicial é incompatível com o resultado de laudos particulares de seus médicos assistentes, impõe-se ressaltar que a mera divergência entre os pareceres, por si só, não é apta a impor a revisão ou desconsideração do laudo da perícia judicial, sobretudo porque o perito do juízo pode divergir de considerações médicas emitidas pelos assistentes tanto da parte autora como da parte ré, com base na sua própria opinião clínica.

Neste sentido, a conclusão do perito do juízo, em razão de sua condição equidistante das partes, prevalece em relação às conclusões dos assistentes de qualquer das partes. Ademais, o perito tem atribuição de avaliar a capacidade da parte para o trabalho, tendo em mente a necessidade de concessão ou não do benefício, enquanto o médico assistente se responsabiliza pelo tratamento de seu paciente. 

Tenho que apenas em casos excepcionais, em que se prova um quadro fático muito destoante dos elementos de convicção estabelecidos pelo perito é que a opinião do expert deve ser afastada como elemento principal de convencimento. Certamente este não é o caso trazido a julgamento, que apenas demonstra opiniões diversas sobre a capacidade da parte autora. 

{ Apresentação de novos quesitos, afirmando que existem pontos omissos ou contraditórios no laudo pericial que precisam ser esclarecidos pelo perito }
A irresignação da parte autora em relação às respostas do perito em alguns quesitos, requerendo maiores esclarecimentos, não se justifica, haja vista que o laudo se encontra suficientemente fundamentado. Nota-se claramente o viés de irresignação nas perguntas que foram colocadas como se fossem uma necessidade de maior esclarecimento, ou seja, a parte autora apenas deseja ver o laudo ter outro resultado (favorável à concessão de benefício por incapacidade permanente). Não há contradição a ser sanada. Não há elemento a ser esclarecido. Há tão somente a vontade de que o laudo tivesse conclusão ainda mais favorável aos seus interesses. 



## Resposta à Impugnação do INSS ao Laudo ([Ev_INSS_Impug] <> 0)

Em qual evento se encontra a impugnação do INSS ao laudo pericial?
[Ev_INSS_Impug]=&inss_impug.ev&

### GENERATION

Você deve verificar quais os argumentos apresentados entre os delimitadores <arg_TP> e </arg_TP> têm correlação com as alegações e pedidos contidos na impugnação ao laudo pericial entre os delimitadores <impug> e </impug>.
Os argumentos estão numerados e, para cada argumento, sua resposta deve indicar apenas sim, não ou ind, sem explicações adicionais. A resposta deve seguir rigorosamente o formato: número do argumento – sim, não ou ind. Depois de cada argumento analisado, coloque ponto e vírgula (;) para fins de separação. Exemplo de resposta: 1 - sim; 2 - não; 3 – ind; 4 – sim; 5 – não.
Responda “sim” se o argumento apresenta semelhança de significado ou ideia equivalente a alguma alegação ou pedido da impugnação.
Responda “não” se o argumento não tem semelhança de significado ou ideia equivalente com as alegações ou pedidos da impugnação.
Responda “ind” se o argumento abordar alguma alegação ou pedido da impugnação de forma indireta, muito genérica ou se a relação entre o argumento e as alegações ou pedidos da impugnação for ambígua, vaga ou insuficiente para estabelecer uma conexão clara.

IMPORTANTE:
Cada análise deve ser feita de forma independente, sem considerar qualquer outra análise já realizada. Você não deve, sob nenhuma hipótese, reutilizar informações anteriores ou qualquer dado externo à análise em questão.


### OBJECTION

{ Incompatibilidade entre a conclusão do laudo pericial em juízo e a perícia realizada administrativamente }
Quanto à alegação do INSS de que o resultado da perícia judicial é incompatível com o resultado da perícia administrativa, impõe-se ressaltar que a mera divergência entre os pareceres, por si só, não é apta a impor a revisão ou desconsideração do laudo da perícia judicial, sobretudo porque o perito do juízo pode divergir de considerações médicas emitidas pelos assistentes tanto da parte autora como da parte ré, com base na sua própria opinião clínica.
Neste sentido, a conclusão do perito do juízo, em razão de sua condição equidistante das partes, prevalece em relação às conclusões dos assistentes de qualquer das partes.
Outrossim, a presunção de legitimidade e veracidade da negativa administrativa é apenas relativa, e, no caso concreto, o laudo da perícia realizada em juízo já conclui satisfatoriamente pela incapacidade da parte autora para sua atividade habitual, não havendo necessidade de outra prova ou prova mais robusta que corrobore a conclusão do perito judicial.

{ Requerimento para que o perito judicial se manifeste sobre a perícia realizada administrativamente e indique os pontos nos quais diverge em relação ao parecer médico do INSS } 
Não há que se falar em manifestação adicional do perito em relação ao parecer administrativo, visto que, no caso dos autos, resta claro que as opiniões divergentes retratam apenas visões clínicas destoantes sobre o estado de incapacidade dentro dos limites de subjetividade que são próprios e aceitáveis no exame em questão. Não há erro grosseiro ou contradição relevante que reclame esclarecimento, ou informação adicional a ser prestada para a solução da lide, mas apenas insurgência do réu quanto ao resultado da perícia.




## Fechamento da Sentença

Se confirmada a qualidade de segurado, qual a origem?
[Fonte_QS]=&Fonte_QS&

A parte autora cumpriu a carência necessária?
[Possui_Carência]=&Possui_Carência&

Espécie do vínculo antes da Incapacidade:
[Espécie_Antes_DII]=&Espécie_Antes_DII&

Qual a DER (Data da Entrada do Requerimento)?
[DER]=&DER&

Em que data foi realizada a perícia?
[DtPerícia]=&DtPerícia&

Qual a idade do(a) periciado(a)?
[Idade]=&Idade&

Qual foi a conclusão da Perícia?
[ConclusãoPerícia]=&ConclusãoPerícia&

Qual a DII (Data do Início da Incapacidade)?
[DII]=&DII&

Qual a DII (Data do Início da Incapacidade Permanente)?
[DII_Perm]=&DII_Perm&

Qual a DIB (Data do Início do Benefício)?
[DIB]=&DIB&

O caso é de concessão ou restabelecimento?
[Concede_Restabelece]=&Concede_Restabelece&

Há necessidade de Reabilitação Profissional?
[Reabilitação]=&Reabilitação&

Indicação para reabilitação profissional:
[ReabilitaçãoSugerida]=&ReabilitaçãoSugerida&

Qual a última DCB (Data da Cessação do Benefício)?
[ÚltimaDCB]=&ÚltimaDCB&

Qual a DCB (Data de Cessação do Benefício) indicada no laudo pericial?
[DCB]=&DCB&

Qual a DCB efetiva, caso a DCB no laudo seja nos próximos 90 dias?
[DCB_90dias_hoje]=&DCB&

Qual a DCB caso seja necessária reabilitação profissional?
[DCB_6meses_hoje]= &DCB_6meses_hoje&

Há requerimento de benefício por incapacidade permanente (S ou N)?
[APIN]=&APIN&

Há requerimento de acréscimo de 25% (S ou N)?
[AC25]=&AC25&

Perito reconhece a necessidade do acréscimo de 25% (Sim ou Não)?
[Acréscimo25pc]=&Acréscimo25pc&

Em caso de necessidade do acréscimo, deve ser pago a partir de:
[DI_AC25]=&DI_AC25&

Há requerimento de Dano Moral (S ou N)?
[DM]=&DM&

### INVESTIGATION

OBJETIVO: Atribuir valores a variáveis com base em testes lógicos, explicando o cálculo feito para a atribuição.

#### ANÁLISE:
A análise será feita conforme as <REGRAS_LÓGICAS_GERAIS> (aplicáveis a toda e qualquer análise), bem como atendendo às instruções específicas da <<PARTE_1>>, <<PARTE_2>> e <<PARTE_3>>, conforme o caso.

#### USO DE VARIÁVEIS:
1) Os testes lógicos entre chaves {} fazem referência às variáveis contidas entre os delimitadores <variáveis_anteriores> e </variáveis_anteriores>, bem como à data [DII] entre os marcadores <Info_DII> e </Info_DII>.
2) Variáveis numéricas (quantidade de competências): [Total_Contrib], [Núm_Contrib_Antes_DII].
3) Variáveis com competência no formato mm/aaaa: [Comp_DII], [Últ_Comp_Ant_Incapac]. 
4) Variáveis com datas no formato dd/mm/aaaa: [DII], [Dt_Ini_Último_Emprego], [Dt_Fim_Último_Emprego], [Dt_Primeiro_Recol], [Dt_1o_Recol_pósDII], [DID], [Dia_Recupera_QS_Antes_DII], [Dia_Perda_QS], [ÚltimaDCB], [ÚltimaDIB], [ÚltimaDER_Indef], [Hoje].
5) A variável [PatologiaIncapacitante] é texto livre e indica uma ou mais patologias. Verifique se a(s) patologia(s) indicada(s) está(ão) presente(s) na seguinte lista de patologias: I - tuberculose ativa; II - hanseníase; III - transtorno mental grave, desde que esteja cursando com alienação mental; IV - neoplasia maligna; V - cegueira; VI - paralisia irreversível e incapacitante; VII - cardiopatia grave; VIII - doença de Parkinson; IX - espondilite anquilosante; X - nefropatia grave; XI - estado avançado da doença de Paget (osteíte deformante); XII - síndrome da deficiência imunológica adquirida (AIDS/SIDA); XIII - contaminação por radiação, com base em conclusão da medicina especializada; XIV - hepatopatia grave; XV - esclerose múltipla; XVI - acidente vascular encefálico (agudo); e XVII - abdome agudo cirúrgico. 
A comparação deve considerar equivalência semântica, ou seja, mesmo que os nomes não coincidam exatamente, deve-se reconhecer se a patologia indicada corresponde, de forma substancial, a alguma da lista.
Identificada a presença em lista, considere como nova variável [Patologia_Lista] = Sim. Caso contrário, considere [Patologia_Lista] = Não.

<REGRAS_LÓGICAS_GERAIS>

* Usaremos os seguintes operadores lógicos na comparação das variáveis: a) > maior; b) < menor; c) >= maior ou igual; d) <= menor ou igual; e) <> diferente; f) = igual.

* As comparações entre competências (formato mm/aaaa) devem ser feitas mês a mês e as comparações entre datas (formato dd/mm/aaaa) devem ser feitas dia a dia. 

** REGRA DE OURO (a resposta será inválida se essa regra não for aplicada corretamente): As datas e competências devem ser comparadas exclusivamente com base em lógica de datas (datetime do Python). Não considerar formatos textuais nem aparências. Esta regra é obrigatória e deve ser aplicada antes de qualquer decisão. Comparações válidas dependem de cálculo preciso baseado em lógica de datas ou matemática, e não em interpretação textual. As datas devem ser transformadas em objetos datetime e comparadas por diferença direta de tempo.

<<PARTE_1>>

REGRA INICIAL DA PARTE_1: Se [Fonte_QS] = DCB, inclua na RESPOSTA a linha: “[Fonte_QS] = DCB” e pule diretamente para a <<PARTE_3>>, caso contrário processe a PARTE_1 conforme instruções abaixo:

1) Na PARTE_1, os testes lógicos entre chaves {} devem ser analisados sequencialmente mediante a aplicação da REGRA DE OURO. Para cada análise feita, você deve incluir na RESPOSTA uma breve explicação (até 70 palavras) sobre como aplicou a REGRA DE OURO (mas sem mencionar a existência da regra de ouro). Deve mencionar: os valores envolvidos, a comparação realizada e o respectivo resultado lógico. Exemplo: “... #R09:\n [Comp_DII] > [Últ_Comp_Ant_Incapac] + 25 meses \n → 08/2023 > 05/2023 ✔️\n [Comp_DII] <= [Últ_Comp_Ant_Incapac] + 37 meses \n → 08/2023 <= 05/2024 ✔️\n [Núm_Contrib_Sem_Perder_QS] >= 120 \n → 85 < 120 ❌\n [Ev_Seg_Desemprego] <> 0 \n → 1 ≠ 0 ✔️\n #R09 é FALSA \n...”

2) Se o resultado do teste lógico for verdadeiro, inclua na RESPOSTA a linha: “[Fonte_QS] = CNIS” e pule para a <<PARTE_2>>, sem processar os demais testes lógicos da <<PARTE_1>>. 

3) Se o resultado de todos os testes lógicos da <<PARTE_1>> forem falsos, inclua na RESPOSTA a linha: “[Fonte_QS] = Não” e encerre o processamento.

{ #R01: [Comp_DII] <= [Últ_Comp_Ant_Incapac] + 2 meses }

{ #R02: 2 condições cumulativas: 
i) [Comp_DII] > [Últ_Comp_Ant_Incapac] + 2 meses 
ii) [Comp_DII] <= [Últ_Comp_Ant_Incapac] + 13 meses }

{ #R03: A tag será incluída se for satisfeito pelo menos um dos conjuntos de condições abaixo:
Conjunto A: 
i) [Dt_Ini_Último_Emprego] <> 00/00/0000 E
ii) [Dt_Fim_Último_Emprego] > [DII]. 
OU 
Conjunto B:
i) [Dt_Ini_Último_Emprego] <> 00/00/0000 E
ii) [Dt_Fim_Último_Emprego] = 00/00/0000 }

{ #R04: 2 condições cumulativas: 
i) [DII] > [Dt_Fim_Último_Emprego] 
ii) [DII] <= [Dt_Fim_Último_Emprego] + 13 meses }

{ #R05: 4 condições cumulativas: 
i) [Comp_DII] > [Últ_Comp_Ant_Incapac] + 13 meses 
ii) [Comp_DII] <= [Últ_Comp_Ant_Incapac] + 25 meses 
iii) [Núm_Contrib_Sem_Perder_QS] >= 120 
iv) [Ev_Seg_Desemprego] = 0 }

{ #R06: 4 condições cumulativas: 
i) [DII] > [Dt_Fim_Último_Emprego] + 13 meses 
ii) [DII] <= [Dt_Fim_Último_Emprego] + 25 meses 
iii) [Núm_Contrib_Sem_Perder_QS] >= 120 
iv) [Ev_Seg_Desemprego] = 0 }

{ #R07: 4 condições cumulativas: 
i) [Comp_DII] > [Últ_Comp_Ant_Incapac] + 13 meses 
ii) [Comp_DII] <= [Últ_Comp_Ant_Incapac] + 25 meses 
iii) [Núm_Contrib_Sem_Perder_QS] < 120 
iv) [Ev_Seg_Desemprego] <> 0 }

{ #R08: 4 condições cumulativas: 
i) [DII] > [Dt_Fim_Último_Emprego] + 13 meses 
ii) [DII] <= [Dt_Fim_Último_Emprego] + 25 meses 
iii) [Núm_Contrib_Sem_Perder_QS] < 120 
iv) [Ev_Seg_Desemprego] <> 0 }

{ #R09: 4 condições cumulativas: 
i) [Comp_DII] > [Últ_Comp_Ant_Incapac] + 25 meses 
ii) [Comp_DII] <= [Últ_Comp_Ant_Incapac] + 37 meses 
iii) [Núm_Contrib_Sem_Perder_QS] >= 120 
iv) [Ev_Seg_Desemprego] <> 0 }

{ #R10: 4 condições cumulativas: 
i) [DII] > [Dt_Fim_Último_Emprego] + 25 meses 
ii) [DII] <= [Dt_Fim_Último_Emprego] + 37 meses 
iii) [Núm_Contrib_Sem_Perder_QS] >= 120 
iv) [Ev_Seg_Desemprego] <> 0 }


<<PARTE_2>>

1) Na PARTE_2, os testes lógicos entre chaves {} devem ser analisados sequencialmente mediante a aplicação da REGRA DE OURO. Para cada análise feita, você deve incluir na RESPOSTA uma breve explicação (até 60 palavras) sobre como aplicou a REGRA DE OURO (mas sem mencionar a existência da regra de ouro). Deve mencionar: os valores envolvidos, a comparação realizada e o respectivo resultado lógico. Exemplo de RESPOSTA para cada teste lógico (antes da → vem a condição, depois da → vem os valores envolvidos e o resultado do teste ❌ ou ✔️): “... #R23:\n [Patologia_Lista] = Sim ✔️\n [DID] >= [Dia_Recupera_QS_Antes_DII] \n → 22/08/2023 >= 10/10/2024 ❌\n #R23 é FALSA \n ...”

2) Se o resultado do teste lógico for verdadeiro, inclua na RESPOSTA a linha: “[Possui_Carência] = Sim” e pule para a <<PARTE_3>>, sem processar os demais testes lógicos da <<PARTE_2>>. 

3) Se o resultado de todos os testes lógicos da <<PARTE_2>> forem falsos, inclua na RESPOSTA a linha: “[Possui_Carência] = Não” e encerre o processamento.
{ #R21: [Núm_Contrib_Antes_DII] >= 12 }

{ #R22: 2 condições cumulativas: 
i) [Total_Contrib] >= 12 
ii) [Núm_Contrib_Antes_DII] >= 6 }

{ #R23: 2 condições cumulativas:
i) [Patologia_Lista] = Sim 
ii) [DID] >= [Dia_Recupera_QS_Antes_DII] }


<<PARTE_3>>

1) Na PARTE_3, os testes lógicos entre chaves {} devem ser analisados sequencialmente mediante a aplicação da REGRA DE OURO. Para cada análise feita, você deve incluir na RESPOSTA uma breve explicação (até 70 palavras) sobre como aplicou a REGRA DE OURO (mas sem mencionar a existência da regra de ouro). Deve mencionar: os valores envolvidos, a comparação realizada e o respectivo resultado lógico. Exemplo (antes da → vem a condição, depois da → vem os valores envolvidos e o resultado do teste ❌ ou ✔️): “... \n #R31: \n Condição: [Fonte_QS] = DCB → Como [Fonte_QS] = CNIS ❌ \n Condição: [ÚltimaDCB] >= [DII]  → 20/03/2022 >= 04/05/2022  ❌ \n #R34 é FALSA \n ...”

2) Se o resultado do teste lógico for verdadeiro, inclua na RESPOSTA a(s) linha(s) que atribui(em) valor à(s) variável(eis) imediatamente abaixo do teste lógico, seguindo um formato fixo e rigoroso: “[nome_variavel] = valor”. Exemplo: “[DIB] = 04/05/2022”. Depois, siga para o próximo teste lógico entre chaves {}.

IMPORTANTE: Antes do sinal de igual, o nome da variável é preservado entre colchetes []. Após o sinal de igual, deve-se substituir a variável indicada pelo seu valor. Exemplo: Se a linha abaixo do teste lógico for “[DIB] = [DII]” e a variável [DII] = 04/05/2022, a linha a ser incluída na RESPOSTA deve ser: “[DIB] = 04/05/2022”

3) Se o resultado do teste lógico for falso, siga para o próximo teste lógico entre chaves {} sem incluir na RESPOSTA a(s) atribuição(ões) de valor(es) à(s) variável(eis) indicada(s) imediatamente abaixo.

{ #R31: 2 condições cumulativas:
i) [Fonte_QS] = DCB
ii) [ÚltimaDCB] >= [DII] }
[DIB] = [ÚltimaDCB]
[Concede_Restabelece] = Restabelece 

{ #R32: 2 condições cumulativas:
i) [Fonte_QS] = DCB 
ii) [ÚltimaDER_Indef] > [ÚltimaDCB] }
[DER] = [ÚltimaDER_Indef]

{ #R33: 2 condições cumulativas:
i) [Fonte_QS] = DCB 
ii) [ÚltimaDER_Indef] <= [ÚltimaDCB] }
[DER] = [ÚltimaDIB]

{ #R34: 3 condições cumulativas:
i) [Fonte_QS] = DCB
ii) [DII] > [ÚltimaDCB]
iii) [DII] <= [DER] – 30 dias }
[DIB] = [DER]
[Concede_Restabelece] = Concede 

{ #R35: 4 condições cumulativas:
i) [Fonte_QS] = DCB
ii) [DII] > [ÚltimaDCB]
iii) [DII] < [DER]
iv) [DII] >= [DER] – 30 dias }
[DIB] = [DII]
[Concede_Restabelece] = Concede 

{ #R36: 4 condições cumulativas:
i) [Fonte_QS] = DCB
ii) [DII] > [ÚltimaDCB]
iii) [DII] > [DER] }
[DIB] = [DII]
[Concede_Restabelece] = Concede 

{ #R37: 2 condições cumulativas:
i) [Fonte_QS] = CNIS
ii) [DII] <= [DER] – 30 dias }
[DIB] = [DER]
[Concede_Restabelece] = Concede 

{ #R38: 4 condições cumulativas:
i) [Fonte_QS] = CNIS
ii) [Espécie_Antes_DII] = Recolhimentos
iii) [DII] < [DER]
iv) [DII] >= [DER] – 30 dias }
[DIB] = [DII]
[Concede_Restabelece] = Concede 

{ #R39: 4 condições cumulativas:
i) [Fonte_QS] = CNIS
ii) [Espécie_Antes_DII] <> Recolhimentos
iii) [DII] < [DER]
iv) [DII] >= [DER] – 30 dias }
[DIB] = [DII] + 16 dias
[Concede_Restabelece] = Concede 

{ #R40: 2 condições cumulativas:
i) [Fonte_QS] = CNIS
ii) [DII] > [DER] }
[DIB] = [DII]
[Concede_Restabelece] = Concede 

{ #R41: [DII_Perm] não é uma data válida no formato dd/mm/aaaa }
[DII_Perm] = [DtPerícia]


{ #42: Em todos os casos inclua as variáveis abaixo na RESPOSTA }
[DCB_90dias_hoje] = [Hoje] + 90 dias
[DCB_6meses_hoje] = [Hoje] + 6 meses


### GENERATION

OBJETIVO: Determinar, com base em testes lógicos, quais tags devem ser utilizadas na fase atual com a finalidade maior de construir um template de sentença estruturado por fases.

#### ANÁLISE:
A análise será feita conforme as <REGRAS_LÓGICAS_GERAIS> (aplicáveis a toda e qualquer análise), bem como atendendo às instruções específicas da <<PARTE_1>>, <<PARTE_2>> e <<PARTE_3>>, conforme o caso.

#### USO DE VARIÁVEIS:
1) Os testes lógicos entre chaves {} fazem referência às variáveis contidas entre os delimitadores <variáveis> e </variáveis>. 
2) Variáveis numéricas: [Idade]. 
3) Variáveis texto com resposta “S” ou “Sim” são equivalentes. Da mesma forma, são equivalentes as respostas “N” e “Não”. Não use lógica case sensitive nesses tipos de variáveis. 
4) Variáveis com datas no formato dd/mm/aaaa: [DII], [DER], [DII_Perm], [DtPerícia] e [DCB].

<REGRAS_LÓGICAS_GERAIS>

* Usaremos os seguintes operadores lógicos na comparação das variáveis: a) > maior; b) < menor; c) >= maior ou igual; d) <= menor ou igual; e) <> diferente; f) = igual.

* As comparações entre datas (formato dd/mm/aaaa) devem ser feitas dia a dia. 

* As comparações usando a variável [Idade] têm que ser feitas com lógica matemática e não mediante comparação textual.

** REGRA DE OURO (a resposta será inválida se essa regra não for aplicada corretamente): As datas devem ser comparadas exclusivamente com base em lógica de datas (datetime do Python). Não considerar formatos textuais nem aparências. Esta regra é obrigatória e deve ser aplicada antes de qualquer decisão. Comparações válidas dependem de cálculo preciso baseado em lógica de datas ou matemática, e não em interpretação textual. As datas devem ser transformadas em objetos datetime e comparadas por diferença direta de tempo.

<<PARTE_1>>

REGRA INICIAL DA PARTE_1: Se [Fonte_QS] = “Não”  OU [Possui_Carência] = “Não” pule diretamente para a <<PARTE_3>>, caso contrário processe a PARTE_1 conforme instruções abaixo:

1) No início da RESPOSTA, inclua o indicador de início de comentário: “//*”.

2) Nessa primeira parte, os testes lógicos entre chaves {} devem ser analisados sequencialmente mediante a aplicação da REGRA DE OURO. Para cada análise feita, você deve incluir na RESPOSTA uma breve explicação (até 70 palavras) sobre como aplicou a REGRA DE OURO (mas sem mencionar a existência da regra de ouro). Deve mencionar: os valores envolvidos, a comparação realizada e o respectivo resultado lógico. Exemplo: “... \n #R01: \n Condição: [Fonte_QS] = DCB → CNIS = DCB ❌ \n Condição: [ÚltimaDCB] >= [DII]  → 20/03/2022 >= 04/05/2022  ❌ \n #R34 é FALSA \n ...”

3) A RESPOSTA deve seguir estritamente o formato definido, sem inserir explicações extras, alterar a ordem ou omitir quaisquer partes das estruturas requeridas.

4) Se o resultado do teste lógico for verdadeiro, inclua na RESPOSTA o indicador de comentário “*//”, seguido de “\n” e da tag imediatamente abaixo do teste lógico (Exemplo: “*//\n<DIB_Restabelecimento>\n”) e pule para a <<PARTE_2>>, sem processar os demais testes lógicos da <<PARTE_1>>. 

5) Se o resultado do teste lógico for falso, siga para o próximo teste lógico entre chaves {} sem incluir a tag ou expressão adicional na RESPOSTA.

{ #R01: 2 condições cumulativas:
i) [Fonte_QS] = DCB
ii) [ÚltimaDCB] >= [DII] }
<DIB_Restabelecimento>

{ #R02: 3 condições cumulativas:
i) [Fonte_QS] = DCB
ii) [DII] > [ÚltimaDCB]
iii) [DII] <= [DER] – 30 dias }
<DIB_Concede_CI_Dom_DII_mais_30dias_DER>

{ #R03: 4 condições cumulativas:
i) [Fonte_QS] = DCB
ii) [DII] > [ÚltimaDCB]
iii) [DII] < [DER]
iv) [DII] >= [DER] – 30 dias }
<DIB_Concede_CI_Dom_DII_até_30dias_DER>

{ #R04: 4 condições cumulativas:
i) [Fonte_QS] = DCB
ii) [DII] > [ÚltimaDCB]
iii) [DII] > [DER] }
<DIB_na_DII_posterior_DER>

{ #R05: 3 condições cumulativas:
i) [Fonte_QS] = CNIS
ii) [Espécie_Antes_DII] = Recolhimentos
iii) [DII] <= [DER] – 30 dias }
<DIB_Concede_CI_Dom_DII_mais_30dias_DER>

{ #R06: 4 condições cumulativas:
i) [Fonte_QS] = CNIS
ii) [Espécie_Antes_DII] = Recolhimentos
iii) [DII] < [DER]
iv) [DII] >= [DER] – 30 dias }
<DIB_Concede_CI_Dom_DII_até_30dias_DER>

{ #R07: 4 condições cumulativas:
i) [Fonte_QS] = CNIS
ii) [Espécie_Antes_DII] <> Recolhimentos
iii) [DII] < [DER]
iv) [DII] >= [DER] – 30 dias }
<DIB_Concede_Empregado_DII_até_30dias_DER>

{ #R08: 3 condições cumulativas:
i) [Fonte_QS] = CNIS
ii) [Espécie_Antes_DII] <> Recolhimentos
iii) [DII] <= [DER] – 30 dias }
<DIB_Concede_Empregado_DII_mais_30dias_DER>

{ #R09: 2 condições cumulativas:
i) [Fonte_QS] = CNIS
ii) [DII] > [DER] }
<DIB_na_DII_posterior_DER>


<<PARTE_2>> 

Na PARTE_2, siga rigorosamente as mesmas regras previstas nos itens 1, 2 e 3 da PARTE_1, incluindo na RESPOSTA o indicador de início de comentário, bem como as explicações (até 70 palavras) sobre como foi aplicada a REGRA DE OURO em cada teste lógico. Por outro lado, as regras prevista nos itens 4 e 5 devem ser substituída pelas seguintes instruções:

4) Se o resultado do teste lógico for verdadeiro, atribua “True” a uma variável com o nome da regra ([R21], [R22], etc), para que essa variável seja utilizada adiante, e inclua na RESPOSTA:
a) a variável relacionada à regra e seu valor. Ex: “[R21] = True”.
b) o indicador de fim de comentário “*//”, seguido de “\n”
c) a(s) tag(s) imediatamente(s) abaixo do teste lógico 
d) novo indicador de início de comentário: “//*”. Sempre deve ser inserido “//*” após a inclusão da(s) tag(s), mesmo que seja o último teste lógico da PARTE_2.

5) Se o resultado do teste lógico for falso, atribua “False” a uma variável com o nome da regra ([R21], [R22], etc), para que essa variável seja utilizada adiante, e inclua na RESPOSTA a variável relacionada à regra e seu valor. Ex: “[R22] = False”. Não inclua a tag abaixo do teste lógico na RESPOSTA.

6) Percorra todos os testes lógicos na ordem em que aparecem até o final da PARTE_2. Ao final, insira na RESPOSTA a linha “\n FIM \n *//” e encerre o processamento sem entrar na PARTE_3.

{ #R21: 2 condições cumulativas:
i) [ConclusãoPerícia] = Com Incapacidade Permanente
ii) [DII_Perm] = [DtPerícia] }
<DIB_APIN_Perícia>

{ #R22: 3 condições cumulativas:
i) [ConclusãoPerícia] = Com Incapacidade Permanente
ii) [DII_Perm] <> [DIB] 
iii) [DII_Perm] <> [DtPerícia] }
<DIB_APIN_DII_Perm>

{ #R23: 2 condições cumulativas:
i) [ConclusãoPerícia] = Com Incapacidade Permanente
ii) [DII_Perm] = [DIB] }
<DIB_APIN_Igual_AD>

{ #R24: 3 condições cumulativas:
i) [ConclusãoPerícia] = Com Incapacidade Temporária
ii) [Reabilitação] = Não
iii) [DCB] >= Data de Hoje + 3 meses }
<TP_Base2_AD>
<DCB_Mais_90dias_Hoje> 

{ #R25: 3 condições cumulativas:
i) [ConclusãoPerícia] = Com Incapacidade Temporária
ii) [Reabilitação] = Não
iii) [DCB] < Data de Hoje + 3 meses }
<TP_Base2_AD>
<DCB_Menos_90dias_Hoje> 

{ #R26: 3 condições cumulativas:
i) [ConclusãoPerícia] = Com Incapacidade Temporária
ii) [Reabilitação] = Sim 
iii) [idade] < 58}
<TP_Base2_AD>
<DCB_Reabilitação_Profissional> 

{ #R27: 3 condições cumulativas:
i) [ConclusãoPerícia] = Com Incapacidade Temporária
ii) [Reabilitação] = Sim 
iii) [idade] >= 58}
<Reabilitação_Improvável>

{ #R28: 2 condições cumulativas:
i) [AC25] = S
ii) [Acréscimo25pc] = Sim }
<AC25_Proc>

{ #R29: 2 condições cumulativas:
i) [AC25] = S
ii) [Acréscimo25pc] = Não }
<AC25_Improc>

{ #R30: [DM] = S }
<DM_Benef_Concedido>

{ #R31: [R24] = True }
<Disp_Só_AD_Com_DCB>

{ #R32: [R25] = True }
<Disp_Só_AD_Com_DCB+90>
{ #R33: [R26] = True }
<Disp_Só_AD_Com_Reab>
{ #R34: 2 condições cumulativas
i) [ConclusãoPerícia] = Com Incapacidade Permanente
ii) [DII_Perm] <> [DIB] }
<Disp_AD_Com_APIN>
{ #R35: 2 condições cumulativas
i) [R27] = True
ii) [DII_Perm] <> [DIB] }
<Disp_AD_Com_APIN>
{ #R36: 2 condições cumulativas
i) [ConclusãoPerícia] = Com Incapacidade Permanente
ii) [DII_Perm] = [DIB] }
<Disp_Só_APIN >
{ #R37: 2 condições cumulativas
i) [R27] = True
ii) [DII_Perm] = [DIB] }
<Disp_Só_APIN >
{ #R38: [R28] = True }
<Disp_AC25>
{ #R39: 6 condições cumulativas
i) Alternativamente: [R34] = True OU [R35] = True OU [R36] = True OU [R37] = True
ii) [R31] = False
iii) [R32] = False
iv) [R33] = False
v) [R29] = True
vi) [DM] = S }
<Disp_AC25_DM_Impro>
{ #R40: 6 condições cumulativas
i) Alternativamente: [R34] = True OU [R35] = True OU [R36] = True OU [R37] = True
ii) [R31] = False
iii) [R32] = False
iv) [R33] = False
v) [R29] = True
vi) [DM] = N }
<Disp_AC25_Impro>
{ #R41: 6 condições cumulativas
i) [R31] = False
ii) [R32] = False
iii) [R33] = False
iv) [R39] = False
v) [R40] = False
vi) [DM] = S }
<Disp_DM_Impro>

{ #R42: Sempre incluir a tag abaixo }
<Fechamento_Sent_Proc>


<<PARTE_3>> 

Verifique se a variável [DM] = S. Caso positivo, inclua uma linha na RESPOSTA com a tag “<DM_Benef_Indeferido>”.
Em seguida, deve ser produzido um trecho de dispositivo seguindo rigorosamente o texto entre “$$” abaixo e os acréscimos a que se referem as regras que estão entre chaves ao longo de sua construção:
$$
Dispositivo 
Diante do exposto, com fulcro no art. 487, I, do CPC, JULGO IMPROCEDENTES os pedidos de concessão do auxílio por incapacidade temporária {acrescentar “, conversão em aposentadoria por incapacidade permanente”, se a variável [APIN]=S} {acrescentar “e acréscimo de 25% referente ao auxílio permanente de terceiros”, se a variável [AC25]=S}, nos termos da fundamentação.
{ Inclua o texto abaixo se a variável [DM] = S. }
JULGO igualmente IMPROCEDENTE o pedido de condenação em danos morais.
$$
Após a construção, verifique e ajuste a ortografia do texto construído e inclua-o na RESPOSTA. 
Depois, inclua na RESPOSTA uma linha com a tag “<Fechamento_Sent_Improc>” e encerre o processamento.



# STANDARD TEXTS

<Revelia>
Considerando a ausência de contestação, decreto a revelia do INSS, afastando os seus efeitos materiais tendo em vista tratar-se de direito indisponível, nos termos do art. 345, II, do CPC/15. 

<Interesse>
Afasto a preliminar de falta de interesse de agir diante da comprovação de cessação do benefício (evento [Ev_Cessação_Benef]), não sendo exigido o exaurimento das vias administrativas para postular em juízo. 

<Prescrição>
Rejeito a alegação de prescrição quinquenal, pois, apesar da previsão legal no art. 103, parágrafo único, da Lei 8.213/91, não há, nos presentes autos, requerimento que ultrapasse o período de 5 anos contados da propositura da inicial. 

<Recusa_Acordo>
O INSS juntou aos autos uma proposta de acordo (evento [Ev_Proposta_Acordo]), no entanto a parte autora expressamente a recusou (evento [Ev_Recusa_Acordo]). Deste modo, passo à análise do mérito.

<Sem_Manifestação_Acordo>
O INSS juntou aos autos uma proposta de acordo (evento [Ev_Proposta_Acordo]) e o juízo intimou a parte autora para manifestação. Ocorre que ela se manteve silente, apesar da tentativa de conciliação. Tratando-se de benefício por incapacidade e considerando a necessidade de solução rápida para tais casos, tenho que seria inviável proceder sucessivas intimações buscando manifestação expressa. Deste modo, passo à análise do mérito.

<TP_Base1> 
Para o recebimento de auxílio por incapacidade temporária, mister se faz que a parte demandante atenda aos requisitos legais ditados pelo art. 59 da Lei nº 8.213/91, quais sejam: ostentar a qualidade de segurado, atender o prazo de carência fixado em lei e constatação de incapacidade para o seu trabalho ou para a sua atividade habitual por mais de 15 dias consecutivos. Já em relação à aposentadoria por incapacidade permanente é necessário, além do preenchimento dos dois primeiros requisitos acima descritos, que haja incapacidade insuscetível de reabilitação para o exercício de atividade que garanta subsistência, nos termos do art. 42 da Lei nº 8.213/91. 

<Laudo_Favorável_Sem_Reabilitação>
A perícia judicial realizada em [DtPerícia] atestou que a parte autora encontra-se acometida de moléstia que a incapacita para o exercício de sua atividade laborativa habitual. Pelas conclusões médicas constantes no laudo de evento [Ev_Laudo], a situação fática vivida pela parte autora atende ao requisito legal de incapacidade para a concessão do auxílio por incapacidade temporária e, por não haver provas suficientemente robustas em sentido contrário, acolho e fundamento a existência de incapacidade nos termos do laudo pericial, o qual utilizo como razões de decidir.

<Laudo_Favorável_Apenas_Período_Pregresso>
A perícia judicial realizada em [DtPerícia] atestou que a parte autora encontra-se atualmente apta ao exercício de suas atividades laborais, não obstante ter havido períodos de incapacidade pregressa: [PeríodoIncapacidadeAnterior].

Pelas conclusões médicas constantes no laudo de evento [Ev_Laudo], a situação fática vivida pela parte autora não atende ao requisito legal de incapacidade para a concessão do benefício pretendido no presente momento, apesar de sua incapacidade pretérita dever ser considerada para fins de aferição do direito ao benefício temporário no passado. 

Por não haver provas suficientemente robustas em sentido contrário, acolho e fundamento a existência de incapacidade nos termos do laudo pericial, o qual utilizo como razões de decidir.

<Laudo_Favorável_Com_Reabilitação>
A perícia judicial realizada em [DtPerícia] atestou que a parte autora encontra-se acometida de moléstia que a incapacita para o exercício de atividades laborais próprias da sua categoria profissional de forma permanente, havendo aptidão, no entanto, para o desempenho de outras atividades após processo de reabilitação profissional.

Pelas conclusões médicas constantes no laudo de evento [Ev_Laudo], a situação fática vivida pela parte autora atende ao requisito legal de incapacidade para a concessão do auxílio por incapacidade temporária e, por não haver provas suficientemente robustas em sentido contrário, acolho e fundamento a existência de incapacidade nos termos do laudo pericial, o qual utilizo como razões de decidir.

<Laudo_Favorável_APIN>
A perícia judicial realizada em [DtPerícia] atestou que a parte autora encontra-se acometida de moléstia que a incapacita para toda e qualquer atividade laborativa, configurando-se, no caso, incapacidade total e permanente.

Pelas conclusões médicas constantes no laudo de evento [Ev_Laudo], a situação fática vivida pela parte autora atende ao requisito legal de incapacidade para a concessão de aposentadoria e, por não haver provas suficientemente robustas em sentido contrário, acolho e fundamento a existência de incapacidade nos termos do laudo pericial, o qual utilizo como razões de decidir.

<Laudo_Favorável_APIN_Sem_Pedido_APIN>
Embora tenha sido requerido somente o benefício de auxílio por incapacidade temporária, também restou comprovado o preenchimento dos requisitos legais exigidos para a concessão do benefício de aposentadoria por incapacidade permanente, previstos no art. 42 da Lei nº 8.213/91, tendo em vista que o laudo pericial concluiu pela incapacidade plena e permanente da parte autora para exercer quaisquer atividades laborais.

Entendo que os princípios que regem os Juizados Especiais – simplicidade, informalidade, economia processual e celeridade (art. 2º da Lei nº 9.099/95 c/c art. 1º da Lei nº 10.259/01) – devem prevalecer, no caso concreto, sobre o princípio da correlação ou congruência previsto no CPC. Em casos análogos, o Eg. STJ posicionou-se no sentido de aplicar o princípio da fungibilidade quando se trata da concessão de benefício previdenciário, o que também vem sendo adotado por boa parte da jurisprudência nos diversos Tribunais. 

Destarte, em observância aos princípios norteadores dos Juizados Especiais e diante da constatação, pela análise pericial, da incapacidade laboral da parte autora em caráter permanente, ou seja, a impossibilidade de retornar às suas atividades habituais, bem como ter sucesso em eventual reabilitação profissional, é cabível a procedência do pedido para determinar, além da concessão do benefício de auxílio por incapacidade temporária, sua conversão em aposentadoria por incapacidade permanente.

<QSEG_Restabelecimento>
A qualidade de segurado perante a Previdência Social presume-se, já que o benefício foi cessado em razão da capacidade para o trabalho e não por ausência de vínculo com o RGPS (evento [Ev_Cessação_Benef]). 

Ademais, em se tratando de restabelecimento, deve-se considerar que o próprio INSS reconheceu a qualidade de segurado e o cumprimento da carência quando da concessão, donde se conclui que a cessação do benefício na esfera administrativa restringiu-se à hipótese de não mais haver incapacidade para o trabalho.

<QSEG_Último_Benefício_Menos_12meses>
A qualidade de segurado perante a Previdência Social presume-se, já que o benefício foi indeferido em razão da capacidade para o trabalho e não por ausência de vínculo com o RGPS (evento [Ev_Cessação_Benef]). 

Ademais, constam nos autos elementos que comprovam de forma substancial a manutenção desta condição perante o Regime Geral de Previdência Social, uma vez que a parte autora estava em gozo de benefício por incapacidade até [ÚltimaDCB], devendo-se considerar que o próprio INSS reconheceu a qualidade de segurado e o cumprimento da carência quando da concessão. 

Tendo em vista que o laudo pericial fixa o início da incapacidade em [DII], não foi ultrapassado o período de graça desde a cessação do último benefício, de modo que se tem por preenchidos os requisitos da qualidade de segurado e carência.

<QSEG_Última_Contribuição_na_DII>
Constam nos autos elementos que comprovam de forma substancial a manutenção do vínculo com o Regime Geral de Previdência Social, uma vez que a parte autora estava contribuindo quando do início da incapacidade.

Com efeito, o laudo pericial fixa o início da incapacidade em [DII], ao passo que há registro contemporâneo no extrato previdenciário (evento [Ev_CNIS]), demonstrando vínculo previdenciário regular em momento imediatamente anterior, mais especificamente na competência [Últ_Comp_Ant_Incapac], com recolhimento em [Dt_Recol_Ant_Incapac].

<QSEG_Vínculo_Empregado_na_DII>
Constam nos autos elementos que comprovam de forma substancial a manutenção do vínculo com o Regime Geral de Previdência Social. Com efeito, o laudo pericial fixa o início da incapacidade em [DII], ao passo que há registro contemporâneo no extrato previdenciário: [Espécie_Antes_DII], com data de início em [Dt_Ini_Último_Emprego], perdurando até o advento da incapacidade (evento [Ev_CNIS]).

<QSEG_Última_Contribuição_Menos_12meses> 
Constam nos autos elementos que comprovam de forma substancial a manutenção do vínculo com o Regime Geral de Previdência Social, uma vez que a parte autora estava, na forma do art. 15, II da Lei 8.213/91, em período de graça quando do início da incapacidade.

Com efeito, o laudo pericial fixa o início da incapacidade em [DII], ao passo que o último registro no extrato previdenciário anterior à essa data indica vínculo até [Últ_Comp_Ant_Incapac], com recolhimento em [Dt_Recol_Ant_Incapac], não tendo decorrido o prazo definido pelo art. 15, § 4º da Lei de Benefícios (evento [Ev_CNIS]).

<QSEG_Vínculo_Empregado_Menos_12meses>
Constam nos autos elementos que comprovam de forma substancial a manutenção do vínculo com o Regime Geral de Previdência Social, uma vez que a parte autora estava, na forma do art. 15, II da Lei 8.213/91, em período de graça quando do início da incapacidade.

Com efeito, o laudo pericial fixa o início da incapacidade em [DII], ao passo que o último registro no extrato previdenciário anterior à essa data indica [Espécie_Antes_DII], com data de término em [Dt_Fim_Último_Emprego], não tendo decorrido o prazo definido pelo art. 15, § 4º da Lei de Benefícios (evento [Ev_CNIS]).

<QSEG_+120Contrib_Última_Contribuição_12e24meses>
Constam nos autos elementos que comprovam de forma substancial a manutenção do vínculo com o Regime Geral de Previdência Social, pois, no início da incapacidade, a parte autora se encontrava, na forma do art. 15, II e § 1º da Lei 8.213/91, em prorrogação do período de graça por 12 meses.

Conforme se extrai do CNIS juntado no evento [Ev_CNIS], é possível contabilizar [Núm_Contrib_Sem_Perder_QS] contribuições sem perda da qualidade de segurado. Ultrapassado o marco de 120 contribuições sem interrupções do vínculo com o sistema, opera-se a ampliação do período de graça para 24 meses, nos termos do art. 15, § 1º, da Lei 8.213/91. 

Com efeito, o laudo pericial fixa o início da incapacidade em [DII], ao passo que o último registro no extrato previdenciário anterior à essa data indica vínculo até [Últ_Comp_Ant_Incapac], com recolhimento em [Dt_Recol_Ant_Incapac], não tendo decorrido o prazo definido pelo art. 15, § 4º da Lei de Benefícios.

<QSEG_+120Contrib_Vínculo_Empregado_12e24meses>
Constam nos autos elementos que comprovam de forma substancial a manutenção do vínculo com o Regime Geral de Previdência Social, pois, no início da incapacidade, a parte autora se encontrava, na forma do art. 15, II e § 1º da Lei 8.213/91, em prorrogação do período de graça por 12 meses.

Conforme se extrai do CNIS juntado no evento [Ev_CNIS], é possível contabilizar [Núm_Contrib_Sem_Perder_QS] contribuições sem perda da qualidade de segurado. Ultrapassado o marco de 120 contribuições sem interrupções do vínculo com o sistema, opera-se a ampliação do período de graça para 24 meses, nos termos do art. 15, § 1º, da Lei 8.213/91.

Com efeito, o laudo pericial fixa o início da incapacidade em [DII], ao passo que o último registro no extrato previdenciário anterior à essa data indica [Espécie_Antes_DII], com data de término em [Dt_Fim_Último_Emprego], não tendo decorrido o prazo definido pelo art. 15, § 4º da Lei de Benefícios.

<QSEG_SegDesemp_Última_Contribuição_12e24meses>
Constam nos autos elementos que comprovam de forma substancial a manutenção do vínculo com o Regime Geral de Previdência Social, pois, no início da incapacidade, a parte autora se encontrava, na forma do art. 15, II e § 2º da Lei 8.213/91, em prorrogação do período de graça por 12 meses.
No evento [Ev_Seg_Desemprego], houve comprovação de requerimento do seguro desemprego, o que garante a extensão do período de graça para 24 meses, nos termos da lei. 

Com efeito, o laudo pericial fixa o início da incapacidade em [DII], ao passo que o último registro no extrato previdenciário anterior à essa data indica vínculo até [Últ_Comp_Ant_Incapac], com recolhimento em [Dt_Recol_Ant_Incapac], não tendo decorrido o prazo definido pelo art. 15, § 4º da Lei de Benefícios.

<QSEG_SegDesemp_Vínculo_Empregado_12e24meses>
Constam nos autos elementos que comprovam de forma substancial a manutenção do vínculo com o Regime Geral de Previdência Social, pois, no início da incapacidade, a parte autora se encontrava, na forma do art. 15, II e § 2º da Lei 8.213/91, em prorrogação do período de graça por 12 meses.
No evento [Ev_Seg_Desemprego], houve comprovação de requerimento do seguro-desemprego, o que garante a extensão do período de graça para 24 meses, nos termos da lei. 

Com efeito, o laudo pericial fixa o início da incapacidade em [DII], ao passo que o último registro no extrato previdenciário anterior à essa data indica [Espécie_Antes_DII], com data de término em [Dt_Fim_Último_Emprego], não tendo decorrido o prazo definido pelo art. 15, § 4º da Lei de Benefícios.

<QSEG_Última_Contribuição_24e36meses>
Constam nos autos elementos que comprovam de forma substancial a manutenção do vínculo com o Regime Geral de Previdência Social, pois, no início da incapacidade, a parte autora se encontrava, na forma do art. 15, II, §§ 1º e 2º, da Lei 8.213/91, em prorrogação do período de graça por 12 meses.

Conforme se extrai do CNIS juntado no evento [Ev_CNIS], é possível contabilizar [Núm_Contrib_Sem_Perder_QS] contribuições sem perda da qualidade de segurado. Ultrapassado o marco de 120 contribuições sem interrupções do vínculo com o sistema, opera-se a ampliação do período de graça para 24 meses, nos termos do art. 15, § 1º, da Lei 8.213/91. 

Além disso, no evento [Ev_Seg_Desemprego], houve comprovação de requerimento do seguro-desemprego, o que garante o prazo adicional de 12 meses, nos termos do art. 15, § 2º, totalizando, assim, 36 meses de cobertura.

Com efeito, o laudo pericial fixa o início da incapacidade em [DII], ao passo que o último registro no extrato previdenciário anterior à essa data indica vínculo até [Últ_Comp_Ant_Incapac], com recolhimento em [Dt_Recol_Ant_Incapac], não tendo decorrido o prazo definido pelo art. 15, § 4º da Lei de Benefícios.

<QSEG_Vínculo_Empregado_Entre_24e36meses>
Constam nos autos elementos que comprovam de forma substancial a manutenção do vínculo com o Regime Geral de Previdência Social, pois, no início da incapacidade, a parte autora se encontrava, na forma do art. 15, II, §§ 1º e 2º, da Lei 8.213/91, em prorrogação do período de graça por 12 meses.

Conforme se extrai do CNIS juntado no evento [Ev_CNIS], é possível contabilizar [Núm_Contrib_Sem_Perder_QS] contribuições sem perda da qualidade de segurado. Ultrapassado o marco de 120 contribuições sem interrupções do vínculo com o sistema, opera-se a ampliação do período de graça para 24 meses, nos termos do art. 15, § 1º, da Lei 8.213/91. 

Além disso, no evento [Ev_Seg_Desemprego], houve comprovação de requerimento do seguro-desemprego, o que garante o prazo adicional de 12 meses, nos termos do art. 15, § 2º, totalizando, assim, 36 meses de cobertura.

Com efeito, o laudo pericial fixa o início da incapacidade em [DII], ao passo que o último registro no extrato previdenciário anterior à essa data indica [Espécie_Antes_DII], com data de término em [Dt_Fim_Último_Emprego], não tendo decorrido o prazo definido pelo art. 15, § 4º da Lei de Benefícios.

<SemQSEG_PGraça_12meses_Sem_Contrib_Pos>
Conforme CNIS de evento [Ev_CNIS], é possível contabilizar [Núm_Contrib_Sem_Perder_QS] contribuições ao RGPS sem perda da qualidade de segurado. Havendo menos de 120 contribuições, há que se fixar o período de graça em 12 meses, nos termos do art. 15 da Lei 8.213/91.

A última contribuição efetuada refere-se à competência [Últ_Comp_Contrib_Ant], o que leva à perda da qualidade de segurado em [Dia_Perda_QS].

Considerando que, nos termos do laudo pericial, a incapacidade da parte autora (DII) foi fixada em [DII], forçoso concluir que houve perda da qualidade de segurado em momento anterior à incapacidade, o que conduz ao indeferimento do pedido.

<SemQSEG_PGraça_24meses_+120Contrib_Sem_Contrib_Pos>
Conforme CNIS de evento [Ev_CNIS], é possível contabilizar [Núm_Contrib_Sem_Perder_QS] contribuições ao RGPS sem perda da qualidade de segurado. Superadas as 120 contribuições sem quebra do vínculo com o sistema, garante-se a extensão do período de graça para 24 meses, nos termos da lei. 

A última contribuição efetuada refere-se à competência [Últ_Comp_Contrib_Ant], o que leva à perda da qualidade de segurado em [Dia_Perda_QS].

Considerando que, nos termos do laudo pericial, a incapacidade da parte autora (DII) foi fixada em [DII], forçoso concluir que houve perda da qualidade de segurado em momento anterior à incapacidade, o que conduz ao indeferimento do pedido.

<SemQSEG_PGraça_24meses_SegDesemp_Sem_Contrib_Pos>
Conforme CNIS de evento [Ev_CNIS], é possível contabilizar [Núm_Contrib_Sem_Perder_QS] contribuições ao RGPS sem perda da qualidade de segurado. Havendo menos de 120 contribuições, há que se fixar o período de graça em 12 meses, nos termos do art. 15 da Lei 8.213/91.

Ocorre que no evento [Ev_Seg_Desemprego], houve comprovação de requerimento do seguro desemprego, o que garante a extensão do período de graça para 24 meses, nos termos do art. 15, § 2º, da Lei 8.213/91. 
No caso dos autos, a última contribuição efetuada refere-se à competência [Últ_Comp_Contrib_Ant], o que leva à perda da qualidade de segurado em [Dia_Perda_QS].

Considerando que, nos termos do laudo pericial, a incapacidade da parte autora (DII) foi fixada em [DII], forçoso concluir que houve perda da qualidade de segurado em momento anterior à incapacidade, o que conduz ao indeferimento do pedido.

<SemQSEG_PGraça_36meses_Sem_Contrib_Pos>
Conforme CNIS de evento [Ev_CNIS], é possível contabilizar [Núm_Contrib_Sem_Perder_QS] contribuições ao RGPS sem perda da qualidade de segurado. Superadas as 120 contribuições sem quebra do vínculo com o sistema, garante-se a extensão do período de graça para 24 meses, nos termos do art. 15, § 1º, da Lei 8.213/91. 

Além disso, no evento [Ev_Seg_Desemprego], houve comprovação de requerimento do seguro-desemprego, o que garante o prazo adicional de 12 meses, nos termos do art. 15, § 2º, totalizando um período de graça de 36 meses.

Ocorre que, no caso dos autos, a última contribuição efetuada refere-se à competência [Últ_Comp_Contrib_Ant], o que leva à perda da qualidade de segurado em [Dia_Perda_QS].

Considerando que, nos termos do laudo pericial, a incapacidade da parte autora (DII) foi fixada em [DII], forçoso concluir que houve perda da qualidade de segurado em momento anterior à incapacidade, o que conduz ao indeferimento do pedido.

<SemQSEG_Preexistência_Ingresso>
Para verificar a ocorrência de doença pré-existente à filiação ao RGPS, mister observar a dicção do art. 59 da Lei 8.213/91 que, em seu §1º, estabelece: “Não será devido o auxílio-doença ao segurado que se filiar ao Regime Geral de Previdência Social já portador da doença ou da lesão invocada como causa para o benefício, exceto quando a incapacidade sobrevier por motivo de progressão ou agravamento da doença ou da lesão”.

Considerando que, nos termos do laudo pericial, a incapacidade da parte autora (DII) foi fixada em [DII] e que seu ingresso no RGPS se deu através do primeiro recolhimento em [Dt_Primeiro_Recol], forçoso concluir que a incapacidade é preexistente ao ingresso no RGPS, o que conduz ao indeferimento do pedido, nos termos do art. 59, § 1º, da Lei 8.213/91.

<SemQSEG_Preexistência_Reingresso_PGraça12meses>
Para verificar a ocorrência de doença pré-existente à filiação ao RGPS, mister observar a dicção do art. 59 da Lei 8.213/91 que, em seu §1º, estabelece: “Não será devido o auxílio-doença ao segurado que se filiar ao Regime Geral de Previdência Social já portador da doença ou da lesão invocada como causa para o benefício, exceto quando a incapacidade sobrevier por motivo de progressão ou agravamento da doença ou da lesão”.

No caso dos autos, verifico que, nos termos do laudo pericial, a incapacidade da parte autora (DII) foi fixada em [DII]. 

Por outro lado, conforme CNIS de evento [Ev_CNIS], é possível contabilizar [Núm_Contrib_Sem_Perder_QS] contribuições ao RGPS sem perda da qualidade de segurado. Havendo menos de 120 contribuições, há que se fixar o período de graça em 12 meses, nos termos do art. 15 da Lei 8.213/91.

Nesse cenário, considerando que sua última contribuição em momento anterior à incapacidade refere-se à competência [Últ_Comp_Contrib_Ant], forçoso concluir que houve perda da qualidade de segurado em [Dia_Perda_QS], sendo, portanto, anterior à incapacidade fixada em perícia. As contribuições vertidas após o início da incapacidade (recolhimentos feitos de [Dt_1o_Recol_pósDII] em diante) não tem o condão de modificar esta situação. 

Deste modo, verificando-se que a incapacidade foi preexistente ao reingresso no RGPS, o pedido deve ser indeferido, nos termos do art. 59, § 1º, da Lei 8.213/91.

<SemQSEG_Preexistência_Reingresso_PGraça24meses_+120Contrib>
Para verificar a ocorrência de doença pré-existente à filiação ao RGPS, mister observar a dicção do art. 59 da Lei 8.213/91 que, em seu §1º, estabelece: “Não será devido o auxílio-doença ao segurado que se filiar ao Regime Geral de Previdência Social já portador da doença ou da lesão invocada como causa para o benefício, exceto quando a incapacidade sobrevier por motivo de progressão ou agravamento da doença ou da lesão”.

No caso dos autos, verifico que, nos termos do laudo pericial, a incapacidade da parte autora (DII) foi fixada em [DII]. 

Por outro lado, conforme CNIS de evento [Ev_CNIS], é possível contabilizar [Núm_Contrib_Sem_Perder_QS] contribuições ao RGPS sem perda da qualidade de segurado. Superadas as 120 contribuições sem quebra do vínculo com o sistema, garante-se a extensão do período de graça para 24 meses, nos termos da lei.

Nesse cenário, considerando que sua última contribuição em momento anterior à incapacidade refere-se à competência [Últ_Comp_Contrib_Ant], forçoso concluir que houve perda da qualidade de segurado em [Dia_Perda_QS], sendo, portanto, anterior à incapacidade fixada em perícia. As contribuições vertidas após o início da incapacidade (recolhimentos feitos de [Dt_1o_Recol_pósDII] em diante) não tem o condão de modificar esta situação. 

Deste modo, verificando-se que a incapacidade foi preexistente ao reingresso no RGPS, o pedido deve ser indeferido, nos termos do art. 59, § 1º, da Lei 8.213/91.

<SemQSEG_Preexistência_Reingresso_PGraça24meses_SegDesemp>
Para verificar a ocorrência de doença pré-existente à filiação ao RGPS, mister observar a dicção do art. 59 da Lei 8.213/91 que, em seu §1º, estabelece: “Não será devido o auxílio-doença ao segurado que se filiar ao Regime Geral de Previdência Social já portador da doença ou da lesão invocada como causa para o benefício, exceto quando a incapacidade sobrevier por motivo de progressão ou agravamento da doença ou da lesão”.

No caso dos autos, verifico que, nos termos do laudo pericial, a incapacidade da parte autora (DII) foi fixada em [DII]. 

Por outro lado, conforme CNIS de evento [Ev_CNIS], é possível contabilizar [Núm_Contrib_Sem_Perder_QS] contribuições ao RGPS sem perda da qualidade de segurado. Havendo menos de 120 contribuições, há que se fixar o período de graça em 12 meses, nos termos do art. 15 da Lei 8.213/91.

Ocorre que no evento [Ev_Seg_Desemprego], houve comprovação de requerimento do seguro-desemprego, o que garante a extensão do período de graça para 24 meses, nos termos do art. 15, § 2º, da Lei 8.213/91. 

Nesse cenário, considerando que sua última contribuição em momento anterior à incapacidade refere-se à competência [Últ_Comp_Contrib_Ant], forçoso concluir que houve perda da qualidade de segurado em [Dia_Perda_QS], sendo, portanto, anterior à incapacidade fixada em perícia. As contribuições vertidas após o início da incapacidade (recolhimentos feitos de [Dt_1o_Recol_pósDII] em diante) não tem o condão de modificar esta situação. 

Deste modo, verificando-se que a incapacidade foi preexistente ao reingresso no RGPS, o pedido deve ser indeferido, nos termos do art. 59, § 1º, da Lei 8.213/91.

<SemQSEG_Preexistência_Reingresso_PGraça36meses>
Para verificar a ocorrência de doença pré-existente à filiação ao RGPS, mister observar a dicção do art. 59 da Lei 8.213/91 que, em seu §1º, estabelece: “Não será devido o auxílio-doença ao segurado que se filiar ao Regime Geral de Previdência Social já portador da doença ou da lesão invocada como causa para o benefício, exceto quando a incapacidade sobrevier por motivo de progressão ou agravamento da doença ou da lesão”.

No caso dos autos, verifico que, nos termos do laudo pericial, a incapacidade da parte autora (DII) foi fixada em [DII]. 

Por outro lado, conforme CNIS de evento [Ev_CNIS], é possível contabilizar [Núm_Contrib_Sem_Perder_QS] contribuições ao RGPS sem perda da qualidade de segurado. Superadas as 120 contribuições sem quebra do vínculo com o sistema, garante-se a extensão do período de graça para 24 meses, nos termos da lei.

Além disso, no evento [Ev_Seg_Desemprego], houve comprovação de requerimento do seguro-desemprego, o que garante o prazo adicional de 12 meses, nos termos do art. 15, § 2º, totalizando um período de graça de 36 meses.

Nesse cenário, considerando que sua última contribuição em momento anterior à incapacidade refere-se à competência [Últ_Comp_Contrib_Ant], forçoso concluir que houve perda da qualidade de segurado em [Dia_Perda_QS], sendo, portanto, anterior à incapacidade fixada em perícia. As contribuições vertidas após o início da incapacidade (recolhimentos feitos de [Dt_1o_Recol_pósDII] em diante) não tem o condão de modificar esta situação. 

Deste modo, verificando-se que a incapacidade foi preexistente ao reingresso no RGPS, o pedido deve ser indeferido, nos termos do art. 59, § 1º, da Lei 8.213/91.

<SemQSEG_Comp_Antes_DII_Recol_Depois>
Importa destacar que as competências [Lista_Comp_Antes_DII_Recol_Depois], apesar de se referirem a meses anteriores à constatação da incapacidade, foram recolhidas em momento posterior à DII. 
Recolhimentos em atraso realizados em momento no qual a parte já estava incapacitada para o trabalho não podem ser considerados para efeito de concessão do benefício pretendido, sob pena de subverter a lógica do seguro social e à própria lei, sobretudo à regra contida no art. 27, inciso II, da Lei 8.213/91.

<Carência_+12Contrib_AntesDII> 
Observa-se, ainda, mais de 12 contribuições ao RGPS em período anterior à manifestação da incapacidade, sem que tenha ocorrido perda da qualidade de segurado. Deste modo, conclui-se que o requisito da carência também foi cumprido.

<Carência_+12ContribTotal_+6AntesDII>
Observa-se, ainda, mais de 12 contribuições ao RGPS no total, sendo [Núm_Contrib_Antes_DII] delas em período anterior à manifestação da incapacidade. Deste modo, conclui-se que o requisito da carência também foi cumprido.

Ainda no que se refere à carência, saliento que a incapacidade é posterior a 06/01/2017 (edição da MP 767/2017, convertida na Lei 13.457/17), de modo que se aplica ao caso o art. 27-A da Lei 8.213/91, na redação dada pela Lei 13.846/19, que prevê a recuperação das contribuições anteriores para efeito de carência ao se completar metade das contribuições necessárias (ao menos 6 contribuições).

<Carência_Dispensa>
Quanto ao requisito da carência, não constam dos autos ao menos 12 contribuições ao RGPS em momento anterior à data da incapacidade identificada na perícia. Todavia, considerando a natureza da patologia e o fato desta ter surgido após o ingresso no sistema, aplica-se, ao caso, o art. 26, inciso II, combinado com o art. 151 da Lei 8.213/91, que classifica as doenças isentas de carência.

> “Art. 151.  Até que seja elaborada a lista de doenças mencionada no inciso II do art. 26, independe de carência a concessão de auxílio-doença e de aposentadoria por invalidez ao segurado que, após filiar-se ao RGPS, for acometido das seguintes doenças: tuberculose ativa, hanseníase, alienação mental, esclerose múltipla, hepatopatia grave, neoplasia maligna, cegueira, paralisia irreversível e incapacitante, cardiopatia grave, doença de Parkinson, espondiloartrose anquilosante, nefropatia grave, estado avançado da doença de Paget (osteíte deformante), síndrome da deficiência imunológica adquirida (aids) ou contaminação por radiação, com base em conclusão da medicina especializada.” 

A lista acima foi ampliada pela portaria MTP/MS 22 de 31/08/2022, englobando, atualmente: I - tuberculose ativa; II - hanseníase; III - transtorno mental grave, desde que esteja cursando com alienação mental; IV - neoplasia maligna; V - cegueira; VI - paralisia irreversível e incapacitante; VII - cardiopatia grave; VIII - doença de Parkinson; IX - espondilite anquilosante; X - nefropatia grave; XI - estado avançado da doença de Paget (osteíte deformante); XII - síndrome da deficiência imunológica adquirida (AIDS/SIDA); XIII - contaminação por radiação, com base em conclusão da medicina especializada; XIV - hepatopatia grave; XV - esclerose múltipla; XVI - acidente vascular encefálico (agudo); e XVII - abdome agudo cirúrgico.

Nesse sentido, havendo isenção de carência no caso concreto, há que se reconhecer o cumprimento de mais esse requisito.

<SemCarência_Menos_12Contrib_Sem_Lista_AntesDepois >
Quanto ao requisito da carência, constam [Núm_Contrib_Antes_DII] recolhimentos anteriores ao início da incapacidade. Com menos de 12 contribuições ao RGPS, não se atende um dos requisitos legais, devendo ser julgada improcedente a demanda.

<SemCarência_Menos_12Contrib_Com_Lista_AntesDepois >
Quanto ao requisito da carência, constam [Núm_Contrib_Antes_DII] recolhimentos anteriores ao início da incapacidade. Com menos de 12 contribuições ao RGPS, não se atende um dos requisitos legais, devendo ser julgada improcedente a demanda.

Importa destacar que as competências [Lista_Comp_Antes_DII_Recol_Depois], apesar de se referirem a meses anteriores à constatação da incapacidade, foram recolhidas em momento posterior à DII. 

Recolhimentos em atraso realizados em momento no qual a parte já estava incapacitada para o trabalho não podem ser considerados para efeito de concessão do benefício pretendido, sob pena de subverter a lógica do seguro social e à própria lei, sobretudo à regra contida no art. 27, inciso II, da Lei 8.213/91.

<SemCarência_+12Total_-6antesDII_Sem_Lista_AntesDepois>
Quanto ao requisito da carência, inobstante constarem, no total, mais de 12 contribuições ao RGPS, não houve o recolhimento de ao menos 6 delas após a perda da qualidade de segurado, ocorrida em [Dia_Perda_QS]. Contam-se, no caso, [Núm_Contrib_Antes_DII] recolhimentos após a recuperação da qualidade de segurado ocorrida em [Dia_Recupera_QS_Antes_DII]. Afasta-se, portanto, a benesse prevista no art. 27-A da Lei 8.213/91, na redação da Lei 13.846/19.

<SemCarência_+12Total_-6antesDII_Com_Lista_AntesDepois>
Quanto ao requisito da carência, inobstante constarem, no total, mais de 12 contribuições ao RGPS, não houve o recolhimento de ao menos 6 delas após a perda da qualidade de segurado, ocorrida em [Dia_Perda_QS]. Contam-se, no caso, [Núm_Contrib_Antes_DII] recolhimentos após a recuperação da qualidade de segurado ocorrida em [Dia_Recupera_QS_Antes_DII]. Afasta-se, portanto, a benesse prevista no art. 27-A da Lei 8.213/91, na redação da Lei 13.846/19.

Importa destacar que as competências [Lista_Comp_Antes_DII_Recol_Depois], apesar de se referirem a meses anteriores à constatação da incapacidade, foram recolhidas em momento posterior à DII. 

Recolhimentos em atraso realizados em momento no qual a parte já estava incapacitada para o trabalho não podem ser considerados para efeito de concessão do benefício pretendido, sob pena de subverter a lógica do seguro social e à própria lei, sobretudo à regra contida no art. 27, inciso II, da Lei 8.213/91.

<SemCarência_Moléstia_Isentiva_DID_Anterior_(Re)Ingresso>
A moléstia que acomete a parte autora encontra-se no rol do art. 151 da Lei 8.213/91, que remete à isenção de carência:

> “Art. 151.  Até que seja elaborada a lista de doenças mencionada no inciso II do art. 26, independe de carência a concessão de auxílio-doença e de aposentadoria por invalidez ao segurado que, após filiar-se ao RGPS, for acometido das seguintes doenças: tuberculose ativa, hanseníase, alienação mental, esclerose múltipla, hepatopatia grave, neoplasia maligna, cegueira, paralisia irreversível e incapacitante, cardiopatia grave, doença de Parkinson, espondiloartrose anquilosante, nefropatia grave, estado avançado da doença de Paget (osteíte deformante), síndrome da deficiência imunológica adquirida (aids) ou contaminação por radiação, com base em conclusão da medicina especializada.”

Cumpre destacar, ainda, que a lista acima foi ampliada pela portaria MTP/MS 22 de 31/08/2022, englobando, atualmente: I - tuberculose ativa; II - hanseníase; III - transtorno mental grave, desde que esteja cursando com alienação mental; IV - neoplasia maligna; V - cegueira; VI - paralisia irreversível e incapacitante; VII - cardiopatia grave; VIII - doença de Parkinson; IX - espondilite anquilosante; X - nefropatia grave; XI - estado avançado da doença de Paget (osteíte deformante); XII - síndrome da deficiência imunológica adquirida (AIDS/SIDA); XIII - contaminação por radiação, com base em conclusão da medicina especializada; XIV - hepatopatia grave; XV - esclerose múltipla; XVI - acidente vascular encefálico (agudo); e XVII - abdome agudo cirúrgico.

Ocorre que, como se depreende da leitura do dispositivo legal, somente se confere isenção de carência quando a enfermidade surge em momento posterior ao ingresso / reingresso no RGPS. Explico melhor!

Apesar do § 1º do art. 59 da Lei nº 8.213/91 permitir o deferimento de benefício por incapacidade temporária ao segurado que se filiou com alguma patologia, sem estar incapacitado, e tornou-se incapaz tempos depois, por agravamento, não há que se falar (nesse caso) de dispensa de carência, conforme redação do art. 26, inciso II, da Lei 8.213/91:

> “Art. 26. Independe de carência a concessão das seguintes prestações: (...)
II - auxílio-doença e aposentadoria por invalidez nos casos de acidente de qualquer natureza ou causa e de doença profissional ou do trabalho, bem como nos casos de segurado que, após filiar-se ao RGPS, for acometido de alguma das doenças e afecções especificadas em lista elaborada pelos Ministérios da Saúde e da Previdência Social, atualizada a cada 3 (três) anos, de acordo com os critérios de estigma, deformação, mutilação, deficiência ou outro fator que lhe confira especificidade e gravidade que mereçam tratamento particularizado;”              

No caso dos autos, ainda que a incapacidade possa eventualmente ter sido detectada em data posterior ao (re)início das contribuições (Data do Início da Incapacidade em [DII] com recolhimentos feitos de [Dia_Recupera_QS_Antes_DII] em diante), conforme consta do laudo pericial, a data do início da doença (DID) foi em [DID]. Havendo início da doença em momento anterior ao início das contribuições, exige-se o cumprimento da carência, conforme acima fundamentado.

Deste modo, ainda que a incapacidade não seja preexistente ao (re)início das contribuições, na data da incapacidade estabelecida pela perícia, a parte autora não tinha cumprido a carência mínima de 12 meses, ou até mesmo os 6 meses exigidos pela lei nas situações de reingresso (art. 27-A da Lei 8.213/91, na redação da Lei 13.846/19).

Embora este Juízo tenha consciência das dificuldades enfrentadas pela parte autora, em razão da doença que lhe acometeu, não há como, a pretexto de querer ajudá-la, conceder-lhe benefício de natureza eminentemente previdenciária. Os benefícios previdenciários são deferidos com base em regras de proteção, tanto do segurado, como do sistema, uma vez que se trata de seguro, ainda que de caráter social. 

Destarte, não atendido um dos requisitos legais, há de ser julgada improcedente a demanda.

<SemCarência_Filiação_Oportunista_Moléstia_Isentiva_DID_Desconhecida>
A moléstia que acomete a parte autora encontra-se no rol do art. 151 da Lei 8.213/91, que remete à isenção de carência:

> “Art. 151.  Até que seja elaborada a lista de doenças mencionada no inciso II do art. 26, independe de carência a concessão de auxílio-doença e de aposentadoria por invalidez ao segurado que, após filiar-se ao RGPS, for acometido das seguintes doenças: tuberculose ativa, hanseníase, alienação mental, esclerose múltipla, hepatopatia grave, neoplasia maligna, cegueira, paralisia irreversível e incapacitante, cardiopatia grave, doença de Parkinson, espondiloartrose anquilosante, nefropatia grave, estado avançado da doença de Paget (osteíte deformante), síndrome da deficiência imunológica adquirida (aids) ou contaminação por radiação, com base em conclusão da medicina especializada.”

Cumpre destacar, ainda, que a lista acima foi ampliada pela portaria MTP/MS 22 de 31/08/2022, englobando, atualmente: I - tuberculose ativa; II - hanseníase; III - transtorno mental grave, desde que esteja cursando com alienação mental; IV - neoplasia maligna; V - cegueira; VI - paralisia irreversível e incapacitante; VII - cardiopatia grave; VIII - doença de Parkinson; IX - espondilite anquilosante; X - nefropatia grave; XI - estado avançado da doença de Paget (osteíte deformante); XII - síndrome da deficiência imunológica adquirida (AIDS/SIDA); XIII - contaminação por radiação, com base em conclusão da medicina especializada; XIV - hepatopatia grave; XV - esclerose múltipla; XVI - acidente vascular encefálico (agudo); e XVII - abdome agudo cirúrgico.

Ocorre que, como se depreende da leitura do dispositivo legal, somente se confere isenção de carência quando a enfermidade surge em momento posterior ao ingresso / reingresso no RGPS. Explico melhor!

Apesar do § 1º do art. 59 da Lei nº 8.213/91 permitir o deferimento de benefício por incapacidade temporária ao segurado que se filiou com alguma patologia, sem estar incapacitado, e tornou-se incapaz tempos depois, por agravamento, não há que se falar (nesse caso) de dispensa de carência, conforme redação do art. 26, inciso II, da Lei 8.213/91:

> “Art. 26. Independe de carência a concessão das seguintes prestações: (...)
II - auxílio-doença e aposentadoria por invalidez nos casos de acidente de qualquer natureza ou causa e de doença profissional ou do trabalho, bem como nos casos de segurado que, após filiar-se ao RGPS, for acometido de alguma das doenças e afecções especificadas em lista elaborada pelos Ministérios da Saúde e da Previdência Social, atualizada a cada 3 (três) anos, de acordo com os critérios de estigma, deformação, mutilação, deficiência ou outro fator que lhe confira especificidade e gravidade que mereçam tratamento particularizado;”                 

No caso dos autos, ainda que a incapacidade possa eventualmente ter sido detectada em data posterior ao (re)início das contribuições (Data do Início da Incapacidade em [DII] com recolhimentos feitos de [Dia_Recupera_QS_Antes_DII] em diante), a doença certamente estava presente em momento anterior, em razão da sua própria natureza e conforme verificado pela lista de eventos clínicos e contributivos. Havendo início da doença em momento anterior ao início das contribuições, exige-se o cumprimento da carência, conforme acima fundamentado.

Deste modo, ainda que a incapacidade não seja preexistente ao (re)início das contribuições, na data da incapacidade estabelecida pela perícia, a parte autora não tinha cumprido a carência mínima de 12 meses, ou até mesmo os 6 meses exigidos pela lei nas situações de reingresso (art. 27-A da Lei 8.213/91, na redação da Lei 13.846/19).

Embora este Juízo tenha consciência das dificuldades enfrentadas pela parte autora, em razão da doença que lhe acometeu, não há como, a pretexto de querer ajudá-la, conceder-lhe benefício de natureza eminentemente previdenciária. Os benefícios previdenciários são deferidos com base em regras de proteção, tanto do segurado, como do sistema, uma vez que se trata de seguro, ainda que de caráter social. 

Destarte, não atendido um dos requisitos legais, há de ser julgada improcedente a demanda.

<DIB_Restabelecimento>
Os atrasados são devidos desde a data que o benefício foi cessado na esfera administrativa - [ÚltimaDCB], sobretudo porque, durante a perícia em juízo, foi comprovado que a incapacidade já estava presente desde aquela época.

<DIB_Concede_CI_Dom_DII_até_30dias_DER>
Por força do art. 60, caput, parte final, da Lei 8.213/91, fixo o dia [DIB] como data de início do benefício (DIB) e pagamento dos atrasados, eis que essa foi a data mencionada pelo perito como provável início da incapacidade. Neste ponto, importante destacar que não transcorreram mais de 30 dias entre o início da incapacidade fixada pelo perito – [DII] – e a data de entrada do requerimento - [DER]. 

<DIB_Concede_CI_Dom_DII_mais_30dias_DER>
Por força do art. 60, da Lei 8.213/91, fixo o dia [DIB] como data de início do benefício (DIB) e pagamento dos atrasados, eis que essa foi a data na qual houve requerimento do benefício na esfera administrativa. Neste ponto, importante destacar que transcorreram mais de 30 dias entre a data do início da incapacidade fixada pelo perito – [DII] – e data da entrada do requerimento – [DER].

<DIB_na_DII_posterior_DER>
Fixo o dia [DIB] como data de início do benefício (DIB) e pagamento dos atrasados, eis que essa foi a data do início da incapacidade fixada pelo perito.

Apesar de não haver requerimento administrativo posterior à data da incapacidade, os documentos acostados aos autos comprovam pedido do benefício em momento anterior. Não haveria como, em ações de benefício por incapacidade, inviabilizar a fixação, pelo perito e pelo juízo, de datas de incapacidade entre a negativa do INSS e a realização do ato pericial, sob o argumento de que faltaria interesse de agir do autor nesses casos. Ou seja, que o autor teria que procurar o INSS no momento do início da incapacidade fixada pelo perito ou pelo juízo, caso contrário seu interesse restaria afastado.

Múltiplas são as patologias que se apresentam com períodos de remissão e agravamento e pode ocorrer da incapacidade ser atestada pelo perito judicial no interstício entre o indeferimento administrativo e a perícia. Por outro lado, pode entender o autor, que nunca deixou de estar incapaz, ou seja, é da essência dessa espécie de lide que as avaliações quanto à incapacidade sejam divergentes e, uma vez ajuizada a ação, há liberdade para que se fixe a incapacidade em qualquer momento. 

Por óbvio, alguém que demanda em juízo achando que nunca deixou de estar incapaz não poderia, a cada exame ou laudo e com a lide em curso, ser obrigado a apresentar perante o INSS um novo pedido e mostrar novos documentos médicos. Poderá até fazê-lo por opção, mas não é razoável obrigá-lo a proceder dessa forma sob pena de caracterizar falta de interesse de agir. 

Em suma, o interesse de agir se fixa no momento da recusa do INSS (negativa de concessão ou prorrogação de benefício). É uma questão processual e se exaure no momento em que se forma a lide: autor entende estar incapaz em certo momento e o INSS contesta, afirmando sua capacidade. Passado este momento, adentra-se a questão de mérito: conforme a prova dos autos, irá se fixar a data de início da incapacidade. Nesse sentido, o exame pericial tem liberdade para estabelecer a data de incapacidade em qualquer momento que entender cabível sob o ponto de vista médico e conforme suas convicções, bem como o juízo para adotá-lo.

<DIB_Concede_Empregado_DII_até_30dias_DER>
Conforme previsão contida no art. 60, § 3º, da Lei nº 8.213/91, “durante os primeiros quinze dias consecutivos ao do afastamento da atividade por motivo de doença, incumbirá à empresa pagar ao segurado empregado o seu salário integral”. Deste modo, fixo o dia [DIB] como data de início do benefício (DIB) e pagamento dos atrasados, sobretudo porque, durante a perícia realizada em juízo, foi comprovado que entre a data da incapacidade – [DII] – e o requerimento administrativo – [DER] – não transcorreram mais de 30 dias.

<DIB_Concede_Empregado_DII_mais_30dias_DER>
Por força do art. 60, § 1º, da Lei 8.213/91, fixo o dia [DIB] como data de início do benefício (DIB) e pagamento dos atrasados, eis que essa foi a data na qual houve requerimento do benefício na esfera administrativa. Neste ponto, importante destacar que transcorreram mais de 30 dias entre a data do início da incapacidade fixada pelo perito – [DII] – e data da entrada do requerimento – [DER].

<TP_Base2_AD> 
Esclareça-se, desde logo, que, em virtude do caráter temporário do benefício em questão, o mesmo poderá, em decorrência das perícias periódicas estabelecidas em lei, ser cessado administrativamente pelo réu caso constatada a recuperação da capacidade laborativa, ou, alternativamente, ser convertido em aposentadoria por invalidez se verificado o caráter total e definitivo da incapacidade.

<DIB_APIN_Perícia>
Afirma ainda o laudo pericial que a parte autora está definitivamente incapacitada para toda espécie de trabalho (incapacidade total e permanente), razão pela qual deve-se fazer a conversão do auxílio por incapacidade temporária em aposentadoria por incapacidade permanente, esta, no entanto, a contar da data da realização da perícia – [DtPerícia].

<DIB_APIN_DII_Perm>
Afirma ainda o laudo pericial que a parte autora está definitivamente incapacitada para toda espécie de trabalho (incapacidade total e permanente), razão pela qual deve-se fazer a conversão do auxílio por incapacidade temporária em aposentadoria por incapacidade permanente. 

A aposentadoria deve ser implantada a partir de [DII_Perm], pois, segundo a perícia, foi esse o provável momento em que a incapacidade se tornou permanente. 

<DIB_APIN_Igual_AD>
Afirma ainda o laudo pericial que a parte autora está definitivamente incapacitada para toda espécie de trabalho (incapacidade total e permanente) desde [DII_Perm]. Tendo em vista que foi possível ao perito fixar aquele momento como início da incapacidade permanente, deve-se conceder o benefício de aposentadoria desde então. 

<DCB_Mais_90dias_Hoje> 
Quanto à estimativa de tempo necessário para recuperação, considerando as conclusões periciais, deve o auxílio por incapacidade temporária ser mantido até, no mínimo, [DCB], ressalvado à parte o direito de requerer administrativamente a prorrogação do benefício, caso ainda se considere incapaz para atividades laborativas ao término do prazo ora fixado.

<DCB_Menos_90dias_Hoje> 
Quanto à estimativa de tempo necessário para recuperação, considerando as conclusões periciais, deveria o auxílio por incapacidade temporária ser mantido até [DCB]. Todavia, há de se considerar que esta data acarretaria dificuldades operacionais, uma vez considerados os procedimentos necessários à implantação, juntamente com a necessidade de oportunizar ao segurado eventual pedido de prorrogação. Assim, o auxílio por incapacidade temporária deverá ser mantido até, no mínimo, [DCB_90dias_hoje], ressalvado à parte o direito de requerer administrativamente a prorrogação do benefício, caso ainda se considere incapaz para atividades laborativas ao término do prazo ora fixado.

<DCB_Reabilitação_Profissional> 
Quanto à estimativa de tempo necessário para recuperação, cumpre destacar que, por ora, a limitação da parte autora, muito embora permanente, configura-se de forma parcial, não abrangendo toda e qualquer atividade. No ponto, destacou o perito: “[Reabilitação_Sugerida]”. 

Desta forma, a ré deve conceder o benefício de auxílio por incapacidade temporária e, assim que possível, avaliar administrativamente o cabimento de reabilitação para atividades compatíveis com sua situação física.

Em tais casos, não é razoável manter o benefício ativo por período demasiadamente curto, sob pena de se inviabilizar o procedimento de reabilitação, prejudicando ambas as partes. Assim, o auxílio deverá ser mantido até, no mínimo, [DCB_6meses_hoje], ressalvado à parte o direito de requerer administrativamente a prorrogação do benefício, caso ainda se considere incapaz para atividades laborativas ao término do prazo ora fixado.

<Reabilitação_Improvável>
Afirma ainda o laudo pericial que a parte autora está definitivamente incapacitada para as atividades laborais próprias de sua categoria profissional de forma permanente. Levando em conta sua idade ([Idade] anos), os trabalhos que realizava e sua escolaridade, não se torna crível que haja sucesso em eventual reabilitação profissional, razão pela qual, deve-se fazer a conversão do auxílio por incapacidade temporária em aposentadoria por incapacidade permanente, esta, no entanto, a contar da data da realização da perícia – [DtPerícia].

<AC25_Proc>
No que concerne ao acréscimo de 25% de que trata o art. 45 da Lei 8.213/91, faz-se necessário que a parte necessite de assistência permanente de terceiros. A verificação a cargo da perícia judicial atestou que, de fato, a parte autora não tem condições de realizar a maioria dos atos cotidianos sem auxílio permanente desde [DI_AC25], o que lhe garante o respectivo acréscimo desde então. 

<AC25_Improc>
No que concerne ao acréscimo de 25% de que trata o art. 45 da Lei 8.213/91, faz-se necessário que a parte necessite de assistência permanente de terceiros. A verificação a cargo da perícia judicial atestou que a parte autora não está incapacitada para uma vida independente, nem necessita do auxílio de terceiros para desenvolver suas tarefas rotineiras, o que conduz ao indeferimento desse pedido.

<DM_Benef_Concedido>
Por fim, não há que se falar em dano moral, uma vez que não restou demonstrado nos autos qualquer situação ou circunstância especial apta a ensejar tal condenação. 

O indeferimento do pedido no âmbito administrativo, per si, não é apto a caracterizar dano moral indenizável, visto que a Administração atuou dentro dos limites postos pela lei, a despeito de não ter caminhado para a melhor solução. 

Há de se ter em mente que não é razoável a condenação em danos morais por todo e qualquer equívoco ou divergência nas conclusões inerentes às atividades de um órgão que precisa lidar com certo grau de subjetividade, no caso, a constatação, através de perícia médica, da incapacidade ou não para atividades laborativas. Como se sabe, tal atividade, a ser exercida por peritos médicos, está sujeita a divergências de opiniões e conclusões, sendo impossível ao INSS escapar a certo grau de erro, o que acarreta, infelizmente, certo número de indeferimentos de benefícios na esfera administrativa, benefícios estes que posteriormente vêm a ser concedidos em juízo. 

Não há nos autos prova de que o segurado tenha sido tratado de forma desrespeitosa, com específico desprestígio, ou algo em especial que justifique a imposição da reparação pretendida. Deste modo, deve ser julgado improcedente tal pedido.

<DM_Benef_Indeferido>
Por fim, não há que se falar em dano moral. A uma porque não há nos autos prova de que a parte autora tenha sido tratada de forma desrespeitosa, com específico desprestígio, ou algo em especial que justifique a imposição da reparação pretendida, e, a duas, por decorrência lógica do indeferimento do benefício em juízo, o que revela acerto da Administração no caso em tela. 

<Disp_Só_AD_Com_DCB>
Dispositivo

Diante de todo o exposto, nos termos do art. 487, I, do CPC/15, JULGO PROCEDENTE o pedido para condenar o INSS a conceder o auxílio por incapacidade temporária em favor da parte autora, a partir de [DIB], devendo mantê-lo ativo ao menos até dia [DCB]. JULGO IMPROCEDENTES os demais pedidos.

<Disp_Só_AD_Com_DCB+90>
Dispositivo

Diante de todo o exposto, nos termos do art. 487, I, do CPC/15, JULGO PROCEDENTE o pedido para condenar o INSS a conceder o auxílio por incapacidade temporária em favor da parte autora, a partir de [DIB], devendo mantê-lo ativo ao menos até dia [DCB_90dias_hoje]. JULGO IMPROCEDENTES os demais pedidos.

<Disp_Só_AD_Com_Reab>
Dispositivo

Diante de todo o exposto, nos termos do art. 487, I, do CPC/15, JULGO PROCEDENTE o pedido para condenar o INSS a conceder o auxílio por incapacidade temporária em favor da parte autora, a partir de [DIB], devendo mantê-lo ativo ao menos até dia [DCB_6meses_hoje]. JULGO IMPROCEDENTES os demais pedidos.

<Disp_AD_Com_APIN>
Dispositivo

Diante de todo o exposto, nos termos do art. 487, I, do CPC/15, JULGO PROCEDENTE o pedido para condenar o INSS a conceder o auxílio por incapacidade temporária em favor da parte autora desde [DIB] e aposentadoria por incapacidade permanente a partir de [DII_Perm]. 

<Disp_Só_APIN >
Diante de todo o exposto:

JULGO PROCEDENTE O PEDIDO, nos termos do art. 487, I, do CPC/15, para condenar o INSS à concessão de aposentadoria por incapacidade permanente em favor da parte autora, a partir de [DII_Perm]. 

<Disp_AC25>
JULGO igualmente PROCEDENTE o pedido de acréscimo de 25% sobre a aposentadoria, devendo este ser pago desde [DI_AC25].

<Disp_AC25_Impro>
JULGO IMPROCEDENTE o pedido de adicional de 25% sobre o valor da aposentadoria. 

<Disp_AC25_DM_Impro>
JULGO IMPROCEDENTES os pedidos de adicional de 25% sobre o valor da aposentadoria e condenação em danos morais. 

<Disp_DM_Impro>
JULGO IMPROCEDENTE o pedido de condenação em danos morais.

<Fechamento_Sent_Proc>
Os atrasados desde [DIB] deverão ser calculados conforme os critérios de correção dispostos no Manual de Cálculos da Justiça Federal.
Incidentalmente, REAPRECIO E ANTECIPO OS EFEITOS DA TUTELA, tendo em vista o caráter alimentar, para que seja implantado o benefício no prazo de 30 dias, devendo o INSS comprovar nos autos o atendimento da presente determinação judicial. Intime-se a CEAB-DJ.

Sem custas e honorários conforme artigos 54 e 55 da Lei 9.099/95.

Diante da decisão acima, deverá o INSS ressarcir os valores antecipados por esta Seção Judiciária a título de honorários periciais, nos termos do §1º do art. 12 da Lei n.º 10.259/01.

Intimem-se.

<Fechamento_Sent_Improc>
Sem custas e honorários conforme artigos 54 e 55 da Lei 9.099/95.

Transitado em julgado, dê-se baixa e arquive-se.


