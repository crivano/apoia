import _prompts from "@/lib/ai/prompts"
import { maiusculasEMinusculas, slugify } from "../utils/utils"

// Enum com os tipos de peças
export enum T {
    TEXTO = 'TEXTO',
    PETICAO_INICIAL = 'PETIÇÃO INICIAL',
    CONTESTACAO = 'CONTESTAÇÃO',
    INFORMACAO_EM_MANDADO_DE_SEGURANCA = 'INFORMAÇÃO EM MANDADO DE SEGURANÇA',
    SENTENCA = 'SENTENÇA',
    APELACAO = 'APELAÇÃO',
    RECURSO_INOMINADO = 'RECURSO INOMINADO',
    CONTRARRAZOES = 'CONTRARRAZÕES',
    RELATORIO = 'RELATÓRIO',
    EXTRATO_DE_ATA = 'EXTRATO DE ATA',
    VOTO = 'VOTO',
    ACORDAO = 'ACÓRDÃO',
}

export const Categorias = {
    TEXTO: { descr: 'TEXTO' },
    PETICAO_INICIAL: { descr: 'PETIÇÃO INICIAL' },
    CONTESTACAO: { descr: 'CONTESTAÇÃO' },
    INFORMACAO_EM_MANDADO_DE_SEGURANCA: { descr: 'INFORMAÇÃO EM MANDADO DE SEGURANÇA' },
    SENTENCA: { descr: 'SENTENÇA' },
    APELACAO: { descr: 'APELAÇÃO' },
    RECURSO_INOMINADO: { descr: 'RECURSO INOMINADO' },
    CONTRARRAZOES: { descr: 'CONTRARRAZÕES' },
    RELATORIO: { descr: 'RELATÓRIO' },
    EXTRATO_DE_ATA: { descr: 'EXTRATO DE ATA' },
    VOTO: { descr: 'VOTO' },
    ACORDAO: { descr: 'ACÓRDÃO' },
}

export const findCategoria = (descr: string) => {
    for (const [key, value] of Object.entries(Categorias)) {
        if (value.descr === descr) return key
    }
    return null
}

export enum P {
    RESUMOS = 'Resumos',
    RESUMO_PECA = 'Resumo de Peça',
    ANALISE = 'Análise',
    ANALISE_TR = 'Análise para Turma Recursal',
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
}

export interface ProdutoValido { titulo: string, prompt: string, plugins: Plugin[] }

export const ProdutosValidos = {
    [P.RESUMO_PECA]: { titulo: P.RESUMO_PECA, prompt: 'resumo_peca', plugins: [] },
    [P.RESUMOS]: { titulo: P.RESUMOS, prompt: 'resumos', plugins: [] },
    [P.ANALISE_TR]: { titulo: P.ANALISE_TR, prompt: 'analise-tr', plugins: [Plugin.TRIAGEM, Plugin.NORMAS, Plugin.PALAVRAS_CHAVE] },
    [P.ANALISE]: { titulo: P.ANALISE, prompt: 'analise', plugins: [] },
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

export interface TCombinacaoValida {
    tipos: T[],
    produtos: (P | ProdutoCompleto)[]
}

export const TCombinacoesValidas: TCombinacaoValida[] = [
    { tipos: [T.EXTRATO_DE_ATA, T.RELATORIO, T.VOTO], produtos: [P.RESUMOS, PC(P.ACORDAO, [T.EXTRATO_DE_ATA, T.VOTO])] },
    // { tipos: [T.RELATORIO, T.VOTO], produtos: [P.RESUMOS, PC(P.REVISAO, T.VOTO), PC(P.REFINAMENTO, T.VOTO), PC(P.ACORDAO, T.VOTO)] },
    { tipos: [T.SENTENCA, T.APELACAO, T.CONTRARRAZOES], produtos: [P.RESUMOS, P.RESUMO] },
    { tipos: [T.SENTENCA, T.RECURSO_INOMINADO], produtos: [P.RESUMOS, P.RESUMO] },
    // { tipos: [T.SENTENCA, T.APELACAO, T.CONTRARRAZOES], produtos: [P.RELATORIO] },
    { tipos: [T.PETICAO_INICIAL, T.CONTESTACAO], produtos: [P.RESUMOS, P.ANALISE] },
    { tipos: [T.PETICAO_INICIAL, T.INFORMACAO_EM_MANDADO_DE_SEGURANCA], produtos: [P.RESUMOS, P.RESUMO] },
    { tipos: [T.PETICAO_INICIAL], produtos: [P.RESUMOS] },
]

export interface CombinacaoValida {
    tipos: T[],
    produtos: InfoDeProduto[]
}

export interface InfoDeProduto {
    produto: P,
    dados: T[],
    titulo: string,
    prompt: string,
    plugins: Plugin[]
}

export const infoDeProduto = (produto: P | ProdutoCompleto): InfoDeProduto => {
    let ip: InfoDeProduto
    if (typeof produto === 'object') {
        const complex = produto as any as ProdutoCompleto
        const tipos = Array.isArray(complex.dados) ? complex.dados : [complex.dados]
        ip = { produto: produto.produto, dados: tipos, ...ProdutosValidos[produto.produto] }
    } else
        ip = { produto, dados: [], ...ProdutosValidos[produto] }

    // Caso o produto seja um resumo de peça, vamos tentar localizar o melhor prompt e trocar o título
    if (ip.produto === P.RESUMO_PECA) {
        ip.titulo = maiusculasEMinusculas(ip.dados[0])
        const prompt = `resumo-${slugify(ip.dados[0])}`
        const promptUnderscore = prompt.replace(/-/g, '_')
        let buildPrompt = _prompts[promptUnderscore]
        if (buildPrompt) {
            ip.prompt = prompt
        }
    }
    return ip
}

export const CombinacoesValidas: CombinacaoValida[] = TCombinacoesValidas.map(tc => ({
    tipos: tc.tipos, produtos: tc.produtos.map(p => infoDeProduto(p))
}))
