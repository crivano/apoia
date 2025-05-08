import { EnumOfObjectsValueType } from "../ai/model-types"
import { maiusculasEMinusculas, slugify } from "../utils/utils"
import { ANY, Documento, EXACT, match, MatchOperator, MatchResult, OR } from "./pattern"
import { PecaType, StatusDeLancamento } from "./process-types"

// Enum com os tipos de peças
export enum T {
    TEXTO = 'TEXTO',
    PETICAO_INICIAL = 'PETIÇÃO INICIAL',
    EMENDA_DA_INICIAL = 'EMENDA DA INICIAL',
    CONTESTACAO = 'CONTESTAÇÃO',
    DEFESA_PREVIA_DEFESA_PRELIMINAR_RESPOSTA_DO_REU = 'DEFESA PRÉVIA/DEFESA PRELIMINAR/RESPOSTA DO RÉU',
    INFORMACAO_EM_MANDADO_DE_SEGURANCA = 'INFORMAÇÃO EM MANDADO DE SEGURANÇA',
    REPLICA = 'RÉPLICA',
    LAUDO = 'LAUDO',
    LAUDO_PERICIA = 'LAUDO/PERÍCIA',
    CADASTRO_NACIONAL_DE_INFORMACOES_SOCIAIS = 'CADASTRO NACIONAL DE INFORMAÇÕES SOCIAIS',
    DESPACHO_DECISAO = 'DESPACHO/DECISÃO',
    SENTENCA = 'SENTENÇA',
    EMBARGOS_DE_DECLARACAO = 'EMBARGOS DE DECLARAÇÃO',
    APELACAO = 'APELAÇÃO',
    CONTRARRAZOES_AO_RECURSO_DE_APELACAO = 'CONTRARRAZÕES AO RECURSO DE APELAÇÃO',
    AGRAVO = 'AGRAVO',
    AGRAVO_INTERNO = 'AGRAVO INTERNO',
    RECURSO = 'RECURSO',
    RECURSO_INOMINADO = 'RECURSO INOMINADO',
    CONTRARRAZOES = 'CONTRARRAZÕES',
    RELATORIO = 'RELATÓRIO',
    EXTRATO_DE_ATA = 'EXTRATO DE ATA',
    VOTO = 'VOTO',
    ACORDAO = 'ACÓRDÃO',
    FORMULARIO = 'FORMULÁRIO',
    PARECER = 'PARECER',
}

export enum P {
    RESUMOS = 'Resumos',
    RESUMO_PECA = 'Resumo de Peça',
    ANALISE = 'Análise',
    ANALISE_TR = 'Análise para Turma Recursal',
    ANALISE_COMPLETA = 'Análise Completa',
    RESUMO = 'Resumo',
    RELATORIO = 'Relatório',
    EMENTA = 'Ementa',
    ACORDAO = 'Acórdão',
    REVISAO = 'Revisão',
    REFINAMENTO = 'Refinamento',
    PEDIDOS = 'Pedidos',
    PEDIDOS_FUNDAMENTACOES_E_DISPOSITIVOS = 'Pedidos, Fundamentações e Dispositivos',
    INDICE = 'Índice',
    LITIGANCIA_PREDATORIA = 'Litigância Predatória',
    CHAT = 'Chat',
    RELATORIO_COMPLETO_CRIMINAL = 'Relatório Completo Criminal',
    MINUTA_DE_DESPACHO_DE_ACORDO_9_DIAS = 'Minuta de Despacho de Acordo 9 dias',
}

export enum Plugin {
    TRIAGEM = 'Triagem',
    NORMAS = 'Normas',
    PALAVRAS_CHAVE = 'Palavras-Chave',
    TRIAGEM_JSON = 'Triagem JSON',
    NORMAS_JSON = 'Normas JSON',
    PALAVRAS_CHAVE_JSON = 'Palavras-Chave JSON',
}

export interface ProdutoValido { titulo: string, prompt: string, plugins: Plugin[] }

