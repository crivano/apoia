import { ANY, EXACT, MatchOperator, OR } from "./pattern"
import { StatusDeLancamento } from "./process-types"

// Enum com os tipos de peças
export enum T {
    TEXTO = 'TEXTO',
    PETICAO_INICIAL = 'PETIÇÃO INICIAL',
    EMENDA_DA_INICIAL = 'EMENDA DA INICIAL',
    CONTESTACAO = 'CONTESTAÇÃO',
    INFORMACAO_EM_MANDADO_DE_SEGURANCA = 'INFORMAÇÃO EM MANDADO DE SEGURANÇA',
    LAUDO = 'LAUDO',
    DESPACHO_DECISAO = 'DESPACHO/DECISÃO',
    SENTENCA = 'SENTENÇA',
    EMBARGOS_DE_DECLARACAO = 'EMBARGOS DE DECLARAÇÃO',
    APELACAO = 'APELAÇÃO',
    CONTRARRAZOES_AO_RECURSO_DE_APELACAO = 'CONTRARRAZÕES AO RECURSO DE APELAÇÃO',
    RECURSO = 'RECURSO',
    RECURSO_INOMINADO = 'RECURSO INOMINADO',
    CONTRARRAZOES = 'CONTRARRAZÕES',
    RELATORIO = 'RELATÓRIO',
    EXTRATO_DE_ATA = 'EXTRATO DE ATA',
    VOTO = 'VOTO',
    ACORDAO = 'ACÓRDÃO',
    FORMULARIO = 'FORMULÁRIO',
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

const padroesBasicos = [
    [ANY(), EXACT(T.SENTENCA), ANY(), OR(T.APELACAO, T.RECURSO, T.RECURSO_INOMINADO), ANY({ capture: [T.CONTRARRAZOES, T.CONTRARRAZOES_AO_RECURSO_DE_APELACAO] }), OR(T.CONTRARRAZOES, T.CONTRARRAZOES_AO_RECURSO_DE_APELACAO), ANY()],
    [ANY(), EXACT(T.SENTENCA), ANY(), OR(T.APELACAO, T.RECURSO, T.RECURSO_INOMINADO), ANY()],
    [ANY(), EXACT(T.PETICAO_INICIAL), ANY({ capture: [T.EMENDA_DA_INICIAL, T.CONTESTACAO, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA, T.LAUDO] }), OR(T.CONTESTACAO, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA), ANY(), EXACT(T.SENTENCA), ANY()],
    [ANY(), EXACT(T.PETICAO_INICIAL), ANY({ capture: [T.EMENDA_DA_INICIAL, T.CONTESTACAO, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA, T.LAUDO] }), OR(T.CONTESTACAO, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA), ANY()],
    [ANY(), EXACT(T.PETICAO_INICIAL), ANY({ capture: [T.EMENDA_DA_INICIAL, T.CONTESTACAO, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA, T.LAUDO, T.CONTESTACAO, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA] })],
    [ANY(), EXACT(T.PETICAO_INICIAL), ANY()]
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
    CHAT: {
        status: StatusDeLancamento.PUBLICO,
        sort: 6,
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
        sort: 7,
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
        sort: 8,
        nome: 'Relatório Completo Criminal',
        padroes: [
            [ANY({ capture: [] })],
        ],
        produtos: [P.RELATORIO_COMPLETO_CRIMINAL, P.CHAT]
    },

    MINUTA_DE_DESPACHO_DE_ACORDO_9_DIAS: {
        status: StatusDeLancamento.EM_DESENVOLVIMENTO,
        sort: 9,
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

