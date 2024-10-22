'use server'
import { createHash } from 'node:crypto';

import * as soap from 'soap'
import { pdfToText } from './pdf'
import { html2md } from './html2md'
import { CombinacoesValidas, CombinacaoValida } from './combinacoes'
import { parseYYYYMMDDHHMMSS, addBlockQuote } from './utils'
import { systems } from './env'
import { assertCurrentUser, } from './user'
import { decrypt } from './crypt'
import { Dao } from './mysql'

const clientMap = new Map<string, soap.Client>()

const getClient = async (system: string | undefined) => {
    if (system === undefined) {
        const user = await assertCurrentUser()
        system = user.image.system
    }
    let client = clientMap.get(system as string)
    if (client !== undefined)
        return client
    const systemData = systems.find(s => s.system === system)
    client = await soap.createClientAsync(
        systemData?.wsdl as string,
        { parseReponseAttachments: true },
        systemData?.endpoint as string)
    clientMap.set(system as string, client)
    return client
}

const criarHash = (senha: string) => {
    const date = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date()).replaceAll('/', '-');

    const input = `${date}${senha}`;
    const hash = createHash('sha256').update(input).digest('hex');
    return hash;
}

export const autenticar = async (system: string, username: string, password: string) => {
    const client = await getClient(system)
    const currentSystem = systems.find(s => s.system === system)
    if (!currentSystem) {
        throw new Error(`Client for system ${system} not found`)
    }
    if (currentSystem.hashable) {
        password = criarHash(password)
    }
    const res = await client.consultarProcessoAsync({
        idConsultante: username,
        senhaConsultante: password,
        numeroProcesso: '00000000000000000000',
        movimentos: false,
        incluirCabecalho: false,
        incluirDocumentos: false
    })
    return res[0].mensagem.includes(currentSystem.validation)
}

export type PecaType = {
    id: string
    numeroDoEvento: string,
    descr: string
    tipoDoConteudo: string
    sigilo: string,
    pConteudo: Promise<string> | undefined
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
            pConteudo: obterConteudoDaPeca(dossier_id, numeroDoProcesso, peca.id, username, password)
        })
    }
    return pecasComConteudo
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

        const documentos = respQuery[0].processo?.documento ?? []

        // console.log('documentos', JSON.stringify(documentos, null, 2))
        for (const doc of documentos) {
            // if (!Object.values(T).includes(doc.attributes.descricao)) continue
            if (doc?.attributes?.movimento && doc?.attributes?.descricao) {
                pecas.unshift({
                    id: doc.attributes.idDocumento,
                    numeroDoEvento: doc.attributes.movimento,
                    descr: doc.attributes.descricao.toUpperCase(),
                    tipoDoConteudo: doc.attributes.mimetype,
                    sigilo: doc.attributes.nivelSigilo,
                    pConteudo: undefined
                })
            }
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

const consultarProcesso = async (numero, username, password) => {
    const user = await assertCurrentUser()
    const system = systems.find(s => s.system === user.image.system)
    if (system?.hashable) {
        password = criarHash(password)
    }
    const client = await getClient(undefined)
    // throw an error if the number is invalid
    if (!numero.match(/^\d{20}$/))
        throw new Error('Número de processo inválido')
    const pConsultarProcesso = client.consultarProcessoAsync({
        idConsultante: username,
        senhaConsultante: password,
        numeroProcesso: numero,
        movimentos: true,
        incluirCabecalho: true,
        incluirDocumentos: true
    })
    return pConsultarProcesso
}

// const butoArrayBuffer(buffer) {
//     const arrayBuffer = new ArrayBuffer(buffer.length);
//     const view = new Uint8Array(arrayBuffer);
//     for (let i = 0; i < buffer.length; ++i) {
//       view[i] = buffer[i];
//     }
//     return arrayBuffer;
//   }

const obterPeca = async (numeroDoProcesso, idDaPeca, username: string, password: string) => {
    const user = await assertCurrentUser()
    const system = systems.find(s => s.system === user.image.system)
    if (system?.hashable) {
        password = criarHash(password)
    }
    const client = await getClient(undefined)
    const respPeca = await client.consultarProcessoAsync({
        idConsultante: username,
        senhaConsultante: password,
        numeroProcesso: numeroDoProcesso,
        movimentos: false,
        incluirCabecalho: false,
        incluirDocumentos: false,
        documento: [idDaPeca]
    })
    const arquivo = client.lastResponseAttachments.parts[0]
    const b = arquivo.body
    const ab = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
    const resultado = { buffer: ab, contentType: respPeca[0].processo.documento[0].attributes.mimetype }
    return resultado
}

const obterTextoDeHtml = async (buffer: ArrayBuffer, documentId: number) => {
    const decoder = new TextDecoder('iso-8859-1')
    const html = decoder.decode(buffer)
    const htmlWithBlockQuote = addBlockQuote(html)
    const texto = await html2md(htmlWithBlockQuote)
    Dao.updateDocumentContent(null, documentId, 1, texto)
    return texto
}

const obterPaginasECaracteres = (texto) => {
    const pages = texto.replace(/<page number="\d+">\n/, '').split('</page>')
    pages.pop()
    const chars = pages.reduce((acc, p) => acc + p.length, 0)
    return { pages, chars }
}

// Método que recebe um buffer de um PDF, faz um post http para o serviço de OCR e retorna o PDF processado pelo OCR
const ocrPdf = async (buffer: ArrayBuffer) => {
    const url = process.env.OCR_URL as string
    const formData = new FormData()
    const file = new Blob([buffer], { type: 'application/pdf' })
    formData.append('file', file)
    const res = await fetch(url, {
        method: 'POST',
        body: formData
    })
    return await res.arrayBuffer()
}

const obterTextoDePdf = async (buffer: ArrayBuffer, documentId: number) => {
    const texto = await pdfToText(buffer, {})
    const { pages, chars } = obterPaginasECaracteres(texto)

    // PDF tem texto suficiente para se considerar que não será necessário realizar o OCR
    if (chars / pages.length > 300) {
        Dao.updateDocumentContent(null, documentId, 2, texto);
        return texto
    }

    const ocrBuffer = await ocrPdf(buffer)
    const ocrTexto = await pdfToText(ocrBuffer, {})
    const { pages: ocrPages, chars: ocrChars } = obterPaginasECaracteres(ocrTexto)

    // PDF processado pelo OCR tem mais texto que o original
    if (ocrChars > chars) {
        Dao.updateDocumentContent(null, documentId, 3, ocrTexto);
        return ocrTexto
    }

    return undefined
}

const obterConteudoDaPeca = async (dossier_id: number, numeroDoProcesso: string, idDaPeca: string, username: string, password: string) => {
    const document_id = await Dao.assertIADocumentId(null, idDaPeca, dossier_id)

    // verificar se a peça já foi gravada no banco
    const document = await Dao.retrieveDocument(null, document_id)
    if (document && document.content) {
        console.log('Retrieving from cache, content of type', document.content_source_id)
        return document.content
    }

    const { buffer, contentType } = await obterPeca(numeroDoProcesso, idDaPeca, username, password)


    if (buffer.byteLength == 0) {
        throw new Error(`Buffer vazio ${buffer.byteLength}`)
    }
    switch (contentType) {
        case 'text/html': {
            return obterTextoDeHtml(buffer, document_id)
        }
        case 'application/pdf': {
            return obterTextoDePdf(buffer, document_id)
        }
    }
    throw new Error(`Tipo de conteúdo não suportado: ${contentType}`)
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
