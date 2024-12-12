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
}

export interface ProdutoCompleto { produto: P, dados: T[] }

export const PC = (p: P, d?: T | T[]): ProdutoCompleto => {
    if (Array.isArray(d)) return { produto: p, dados: d }
    return { produto: p, dados: d ? [d as T] : [] }
}

export type TipoDeSinteseType = {
    nome: string,
    tipos: T[][],
    produtos: P[],
    sort: number
}

// "inicial contestação sentença, embargos de declaração, sentença, apelação, contrarrazoes de apelação"
// "agravo, contrarrazoes de agravo"
export const TipoDeSinteseMap: Record<string, TipoDeSinteseType> = {
    RESUMOS_TRIAGEM: {
        sort: 1,
        nome: 'Resumos e triagem',
        tipos: [
            [T.PETICAO_INICIAL, T.CONTESTACAO, T.SENTENCA, T.RECURSO, T.CONTRARRAZOES],
            [T.PETICAO_INICIAL, T.CONTESTACAO, T.SENTENCA, T.APELACAO, T.CONTRARRAZOES_AO_RECURSO_DE_APELACAO],
            [T.SENTENCA, T.RECURSO, T.CONTRARRAZOES],
            [T.SENTENCA, T.APELACAO, T.CONTRARRAZOES_AO_RECURSO_DE_APELACAO],
            [T.SENTENCA, T.APELACAO, T.CONTRARRAZOES],
            [T.SENTENCA, T.RECURSO],
            [T.SENTENCA, T.APELACAO],
            [T.SENTENCA, T.RECURSO_INOMINADO],
            [T.PETICAO_INICIAL, T.CONTESTACAO],
            [T.PETICAO_INICIAL, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA]
        ],
        produtos: [P.RESUMOS, P.RESUMO]
    },
    RESUMOS_ANALISE: {
        sort: 2,
        nome: 'Resumos e análise',
        tipos: [
            [T.PETICAO_INICIAL, T.CONTESTACAO, T.SENTENCA, T.RECURSO, T.CONTRARRAZOES],
            [T.PETICAO_INICIAL, T.CONTESTACAO, T.SENTENCA, T.APELACAO, T.CONTRARRAZOES_AO_RECURSO_DE_APELACAO],
            [T.SENTENCA, T.RECURSO, T.CONTRARRAZOES],
            [T.SENTENCA, T.APELACAO, T.CONTRARRAZOES_AO_RECURSO_DE_APELACAO],
            [T.SENTENCA, T.APELACAO, T.CONTRARRAZOES],
            [T.SENTENCA, T.RECURSO],
            [T.SENTENCA, T.APELACAO],
            [T.SENTENCA, T.RECURSO_INOMINADO],
            [T.PETICAO_INICIAL, T.CONTESTACAO],
            [T.PETICAO_INICIAL, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA]
        ],
        produtos: [P.RESUMOS, P.ANALISE]
    },
    RESUMOS: {
        sort: 3,
        nome: 'Resumos das principais peças',
        tipos: [
            [T.PETICAO_INICIAL],
        ],
        produtos: [P.RESUMOS]
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
    tipos: T[][],
    produtos: InfoDeProduto[]
}

export interface InfoDeProduto {
    produto: P,
    dados: T[],
    titulo: string,
    prompt: string,
    plugins: Plugin[]
}

