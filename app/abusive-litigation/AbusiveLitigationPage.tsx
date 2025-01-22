'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'
import AiContent from '../../components/ai-content'
import { P } from '@/lib/proc/combinacoes'
import { Button, Container } from 'react-bootstrap'
import PromptConfig from '@/components/prompt-config'
import { PromptConfigType } from '@/lib/ai/prompt-types'
import { getInternalPrompt } from '@/lib/ai/prompt'
import fetcher from '@/lib/utils/fetcher'
import { slugify } from '@/lib/utils/utils'
import { DadosDoProcessoType, PecaType } from '@/lib/proc/process'
import strcomp from "string-comparison"

const preprocessInput = (value: string) => {
    value = value.replaceAll(/(:.*?)$/gm, '')
    value = value.replaceAll('\n', ',').replaceAll(/[^\d,]/g, '').replaceAll(',', '\n').replaceAll('\n\n', '\n')
    return value
}

const formatAsPercentage = (value: number) => {
    if (isNaN(value)) return ''
    return `${(value * 100).toFixed(2)}%`
}

export default function AbusiveLitigationPage() {
    const [outrosNumerosDeProcessos, setOutrosNumerosDeProcessos] = useState('')
    const [numeroDoProcesso, setNumeroDoProcesso] = useState('')
    const [hidden, setHidden] = useState(true)
    const [promptConfig, setPromptConfig] = useState({} as PromptConfigType)
    const [peticaoInicial, setPeticaoInicial] = useState('')
    const [processos, setProcessos] = useState([] as DadosDoProcessoType[])
    const [similaridadeDePeticaoInicial, setSimilaridadeDePeticaoInicial] = useState({} as { [key: string]: number })
    const [processosMap, setProcessosMap] = useState({} as { [key: string]: DadosDoProcessoType })


    const outrosNumerosDeProcessosChanged = (text) => {
        setOutrosNumerosDeProcessos(text)
        setHidden(true)
    }

    const numeroDoProcessoChanged = (text) => {
        setNumeroDoProcesso(text)
        setHidden(true)
    }

    const localizarAPeticaoInicial = (dadosDoProcesso: DadosDoProcessoType): PecaType => {
        return dadosDoProcesso.pecasSelecionadas.find(p => slugify(p.descr) === 'peticao-inicial')
    }

    const obterDadosDoProcessoEConteudoDaPeticaoInicial = async (numeroDoProcesso: string): Promise<DadosDoProcessoType> => {
        let mapa: { [key: string]: DadosDoProcessoType } =  processosMap
        console.log('mapa', mapa)
        let dadosDoProcesso: DadosDoProcessoType = mapa[numeroDoProcesso]
        if (!dadosDoProcesso) {
            dadosDoProcesso = await fetcher.get(`/api/v1/process/${numeroDoProcesso}?kind=LITIGANCIA_PREDATORIA`)
            mapa = { ...mapa, numeroDoProcesso: dadosDoProcesso }
            setProcessosMap(mapa)
        }

        const peticaoInicialPeca = localizarAPeticaoInicial(dadosDoProcesso)
        const peticaoInicialId = peticaoInicialPeca?.id
        if (!peticaoInicialPeca.conteudo && peticaoInicialId) {
            const peticaoInicialConteudo = await fetcher.get(`/api/v1/process/${numeroDoProcesso}/piece/${peticaoInicialId}/content`)
            peticaoInicialPeca.conteudo = peticaoInicialConteudo.content
            setProcessosMap({ ...mapa })
        }
        return dadosDoProcesso
    }

    const startAnalysis = async () => {
        setProcessos([])
        setSimilaridadeDePeticaoInicial({})

        // Obter a petição inicial do processo principal
        const dadosDoProcesso = await obterDadosDoProcessoEConteudoDaPeticaoInicial(numeroDoProcesso)
        setProcessos([dadosDoProcesso])

        const peticaoInicial = localizarAPeticaoInicial(dadosDoProcesso)

        // Obter a petição inicial dos outros processos
        const outrosNumerosDeProcessosArray = outrosNumerosDeProcessos.trim().split('\n')
        for (const numeroDoOutroProcesso of outrosNumerosDeProcessosArray) {
            const dadosDoOutroProcesso = await obterDadosDoProcessoEConteudoDaPeticaoInicial(numeroDoOutroProcesso)
            const outraPeticaoInicial = localizarAPeticaoInicial(dadosDoOutroProcesso)
            if (peticaoInicial?.conteudo && outraPeticaoInicial?.conteudo)
                setSimilaridadeDePeticaoInicial({ ...similaridadeDePeticaoInicial, [numeroDoOutroProcesso]: strcomp.cosine.similarity(peticaoInicial?.conteudo, outraPeticaoInicial?.conteudo) })
            setProcessos((processos) => [...processos, dadosDoOutroProcesso])
        }


    }

    return (
        <div className="mb-3">
            <h2 className="mt-3">Avaliação de Litigância Abusiva</h2>
            <PromptConfig kind="litigancia-predatoria" setPromptConfig={setPromptConfig} />
            <div className="row mb-3 mt-3">
                <div className="col">
                    <div className="form-group">
                        <label>Número do Principal Processo Suspeito</label>
                        <input type="text" id="key" name="key" placeholder="" autoFocus={true} className="form-control" onChange={(e: React.ChangeEvent<HTMLInputElement>) => numeroDoProcessoChanged(e.target.value.replace(/\D/g, ""))} value={numeroDoProcesso} autoComplete='' />
                    </div>
                </div>
            </div>
            <div className="form-group"><label>Números de Outros Processos Suspeitos</label></div>
            <div className="alert alert-secondary mb-1 p-0">
                <textarea className="form-control" value={outrosNumerosDeProcessos} onChange={(e) => outrosNumerosDeProcessosChanged(preprocessInput(e.target.value))} />
            </div>
            {hidden && <>
                <div className="text-muted">Informe o número do processo suspeito, a lista de outros processos a serem analisados e clique em &quot;Analisar&quot;.</div>
            </>}
            {hidden && <>
                <Button disabled={!numeroDoProcesso.trim() || !outrosNumerosDeProcessos.trim()} className="mt-3" onClick={() => startAnalysis()}>Analisar</Button>
            </>}
            {!hidden && numeroDoProcesso.trim() && outrosNumerosDeProcessos.trim() && <>
                <h2 className="mt-3">Análise</h2>
                <AiContent
                    definition={getInternalPrompt('litigancia-predatoria')}
                    data={{ textos: [{ descr: 'Petição Inicial', slug: 'peticao-inicial', texto: peticaoInicial }] }}
                    options={{ cacheControl: true }} config={promptConfig} />
            </>}
            {processos && processos.length > 0 && <>
                <h2 className="mt-3">Processos</h2>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Número do Processo</th>
                            <th>Similaridade da Petição Inicial</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processos.map((processo, index) => (
                            <tr key={index}>
                                <td>{processo.numeroDoProcesso}</td>
                                <td>{formatAsPercentage(similaridadeDePeticaoInicial[processo.numeroDoProcesso])}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </>}
        </div>
    )
}