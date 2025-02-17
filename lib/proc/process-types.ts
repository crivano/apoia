import { EnumOfObjectsValueType } from "../ai/model-types"
import { IADocument } from "../db/mysql-types"
import { slugify } from "../utils/utils"
import { P, ProdutoCompleto, TipoDeSinteseEnum } from "./combinacoes"

export type PecaConteudoType = {
    conteudo: string
    errorMsg?: string
}

export type PecaType = {
    id: string
    numeroDoEvento: string
    descricaoDoEvento: string
    descr: string
    tipoDoConteudo: string
    sigilo: string
    pConteudo: Promise<PecaConteudoType> | undefined
    conteudo: string | undefined
    pDocumento: Promise<IADocument> | undefined
    documento: IADocument | undefined
    // pCategoria: Promise<string> | undefined
    categoria: string | undefined
    rotulo: string | undefined
    dataHora: Date | undefined
}

export type DadosDoProcessoType = {
    pecas: PecaType[]
    pecasSelecionadas?: PecaType[]
    sigilo?: number
    tipoDeSintese?: TipoDeSinteseEnum
    produtos?: (P | ProdutoCompleto)[]
    ajuizamento?: Date
    codigoDaClasse?: number
    classe?: string
    numeroDoProcesso?: string
    nomeOrgaoJulgador?: string
    errorMsg?: string
}

export enum StatusDeLancamento {
    PUBLICO,
    EM_DESENVOLVIMENTO
}


const ScopeArray = [
    { id: 1, name: 'JUSTICA_FEDERAL', descr: 'Federal', acronym: 'JF' },
    { id: 2, name: 'JUSTICA_ESTADUAL', descr: 'Estadual' , acronym: 'JE'},
    { id: 3, name: 'JUSTICA_TRABALHISTA', descr: 'Trabalhista', acronym: 'JT' },
]
export type ScopeValueType = EnumOfObjectsValueType & { descr: string, acronym: string }
export type ScopeType = { [key: string]: ScopeValueType }
export const Scope: ScopeType = ScopeArray.reduce((acc, cur, idx) => {
    acc[slugify(cur.name).replaceAll('-', '_').toUpperCase()] = { ...cur, sort: idx + 1 }
    return acc
}, {} as ScopeType)


const InstanceArray = [
    { id: 1, name: 'PRIMEIRA_INSTANCIA', descr: 'Primeira', acronym: '1ª' },
    { id: 2, name: 'SEGUNDA_INSTANCIA', descr: 'Segunda', acronym: '2ª' },
    { id: 3, name: 'TERCEIRA_INSTANCIA', descr: 'Terceira', acronym: '3ª' },
]
export type InstanceValueType = EnumOfObjectsValueType & { descr: string, acronym: string }
export type InstanceType = { [key: string]: InstanceValueType }
export const Instance: InstanceType = InstanceArray.reduce((acc, cur, idx) => {
    acc[slugify(cur.name).replaceAll('-', '_').toUpperCase()] = { ...cur, sort: idx + 1 }
    return acc
}, {} as InstanceType)


const MatterArray = [
    { id: 1, name: 'CIVEL', descr: 'Cível', acronym: 'Cív' },
    { id: 2, name: 'CRIMINAL', descr: 'Criminal', acronym: 'Cri' },
    { id: 3, name: 'TRABALHISTA', descr: 'Trabalhista', acronym: 'Trab' },
]
export type MatterValueType = EnumOfObjectsValueType & { descr: string, acronym: string }
export type MatterType = { [key: string]: MatterValueType }
export const Matter: MatterType = MatterArray.reduce((acc, cur, idx) => {
    acc[slugify(cur.name).replaceAll('-', '_').toUpperCase()] = { ...cur, sort: idx + 1 }
    return acc
}, {} as MatterType)


const TargetArray = [
    { id: 1, name: 'PROCESSO', descr: 'Peças de Processo' },
    { id: 2, name: 'TEXTO', descr: 'Editor de Texto' },
    { id: 3, name: 'REFINAMENTO', descr: 'Refinamento de Texto' },
]
export type TargetValueType = EnumOfObjectsValueType & { descr: string }

const targetKeys = TargetArray.map(i => i.name)
type TargetKeys = typeof targetKeys[number]
export type TargetType = { [key: TargetKeys]: TargetValueType }
export const Target: TargetType = TargetArray.reduce((acc, cur, idx) => {
    acc[slugify(cur.name).replaceAll('-', '_').toUpperCase()] = { ...cur, sort: idx + 1 }
    return acc
}, {} as TargetType)