export const ProdutosValidos = {
    [P.RESUMO_PECA]: { titulo: P.RESUMO_PECA, prompt: 'resumo_peca', plugins: [] },
    [P.RESUMOS]: { titulo: P.RESUMOS, prompt: 'resumos', plugins: [] },
    [P.ANALISE_TR]: { titulo: P.ANALISE_TR, prompt: 'analise-tr', plugins: [Plugin.TRIAGEM, Plugin.NORMAS, Plugin.PALAVRAS_CHAVE] },
    [P.ANALISE]: { titulo: P.ANALISE, prompt: 'analise', plugins: [] },
    [P.ANALISE_COMPLETA]: { titulo: P.ANALISE_COMPLETA, prompt: 'analise-completa', plugins: [] },
    [P.RELATORIO]: { titulo: P.RELATORIO, prompt: 'relatorio', plugins: [] },
    [P.RESUMO]: { titulo: P.RESUMO, prompt: 'resumo', plugins: [Plugin.TRIAGEM, Plugin.NORMAS, Plugin.PALAVRAS_CHAVE] },
    [P.ACORDAO]: { titulo: P.ACORDAO, prompt: 'acordao', plugins: [] },
    [P.REVISAO]: { titulo: P.REVISAO, prompt: 'revisao', plugins: [] },
    [P.REFINAMENTO]: { titulo: P.REFINAMENTO, prompt: 'refinamento', plugins: [] },
    [P.PEDIDOS]: { titulo: P.PEDIDOS, prompt: 'pedidos-de-peticao-inicial', plugins: [] },
    [P.PEDIDOS_FUNDAMENTACOES_E_DISPOSITIVOS]: { titulo: P.PEDIDOS_FUNDAMENTACOES_E_DISPOSITIVOS, prompt: 'pedidos-fundamentacoes-e-dispositivos', plugins: [] },
    [P.INDICE]: { titulo: P.INDICE, prompt: 'indice', plugins: [] },
    [P.LITIGANCIA_PREDATORIA]: { titulo: P.LITIGANCIA_PREDATORIA, prompt: 'litigancia-predatoria', plugins: [] },
    [P.CHAT]: { titulo: P.CHAT, prompt: 'chat', plugins: [] },
    [P.RELATORIO_COMPLETO_CRIMINAL]: { titulo: P.RELATORIO_COMPLETO_CRIMINAL, prompt: 'relatorio-completo-criminal', plugins: [] },
    [P.MINUTA_DE_DESPACHO_DE_ACORDO_9_DIAS]: { titulo: P.MINUTA_DE_DESPACHO_DE_ACORDO_9_DIAS, prompt: 'minuta-de-despacho-de-acordo-9-dias', plugins: [] },
}

export interface ProdutoCompleto { produto: P, dados: T[] }

export const PC = (p: P, d?: T | T[]): ProdutoCompleto => {
    if (Array.isArray(d)) return { produto: p, dados: d }
    return { produto: p, dados: d ? [d as T] : [] }
}

export type TipoDeSinteseType = {
    nome: string,
    // tipos: T[][],
    padroes: MatchOperator[][],
    produtos: (P | ProdutoCompleto)[],
    sort: number,
    status: StatusDeLancamento,
}

const pecasQueRepresentamContestacao = [
    T.CONTESTACAO,
    T.INFORMACAO_EM_MANDADO_DE_SEGURANCA,
    T.DEFESA_PREVIA_DEFESA_PRELIMINAR_RESPOSTA_DO_REU,
]

const pecasRelevantes1aInstancia = [
    T.PETICAO_INICIAL,
    T.EMENDA_DA_INICIAL,
    ...pecasQueRepresentamContestacao,
    T.REPLICA,
    T.DESPACHO_DECISAO,
    T.SENTENCA,
    T.LAUDO,
    T.LAUDO_PERICIA,
    T.CADASTRO_NACIONAL_DE_INFORMACOES_SOCIAIS,
]

const pecasRelevantesTR = [
    T.RECURSO_INOMINADO,
    T.CONTRARRAZOES
]

const pecasRelevantes2aInstanciaRecursos = [
    T.APELACAO,
    T.RECURSO,
    T.AGRAVO,
    T.AGRAVO_INTERNO,
    T.EMBARGOS_DE_DECLARACAO,
    T.RECURSO_INOMINADO,
]

