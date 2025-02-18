'use server'

import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { Dao } from '@/lib/db/mysql'
import { Container, Spinner } from 'react-bootstrap'
import PromptInfoContents from './prompt-info-contents'

export default async function Home({ params }: { params: { id: number } }) {
    noStore()

    const pPrompt = Dao.retrieveLatestPromptByBaseId(params.id)

    return (
        <Container className="mt-5" fluid={false}>
            <h1 className="text-center">Informações de Prompt</h1>
            <Suspense fallback={
                <div className="text-center"><Spinner variant='secondary' /></div>
            }>
                <PromptInfoContents pPrompt={pPrompt} />
            </Suspense>
        </Container>
    )
}