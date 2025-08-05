import { decrypt } from '../utils/crypt'
import { Dao } from '../db/mysql'
import { inferirCategoriaDaPeca } from '../category'
import { obterConteudoDaPeca, obterDocumentoGravado } from './piece'
import { assertNivelDeSigilo, nivelDeSigiloPermitido, verificarNivelDeSigilo } from './sigilo'
import { P, selecionarPecasPorPadrao, T, TipoDeSinteseEnum, TipoDeSinteseMap } from './combinacoes'
import { infoDeProduto, TiposDeSinteseValido } from './info-de-produto'
import { getInterop, Interop } from '../interop/interop'
import { DadosDoProcessoType, PecaType, StatusDeLancamento } from './process-types'
import { UserType } from '../user'

export const TEXTO_PECA_SIGILOSA = 'Peça sigilosa, conteúdo não acessado.'
export const TEXTO_PECA_COM_ERRO = 'Não foi possível obter o conteúdo.'
export const TEXTO_PECA_IMAGEM_JPEG = 'Peça no formato de imagem JPEG, conteúdo não acessado.'
export const TEXTO_PECA_IMAGEM_PNG = 'Peça no formato de imagem PNG, conteúdo não acessado.'
export const TEXTO_PECA_VIDEO_XMS_WMV = 'Peça no formato de vídeo X-MS-WMV, conteúdo não acessado.'
export const TEXTO_PECA_VIDEO_MP4 = 'Peça no formato de vídeo MP4, conteúdo não acessado.'
export const TEXTO_PECA_PDF_OCR_VAZIO = 'Peça no formato PDF, conteúdo não acessado. O OCR não retornou texto.'
export const TEXTO_PECA_PDF_OCR_ERRO = 'Peça no formato PDF, conteúdo não acessado. Ocorreu um erro ao processar o OCR.'
export const REGEX_TIPO_DE_CONTEUDO_NAO_SUPORTADO = /^Peça (.+) \((.+)\) - Tipo de conteúdo não suportado: (.+)$/
export const formatarMensagemDeConteudoNaoSuportado = (idDaPeca: string, descrDaPeca: string, contentType: string) => {
    return `Peça ${idDaPeca} (${descrDaPeca}) - Tipo de conteúdo não suportado: ${contentType}`
}

const selecionarPecas = (pecas: PecaType[], descricoes: string[]) => {
    const pecasRelevantes = pecas.filter(p => descricoes.includes(p.descr))

    // Seleciona as peças de acordo com o tipo de peça, pegando sempre a primeira peça de cada tipo
    let pecasSelecionadas: PecaType[] = []
    let idxDescricao = 0

    for (const peca of pecasRelevantes) {
        if (peca.descr === descricoes[idxDescricao]) {
            pecasSelecionadas.push(peca)
            idxDescricao++
            if (idxDescricao >= descricoes.length) break
        }
    }
    if (pecasSelecionadas.length !== descricoes.length)
        return null
    return pecasSelecionadas
}

