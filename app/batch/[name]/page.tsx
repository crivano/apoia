import { unstable_noStore as noStore } from 'next/cache'
import { Dao } from "@/lib/mysql"
import { Plugin } from '../../../lib/combinacoes'


export const maxDuration = 60 // seconds
export const dynamic = 'force-dynamic'

export default async function ShowBatchResult({ params }: { params: { name: string } }) {
    noStore()

    const loading = () => {
        return <div className="spinner-border text-secondary opacity-50 text-center" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    }

    const batch_id = await Dao.assertIABatchId(null, params.name)
    const enum_id = await Dao.assertIAEnumId(null, Plugin.TRIAGEM)

    let html = ''

    const items = await Dao.retrieveByBatchIdAndEnumId(null, batch_id, enum_id)

    const enumDescrs = items.reduce((acc, i) => {
        if (!acc.includes(i.enum_item_descr))
            acc.push(i.enum_item_descr)
        return acc
    }, [] as string[])
    const map = items.reduce((acc, i) => {
        acc[i.enum_item_descr] = acc[i.enum_item_descr] || []
        acc[i.enum_item_descr].push(i)
        return acc
    }, {})

    const triageItems = enumDescrs.map(d => ({ descr: d, items: map[d] }))

    for (const ti of triageItems) {
        html += `<h2>${ti.descr} (${ti.items.length})</h2>`
        let i = 0
        for (const item of ti.items) {
            if (i) html += ', '
            html += item.dossier_code
            i++
        }
    }

    for (const ti of triageItems) {
        html += `<h1>${ti.descr}</h1><div class="center">${ti.items.length} processos</div>`
        for (const item of ti.items) {
            html += item.dossier_code
        }

        for (const item of ti.items) {
            html += `<div class="page"><h1>Processo ${item.dossier_code}</h1>`
            const generations = await Dao.retrieveGenerationByBatchDossierId(null, item.batch_dossier_id)
            for (const g of generations) {
                html += `<h2>${g.descr}</h2><div>${g.generation}</div>`
            }
            html += `</div>`
        }
    }


    return (<>
        <table style={{ width: '100%' }}>
            <tbody>
                <tr>
                    <td style={{ width: '3em' }}><img src="https://apoia.vercel.app/apoia-logo-transp.png" style={{ height: '3em%' }} alt="Apoia" /></td>
                    <td align-left><span style={{ fontSize: '150%' }}>ApoIA</span><br /></td>
                </tr>
            </tbody>
        </table>
        <style dangerouslySetInnerHTML={{ __html: styles }}></style>
        <style type="text/css" media="print" dangerouslySetInnerHTML={{ __html: printStyles }}></style>
    </>
    )
}


const styles = `button { display: none; }
    a.back-button { display: none; }
    div.navbar { display: none; }
    h1 { text-align: center; }
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

    div.center {
        text-align: center;
    }`

const printStyles = `
    div.page {
        page-break-after: always;
        page-break-inside: avoid;
    }`