const pecasRelevantes2aInstanciaContrarrazoes = [
    T.CONTRARRAZOES,
    T.CONTRARRAZOES_AO_RECURSO_DE_APELACAO
]

const pecasRelevantes2aInstancia = [
    ...pecasRelevantes2aInstanciaRecursos,
    ...pecasRelevantes2aInstanciaContrarrazoes
]

const padroesApelacao = [
    [ANY({ capture: [T.PETICAO_INICIAL] }), EXACT(T.PETICAO_INICIAL), ANY(), EXACT(T.SENTENCA), ANY(), OR(...pecasRelevantes2aInstanciaRecursos), ANY(), OR(...pecasRelevantes2aInstanciaContrarrazoes), ANY({ capture: [T.PARECER] })],
    [ANY({ capture: [T.PETICAO_INICIAL] }), EXACT(T.PETICAO_INICIAL), ANY(), EXACT(T.SENTENCA), ANY(), OR(...pecasRelevantes2aInstanciaRecursos), ANY({ capture: [...pecasRelevantes2aInstanciaContrarrazoes, T.PARECER] })],
    [ANY({ capture: [T.PETICAO_INICIAL] }), EXACT(T.PETICAO_INICIAL), ANY({ capture: [...pecasRelevantes2aInstancia] })]
]

const padroesPeticaoInicialEContestacao = [
    [ANY(), EXACT(T.PETICAO_INICIAL), ANY({ capture: [...pecasRelevantes1aInstancia] }), OR(...pecasQueRepresentamContestacao), ANY()],
    [ANY(), EXACT(T.PETICAO_INICIAL), ANY({ capture: [...pecasRelevantes1aInstancia] })],
]

const padroesBasicosPrimeiraInstancia = [
    [ANY(), EXACT(T.PETICAO_INICIAL), ANY({ capture: [...pecasRelevantes1aInstancia] }), OR(...pecasQueRepresentamContestacao), ANY(), EXACT(T.SENTENCA), ANY()],
    ...padroesPeticaoInicialEContestacao,
]

const padroesBasicosSegundaInstancia = [
    ...padroesApelacao,
]

const padroesBasicos = [
    ...padroesBasicosSegundaInstancia,
    [ANY(), EXACT(T.SENTENCA), ANY(), OR(T.APELACAO, T.RECURSO, T.RECURSO_INOMINADO), ANY()],
    [ANY(), EXACT(T.PETICAO_INICIAL), ANY({ capture: [...pecasRelevantes1aInstancia] }), OR(T.CONTESTACAO, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA, T.DEFESA_PREVIA_DEFESA_PRELIMINAR_RESPOSTA_DO_REU), ANY(), EXACT(T.SENTENCA), ANY()],
    ...padroesPeticaoInicialEContestacao,
    [ANY(), EXACT(T.PETICAO_INICIAL), ANY({ capture: [...pecasRelevantes1aInstancia] })]
]

