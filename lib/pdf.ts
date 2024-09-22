import { NextResponse } from 'next/server'
import * as pdfjs from 'pdfjs-dist/build/pdf.min.js'
await import('pdfjs-dist/build/pdf.worker.min.js')

export async function pdfToText(blob, options) {
    const doc = await pdfjs.getDocument(blob).promise
    //   const page = await pdf.getPage(1)
    //   const textContent = await page.getTextContent()
    //   return NextResponse.json({ message: textContent }, { status: 200 })


    {
        const pdf = {
            pdfInfo: undefined as any,
            meta: {},
            pages: [] as any[]
        };
        const firstPage = (options && options.firstPage) ? options.firstPage : 1;
        const lastPage = Math.min((options && options.lastPage) ? options.lastPage : doc.numPages, doc.numPages);
        pdf.pdfInfo = doc.pdfInfo;
        const promises = [
            doc.getMetadata().then(data => {
                pdf.meta = { info: data.info, metadata: data.metadata ? data.metadata.getAll() || null : null };
            })
        ];
        const loadPage = pageNum => doc.getPage(pageNum).then(async page => {
            const viewport = page.getViewport({ scale: 1.0 });
            const pag = {
                links: undefined as any,
                content: undefined as any,
                pageInfo: {
                    num: pageNum,
                    scale: viewport.scale,
                    rotation: viewport.rotation,
                    offsetX: viewport.offsetX,
                    offsetY: viewport.offsetY,
                    width: viewport.width,
                    height: viewport.height
                }
            };
            pdf.pages.push(pag);
            const normalizeWhitespace = !!(options && options.normalizeWhitespace === true);
            const disableCombineTextItems = !!(options && options.disableCombineTextItems === true);
            await Promise.all([
                page.getAnnotations().then((annotations) => {
                    pag.links = annotations.filter((annot) => annot.subtype === "Link" && !!annot.url)
                        .map((link) => link.url);
                }),
                page.getTextContent({ normalizeWhitespace, disableCombineTextItems }).then((content) => {
                    // Content contains lots of information about the text layout and styles, but we need only strings at the moment
                    pag.content = content.items.map(item => {
                        const tm = item.transform;
                        let x = tm[4];
                        let y = pag.pageInfo.height - tm[5];
                        if (viewport.rotation === 90) {
                            x = tm[5];
                            y = tm[4];
                        }
                        // see https://github.com/mozilla/pdf.js/issues/8276
                        const height = Math.sqrt(tm[2] * tm[2] + tm[3] * tm[3]);
                        return {
                            x: x,
                            y: y,
                            str: item.str,
                            dir: item.dir,
                            width: item.width,
                            height: height,
                            fontName: item.fontName
                        };
                    });
                })
            ])
        });
        for (let i = firstPage; i <= lastPage; i++) {
            promises.push(loadPage(i));
        }
        await Promise.all(promises);
        pdf.pages.sort((a, b) => a.pageInfo.num - b.pageInfo.num);

        const pagesText = pdf.pages.map(page =>
            page.content.map((item) => item.str).join(' ').replace(/\s+/g, ' ').replace(/\s([.,;?])/g, '$1').trim())
        
        const s = pagesText.map((str, idx) => `<page number="${idx+1}">\n${str}\n</page>`).join('\n')

        return s
    }
}
