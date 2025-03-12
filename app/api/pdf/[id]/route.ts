export const runtime = 'edge'
export const maxDuration = 60

import template from '@/lib/pdf/template.html'


export async function POST(req: Request, { params }: { params: { id: string } }) {
    const id: string = (params?.id?.toString() || '') as string
    const json = await req.formData()
    const html = json.get('html')
    const formated = template.replace(`<div class="content"></div>`, html)

    const res = await fetch('https://siga.jfrj.jus.br/sigaex/public/app/util/html-pdf', {
        method: 'post',
        body: JSON.stringify({
            conv: '2',
            html: formated
        }),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        cache: 'no-store'
    })
    // const data = await res.json()
    const data = await res.json()

    const pdf = Buffer.from(data.pdf, 'base64')

    const headers = new Headers();
    headers.append("Content-Disposition", `attachment; filename="apoia-${id}.pdf"`)
    headers.append("Content-Type", "application/pdf")
    headers.append("Content-Length", pdf.length.toString())

    return new Response(pdf, { headers })
}