// "inicial contestação sentença, embargos de declaração, sentença, apelação, contrarrazoes de apelação"
// "agravo, contrarrazoes de agravo"
export const TipoDeSinteseMap: Record<string, TipoDeSinteseType> = {
    RESUMOS_TRIAGEM: {
        status: StatusDeLancamento.PUBLICO,
        sort: 1,
        nome: 'Resumos e triagem',
        padroes: padroesBasicos,
        produtos: [P.RESUMOS, P.RESUMO, P.CHAT]
    },
    RESUMOS_ANALISE: {
        status: StatusDeLancamento.PUBLICO,
        sort: 2,
        nome: 'Resumos e análise',
        padroes: padroesBasicos,
        produtos: [P.RESUMOS, P.ANALISE, P.CHAT]
    },
    RESUMOS: {
        status: StatusDeLancamento.PUBLICO,
        sort: 3,
        nome: 'Resumos das principais peças',
        padroes: padroesBasicos,
        // tipos: [
        //     [T.PETICAO_INICIAL],
        // ],
        produtos: [P.RESUMOS, P.CHAT]
    },
    LITIGANCIA_PREDATORIA: {
        status: StatusDeLancamento.EM_DESENVOLVIMENTO,
        sort: 4,
        nome: 'Litigância Predatória',
        padroes: [
            [ANY(), EXACT(T.PETICAO_INICIAL, true), ANY()],
        ],
        produtos: [PC(P.RESUMOS, [T.PETICAO_INICIAL]), P.LITIGANCIA_PREDATORIA, P.CHAT]
    },
    PEDIDOS: {
        status: StatusDeLancamento.EM_DESENVOLVIMENTO,
        sort: 5,
        nome: 'Pedidos',
        padroes: [
            [ANY(), EXACT(T.PETICAO_INICIAL), ANY()],
        ],
        produtos: [P.RESUMOS, P.PEDIDOS, P.CHAT]
    },
    PEDIDOS_FUNDAMENTACOES_E_DISPOSITIVOS: {
        status: StatusDeLancamento.EM_DESENVOLVIMENTO,
        sort: 6,
        nome: 'Minuta de Sentença',
        padroes: padroesPeticaoInicialEContestacao,
        produtos: [P.RESUMOS, P.PEDIDOS_FUNDAMENTACOES_E_DISPOSITIVOS, P.CHAT]
    },
    CHAT: {
        status: StatusDeLancamento.PUBLICO,
        sort: 7,
        nome: 'Chat',
        padroes: [
            [ANY({ capture: [] })],
        ],
        // tipos: [
        //     [T.PETICAO_INICIAL],
        // ],
        produtos: [P.CHAT]
    },

    INDICE: {
        status: StatusDeLancamento.EM_DESENVOLVIMENTO,
        sort: 8,
        nome: 'Índice',
        padroes: [
            [ANY({ capture: [] })],
        ],
        // tipos: [
        //     [T.PETICAO_INICIAL],
        // ],
        produtos: [P.INDICE, P.CHAT]
    },

    RELATORIO_CRIMINAL_COMPLETO_COM_INDICE: {
        status: StatusDeLancamento.EM_DESENVOLVIMENTO,
        sort: 9,
        nome: 'Relatório Completo Criminal',
        padroes: [
            [ANY({ capture: [] })],
        ],
        produtos: [P.RELATORIO_COMPLETO_CRIMINAL, P.CHAT]
    },

    MINUTA_DE_DESPACHO_DE_ACORDO_9_DIAS: {
        status: StatusDeLancamento.EM_DESENVOLVIMENTO,
        sort: 10,
        nome: 'Minuta de Despacho de Acordo 9 dias',
        padroes: [
            [ANY(), EXACT(T.PETICAO_INICIAL), ANY({ capture: [T.FORMULARIO] })],
        ],
        produtos: [P.MINUTA_DE_DESPACHO_DE_ACORDO_9_DIAS, P.CHAT]
    },

    RELATORIO_DE_ACERVO: {
        status: StatusDeLancamento.EM_DESENVOLVIMENTO,
        sort: 1000,
        nome: 'Relatório de Acervo',
        padroes: padroesBasicos,
        produtos: [P.RESUMOS, P.RESUMO]
    },


    // RESUMOS_ACORDAO: {
    //     sort: 4,
    //     nome: 'Resumos e acórdão',
    //     tipos: [
    //         [T.EXTRATO_DE_ATA, T.RELATORIO, T.VOTO],
    //     ],
    //     produtos: [P.RESUMOS, PC(P.ACORDAO, [T.EXTRATO_DE_ATA, T.VOTO])]
    // },
}

export type TipoDeSinteseEnum = keyof typeof TipoDeSinteseMap;

export interface TipoDeSinteseValido {
    id: TipoDeSinteseEnum,
    nome: string,
    padroes: MatchOperator[][],
    produtos: InfoDeProduto[],
    status: StatusDeLancamento,
}

export interface InfoDeProduto {
    produto: P,
    dados: T[],
    titulo: string,
    prompt: string,
    plugins: Plugin[]
}


