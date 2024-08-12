'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'
import AiContent from '../../components/ai-content'
import { P } from '@/lib/combinacoes'
import { Button, Container } from 'react-bootstrap'

const EditorComp = dynamic(() => import('../../components/EditorComponent'), { ssr: false })

export default function Revison() {
    const [markdown, setMarkdown] = useState('')
    const [orgaoJulgador, setOrgaoJulgador] = useState('')
    const [hidden, setHidden] = useState(true)

    const textChanged = (text) => {
        setMarkdown(text)
        setHidden(true)
    }

    const orgaoJulgadorChanged = (text) => {
        setOrgaoJulgador(text)
        setHidden(true)
    }

    const preprocessText = (text) => {
        return `EXTRATO DE ATA:
<extrato_de_ata>
ÓRGÃO JULGADOR: ${orgaoJulgador}
TIPO DE DECISÁO: UNÂMINE
</extrato_de_ata>

VOTO:
<voto>
${text}
</voto>
`
    }

    return (
        <div className="mb-3">
            <h2 className="mt-3">Parâmetros</h2>
            <div className="row mb-3 mt-3">
                <div className="col">
                    <div className="form-group">
                        <label>Órgão Julgador</label>
                        <input type="text" id="key" name="key" placeholder="" autoFocus={true} className="form-control" onChange={(e: React.ChangeEvent<HTMLInputElement>) => orgaoJulgadorChanged(e.target.value)} value={orgaoJulgador} autoComplete='' />
                    </div>
                </div>
            </div>
            <div className="form-group"><label>Voto</label></div>
            <div className="alert alert-secondary mb-1 p-0">
                <Suspense fallback={null}>
                    <EditorComp markdown={markdown} onChange={textChanged} />
                </Suspense>
            </div>
            {hidden && <>
                <div className="text-muted">Cole o texto do voto na caixa acima e clique em &quot;Gerar Ementa&quot;.</div>
            </>}
            {hidden && <>
                <Button disabled={!markdown || !orgaoJulgador} className="mt-3" onClick={() => setHidden(false)}>Gerar Ementa</Button>
            </>}
            {!hidden && markdown && <>
                <h2 className="mt-3">Ementa e Acórdão</h2>
                <AiContent
                    infoDeProduto={{ produto: P.ACORDAO, dados: [], titulo: 'Ementa e Acórdão', prompt: 'acordao', plugins: [] }}
                    textos={[{ descr: 'Texto', slug: 'texto', texto: markdown }]} />
            </>}
        </div>
    )
}