'use server'

import { pdfToText } from '../pdf/pdf'
import { html2md } from '../utils/html2md'
import { T } from './combinacoes'
import { addBlockQuote } from '../utils/utils'
import { Dao } from '../db/mysql'
import { IADocument } from '../db/mysql-types'
import { obterPeca } from '../mni'

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
    console.log('ocrPdf', buffer.byteLength)
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

    const bufferCopy = buffer.slice(0);

    console.log('obterTextoDePdf', buffer.byteLength)
    const texto = await pdfToText(buffer, {})
    const { pages, chars } = obterPaginasECaracteres(texto)

    // PDF tem texto suficiente para se considerar que não será necessário realizar o OCR
    if (chars / pages.length > 300) {
        Dao.updateDocumentContent(null, documentId, 2, texto);
        return texto
    }

    const ocrBuffer = await ocrPdf(bufferCopy)
    const ocrTexto = await pdfToText(ocrBuffer, {})
    const { pages: ocrPages, chars: ocrChars } = obterPaginasECaracteres(ocrTexto)

    // PDF processado pelo OCR tem mais texto que o original
    if (ocrChars > chars) {
        Dao.updateDocumentContent(null, documentId, 3, ocrTexto);
        return ocrTexto
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

export const obterDocumentoGravado = async (dossier_id: number, numeroDoProcesso: string, idDaPeca: string, descrDaPeca: string, username: string, password: string): Promise<IADocument> => {
    const document_id = await Dao.assertIADocumentId(null, dossier_id, idDaPeca, descrDaPeca)

    // verificar se a peça já foi gravada no banco
    const document = await Dao.retrieveDocument(null, document_id)
    if (!document) throw new Error(`Documento ${idDaPeca} não encontrado`)
    return document
}


export const obterConteudoDaPeca = async (dossier_id: number, numeroDoProcesso: string, idDaPeca: string, descrDaPeca: string, username: string, password: string) => {
    const document = await obterDocumentoGravado(dossier_id, numeroDoProcesso, idDaPeca, descrDaPeca, username, password)
    const document_id = document.id
    if (document && document.content) {
        console.log('Retrieving from cache, content of type', document.content_source_id)
        return document.content
    }

    const { buffer, contentType } = await obterPeca(numeroDoProcesso, idDaPeca, username, password)

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


