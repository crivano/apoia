'use server'

import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { Dao } from '@/lib/mysql'
import { formatDate, maiusculasEMinusculas } from '@/lib/utils'
import TablePlaceholder from '../../components/table-placeholder'
import TableRecords from '../../components/table-records'
import { Container } from 'react-bootstrap'
import prompts from '@/lib/prompts'

export default async function Home() {
    noStore()
    const records = await Dao.retrieveCountersByPromptKinds(null)
    const promptKinds = Object.entries(prompts).map(([kind, prompt]) => ({ kind, prompts: 0, testsets: 0 }))
        records.forEach(record => {
            promptKinds.forEach(promptKind => {
                if (!records.find(r => r.kind === promptKind.kind)) {
                    records.push(promptKind)
                }
            })
        })
    records.sort((a, b) => a.kind.localeCompare(b.kind))

    return (<Container className="mt-5" fluid={false}>
        <h1 className="mb-0">Tipos de Prompts</h1>
        <Suspense fallback={< TablePlaceholder />} >
            <TableRecords records={records} spec="CountersByPromptKinds" pageSize={20} />
        </Suspense>
    </Container>)
}