'use server'

import { pdfToText } from '../pdf/pdf'
import { html2md } from '../utils/html2md'
import { T, CombinacoesValidas, CombinacaoValida } from './combinacoes'
import { parseYYYYMMDDHHMMSS, formatBrazilianDateTime, addBlockQuote } from '../utils/utils'
import { decrypt } from '../utils/crypt'
import { Dao } from '../db/mysql'
import { IADocument } from '../db/mysql-types'
import { inferirCategoriaDaPeca } from '../category'
import { consultarProcesso } from '../mni'
import { obterConteudoDaPeca, obterDocumentoGravado } from './piece'

export type PecaType = {
    id: string
    numeroDoEvento: string,
    descr: string
    tipoDoConteudo: string
    sigilo: string,
    pConteudo: Promise<string> | undefined
    pDocumento: Promise<IADocument> | undefined
    documento: IADocument | undefined
    pCategoria: Promise<string> | undefined
}

export type DadosDoProcessoType = {
    pecas: PecaType[]
    combinacao?: CombinacaoValida
    ajuizamento?: Date
    codigoDaClasse?: number
    numeroDoProcesso?: string
    nomeOrgaoJulgador?: string
    errorMsg?: string
}

const selecionarPecas = (pecas: PecaType[], descricoes: string[]) => {
    const pecasRelevantes = pecas.filter(p => descricoes.includes(p.descr))

    // Seleciona as peças de acordo com o tipo de peça, pegando sempre a última peça de cada tipo
    let pecasSelecionadas: PecaType[] = []
    let idxDescricao = descricoes.length - 1

    for (const peca of pecasRelevantes.reverse()) {
        if (peca.descr === descricoes[idxDescricao]) {
            pecasSelecionadas = [peca, ...pecasSelecionadas]
            idxDescricao--
            if (idxDescricao < 0) break
        }
    }
    if (pecasSelecionadas.length !== descricoes.length)
        return null
    return pecasSelecionadas
}

const iniciarObtencaoDeConteudo = (dossier_id: number, numeroDoProcesso: string, pecas: PecaType[], username: string, password: string) => {
    const pecasComConteudo: PecaType[] = []
    for (const peca of pecas) {
        pecasComConteudo.push({
            ...peca,
            pConteudo: obterConteudoDaPeca(dossier_id, numeroDoProcesso, peca.id, peca.descr, username, password)
        })
    }
    return pecasComConteudo
}

const iniciarObtencaoDeDocumentoGravado = (dossier_id: number, numeroDoProcesso: string, pecas: PecaType[], username: string, password: string) => {
    const pecasComConteudo: PecaType[] = []
    for (const peca of pecas) {
        pecasComConteudo.push({
            ...peca,
            pDocumento: obterDocumentoGravado(dossier_id, numeroDoProcesso, peca.id, peca.descr, username, password)
        })
    }
    return pecasComConteudo
}

