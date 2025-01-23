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

type DadosDoProcessoAndControlType =
    DadosDoProcessoType & { missingDadosDoProcesso: boolean, missingPeticaoInicial: boolean }

const preprocessInput = (value: string) => {
    value = value.replaceAll(/(:.*?)$/gm, '')
    value = value.replaceAll('\n\n', '\n').replaceAll('\n', ',').replaceAll(/[^\d,]/g, '').replaceAll(',', ', ')
    return value
}

const extractProcessNumbers = (text: string): string => {
    const regex = /\d{7}\s*-\s*\d{2}\s*\.\s*\d{4}\s*\.\s*\d{1}\s*\.\s*\d{2}\s*\.\s*\d{4}|\d{20}/g;
    const matches = text.match(regex);
    return matches ? matches.map(match => match.replace(/\D/g, '')).join(', ') : '';
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
    const [processos, setProcessos] = useState([] as DadosDoProcessoAndControlType[])
    const [similaridadeDePeticaoInicial, setSimilaridadeDePeticaoInicial] = useState({} as { [key: string]: number })
    const [processosMap, setProcessosMap] = useState({} as { [key: string]: DadosDoProcessoAndControlType })
    const [status, setStatus] = useState('')


    const outrosNumerosDeProcessosChanged = (text) => {
        setOutrosNumerosDeProcessos(text)
        setHidden(true)
    }

    const numeroDoProcessoChanged = (text) => {
        setNumeroDoProcesso(text)
        setHidden(true)
    }

    const handlePaste = (event) => {
        // Prevent the default paste behavior
        event.preventDefault();

        console.log('event', event)

        // Get the pasted text
        const pastedText = event.clipboardData.getData("text");
        // const pastedText = "renato"


        // Preprocess the pasted text (example: trim and convert to uppercase)
        const processedText = extractProcessNumbers(pastedText);
        console.log(processedText)

        // Insert the processed text at the current cursor position
        const { selectionStart, selectionEnd } = event.target;
        const newValue =
            outrosNumerosDeProcessos.substring(0, selectionStart) +
            processedText +
            outrosNumerosDeProcessos.substring(selectionEnd);

        // Update the input value
        setOutrosNumerosDeProcessos(newValue);
    };

    const localizarAPeticaoInicial = (dadosDoProcesso: DadosDoProcessoType): PecaType => {
        return dadosDoProcesso.pecas.find(p => slugify(p.descr) === 'peticao-inicial')
    }

    const obterDadosDoProcessoEConteudoDaPeticaoInicial = async (numeroDoProcesso: string, procs: DadosDoProcessoAndControlType[], procsMap: { [key: string]: DadosDoProcessoAndControlType }): Promise<DadosDoProcessoAndControlType> => {
        let dadosDoProcesso: DadosDoProcessoAndControlType = procsMap[numeroDoProcesso]
        if (!dadosDoProcesso) {
            dadosDoProcesso = await fetcher.get(`/api/v1/process/${numeroDoProcesso}?kind=LITIGANCIA_PREDATORIA`)
            dadosDoProcesso = { ...dadosDoProcesso, missingDadosDoProcesso: false, missingPeticaoInicial: false, numeroDoProcesso }
            procsMap[numeroDoProcesso] = dadosDoProcesso
            setProcessosMap({ ...procsMap })
        }

        if (!dadosDoProcesso) {
            procsMap[numeroDoProcesso] = { numeroDoProcesso, pecas: [], missingDadosDoProcesso: true, missingPeticaoInicial: true }
            setProcessosMap({ ...procsMap })
            return procsMap[numeroDoProcesso]
        }

        const peticaoInicialPeca = localizarAPeticaoInicial(dadosDoProcesso)
        const peticaoInicialId = peticaoInicialPeca?.id
        if (dadosDoProcesso.missingPeticaoInicial !== true) {
            if (peticaoInicialPeca && !peticaoInicialPeca.conteudo && peticaoInicialId) {
                const peticaoInicialConteudo = await fetcher.get(`/api/v1/process/${numeroDoProcesso}/piece/${peticaoInicialId}/content`)
                peticaoInicialPeca.conteudo = peticaoInicialConteudo.content
            }
            if (!peticaoInicialPeca?.conteudo) {
                dadosDoProcesso.missingPeticaoInicial = true
                if (!dadosDoProcesso.errorMsg) dadosDoProcesso.errorMsg = 'Petição inicial não encontrada.'
            }
        }
        setProcessosMap({ ...procsMap })
        return dadosDoProcesso
    }

    const resetCache = async () => {
        setProcessosMap({})
        setProcessos([])
        setSimilaridadeDePeticaoInicial({})
    }

    const startAnalysis = async () => {
        let procs: DadosDoProcessoAndControlType[] = []
        let procsMap: { [key: string]: DadosDoProcessoAndControlType } = processosMap
        const simMap: { [key: string]: number } = {}

        setProcessos(procs)
        setSimilaridadeDePeticaoInicial({})

        // Obter a petição inicial do processo principal
        setStatus('Obtendo dados do processo principal...')
        const dadosDoProcesso = await obterDadosDoProcessoEConteudoDaPeticaoInicial(numeroDoProcesso, procs, procsMap)
        if (!dadosDoProcesso) {
            setStatus('Processo principal não encontrado.')
            return
        }
        procs.push(dadosDoProcesso)
        setProcessos([...procs])

        const peticaoInicial = localizarAPeticaoInicial(dadosDoProcesso)
        if (!peticaoInicial) {
            setStatus('Petição inicial não encontrada.')
            return
        }

        simMap[dadosDoProcesso.numeroDoProcesso] = strcomp.cosine.similarity(peticaoInicial.conteudo, peticaoInicial.conteudo)
        setSimilaridadeDePeticaoInicial({ ...simMap })

        // Obter a petição inicial dos outros processos
        const outrosNumerosDeProcessosArray = outrosNumerosDeProcessos.trim().split(',').map(n => n.trim())
        for (const numeroDoOutroProcesso of outrosNumerosDeProcessosArray) {
            console.log('numeroDoOutroProcesso', numeroDoOutroProcesso)
            setStatus(`Obtendo dados do processo ${numeroDoOutroProcesso} (${procs.length + 1}/${outrosNumerosDeProcessosArray.length})...`)
            const dadosDoOutroProcesso = await obterDadosDoProcessoEConteudoDaPeticaoInicial(numeroDoOutroProcesso, procs, procsMap)
            if (!dadosDoOutroProcesso) {
                setStatus(`Processo ${numeroDoOutroProcesso} não encontrado.`)
                procs = [...procs, dadosDoOutroProcesso]
                setProcessos([...procs])
                continue
            }
            const outraPeticaoInicial = localizarAPeticaoInicial(dadosDoOutroProcesso)
            if (peticaoInicial?.conteudo && outraPeticaoInicial?.conteudo)
                simMap[numeroDoOutroProcesso] = strcomp.cosine.similarity(peticaoInicial.conteudo, outraPeticaoInicial.conteudo)
            setSimilaridadeDePeticaoInicial({ ...simMap })
            procs.push(dadosDoOutroProcesso)
            procs.sort((a, b) => {
                const sa = simMap[a.numeroDoProcesso]
                const sb = simMap[b.numeroDoProcesso]
                if (sa === undefined && sb === undefined) return 0
                if (sa === undefined) return 1
                if (sb === undefined) return -1
                return sb - sa
            })
            setProcessos([...procs])
        }
        setStatus('')
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
            <div className="form-group"><label>Outros Números de Processos Suspeitos</label></div>
            <div className="alert alert-secondary mb-1 p-0">
                <textarea className="form-control" value={outrosNumerosDeProcessos} onChange={(e) => outrosNumerosDeProcessosChanged(preprocessInput(e.target.value))}
                    onPaste={handlePaste} />
            </div>
            {hidden && <>
                <div className="text-muted">Informe o número do processo suspeito, a lista de outros processos a serem analisados e clique em &quot;Analisar&quot;.</div>
            </>}
            {hidden && <>
                <Button disabled={!numeroDoProcesso.trim() || !outrosNumerosDeProcessos.trim()} className="mt-3" onClick={() => startAnalysis()}>Analisar</Button>
                <Button disabled={!numeroDoProcesso.trim() || !outrosNumerosDeProcessos.trim()} className="mt-3 ms-3" variant='secondary' onClick={() => resetCache()}>Limpar o Cache</Button>
            </>}
            {status && <div className="mt-3 alert alert-warning">{status}</div>}
            {!hidden && numeroDoProcesso.trim() && outrosNumerosDeProcessos.trim() && <>
                <h2 className="mt-3">Análise</h2>
                <AiContent
                    definition={getInternalPrompt('litigancia-predatoria')}
                    data={{ textos: [{ descr: 'Petição Inicial', slug: 'peticao-inicial', texto: peticaoInicial }] }}
                    options={{ cacheControl: true }} config={promptConfig} />
            </>}
            {processos && processos.length > 0 && <>
                <h2 className="mt-3">Processos</h2>
                <table className="table table-striped table-sm">
                    <thead className="table-dark">
                        <tr>
                            <th>Número do Processo</th>
                            <th className="text-end">Similaridade da<br/>Petição Inicial</th>
                            <th className="text-end">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processos.map((processo, index) => (
                            <tr key={index}>
                                <td>{processo.numeroDoProcesso}</td>
                                <td className="text-end">{formatAsPercentage(similaridadeDePeticaoInicial[processo.numeroDoProcesso])}</td>
                                <td className="text-end">{processo.errorMsg?.split(' - Error:')[0]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </>}
            {/* <div>{JSON.stringify(Object.keys(processosMap))}</div>
            <div>{JSON.stringify(Object.keys(similaridadeDePeticaoInicial))}</div>
            <div>{JSON.stringify(similaridadeDePeticaoInicial)}</div>
            <div>{JSON.stringify(processos)}</div> */}

        </div>
    )
}