export const selecionarUltimasPecas = (pecas: PecaType[], descricoes: string[]) => {
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



const iniciarObtencaoDeConteudo = async (dossier_id: number, numeroDoProcesso: string, pecas: PecaType[], interop: Interop, synchronous?: boolean) => {
    for (const peca of pecas) {
        if (peca.conteudo) continue
        // console.log('obtendo conteúdo de peça', peca.numeroDoEvento, peca.id, peca.descr)
        peca.pConteudo = obterConteudoDaPeca(dossier_id, numeroDoProcesso, peca.id, peca.descr, peca.sigilo, interop)
        if (synchronous)
            await peca.pConteudo
    }
    return pecas
}

const iniciarObtencaoDeDocumentoGravado = (dossier_id: number, numeroDoProcesso: string, pecas: PecaType[]) => {
    for (const peca of pecas) {
        peca.pDocumento = obterDocumentoGravado(dossier_id, numeroDoProcesso, peca.id, peca.descr)
    }
    return pecas
}

export enum CargaDeConteudoEnum {
    SINCRONO = 'SINCRONO',
    ASSINCRONO = 'ASSINCRONO',
    NAO = 'NAO'
}

export type ObterDadosDoProcessoType = {
    numeroDoProcesso: string
    pUser: Promise<any>,
    idDaPeca?: string | string[]
    identificarPecas?: boolean
    completo?: boolean
    kind?: TipoDeSinteseEnum
    pieces?: string[]
    conteudoDasPecasSelecionadas?: CargaDeConteudoEnum
    statusDeSintese?: StatusDeLancamento
}

export const getInteropFromUser = async (user: UserType): Promise<Interop> => {
    const username = user?.email
    const password = user?.image?.password ? decrypt(user?.image.password) : undefined

    const interop = getInterop(username, password)
    await interop.init()
    return interop
}

export const getSystemIdAndDossierId = async (user: UserType, numeroDoProcesso: string): Promise<{ system_id: number, dossier_id: number }> => {
    const system_id = await Dao.assertSystemId(user?.image?.system || 'PDPJ')
    const dossier_id = await Dao.assertIADossierId(numeroDoProcesso, system_id, undefined, undefined)
    return { system_id, dossier_id }
}

export const obterDadosDoProcesso = async ({ numeroDoProcesso, pUser, idDaPeca, identificarPecas, completo, kind, pieces, conteudoDasPecasSelecionadas = CargaDeConteudoEnum.ASSINCRONO, statusDeSintese = StatusDeLancamento.PUBLICO }: ObterDadosDoProcessoType): Promise<DadosDoProcessoType> => {
    let pecas: PecaType[] = []
    let errorMsg = undefined
    try {
        const user = await pUser
        const interop = await getInteropFromUser(user)
        const arrayDadosDoProcesso = await interop.consultarProcesso(numeroDoProcesso)
        let dadosDoProcesso = arrayDadosDoProcesso[arrayDadosDoProcesso.length - 1]

        let apenasPecasEspecificas: string[] = []
        if (typeof idDaPeca === 'string') {
            if (idDaPeca)
                apenasPecasEspecificas = [idDaPeca]
        } else if (Array.isArray(idDaPeca)) {
            if (idDaPeca.length > 0)
                apenasPecasEspecificas = idDaPeca
        }

        // localiza a tramitação que contém a peça solicitada
        if (apenasPecasEspecificas.length > 0) {
            dadosDoProcesso = arrayDadosDoProcesso.find(d => d.pecas.map(p => p.id).includes(apenasPecasEspecificas[0]))
            if (!dadosDoProcesso) throw new Error(`Peças específicas ${apenasPecasEspecificas.join(', ')} não encontradas no processo ${numeroDoProcesso}`)
        }

        pecas = [...dadosDoProcesso.pecas]

        // for (const peca of pecas) {
        //     console.log('peca', peca.id, peca.numeroDoEvento, peca.descr, peca.rotulo)
        // }

        // grava os dados do processo no banco
        const { system_id, dossier_id } = await getSystemIdAndDossierId(user, numeroDoProcesso)

        // Se for especificado o id da peça, filtra as peças
        if (apenasPecasEspecificas.length > 0) {
            const pecasFiltradas = pecas.filter(p => apenasPecasEspecificas.includes(p.id))
            const idsEncontrados = new Set(pecasFiltradas.map(p => p.id))
            const idsNaoEncontrados = apenasPecasEspecificas.filter(id => !idsEncontrados.has(id))
            if (idsNaoEncontrados.length > 0) {
                throw new Error(`Peça(s) com id ${idsNaoEncontrados.join(', ')} não encontrada(s) no processo ${numeroDoProcesso}`)
            }
            pecas = pecasFiltradas
            const pecasComConteudo = conteudoDasPecasSelecionadas === CargaDeConteudoEnum.NAO ? pecas : await iniciarObtencaoDeConteudo(dossier_id, numeroDoProcesso, pecas, interop)
            return { ...dadosDoProcesso, pecas: pecasComConteudo, pecasSelecionadas: pecasComConteudo }
        }

        // Localiza pecas with descricao == 'OUTROS' e busca no banco de dados se já foram inferidas por IA
        if (identificarPecas === true) {
            const pecasOutros = pecas.filter(p => p.descr === 'OUTROS')
            if (pecasOutros.length > 0 && conteudoDasPecasSelecionadas !== CargaDeConteudoEnum.NAO) {
                if (await Dao.verifyIfDossierHasDocumentsWithPredictedCategories(numeroDoProcesso)) {
                    console.log(`Carregando tipos documentais de ${pecasOutros.length} peças marcadas com "OUTROS"`)
                    const pecasComDocumento = iniciarObtencaoDeDocumentoGravado(dossier_id, numeroDoProcesso, pecasOutros)
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

            // Localiza pecas with descricao == 'OUTROS' e usa IA para determinar quais são os tipos destas peças
            const pecasOutros2 = pecas.filter(p => p.descr === 'OUTROS')
            if (pecasOutros2.length > 0) {
                console.log(`Identificando tipos documentais de ${pecasOutros2.length} peças marcadas com "OUTROS"`)
                const pecasComConteudo = await iniciarObtencaoDeConteudo(dossier_id, numeroDoProcesso, pecasOutros2, interop, true)
                for (const peca of pecasComConteudo) {
                    if (peca.pConteudo) {
                        const c = await peca.pConteudo
                        if (c?.errorMsg) throw new Error(c.errorMsg)
                        const conteudo = c?.conteudo
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

        let pecasSelecionadas: PecaType[] | null = null
        let tipoDeSinteseSelecionado: TipoDeSinteseEnum | null = null

        // Localiza um tipo de síntese válido
        const tipos = TiposDeSinteseValido.filter(t => t.status <= statusDeSintese)
        for (const tipoDeSintese of tipos) {
            const pecasAcessiveis = pecas.filter(p => nivelDeSigiloPermitido(p.sigilo))
            pecasSelecionadas = selecionarPecasPorPadrao(pecasAcessiveis, tipoDeSintese.padroes)
            if (pecasSelecionadas !== null) {
                tipoDeSinteseSelecionado = tipoDeSintese.id
                break
            }
            if (pecasSelecionadas !== null) break
        }

        // Se for especificado o tipo de síntese, substitui 
        if (kind === '0') kind = undefined
        if (kind) {
            tipoDeSinteseSelecionado = kind
            const pecasAcessiveis = pecas.filter(p => nivelDeSigiloPermitido(p.sigilo))
            pecasSelecionadas = selecionarPecasPorPadrao(pecasAcessiveis, TipoDeSinteseMap[kind].padroes)
        }
        if (!tipoDeSinteseSelecionado) tipoDeSinteseSelecionado = 'RESUMOS'

        // Se forem especificadas as peças desejadas, substitui a lista de peças selecionadas
        if (pieces) {
            pecasSelecionadas = pecas.filter(p => pieces.includes(p.id))
        }


        if (completo) {
            for (const peca of pecas)
                // Se a peça for sigilosa, remove o conteúdo
                if (!nivelDeSigiloPermitido(peca.sigilo)) {
                    console.log('removendo conteúdo de peca com sigilo', peca.id, peca.sigilo)
                    peca.pConteudo = undefined
                    peca.conteudo = TEXTO_PECA_SIGILOSA
                }
            pecasSelecionadas = pecas
        } else if (pecasSelecionadas !== null) {
            if (verificarNivelDeSigilo())
                for (const peca of pecasSelecionadas)
                    assertNivelDeSigilo(peca.sigilo, `${peca.descr} (${peca.id})`)
        }

        // console.log('tipo de síntese', `${tipoDeSinteseSelecionado}`)
        // console.log('peças selecionadas', pecasSelecionadas?.map(p => p.id))
        // console.log('produtos', TipoDeSinteseMap[`${tipoDeSinteseSelecionado}`]?.produtos)

        let pecasComConteudo: PecaType[] = []
        if (pecasSelecionadas)
            pecasComConteudo = conteudoDasPecasSelecionadas === CargaDeConteudoEnum.NAO ? pecasSelecionadas : await iniciarObtencaoDeConteudo(dossier_id, numeroDoProcesso, pecasSelecionadas, interop)
        if (pecasComConteudo?.length > 0 && conteudoDasPecasSelecionadas === CargaDeConteudoEnum.SINCRONO) {
            console.log(`\n\nProcessando ${pecasComConteudo.length} peças selecionadas para o processo ${numeroDoProcesso}`)
            let i = 0
            for (const peca of pecasComConteudo) {
                i++
                console.log(`processando peça ${i}`, peca.id, peca.descr)
                if (!peca.conteudo && peca.pConteudo) {
                    const c = await peca.pConteudo
                    if (c?.errorMsg) {
                        if (completo) {
                            peca.conteudo = `${TEXTO_PECA_COM_ERRO} - ${c.errorMsg}`
                        } else {
                            throw new Error(c.errorMsg)
                        }
                    }
                    peca.conteudo = c?.conteudo
                }
                delete peca.pConteudo
            }
        }
        return { ...dadosDoProcesso, pecasSelecionadas: pecasComConteudo, tipoDeSintese: tipoDeSinteseSelecionado, produtos: TipoDeSinteseMap[tipoDeSinteseSelecionado]?.produtos }
        // return { ...dadosDoProcesso, pecas: [] as PecaType[], pecasSelecionadas: [] as PecaType[], tipoDeSintese: tipoDeSinteseSelecionado, produtos: TipoDeSinteseMap[tipoDeSinteseSelecionado]?.produtos }
    } catch (error) {
        if (error?.message === 'NEXT_REDIRECT') throw error
        console.error(`Erro ao obter dados do processo ${numeroDoProcesso}: ${error.stack}`)
        errorMsg = `${error.message}`
        return { pecas, errorMsg }
    }
}

export const obterDadosDoProcesso2 = async ({ numeroDoProcesso, pUser, pieces, conteudoDasPecasSelecionadas = CargaDeConteudoEnum.ASSINCRONO }: ObterDadosDoProcessoType): Promise<{ arrayDeDadosDoProcesso?: DadosDoProcessoType[], errorMsg?: string | undefined }> => {
    let pecas: PecaType[] = []
    let errorMsg = undefined
    try {
        const user = await pUser
        const username = user?.email
        const password = user?.image?.password ? decrypt(user?.image.password) : undefined

        const interop = getInterop(username, password)
        await interop.init()

        const dadosDoProcesso = await interop.consultarProcesso(numeroDoProcesso)
        // pecas = [...dadosDoProcesso.pecas]

        // // grava os dados do processo no banco
        // const system_id = await Dao.assertSystemId(user?.image?.system || 'PDPJ')
        // const dossier_id = await Dao.assertIADossierId(numeroDoProcesso, system_id, dadosDoProcesso.codigoDaClasse, dadosDoProcesso.ajuizamento)

        return { arrayDeDadosDoProcesso: [...dadosDoProcesso] }
        // return { ...dadosDoProcesso, pecas: [] as PecaType[], pecasSelecionadas: [] as PecaType[], tipoDeSintese: tipoDeSinteseSelecionado, produtos: TipoDeSinteseMap[tipoDeSinteseSelecionado]?.produtos }
    } catch (error) {
        if (error?.message === 'NEXT_REDIRECT') throw error
        console.error(`Erro ao obter dados do processo ${numeroDoProcesso}: ${error.stack}`)
        errorMsg = `${error.message}`
        return { errorMsg }
    }
}