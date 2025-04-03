import pdf from 'pdf-parse'

export async function pdfToText(blob: ArrayBuffer, options) {
    const data = await pdf(blob)

    console.log('pdfToText', data)

    return data.text
    
    const pagesText = pdf.pages.map(page =>
        page.content.map((item) => item.str).join(' ').replace(/\s+/g, ' ').replace(/\s([.,;?])/g, '$1').trim())

    const s = pagesText.map((str, idx) => `<page number="${idx + 1}">\n${str}\n</page>`).join('\n')

    return s
}