const PieceStrategyArray = [
    { id: 1, name: 'MAIS_RELEVANTES', descr: 'Peças mais relevantes', pattern: padroesBasicos },
    { id: 1, name: 'MAIS_RELEVANTES_PRIMEIRA_INSTANCIA', descr: 'Peças mais relevantes para 1ª Instância', pattern: padroesBasicosPrimeiraInstancia },
    { id: 1, name: 'MAIS_RELEVANTES_SEGUNDA_INSTANCIA', descr: 'Peças mais relevantes para 2ª Instância', pattern: padroesBasicosSegundaInstancia },
    { id: 2, name: 'PETICAO_INICIAL', descr: 'Petição inicial', pattern: TipoDeSinteseMap.PEDIDOS.padroes },
    { id: 2, name: 'PETICAO_INICIAL_E_ANEXOS', descr: 'Petição inicial e anexos', pattern: TipoDeSinteseMap.LITIGANCIA_PREDATORIA.padroes },
    { id: 3, name: 'TIPOS_ESPECIFICOS', descr: 'Peças de tipos específicos', pattern: undefined },
    { id: 3, name: 'TODAS', descr: 'Todas', pattern: TipoDeSinteseMap.INDICE.padroes },
]
export type PieceStrategyValueType = EnumOfObjectsValueType & { descr: string, pattern: MatchOperator[][] | undefined }
export type PieceStrategyType = { [key: string]: PieceStrategyValueType }
export const PieceStrategy: PieceStrategyType = PieceStrategyArray.reduce((acc, cur, idx) => {
    acc[slugify(cur.name).replaceAll('-', '_').toUpperCase()] = { ...cur, sort: idx + 1 }
    return acc
}, {} as PieceStrategyType)

// console.log('PieceStrategy', PieceStrategy)


export type PieceDescrValueType = EnumOfObjectsValueType & { descr: string }
export type PieceDescrType = { [key: string]: PieceDescrValueType }
export const PieceDescr: PieceDescrType = Object.keys(T).filter(x => x !== 'TEXTO').reduce((acc, cur, idx) => {
    acc[cur] = { id: idx + 1, name: cur, descr: maiusculasEMinusculas(T[cur]), sort: idx + 1 }
    return acc
}, {} as PieceDescrType)


export const selecionarPecasPorPadrao = (pecas: PecaType[], padroes: MatchOperator[][]) => {
    let ps: Documento[] = pecas.map(p => ({ id: p.id, tipo: p.descr as T, numeroDoEvento: p.numeroDoEvento, descricaoDoEvento: p.descricaoDoEvento }))

    // Cria um índice de peças por id
    const indexById = {}
    for (let i = 0; i < ps.length; i++) {
        indexById[ps[i].id] = i
    }

    // Cria um índice de matches possíveis
    const matches: MatchResult[] = []
    for (const padrao of padroes) {
        const m = match(ps, padrao)
        if (m !== null && m.length > 0) {
            matches.push(m)
            break
        }
    }
    if (matches.length === 0) return null

    // Seleciona o match cuja última peça em uma operação de EXACT ou OR é a mais recente
    let matchSelecionado: MatchResult | null = null
    let idxUltimaPecaRelevanteDoMatchSelecionado = -1
    for (const m of matches) {
        // Encontra a última operação do tipo EXACT ou OR com peças capturadas
        let idx = m.length - 1
        while (idx >= 0 && !((m[idx].operator.type === 'ANY' || m[idx].operator.type === 'SOME') && m[idx].captured.length)) idx--
        if (idx < 0) continue

        // Encontra a última peça capturada
        const ultimaPecaRelevante = m[idx].captured[m[idx].captured.length - 1]
        const idxUltimaPecaRelevante = indexById[ultimaPecaRelevante.id]
        if (idxUltimaPecaRelevante > idxUltimaPecaRelevanteDoMatchSelecionado) {
            matchSelecionado = m
            idxUltimaPecaRelevanteDoMatchSelecionado = idxUltimaPecaRelevante
        }
    }

    // Se não encontrou, seleciona o match cuja última peça é a mais recente
    if (matchSelecionado === null) {
        for (const m of matches) {
            // Encontra a última operação do tipo EXACT ou OR
            let idx = m.length - 1
            while (idx >= 0 && m[idx].captured.length === 0) idx--
            if (idx < 0) continue

            // Encontra a última peça capturada
            const ultimaPecaRelevante = m[idx].captured[m[idx].captured.length - 1]
            const idxUltimaPecaRelevante = indexById[ultimaPecaRelevante.id]
            if (idxUltimaPecaRelevante > idxUltimaPecaRelevanteDoMatchSelecionado) {
                matchSelecionado = m
                idxUltimaPecaRelevanteDoMatchSelecionado = idxUltimaPecaRelevante
            }
        }
    }

    if (matchSelecionado === null) return null

    // Flattern the match and map back to PecaType
    const pecasSelecionadas = matchSelecionado.map(m => m.captured).flat().map(d => pecas[indexById[d.id]])

    if (pecasSelecionadas.length === 0) return null

    return acrescentarAnexosDoPJe(pecas, pecasSelecionadas, indexById)
}

