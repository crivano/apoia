'use server'

import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { Dao } from '@/lib/mysql'
import TablePlaceholder from '@/components/table-placeholder'
import TableRecords from '@/components/table-records'
import { Container } from 'react-bootstrap'

export default async function Home({ params }: { params: { kind: string, slug: string } }) {
    noStore()
    const { kind, slug } = params
    const records = await Dao.retrieveTestsetsByKindAndSlug(null, kind, slug)

    return (<Container className="mt-3">
        <h1 className="mb-0">Versões do Conjunto de Testes {kind.toUpperCase()} - {slug.toUpperCase()}</h1>
        <Suspense fallback={< TablePlaceholder />} >
            <TableRecords records={records} spec="TestsetsByKindAndSlug" linkToBack="../.." pageSize={20} />
        </Suspense>
    </Container>)
}