export const obterDadosDoProcesso = async (numeroDoProcesso: string, pUser: Promise<any>, idDaPeca?: string): Promise<DadosDoProcessoType> => {
    let pecas: PecaType[] = []
    let errorMsg = undefined
    try {
        const user = await pUser
        const username = user?.email
        const password = decrypt(user?.image.password)

        const respQuery = await consultarProcesso(numeroDoProcesso, username, password)
        if (!respQuery[0].sucesso)
            throw new Error(`${respQuery[0].mensagem}`)
        const dadosBasicos = respQuery[0].processo.dadosBasicos
        if (verificarNivelDeSigilo())
            assertNivelDeSigilo(dadosBasicos.sigilo)
        const dataAjuizamento = dadosBasicos.attributes.dataAjuizamento
        // console.log('dadosBasicos', dadosBasicos)
        const nomeOrgaoJulgador = dadosBasicos.orgaoJulgador.attributes.nomeOrgao
        const ajuizamento = parseYYYYMMDDHHMMSS(dataAjuizamento)
        // ajuizamentoDate.setTime(ajuizamentoDate.getTime() - ajuizamentoDate.getTimezoneOffset() * 60 * 1000)
        const codigoDaClasse = parseInt(dadosBasicos.attributes.classeProcessual)

        // grava os dados do processo no banco
        const system_id = await Dao.assertSystemId(null, user.image.system)
        const dossier_id = await Dao.assertIADossierId(null, numeroDoProcesso, system_id, codigoDaClasse, ajuizamento)

        const documentos = respQuery[0].processo.documento
        // console.log('documentos', JSON.stringify(documentos, null, 2))
        for (const doc of documentos) {
            // if (!Object.values(T).includes(doc.attributes.descricao)) continue
            pecas.unshift({
                id: doc.attributes.idDocumento,
                numeroDoEvento: doc.attributes.movimento,
                descr: doc.attributes.descricao,
                tipoDoConteudo: doc.attributes.mimetype,
                sigilo: doc.attributes.nivelSigilo,
                pConteudo: undefined,
                pDocumento: undefined,
                documento: undefined,
                pCategoria: undefined
            })
        }

        pecas.sort((a, b) => {
            let i = a.numeroDoEvento.localeCompare(b.numeroDoEvento)
            if (i !== 0) return i
            return a.descr.localeCompare(b.descr)
        })

        if (idDaPeca) {
            pecas = pecas.filter(p => p.id === idDaPeca)
            if (pecas.length === 0)
                throw new Error(`Peça ${idDaPeca} não encontrada`)
            const pecasComConteudo = iniciarObtencaoDeConteudo(dossier_id, numeroDoProcesso, pecas, username, password)
            return { pecas: pecasComConteudo, ajuizamento, codigoDaClasse, numeroDoProcesso, nomeOrgaoJulgador }
        }

        if (process.env.OTHER_PIECES_IDENTIFICATION === 'true') {
            // Localiza pecas with descricao == 'OUTROS' e busca no banco de dados se já foram inferidas por IA
            const pecasOutros = pecas.filter(p => p.descr === 'OUTROS')
            if (pecasOutros.length > 0) {
                console.log('pecasOutros', pecasOutros.length)
                const pecasComDocumento = iniciarObtencaoDeDocumentoGravado(dossier_id, numeroDoProcesso, pecasOutros, username, password)
                for (const peca of pecasComDocumento) {
                    if (peca.pDocumento) {
                        peca.documento = await peca.pDocumento
                        if (peca.documento.predicted_category && peca.documento.predicted_category !== '') {
                            peca.descr = peca.documento.predicted_category
                        }
                    }
                }
            }
            console.log('pecasOutros-fim')

            // Localiza pecas with descricao == 'OUTROS' e usa IA para determinar quais são os tipos destas peças
            const pecasOutros2 = pecas.filter(p => p.descr === 'OUTROS')
            if (pecasOutros2.length > 0) {
                console.log('pecasOutros2', pecasOutros2.length)
                const pecasComConteudo = iniciarObtencaoDeConteudo(dossier_id, numeroDoProcesso, pecasOutros2, username, password)
                for (const peca of pecasComConteudo) {
                    if (peca.pConteudo) {
                        const conteudo = await peca.pConteudo
                        peca.pCategoria = inferirCategoriaDaPeca(dossier_id, peca.documento?.id, conteudo)
                    }
                }
                for (const peca of pecasComConteudo) {
                    if (peca.pCategoria) {
                        const categoria = await peca.pCategoria
                        if (categoria) peca.descr = categoria
                    }
                }
            }
            console.log('pecasOutros2-fim')
        }

        for (const comb of CombinacoesValidas) {
            const pecasSelecionadas = selecionarPecas(pecas, comb.tipos)
            if (pecasSelecionadas !== null) {
                if (verificarNivelDeSigilo())
                    for (const peca of pecasSelecionadas)
                        assertNivelDeSigilo(peca.sigilo, `${peca.descr} (${peca.id})`)

                const pecasComConteudo = iniciarObtencaoDeConteudo(dossier_id, numeroDoProcesso, pecasSelecionadas, username, password)
                return { pecas: pecasComConteudo, combinacao: comb, ajuizamento, codigoDaClasse, numeroDoProcesso, nomeOrgaoJulgador }
            }
        }
        return { pecas: [] as PecaType[], ajuizamento, codigoDaClasse, numeroDoProcesso, nomeOrgaoJulgador }
    } catch (error) {
        if (error?.message === 'NEXT_REDIRECT') throw error
        errorMsg = error.message
        return { pecas, errorMsg }
    }
}

// Nível de sigilo a ser aplicado ao processo. Dever-se-á utilizar os seguintes níveis:
// - 0: públicos, acessíveis a todos os servidores do Judiciário e dos demais órgãos públicos de colaboração na administração da Justiça, assim como aos advogados e a qualquer cidadão
// - 1: segredo de justiça, acessíveis aos servidores do Judiciário, aos servidores dos órgãos públicos de colaboração na administração da Justiça e às partes do processo.
// - 2: sigilo mínimo, acessível aos servidores do Judiciário e aos demais órgãos públicos de colaboração na administração da Justiça 
// - 3: sigilo médio, acessível aos servidores do órgão em que tramita o processo, à(s) parte(s) que provocou(ram) o incidente e àqueles que forem expressamente incluídos 
// - 4: sigilo intenso, acessível a classes de servidores qualificados (magistrado, diretor de secretaria/escrivão, oficial de gabinete/assessor) do órgão em que tramita o processo, às partes que provocaram o incidente e àqueles que forem expressamente incluídos 
// - 5: sigilo absoluto, acessível apenas ao magistrado do órgão em que tramita, aos servidores e demais usuários por ele indicado e às partes que provocaram o incidente.
const assertNivelDeSigilo = (nivel, descrDaPeca?) => {
    const nivelMax = parseInt(process.env.CONFIDENTIALITY_LEVEL_MAX as string)
    nivel = parseInt(nivel)
    if (nivel > nivelMax)
        throw new Error(`Nível de sigilo '${nivel}'${descrDaPeca ? ' da peça ' + descrDaPeca : ''} maior que o máximo permitido '${nivelMax}'.`)
}

const verificarNivelDeSigilo = () => {
    return !(process.env.CONFIDENTIALITY_LEVEL_MAX === undefined || process.env.CONFIDENTIALITY_LEVEL_MAX === '')
}

