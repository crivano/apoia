'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'
import AiContent from '../../../components/ai-content'
import { P } from '@/lib/proc/combinacoes'
import { Button, Container } from 'react-bootstrap'
import PromptConfig from '@/components/prompt-config'
import { PromptConfigType } from '@/lib/ai/prompt-types'
import { getInternalPrompt } from '@/lib/ai/prompt'

export default function Synthesis() {
    const [numeroDoProcesso, setNumeroDoProcesso] = useState('')
    const [hidden, setHidden] = useState(true)
    const [promptConfig, setPromptConfig] = useState({} as PromptConfigType)

    const numeroDoProcessoChanged = (text) => {
        setNumeroDoProcesso(text)
        setHidden(true)
    }

    return (
        <div className="mb-3">
            <h2 className="mt-3">Síntese do Processo</h2>
            <PromptConfig kind="sintese" setPromptConfig={setPromptConfig} />
            <div className="row mb-3 mt-3">
                <div className="col">
                    <div className="form-group">
                        <label>Número do Processo</label>
                        <input type="text" id="key" name="key" placeholder="" autoFocus={true} className="form-control" onChange={(e: React.ChangeEvent<HTMLInputElement>) => numeroDoProcessoChanged(e.target.value)} value={numeroDoProcesso} autoComplete='' />
                    </div>
                </div>
            </div>
            {hidden && <>
                <div className="text-muted">Digite o número do processo na caixa acima e clique em &quot;Sintetizar&quot;.</div>
            </>}
            {hidden && <>
                <Button disabled={!numeroDoProcesso} className="mt-3" onClick={() => setHidden(false)}>Sintetizar</Button>
            </>}
            {!hidden && <>
                <h2 className="mt-3">Ementa</h2>
                <AiContent
                    definition={getInternalPrompt('ementa')}
                    data={{ textos: [{ descr: 'EXTRATO DE ATA', slug: 'extrato-de-ata', texto: `ÓRGÃO JULGADOR: ${numeroDoProcesso}\nTIPO DE DECISÁO: UNÂMINE` }, { descr: 'Voto', slug: 'voto', texto: markdown }] }}
                    options={{ cacheControl: true }} config={promptConfig} />
            </>}
        </div>
    )
}