const isPJeOriginId = (idOriginal: string | undefined | null): boolean => {
    if (!idOriginal) {
        return true; // No idOriginal, assume not PJe for this rule.
    }
    if (!/^\d+$/.test(idOriginal)) {
        return true; // Not a string of digits, assume not PJe.
    }
    // It's a string of digits. If its length is less than typical PJe ID length, assume not PJe.
    return idOriginal.length < PJE_ID_MAX_LENGTH
}

// Incluir a peça seguinte para resolver um problema que afeta o PJe. O critério deve ser o seguinte:
// A peça deve ser do tipo HTML
// Deve haver um PDF logo em seguida, e no mesmo evento
// O idOriginal da peça não deve ser um número muito grande (não é uma peça do PJe)
const acrescentarAnexosDoPJe = (pecas: PecaType[], pecasSelecionadas: PecaType[], indexById: any) => {
    console.log('acrescentarAnexosDoPJe', pecasSelecionadas.map(p => p.id))
    // Use a Set to keep track of IDs in pecasSelecionadas for efficient lookup and to manage additions.
    const allSelectedPecaIds = new Set(pecasSelecionadas.map(p => p.id))
    const newlyAddedPecas: PecaType[] = []

    // Iterate through the original `pecas` array to find pairs of (selected HTML, next PDF)
    for (let i = 0; i < pecas.length - 2; i++) {
        const currentPeca = pecas[i]
        const nextPeca = pecas[i + 1]

        // Check if currentPeca is one of the selected pieces (either original or newly added)
        if (allSelectedPecaIds.has(currentPeca.id)) {
            // Condition 1: The selected piece is HTML
            if (currentPeca.tipoDoConteudo === 'text/html') {
                // Condition 2: The idOriginal of the HTML piece indicates it's not from PJe
                if (isPJeOriginId(currentPeca.idOrigem)) {
                    // Condition 3: The next piece is a PDF
                    // Condition 4: The next piece is in the same event
                    if (nextPeca.tipoDoConteudo === 'application/pdf' &&
                        nextPeca.numeroDoEvento === currentPeca.numeroDoEvento) {
                        // Condition 5: The next piece is not already in the selected set
                        if (!allSelectedPecaIds.has(nextPeca.id)) {
                            newlyAddedPecas.push(nextPeca);
                        }
                    }
                }
            }
        }
    }

    if (newlyAddedPecas.length > 0) {
        // Add the newly identified pieces to the original list
        pecasSelecionadas = [...pecasSelecionadas, ...newlyAddedPecas]

        // Sort the combined list based on their original order in the `pecas` array
        // using the precomputed indexById map.
        pecasSelecionadas.sort((a, b) => {
            const indexA = indexById[a.id]
            const indexB = indexById[b.id]

            // This check is defensive; IDs should always be in indexById if from `pecas`.
            if (indexA === undefined && indexB === undefined) return 0
            if (indexA === undefined) return 1 // Put undefined ones at the end
            if (indexB === undefined) return -1 // Put undefined ones at the end

            return indexA - indexB;
        })
    }

    return pecasSelecionadas
}

const PJE_ID_MAX_LENGTH = 12 // Typical PJe IDs are 19 digits. Shorter or non-numeric are considered "not PJe".

