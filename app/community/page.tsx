'use server'

import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { Dao } from '@/lib/db/mysql'
import TableRecords from '@/components/table-records'
import { Button, Container, Spinner } from 'react-bootstrap'
import { assertCurrentUser } from '@/lib/user'

async function Prompts({ params }: { params: {} }) {
    const user = await assertCurrentUser()
    const user_id = await Dao.assertIAUserId(user.name)
    const prompts = await Dao.retrieveLatestPrompts(user_id)

    prompts.sort((a, b) => {
        if (a.is_favorite !== b.is_favorite)
            return b.is_favorite - a.is_favorite;
        return a.id - b.id
    })
    return <TableRecords records={prompts} spec="Prompts" pageSize={20}>
        <div className="col col-auto">
            <Button variant="primary" href="/community/prompt/new">Criar Novo Prompt</Button>
        </div>
    </TableRecords>
}

export default async function Home({ params }: { params: {} }) {
    noStore()

    return (<Container className="mt-5" fluid={false}>
        <Suspense fallback={<div className="text-center"><Spinner variant='secondary' /></div>} >
            <Prompts params={params} />
        </Suspense>
    </Container>)
}