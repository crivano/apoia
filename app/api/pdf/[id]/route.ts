// export const runtime = 'edge'
export const runtime = 'nodejs'
export const maxDuration = 60

import template from '@/lib/pdf/template.html'
import axios from 'axios'
import https from 'https'

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id: string = (params?.id?.toString() || '') as string
    const json = await req.formData()
    const html: string = json.get('html') as string
    const skipTemplate: boolean = json.get('skipTemplate') === 'true'
    const formated = skipTemplate ? html : template.replace('<div class="content"></div>', html)

    const httpsAgent = new https.Agent({
        rejectUnauthorized: false, // disables SSL certificate validation
    });

    const { data } = await axios.post('https://siga.jfrj.jus.br/sigaex/public/app/util/html-pdf', {
        conv: '2',
        html: formated
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        httpsAgent
    })

    const pdf = Buffer.from(data.pdf, 'base64')

    const headers = new Headers();
    headers.append("Content-Disposition", `attachment; filename="apoia-${id}.pdf"`)
    headers.append("Content-Type", "application/pdf")
    headers.append("Content-Length", pdf.length.toString())

    return new Response(pdf, { headers })
}
