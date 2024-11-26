'use server'

import { pdfToText } from '../pdf/pdf'
import { html2md } from '../utils/html2md'
import { T, CombinacoesValidas, CombinacaoValida, P, infoDeProduto } from './combinacoes'
import { parseYYYYMMDDHHMMSS, formatBrazilianDateTime, addBlockQuote } from '../utils/utils'
import { decrypt } from '../utils/crypt'
import { Dao } from '../db/mysql'
import { IADocument } from '../db/mysql-types'
import { inferirCategoriaDaPeca } from '../category'
import { obterConteudoDaPeca, obterDocumentoGravado } from './piece'
import { faObjectUngroup } from '@fortawesome/free-solid-svg-icons'
import { assertNivelDeSigilo, verificarNivelDeSigilo } from './sigilo'
import { getInterop } from '../interop/interop'

export type PecaType = {
    id: string
    numeroDoEvento: string
    descr: string
    tipoDoConteudo: string
    sigilo: string
    pConteudo: Promise<string> | undefined
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
    sigilo?: number
    combinacao?: CombinacaoValida
    ajuizamento?: Date
    codigoDaClasse?: number
    numeroDoProcesso?: string
    nomeOrgaoJulgador?: string
    errorMsg?: string
}

const selecionarPecas = (pecas: PecaType[], descricoes: string[]) => {
    const pecasRelevantes = pecas.filter(p => descricoes.includes(p.descr))

    // Seleciona as peças de acordo com o tipo de peça, pegando sempre a primeira peça de cada tipo
    let pecasSelecionadas: PecaType[] = []
    let idxDescricao = 0

    for (const peca of pecasRelevantes) {
        if (peca.descr === descricoes[idxDescricao]) {
            pecasSelecionadas = [...pecasSelecionadas, peca]
            idxDescricao++
            if (idxDescricao >= descricoes.length) break
        }
    }
    if (pecasSelecionadas.length !== descricoes.length)
        return null
    return pecasSelecionadas
}

