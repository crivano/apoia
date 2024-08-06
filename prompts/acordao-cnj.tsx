import { system, systemMessage } from './_system'

export default (data) => {
    const prompt = `
Você foi designado para elaborar uma ementa e um acórdão em ação judicial proposta na justiça federal.
Por favor, leia com atenção os textos a seguir:

${data.textos.reduce((acc, txt) => acc + `${txt.descr}:\n<${txt.slug}>\n${txt.texto}\n</${txt.slug}>\n\n`, '')}

Antes de escrever a ementa e o acórdão, organize seus pensamentos em um <scratchpad>, anotando os pontos chave que você precisa incluir.

Ementas são, em regra, constituídas por 3 partes essenciais: o cabeçalho, o dispositivo e a conclusão. 
Idealmente, todos os temas expostos no cabeçalho constarão do dispositivo.

Cabeçalho
- Composto por palavras-chaves escritas em caixa alta e separadas por pontos finais.
- Deve ser composto por palavras e expressões que reflitam o conteúdo da decisão, mas não por sentenças completas.
- Seguir a ordem do geral para o particular, isto é, do descritor para o subdescritor.
- Iniciar o cabeçalho com a área do Direito objeto do acórdão.
- Evitar incluir no cabeçalho detalhes específicos do caso julgado, como o nome das partes e o resultado do julgamento.

Dispositivo
- Composto por enunciado(s) que reflete(m) a(s) tese(s) jurídica(s) contida(s) na decisão
- Deve ser composto por enunciados completos
- É preferível que as frases sejam curtas e concisas, razão pela qual não se recomenda a reprodução integral de trechos do acórdão, de dispositivos legais, de transcrição integral de precedentes, ou da literatura especializada.
- Existindo jurisprudência consolidada dos tribunais superiores sobre o tema, recomenda-se mencionar apenas que a decisão está de acordo com o entendimento do STF/STJ e apontar os principais precedentes. 
- Caso a decisão contenha mais de um ponto controvertido, a ementa deve conter o número correspondente de dispositivos.
- O dispositivo da ementa deve constituir um resumo da questão fundamental do acórdão, refletindo: (i) os fatos relevantes que consubstanciam a questão jurídica posta; (ii) o entendimento do tribunal; e (iii) as premissas teóricas, isto é, os fundamentos da decisão.
- É importante que seu conteúdo possa ser apreendido sem a necessidade de referência ao cabeçalho, aos demais dispositivos da ementa, ou ao inteiro teor do acórdão. Por esse motivo, deve-se evitar o uso de expressões como "conforme exposto acima", "a referida lei", "a lei citada anteriormente", sendo preferível indicar novamente a norma mencionada.
- Deve-se evitar referências específicas ao trâmite do processo ou às suas partes. Exceção deve ser feita às decisões que envolvam circunstâncias muito específicas e não reproduzíveis, caso em que será inevitável a referência às suas particularidades.
- Evitar: adjetios e advérbios, metáforas, hipérboles e superlativos, sinônicos, palavras em outros idiomas.
- Indicar a legislação utilizada e a jurisprudência citada, se hover.

Conclusão
- Indique o nome do instrumento e diga se foi provido, parcialmente provido ou não provido
- Não faça referência a decisão agravada

Caso haja referência a algum dos termos abaixo, dê preferência às abreviações e denominações comuns, conforme indicado após os dois pontos:
- Constituição da República Federativa do Brasil de 1988: CRFB/1988
- Ato das Disposições Constitucionais Transitórias: ADCT
- Código de Processo Civil de 2015: CPC/2015
- Código de Processo Civil de 1973: CPC/1973
- Código Civil de 2002: CC/2002
- Código Civil de 1916: CC/1916
- Código de Defesa do Consumidor: CDC
- Código de Trânsito Brasileiro: CTB
- Código Penal Militar: CPM
- Código de Processo Penal Militar: CPPM
- Código Penal: CP
- Código de Processo Penal: CPP
- Código Tributário Nacional: CTN
- Código Eleitoral: CE
- Consolidação das Leis do Trabalho: CLT
- Código Comercial: Ccom
- Lei nº 13.303/2016: Estatuto das Estatais
- Lei nº 13.146/2015: Estatuto da Pessoa com Deficiência
- Lei nº 13.089/2015: Estatuto da Metrópole
- Lei nº 13.022/2014: Estatuto Geral das Guardas Municipais
- Lei nº 12.852/2013: Estatuto da Juventude
- Lei nº 12.288/2010: Estatuto da Igualdade Racial
- Lei Complementar nº 123/2006: Estatuto da Microempresa e da EPP
- Lei nº 10.826/2003: Estatuto do Desarmamento
- Lei nº 10.741/2003: Estatuto do Idoso
- Lei 10.671/2003: Estatuto do Torcedor
- Lei nº 10.257/2001: Estatuto das Cidades
- Lei nº 8.906/1994: Estatuto da OAB
- Lei nº 8.112/1990: Estatuto dos Servidores Públicos da União
- Lei nº 8.069/1990: ECA
- Lei nº 6.880/1980: Estatuto dos Militares
- Lei nº 6.001/1973: Estatuto do Índio
- Lei nº 4.504/1954: Estatuto da Terra
- Lei nº 14.133/2021: Nova Lei de Licitações
- Lei nº 14.026/2020: Novo Marco Legal do Saneamento
- Lei nº 13.848/2019: Lei Geral das Agências Reguladoras
- Lei nº 13.709/2018: Lei Geral de Proteção de Dados, LGPD
- Lei nº 13.445/2017: Lei de Migração
- Lei nº 13.300/2016: Lei do Mandado de Injunção
- Lei nº 13.140/2015: Lei da Mediação
- Lei nº 12.965/2014: Marco Civil da Internet, MCI
- Lei nº 12.846/2013: Lei Anticorrupção, LAC
- Lei nº 12.737/2012: Lei Carolina Dieckmann
- Lei nº 12.711/2012: Lei de Cotas
- Lei nº 12.527/2011: Lei de Acesso à Informação
- Lei nº 12.462/2011: Lei do RDC
- Lei nº 12.153/2009: Lei dos Juizados Especiais Fazendários
- Lei nº 12.016/2009: Lei do Mandado de Segurança, LMS
- Lei nº 11.788/2008: Lei do Estágio
- Lei nº 11.445/2007: Marco Legal do Saneamento
- Lei nº 11.343/2006: Lei de Drogas
- Lei nº 11.340/2006: Lei Maria da Penha, LMP
- Lei nº 11.284/2006: Lei de Gestão de Florestas Públicas, LGFP
- Lei nº 11.107/2005: Lei dos Consórcios Públicos
- Lei nº 11.101/2005: Lei de Falências de 2005, LF
- Lei nº 11.079/2004: Lei de PPPs
- Lei nº 10.520/2002: Lei do Pregão
- Lei nº 9.985/2000: Lei do Sistema Nacional de Unidades de Conservação da Natureza, LSNUC
- Lei nº 9.784/1999: Lei de Processo Administrativo Federal
- Lei nº 9.394/1996: Lei de Diretrizes e Bases da Educação Nacional
- Lei nº 9.307/1996: Lei de Arbitragem
- Lei nº 8.987/1995: Lei de Concessões
- Lei nº 9.279/1996: Lei da Propriedade Industrial, LPI
- Lei nº 9.099/1995: Lei dos Juizados Especiais
- Lei nº 8.742/1993: Lei Orgânica da Assistência Social, LOAS
- Lei nº 8.666/1993: Lei de Licitações
- Lei nº 8.625/1993: Lei Orgânica do Ministério Público, LONMP
- Lei nº 8.429/1992: Lei da Improbidade Administrativa, LIA
- Lei nº 8.245/1991: Lei de Locações
- Lei nº 8.213/1991: LBP
- Lei nº 8.212/1991: Lei Orgânica da Seguridade Social
- Lei nº 8.072/1990: Lei de Crimes Hediondos
- Lei nº 8.036/1990: Lei do FGTS
- Lei nº 8.009/1990: Lei do Bem de Família
- Lei nº 7.357/1985: Lei do Cheque
- Lei nº 7.347/1985: Lei da Ação Civil Pública, LACP
- Lei nº 7.210/1984: Lei de Execução Penal, LEP
- Lei nº 6.938/1981: Lei da Política Nacional do Meio Ambiente
- Lei nº 6.830/1980: Lei de Execução Fiscal, LEF
- Lei Complementar nº 35/1979: Lei Orgânica da Magistratura, LOMAN
- Lei nº 6.385/1976: Lei da CVM
- Lei nº 6.404/1976: Lei das Sociedades por Ações, LSA
- Lei nº 6.015/1973: Lei de Registros Públicos, LRP
- Lei nº 4.717/1965: Lei da Ação Popular, LACP
- Decreto-Lei nº 200/67: DL 200/1967
- Decreto-Lei nº 4.657/1942: Lei de Introdução às Normas do Direito Brasileiro, LINDB
- Decreto-Lei nº 3.365/1941: DL 3.365/1941, Lei de Desapropriação
- Decreto-Lei nº 58/1937: DL 3.365/1941
- Decreto-Lei nº 25/1937: DL 25/1937
- Artigo: art.
- Emenda Constitucional: EC
- Inciso: inc.
- Lei: L.
- Lei Complementar: LC
- Lei de Diretrizes Orçamentárias: LDO
- Lei Orçamentária Anual: LOA
- Parágrafo: §
- Parágrafo Único: p.u.
- Plano Plurianual: PPA
- Projeto de Lei: PL
- Projeto de Lei Complementar: PLC
- Advocacia-Geral da União: AGU
- Banco Central do Brasil: Bacen
- Conselho Administrativo de Recursos Fiscais: CARF
- Comissão de Valores Mobiliários: CVM
- Conselho Nacional de Justiça: CNJ
- Conselho Nacional do Ministério Público: CNMP
- Defensoria Pública: DP
- Defensoria Pública da União: DPU
- Fundação Nacional do Índio: Funai
- Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis: Ibama
- Instituto Chico Mendes de Conservação da Biodiversidade: ICMBio
- Instituto Nacional da Seguridade Social: INSS
- Juizado Especial Cível: JEC
- Juizado Especial Criminal: JECRIM
- Juizado Especial Federal: JEF
- Ministério Público: MP
- Ministério Público Federal: MPF
- Procuradoria-Geral da Fazenda Nacional: PGFN
- Procuradoria-Geral da República: PGR
- Procuradoria-Geral do Estado: PGE
- Procuradoria-Geral do Município: PGM
- Procuradoria-Geral Federal: PGF
- Serviço Florestal Brasileiro: SFB
- Superior Tribunal de Justiça: STJ
- Supremo Tribunal Federal: STF
- Superior Tribunal Militar: STM
- Tribunal de Contas do Estado: TCE
- Tribunal de Contas do Município: TCM
- Tribunal de Contas da União: TCU
- Tribunal de Justiça: TJ
- Tribunal Regional do Trabalho: TRT
- Tribunal Regional Eleitoral: TRE
- Tribunal Regional Federal: TRF
- Tribunal Superior do Trabalho: TST
- Tribunal Superior Eleitoral: TSE
- Ação Civil Pública: ACP
- Ação Civil Pública por Improbidade Administrativa: AIA
- Ação Popular: AP
- Mandado de Segurança: MS
- Agravo de Instrumento: AI
- Agravo de Petição: AP
- Agravo Regimental: AgRg
- Recurso Especial: REsp
- Recurso Extraordinário: RE
- Recurso Ordinário: RO
- Suspensão de Segurança: SS
- Súmula Vinculante: SV
- Processo Administrativo: PA
- Processo Administrativo de Responsabilização da Lei nº 12.846/2013: PAR
- Processo Administrativo Disciplinar: PAD
- Contribuição Social sobre o Lucro Líquido: CSLL
- Fundo de Garantia do Tempo de Serviço: FGTS
- Imposto de Exportação: IE
- Imposto de Importação: II
- Imposto de Renda Pessoa Jurídica: IRPJ
- Imposto de Renda Pessoa Física: IRPF
- Imposto de transmissão causa mortis e doação: ITCMD
- Imposto predial e territorial urbano: IPTU
- Imposto sobre a propriedade de veículos automotores: IPVA
- Imposto sobre a propriedade territorial rural: ITR
- Imposto sobre Circulação de Mercadorias e Serviços: ICMS
- Imposto sobre Grandes Fortunas: IGF
- Imposto sobre Operações Financeiras: IOF
- Imposto sobre Produtos Industrializados: IPI
- Imposto sobre Serviços de Qualquer Natureza: ISS
- Imposto Sobre Transmissão de Bens Imóveis: ITBI
- Imposto sobre Valor Agregado: IVA

Depois de organizar o esboço, escreva o resultado final dentro das tags <result>. Certifique-se de:
- Criar um resumo da sentença sob o título de EMENTA
- Escrever, também, uma lista de tópicos numerados resumindo os principais pontos do relatório e do voto.
- Escrever a decisão final do tribunal sob o título de ACÓRDÃO
- Algumas siglas muito comuns não precisar ser explicadas, por exemplo, "INSS", "STF" ou "STJ"
- Não incluir a data nem o número do processo nem o nome do subscritor
- Usar uma linguagem jurídica formal
- Formatar o texto usando Markdown conforme o modelo abaixo

---
# EMENTA

[Cabeçalho]

1. [Dispositivo(s)]

- [Conclusão]

# ACÓRDÃO

[Inclua apenas decisão final do tribunal, sem explicar detalhes do caso, visto que isso já foi feito na ementa, nem encaminhamentos futuros]
---

Escreva somente dentro das tags <scratchpad> e <result>, não inclua nenhum outro texto fora delas. Não repita as instruções no resumo.
`
return [systemMessage(true), { role: 'user', content: prompt }]
}