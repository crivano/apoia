'use server'

import { pdfToText } from '../pdf/pdf'
import { html2md } from '../utils/html2md'
import { T } from './combinacoes'
import { addBlockQuote } from '../utils/utils'
import { Dao } from '../db/mysql'
import { IADocument, IADocumentContentSource } from '../db/mysql-types'

import pLimit from 'p-limit'
import { assertNivelDeSigilo, verificarNivelDeSigilo } from './sigilo'
import { Interop } from '../interop/interop'
import { envString } from '../utils/env'
import { PecaConteudoType } from './process-types'

const limit = pLimit(envString('OCR_LIMIT') ? parseInt(envString('OCR_LIMIT')) : 1)

const obterTextoSimples = async (buffer: ArrayBuffer, documentId: number) => {
    const decoder = new TextDecoder('utf-8')
    const texto = decoder.decode(buffer)
    Dao.updateDocumentContent(documentId, 1, texto)
    return texto
}

const obterTextoDeHtml = async (buffer: ArrayBuffer, documentId: number) => {
    const decoder = new TextDecoder('iso-8859-1')
    const html = decoder.decode(buffer)
    const htmlWithBlockQuote = addBlockQuote(html)
    const texto = await html2md(htmlWithBlockQuote)
    Dao.updateDocumentContent(documentId, 1, texto)
    return texto
}

const obterPaginasECaracteres = (texto) => {
    const pages = texto.replace(/<page number="\d+">\n/, '').split('</page>')
    pages.pop()
    const chars = pages.reduce((acc, p) => acc + p.length, 0)
    return { pages, chars }
}

export const ocrPdf = async (buffer: ArrayBuffer, documentId: number) =>
    limit(() => ocrPdfSemLimite(buffer, documentId))

// Método que recebe um buffer de um PDF, faz um post http para o serviço de OCR e retorna o PDF processado pelo OCR
const ocrPdfSemLimite = async (buffer: ArrayBuffer, documentId: number) => {
    console.log('ocrPdf', buffer.byteLength)
    const url = envString('OCR_URL') as string
    const formData = new FormData()
    const file = new Blob([buffer], { type: 'application/pdf' })
    formData.append('file', file)
    const res = await fetch(url, {
        method: 'POST',
        body: formData
    })
    if (res.status !== 200) {
        if (res.headers.get('content-type') === 'application/json') {
            const errorMsg = (await res.json()).error
            throw new Error(`Erro ao processar documento ${documentId} pelo OCR: ${errorMsg}`)
        }
        throw new Error(`Erro ao processar documento ${documentId} pelo OCR`)
    }
    return await res.arrayBuffer()
}

const atualizarConteudoDeDocumento = async (documentId: number, contentSource: number, content: string) => {
    Dao.updateDocumentContent(documentId, contentSource, content)
    return content
}

const obterTextoDePdf = async (buffer: ArrayBuffer, documentId: number) => {

    const bufferCopy = buffer.slice(0);

    console.log('obterTextoDePdf', documentId, buffer.byteLength)
    const texto = await pdfToText(buffer, {})
    const { pages, chars } = obterPaginasECaracteres(texto)

    // PDF tem texto suficiente para se considerar que não será necessário realizar o OCR
    if (chars / pages.length > 500) {
        return atualizarConteudoDeDocumento(documentId, IADocumentContentSource.PDF, texto)
    }

    const ocrBuffer = await ocrPdf(bufferCopy, documentId)
    const ocrTexto = await pdfToText(ocrBuffer, {})
    const { pages: ocrPages, chars: ocrChars } = obterPaginasECaracteres(ocrTexto)

    // PDF processado pelo OCR tem mais texto que o original
    if (ocrChars) {
        return atualizarConteudoDeDocumento(documentId, IADocumentContentSource.OCR, ocrTexto)
    } else if (chars) {
        return atualizarConteudoDeDocumento(documentId, IADocumentContentSource.PDF, texto)
    }

    return undefined
}

const obterTipoDePecaPelaDescricao = (descr: string) => {
    for (const tipo in T) {
        if (descr === T[tipo]) {
            return tipo
        }
    }
    return null
}

export const obterDocumentoGravado = async (dossier_id: number, numeroDoProcesso: string, idDaPeca: string, descrDaPeca: string): Promise<IADocument> => {
    const document_id = await Dao.assertIADocumentId(dossier_id, idDaPeca, descrDaPeca)

    // verificar se a peça já foi gravada no banco
    const document = await Dao.retrieveDocument(document_id)
    // if (!document) throw new Error(`Documento ${idDaPeca} não encontrado`)
    return document
}


export const obterConteudoDaPeca = async (dossier_id: number, numeroDoProcesso: string, idDaPeca: string, descrDaPeca: string, sigiloDaPeca: string, interop: Interop): Promise<PecaConteudoType> => {
    try {
        if (verificarNivelDeSigilo())
            assertNivelDeSigilo(sigiloDaPeca, `${descrDaPeca} (${idDaPeca})`)

        const document = await obterDocumentoGravado(dossier_id, numeroDoProcesso, idDaPeca, descrDaPeca)
        const document_id = document ? document.id : undefined
        if (document && document.content) {
            console.log('Retrieving from cache, content of type', document.content_source_id)
            return { conteudo: document.content }
        }

        const { buffer, contentType } = await interop.obterPeca(numeroDoProcesso, idDaPeca)

        switch (contentType) {
            case 'text/plain': {
                return { conteudo: await obterTextoSimples(buffer, document_id) }
            }
            case 'text/html': {
                return { conteudo: await obterTextoDeHtml(buffer, document_id) }
            }
            case 'application/pdf': {
                return { conteudo: await obterTextoDePdf(buffer, document_id) }
            }
            case 'image/jpeg': {
                return { conteudo: await atualizarConteudoDeDocumento(document_id, IADocumentContentSource.IMAGE, 'Peça no formato de imagem JPEG, conteúdo não acessado.') }
            }
            case 'image/png': {
                return { conteudo: await atualizarConteudoDeDocumento(document_id, IADocumentContentSource.IMAGE, 'Peça no formato de imagem PNG, conteúdo não acessado.') }
            }
            case 'video/mp4': {
                return { conteudo: await atualizarConteudoDeDocumento(document_id, IADocumentContentSource.VIDEO, 'Peça no formato de vídeo X-MS-WMV, conteúdo não acessado.') }
            }
            case 'video/mp4': {
                return { conteudo: await atualizarConteudoDeDocumento(document_id, IADocumentContentSource.VIDEO, 'Peça no formato de vídeo MP4, conteúdo não acessado.') }
            }
            throw new Error(`Tipo de conteúdo não suportado: ${contentType}`)
        }
    } catch (error) {
        return { conteudo: undefined, errorMsg: error}
    }
}


