'use client'

// import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'
import AiContent from './ai-content'
import { P } from '@/lib/proc/combinacoes'
import { Button, Container } from 'react-bootstrap'

// const EditorComp = dynamic(() => import('./EditorComponent'), { ssr: false })

export default function Revison() {
    const [markdown, setMarkdown] = useState('')
    const [hidden, setHidden] = useState(true)

    const textChanged = (text) => {
        setMarkdown(text)
        setHidden(true)
    }

    return (
        <>
            <h2 className="mt-3">Texto</h2>
            <div className="alert alert-secondary mb-1 p-0">
                <Suspense fallback={null}>
                    <></>
                </Suspense>
            </div>
            {hidden && <>
                <div className="text-muted">Cole o texto a ser revisado na caixa acima e clique em &quot;Revisar&quot;.</div>
                <Button disabled={!markdown} className="mt-3" onClick={() => setHidden(false)}>Revisar</Button>
            </>}
            {!hidden && markdown && <>
                <h2 className="mt-3">Revisão</h2>
                <AiContent
                    infoDeProduto={{ produto: P.REVISAO, dados: [], titulo: 'Revisão', prompt: 'revisao', plugins: [] }}
                    textos={[{ descr: 'Texto', slug: 'texto', texto: markdown }]} />
                <h2 className="mt-3">Refinamento</h2>
                <AiContent
                    infoDeProduto={{ produto: P.REFINAMENTO, dados: [], titulo: 'Refinamento', prompt: 'refinamento', plugins: [] }}
                    textos={[{ descr: 'Texto', slug: 'texto', texto: markdown }]} />
            </>}
        </>
    )
}