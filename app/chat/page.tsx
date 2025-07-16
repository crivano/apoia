'use server'

import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { Container, Spinner } from 'react-bootstrap'
import Chat from '../community/chat'
import { getInternalPrompt } from '@/lib/ai/prompt'
import { PromptDataType } from '@/lib/ai/prompt-types'

export default async function Home() {
    noStore()

    const definition = getInternalPrompt('chat')
    const data: PromptDataType = {
        textos: []
    }

    return (
        <Suspense fallback={
            <Container className="mt-5" fluid={false}>
                <div className="text-center"><Spinner variant='secondary' /></div>
            </Container>
        }>
            <Container className="mt-5" fluid={false}>
                <Chat definition={definition} data={data} />
            </Container>
        </Suspense>
    )
}