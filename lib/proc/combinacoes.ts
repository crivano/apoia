import { ANY, EXACT, MatchOperator, OR } from "./pattern"

// Enum com os tipos de peças
export enum T {
    TEXTO = 'TEXTO',
    PETICAO_INICIAL = 'PETIÇÃO INICIAL',
    EMENDA_DA_INICIAL = 'EMENDA DA INICIAL',
    CONTESTACAO = 'CONTESTAÇÃO',
    INFORMACAO_EM_MANDADO_DE_SEGURANCA = 'INFORMAÇÃO EM MANDADO DE SEGURANÇA',
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
    sort: number
}

// "inicial contestação sentença, embargos de declaração, sentença, apelação, contrarrazoes de apelação"
// "agravo, contrarrazoes de agravo"
export const TipoDeSinteseMap: Record<string, TipoDeSinteseType> = {
    RESUMOS_TRIAGEM: {
        sort: 1,
        nome: 'Resumos e triagem',
        padroes: [
            [ANY(), EXACT(T.SENTENCA), ANY(), EXACT(T.RECURSO), ANY(), OR(T.CONTRARRAZOES), ANY()],
            [ANY(), EXACT(T.SENTENCA), ANY(), EXACT(T.APELACAO), ANY({ capture: [T.CONTRARRAZOES, T.CONTRARRAZOES_AO_RECURSO_DE_APELACAO] }), OR(T.CONTRARRAZOES, T.CONTRARRAZOES_AO_RECURSO_DE_APELACAO), ANY()],
            [ANY(), EXACT(T.SENTENCA), ANY(), OR(T.APELACAO, T.RECURSO, T.RECURSO_INOMINADO), ANY()],
            [ANY(), EXACT(T.PETICAO_INICIAL), ANY({ capture: [T.CONTESTACAO, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA] }), OR(T.CONTESTACAO, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA), ANY(), EXACT(T.SENTENCA), ANY()],
            [ANY(), EXACT(T.PETICAO_INICIAL), ANY({ capture: [T.CONTESTACAO, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA] }), OR(T.CONTESTACAO, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA), ANY()]
        ],
        produtos: [P.RESUMOS, P.RESUMO]
    },
    RESUMOS_ANALISE: {
        sort: 2,
        nome: 'Resumos e análise',
        padroes: [
            [ANY(), EXACT(T.SENTENCA), ANY(), EXACT(T.RECURSO), ANY(), OR(T.CONTRARRAZOES), ANY()],
            [ANY(), EXACT(T.SENTENCA), ANY(), EXACT(T.APELACAO), ANY({ capture: [T.CONTRARRAZOES, T.CONTRARRAZOES_AO_RECURSO_DE_APELACAO] }), OR(T.CONTRARRAZOES, T.CONTRARRAZOES_AO_RECURSO_DE_APELACAO), ANY()],
            [ANY(), EXACT(T.SENTENCA), ANY(), OR(T.APELACAO, T.RECURSO, T.RECURSO_INOMINADO), ANY()],
            [ANY(), EXACT(T.PETICAO_INICIAL), ANY({ capture: [T.CONTESTACAO, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA] }), OR(T.CONTESTACAO, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA), ANY(), EXACT(T.SENTENCA), ANY()],
            [ANY(), EXACT(T.PETICAO_INICIAL), ANY({ capture: [T.CONTESTACAO, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA] }), OR(T.CONTESTACAO, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA), ANY()]
        ],
        produtos: [P.RESUMOS, P.ANALISE]
    },
    RESUMOS: {
        sort: 3,
        nome: 'Resumos das principais peças',
        padroes: [
            [ANY(), EXACT(T.SENTENCA), ANY(), EXACT(T.RECURSO), ANY(), OR(T.CONTRARRAZOES), ANY()],
            [ANY(), EXACT(T.SENTENCA), ANY(), EXACT(T.APELACAO), ANY(), OR(T.CONTRARRAZOES, T.CONTRARRAZOES_AO_RECURSO_DE_APELACAO), ANY()],
            [ANY(), EXACT(T.SENTENCA), ANY(), OR(T.APELACAO, T.RECURSO, T.RECURSO_INOMINADO), ANY()],
            [ANY(), EXACT(T.PETICAO_INICIAL), ANY({ capture: [T.CONTESTACAO, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA] }), OR(T.CONTESTACAO, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA), ANY()],
            [ANY(), EXACT(T.PETICAO_INICIAL), ANY({ capture: [T.CONTESTACAO, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA] }), ANY()]
        ],
        // tipos: [
        //     [T.PETICAO_INICIAL],
        // ],
        produtos: [P.RESUMOS]
    },
    PEDIDOS: {
        sort: 4,
        nome: 'Pedidos',
        padroes: [
            [ANY(), EXACT(T.PETICAO_INICIAL), ANY()],
        ],
        produtos: [P.RESUMOS, P.PEDIDOS]
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
    produtos: InfoDeProduto[]
}

export interface InfoDeProduto {
    produto: P,
    dados: T[],
    titulo: string,
    prompt: string,
    plugins: Plugin[]
}

