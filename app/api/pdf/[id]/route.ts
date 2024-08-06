export const runtime = 'edge'
export const maxDuration = 60

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const id: string = (params?.id?.toString() || '').replace(/[^0-9]/g, '') as string
    const json = await req.formData()
    const html = json.get('html')

    const formated = `<html>
    <head>
    </head>
    <body>
    <table style="width: 100%">
        <tr>
            <td style="width: 3em"><img src="https://apoia.vercel.app/apoia-logo-transp.png" style="height: 3em" alt="Apoia" /></td>
            <td align-left><span style="font-size: 150%">ApoIA</span><br/></td>
        </tr>
    </table>
    <style>
        .h-print { display: none; }
        button { display: none; }
        a.back-button { display: none; }
        h1 { text-align: center; }
        .text-center { text-align: center; }
        .mb-0 { margin-bottom: 0}
        .mb-4 { margin-bottom: 1.5em }
        div.ai-content h1 {
            text-align: left;
            font-size: 1.3rem;
            font-weight: bold;
            margin-top: 1rem;
        }

        div.ai-content h2 {
            font-size: 1.1rem;
            font-weight: bold;
            margin-top: 1rem;
        }

        div.ai-content h3 {
            font-size: 1.0rem;
            font-weight: bold;
            text-decoration: underline;
            margin-top: 1rem;
        }

        div.ai-content h4 {
            font-size: 1.0rem;
            font-weight: bold;
            margin-top: 1rem;
        }

        div.ai-content h5 {
            font-size: 1.0rem;
            font-weight: bold;
            margin-top: 1rem;
        }

        div.ai-content h6 {
            font-size: 1.0rem;
            text-decoration: underline;
            margin-top: 1rem;
        }

        div.ai-content p {
            margin-bottom: 0.5rem;
        }

        div.ai-content blockquote {
            font-size: 80%;
            margin-bottom: 0.5rem;
            padding: 0.5rem 0.5rem 0 0.5rem;
            padding-bottom: 0.1rem;
            border-left: 5px solid #f7f7f7;
        }

        div.ai-content ul {
            margin-bottom: 1rem;
        }

        .replaceInline {
            color: #6610f2;
            background-color: #d1b6fb;
        }

        .editOldInline {
            text-decoration: line-through;
            color: #dc3545;
            background-color: #f4bec3;
        }

        .editNewInline {
            color: #28a745;
            background-color: #c1f0cc;
        }
    </style>
    ${html}
    </body>
    </html>`


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
