'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState, useEffect } from 'react'
import AiContent from '@/components/ai-content'
import { InfoDeProduto, P } from '@/lib/combinacoes'
import { Button, Container, Form } from 'react-bootstrap'
import { get } from 'http'
import { TextoType } from '@/prompts/_prompts'
import { IATestset } from '@/lib/mysql-types'
import { slugify } from '@/lib/utils'

const EditorComp = dynamic(() => import('@/components/EditorComponent'), { ssr: false })

export default function Test(params: {
    testset: IATestset, overrideSystemPrompt?: string, overridePrompt?: string,
    overrideJsonSchema?: string, overrideFormat?: string
}) {
    const parsedTests = params.testset.content.tests.map((test, idx) => {
        const titulo = test.name
        const infoDeProduto: InfoDeProduto = {
            "produto": P[slugify(params.testset.kind).replace('-', "_").toUpperCase()],
            "dados": [],
            "titulo": titulo,
            "prompt": params.testset.kind,
            "plugins": []
        }
        const textos = test.texts.map(t => ({ descr: t.name, slug: slugify(t.name), texto: t.value }))
        const result = test.expected
        const file = idx.toString()
        return { file, titulo, infoDeProduto, textos, result }
    })

    const [file, setFile] = useState("0")
    const [hidden, setHidden] = useState(true)
    const [refresh, setRefresh] = useState(false)

    useEffect(() => {
        if (!refresh) return
        const id = setInterval(() => {
            setRefresh(false)
        }, 300);
        return () => clearInterval(id);
    }, [refresh])

    const fileChanged = (text) => {
        setHidden(true)
        setFile(text)
    }

    const test = parsedTests.find(e => e.file === file)
    if (!test) return <div className="alert alert-danger">Teste não encontrado {file}</div>

    return (
        <>
            <div className="row d-print-none mt-4">
                <div className="col col-auto">
                    <Form.Select aria-label="Tipo de Visualização" value={file} onChange={e => fileChanged(e.target.value)} className='w-100'>
                        {parsedTests.map(e => (
                            <option key={e.file} value={e.file}>{e.titulo}</option>))}
                    </Form.Select>
                </div>
                <div className="col col-auto">
                    <Button className="me-3" onClick={() => setHidden(false)}>Testar</Button>
                    <Button className="" onClick={() => setRefresh(true)}>Refazer</Button>
                </div>
            </div>
            {!hidden && !refresh && <>
                <h2 className="mt-3">{test.infoDeProduto.titulo}</h2>
                <AiContent infoDeProduto={test.infoDeProduto} textos={test.textos}
                    overrideSystemPrompt={params.overrideSystemPrompt} overridePrompt={params.overridePrompt}
                    overrideJsonSchema={params.overrideJsonSchema} overrideFormat={params.overrideFormat} />
            </>}
        </>
    )
}
