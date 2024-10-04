'use server'

import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { Dao } from '@/lib/mysql'
import { formatDate, maiusculasEMinusculas } from '@/lib/utils'
import TablePlaceholder from '../../components/table-placeholder'
import TableRecords from '../../components/table-records'
import { Container } from 'react-bootstrap'

export default async function Home() {
    noStore()
    const records = await Dao.retrieveCountersByPromptKinds(null)

    return (<Container className="mt-3" fluid={false}>
        <h1 className="mb-0">Tipos de Prompts</h1>
        <Suspense fallback={< TablePlaceholder />} >
            <TableRecords records={records} spec="CountersByPromptKinds" />
        </Suspense>
    </Container>)
}