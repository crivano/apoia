'use server'

import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { Dao } from '@/lib/mysql'
import { formatDate, maiusculasEMinusculas } from '@/lib/utils'
import TablePlaceholder from '@/components/table-placeholder'
import TableRecords from '@/components/table-records'
import { Button, Container } from 'react-bootstrap'
import Link from 'next/link'
import { headers } from "next/headers";


export default async function Home({ params }: { params: { kind: string } }) {
    noStore()
    const heads = headers()
    const pathname = heads.get('next-url')
    console.log('pathname', pathname)
    const kind = params.kind
    console.log('kind', kind)
    const prompts = await Dao.retrievePromptsByKind(null, kind)
    console.log('prompts', prompts)
    const testsets = await Dao.retrieveTestsetsByKind(null, kind)

    return (<Container className="mt-5" fluid={false}>
        <h1 className="mb-0">Prompts</h1>
        <Suspense fallback={< TablePlaceholder />} >
            <TableRecords records={prompts} spec="PromptsByKind" linkToAdd="prompts/new" pageSize={10} />
        </Suspense>

        <h1 className="mb-0">Conjuntos de Testes</h1>
        <Suspense fallback={< TablePlaceholder />} >
            <TableRecords records={testsets} spec="TestsetsByKind" linkToAdd="testsets/new" linkToBack="../.." pageSize={10} />
        </Suspense>
    </Container>)
}