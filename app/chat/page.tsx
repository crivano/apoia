'use server'

import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { Container, Spinner } from 'react-bootstrap'
import Chat, { SuggestionType } from '../community/chat'
import { getInternalPrompt } from '@/lib/ai/prompt'
import { PromptDataType } from '@/lib/ai/prompt-types'
import { faFileLines, faQuestionCircle } from '@fortawesome/free-regular-svg-icons'
import { faSackDollar, faUsers } from '@fortawesome/free-solid-svg-icons'

export default async function Home() {
    noStore()

    const definition = getInternalPrompt('chat-standalone')
    const data: PromptDataType = {
        textos: []
    }

    const suggestions: SuggestionType[] = [
        { suggestion: 'Resuma o processo em um parágrafo.', icon: faFileLines, label: 'Resumir o processo' },
        { suggestion: 'Liste as partes e seus advogados.', icon: faUsers, label: 'Listar as partes' },
        { suggestion: 'Qual o valor da causa?', icon: faSackDollar, label: 'Valor da causa' },
        { suggestion: 'Quais são os pontos ainda controvertidos?', icon: faQuestionCircle, label: 'Pontos controvertidos' }
    ]

    return (
        <Suspense fallback={
            <Container className="mt-3" fluid={false}>
                <div className="text-center"><Spinner variant='secondary' /></div>
            </Container>
        }>
            <Container className="mt-3" fluid={false}>
                <Chat definition={definition} data={data} suggestions={suggestions}
                    footer={<div className="text-body-tertiary">O Agente de IA busca informações e peças de qualquer processo. Para contextualizar, inclua o número do processo na sua primeira pergunta.</div>}
                />
            </Container>
        </Suspense>
    )
}