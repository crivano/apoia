'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'
import AiContent from '@/components/ai-content'
import { Button } from 'react-bootstrap'
import { PromptConfigType, PromptDefinitionType } from '@/lib/ai/prompt-types'
import { slugify } from '@/lib/utils/utils'
import { IAPrompt } from '@/lib/db/mysql-types'
import { VisualizationEnum } from '@/lib/ui/preprocess'

const EditorComp = dynamic(() => import('@/components/EditorComponent'), { ssr: false })

export default function TargetText({ prompt, visualization }: { prompt: IAPrompt, visualization?: VisualizationEnum }) {
    const [markdown, setMarkdown] = useState('')
    const [hidden, setHidden] = useState(true)
    const [promptConfig, setPromptConfig] = useState({} as PromptConfigType)

    const textChanged = (text) => {
        setMarkdown(text)
        setHidden(true)
    }

    const definition: PromptDefinitionType = {
        kind: `prompt-${prompt.id}`,
        prompt: prompt.content.prompt,
        systemPrompt: prompt.content.system_prompt,
        jsonSchema: prompt.content.json_schema,
        format: prompt.content.format,
        cacheControl: true,
    }

    const textoDescr = prompt.content.editor_label || 'Texto'

    return (
        <div className="mb-3">
            {/* <h2 className="mt-3">{prompt.content.editor_label}</h2> */}
            {/* <PromptConfig kind="ementa" setPromptConfig={setPromptConfig} /> */}
            <div className="form-group"><label>{textoDescr}</label></div>
            <div className="alert alert-secondary mb-1 p-0">
                <Suspense fallback={null}>
                    <EditorComp markdown={markdown} onChange={textChanged} />
                </Suspense>
            </div>
            {hidden && <>
                <div className="text-muted">Cole o texto acima e clique em prosseguir.</div>
            </>}
            {hidden && <>
                {/* <Button disabled={!markdown || !orgaoJulgador} className="mt-3" onClick={() => setHidden(false)}>Gerar Ementa</Button> */}
                <Button disabled={!markdown} className="mt-3" onClick={() => setHidden(false)}>Prosseguir</Button>
            </>}
            {!hidden && markdown && <>
                <h2 className="mt-3">{prompt.name}</h2>
                <AiContent
                    definition={definition}
                    data={{ textos: [{ descr: textoDescr, slug: slugify(textoDescr), texto: markdown }] }}
                    options={{ cacheControl: true }} config={promptConfig} visualization={visualization}/>
            </>}
        </div>
    )
}