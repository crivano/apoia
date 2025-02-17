'use server'

import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { Dao } from '@/lib/db/mysql'
import { Container, Spinner } from 'react-bootstrap'
import { assertCurrentUser } from '@/lib/user'
import { Contents } from './contents'
import { assertModel, hasApiKey } from '@/lib/ai/model-server'

export async function ServerContents({ params }: { params: {} }) {
    const user = await assertCurrentUser()
    const apiKeyProvided = await hasApiKey()
    const user_id = await Dao.assertIAUserId(user.name)
    const prompts = await Dao.retrieveLatestPrompts(user_id)
    return <Contents prompts={prompts} user={user} user_id={user_id} apiKeyProvided={apiKeyProvided} />
}

export default async function Home({ params }: { params: {} }) {
    noStore()
    return (
        <Suspense fallback={
            <Container className="mt-5" fluid={false}>
                <div className="text-center"><Spinner variant='secondary' /></div>
            </Container>
        }>
            <ServerContents params={params} />
        </Suspense>
    )
}