const selecionarUltimasPecas = (pecas: PecaType[], descricoes: string[]) => {
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

const iniciarObtencaoDeConteudo = async (dossier_id: number, numeroDoProcesso: string, pecas: PecaType[], username: string, password: string, synchronous?: boolean) => {
    for (const peca of pecas) {
        if (peca.conteudo) continue
        // console.log('obtendo conteúdo de peça', peca.numeroDoEvento, peca.id, peca.descr)
        peca.pConteudo = obterConteudoDaPeca(dossier_id, numeroDoProcesso, peca.id, peca.descr, peca.sigilo, username, password)
        if (synchronous)
            await peca.pConteudo
    }
    return pecas
}

const iniciarObtencaoDeDocumentoGravado = (dossier_id: number, numeroDoProcesso: string, pecas: PecaType[], username: string, password: string) => {
    for (const peca of pecas) {
        peca.pDocumento = obterDocumentoGravado(dossier_id, numeroDoProcesso, peca.id, peca.descr, username, password)
    }
    return pecas
}

export const obterDadosDoProcesso = async (numeroDoProcesso: string, pUser: Promise<any>, idDaPeca?: string, identificarPecas?: boolean, completo?: boolean): Promise<DadosDoProcessoType> => {
    let pecas: PecaType[] = []
    let errorMsg = undefined
    try {
        const user = await pUser
        const username = user?.email
        const password = decrypt(user?.image.password)

        const dadosDoProcesso = await getInterop(username, password).consultarProcesso(numeroDoProcesso)
        pecas = [...dadosDoProcesso.pecas]

        // for (const peca of pecas) {
        //     console.log('peca', peca.id, peca.numeroDoEvento, peca.descr, peca.rotulo)
        // }

        // grava os dados do processo no banco
        const system_id = await Dao.assertSystemId(user.image.system)
        const dossier_id = await Dao.assertIADossierId(numeroDoProcesso, system_id, dadosDoProcesso.codigoDaClasse, dadosDoProcesso.ajuizamento)

        if (completo) {
            for (const peca of pecas)
                if (peca.sigilo && peca.sigilo !== '0') {
                    console.log('removendo conteúdo de peca com sigilo', peca.id, peca.sigilo)
                    peca.conteudo = 'Peça sigilosa, conteúdo não acessado.'
                }
            const pecasComConteudo = await iniciarObtencaoDeConteudo(dossier_id, numeroDoProcesso, pecas, username, password)
            return { ...dadosDoProcesso, pecas: pecasComConteudo, combinacao: { tipos: [], produtos: [infoDeProduto(P.ANALISE_COMPLETA)] } }
        }

        if (idDaPeca) {
            pecas = pecas.filter(p => p.id === idDaPeca)
            if (pecas.length === 0)
                throw new Error(`Peça ${idDaPeca} não encontrada`)
            const pecasComConteudo = await iniciarObtencaoDeConteudo(dossier_id, numeroDoProcesso, pecas, username, password)
            return { ...dadosDoProcesso, pecas: pecasComConteudo }
        }

        // Localiza pecas with descricao == 'OUTROS' e busca no banco de dados se já foram inferidas por IA
        const pecasOutros = pecas.filter(p => p.descr === 'OUTROS')
        if (pecasOutros.length > 0) {
            if (await Dao.verifyIfDossierHasDocumentsWithPredictedCategories(numeroDoProcesso)) {
                console.log(`Carregando tipos documentais de ${pecasOutros.length} peças marcadas com "OUTROS"`)
                const pecasComDocumento = iniciarObtencaoDeDocumentoGravado(dossier_id, numeroDoProcesso, pecasOutros, username, password)
                for (const peca of pecasComDocumento) {
                    if (peca.pDocumento) {
                        peca.documento = await peca.pDocumento
                        // console.log('peca recuperada', peca.id, peca.documento.id)
                        if (peca.documento.predicted_category && peca.documento.predicted_category !== '') {
                            peca.descr = peca.documento.predicted_category
                        }
                    }
                }
            }
        }

        if (identificarPecas === true) {

            // Localiza pecas with descricao == 'OUTROS' e usa IA para determinar quais são os tipos destas peças
            const pecasOutros2 = pecas.filter(p => p.descr === 'OUTROS')
            if (pecasOutros2.length > 0) {
                console.log(`Identificando tipos documentais de ${pecasOutros2.length} peças marcadas com "OUTROS"`)
                const pecasComConteudo = await iniciarObtencaoDeConteudo(dossier_id, numeroDoProcesso, pecasOutros2, username, password, true)
                for (const peca of pecasComConteudo) {
                    if (peca.pConteudo) {
                        const conteudo = await peca.pConteudo

                        // Localiza a categoria das peças anteriores a esta peça
                        const anteriores: string[] = []
                        for (const pecaAnterior of pecas) {
                            if (pecaAnterior.id === peca.id) break
                            anteriores.push(pecaAnterior.descr)
                        }

                        const categoria = await inferirCategoriaDaPeca(dossier_id, peca.documento?.id, conteudo, anteriores)
                        if (categoria) {
                            // console.log(peca.id, peca.documento)
                            if (!peca.documento)
                                throw new Error(`Documento ${peca.id} do processo ${numeroDoProcesso} não encontrado`)
                            console.log(`Peça ${peca.id} do processo ${numeroDoProcesso}, originalmente categorizada como ${peca.descr}, identificada como ${categoria}`)
                            if (peca.descr !== 'OUTROS')
                                throw new Error(`Peça ${peca.id} do processo ${numeroDoProcesso} não é do tipo 'OUTROS'`)
                            await Dao.updateDocumentCategory(peca.documento.id, peca.descr, categoria)
                            peca.descr = categoria
                        }
                    }
                }
            }
            console.log('Identificação concluída')
        }

        for (const comb of CombinacoesValidas) {
            const pecasSelecionadas = selecionarPecas(pecas, comb.tipos)
            if (pecasSelecionadas !== null) {
                if (verificarNivelDeSigilo())
                    for (const peca of pecasSelecionadas)
                        assertNivelDeSigilo(peca.sigilo, `${peca.descr} (${peca.id})`)

                const pecasComConteudo = await iniciarObtencaoDeConteudo(dossier_id, numeroDoProcesso, pecasSelecionadas, username, password)
                return { ...dadosDoProcesso, pecas: pecasComConteudo, combinacao: comb }
            }
        }
        return { ...dadosDoProcesso, pecas: [] as PecaType[] }
    } catch (error) {
        if (error?.message === 'NEXT_REDIRECT') throw error
        errorMsg = error.message
        return { pecas, errorMsg }
    }
}

