'use client'

import { useState } from 'react'
import AiContent from '../../components/ai-content'
import { Button, Toast } from 'react-bootstrap'
import PromptConfig from '@/components/prompt-config'
import { PromptConfigType, TextoType } from '@/lib/ai/prompt-types'
import { getInternalPrompt, getPiecesWithContent } from '@/lib/ai/prompt'
import fetcher from '@/lib/utils/fetcher'
import { formatBrazilianDate, slugify } from '@/lib/utils/utils'
import { DadosDoProcessoType, PecaType } from '@/lib/proc/process-types'
import { DocumentMatch, matchDocuments, SimilarityType } from '@/lib/utils/documentMatcher'
import { set } from 'zod'
import Print from '../process/[id]/print'

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

const formatSimilarity = (value: number) => {
    if (isNaN(value)) return ''
    if (value === -1) return ''
    const formated = `${(value * 100).toFixed(1)}`
    console.log('value', value, 'formated', formated)
    if (formated === '100.0' && value < 1) return '99.9'
    return formated
}

const fixOutrosNumerosDeProcessos = (outrosNumerosDeProcessos: string, numeroDoProcesso: string): string => {
    const outrosNumerosDeProcessosArray = outrosNumerosDeProcessos.trim().split(',').map(n => n.trim())
    const outrosNumerosDeProcessosValidos = outrosNumerosDeProcessosArray.filter(n => n.length === 20)
    const numerosUnicosDeProcessos = new Set(outrosNumerosDeProcessosValidos);
    if (numerosUnicosDeProcessos.has(numeroDoProcesso)) numerosUnicosDeProcessos.delete(numeroDoProcesso)
    return Array.from(numerosUnicosDeProcessos).join(', ')
}

export default function AbusiveLitigationPage(params: { NAVIGATE_TO_PROCESS_URL?: string }) {
    const NAVIGATE_TO_PROCESS_URL = params.NAVIGATE_TO_PROCESS_URL
    const [outrosNumerosDeProcessos, setOutrosNumerosDeProcessos] = useState('')
    const [numeroDoProcesso, setNumeroDoProcesso] = useState('')
    const [hidden, setHidden] = useState(true)
    const [promptConfig, setPromptConfig] = useState({} as PromptConfigType)
    const [peticaoInicial, setPeticaoInicial] = useState('')
    const [processos, setProcessos] = useState([] as DadosDoProcessoAndControlType[])
    const [similaridade, setSimilaridade] = useState({} as { [key: string]: DocumentMatch[] })
    const [processosMap, setProcessosMap] = useState({} as { [key: string]: DadosDoProcessoAndControlType })
    const [status, setStatus] = useState('')
    const [toast, setToast] = useState('')
    const [tipoDeSimilaridade, setTipoDeSimilaridade] = useState(SimilarityType.JACCARD)
    const [processoPrincipal, setProcessoPrincipal] = useState(undefined as DadosDoProcessoAndControlType)
    const [textos, setTextos] = useState([] as TextoType[])


    const outrosNumerosDeProcessosChanged = (text) => {
        setOutrosNumerosDeProcessos(text)
        setHidden(true)
    }

    const numeroDoProcessoChanged = (text) => {
        setNumeroDoProcesso(text)
        setHidden(true)
    }

    const tipoDeSimilaridadeChanged = (text: SimilarityType) => {
        setTipoDeSimilaridade(text)
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
        return dadosDoProcesso.pecasSelecionadas?.find(p => slugify(p.descr) === 'peticao-inicial')
    }

    const obterDadosDoProcessoEConteudoDaPeticaoInicial = async (numeroDoProcesso: string, procs: DadosDoProcessoAndControlType[], procsMap: { [key: string]: DadosDoProcessoAndControlType }): Promise<DadosDoProcessoAndControlType> => {
        let dadosDoProcesso: DadosDoProcessoAndControlType = procsMap[numeroDoProcesso]
        if (!dadosDoProcesso) {
            dadosDoProcesso = await fetcher.get(`/api/v1/process/${numeroDoProcesso}?kind=LITIGANCIA_PREDATORIA&selectedPiecesContent=true`)
            dadosDoProcesso = {
                ...dadosDoProcesso,
                missingDadosDoProcesso: false,
                missingPeticaoInicial: false,
                numeroDoProcesso,
                ajuizamento: dadosDoProcesso.ajuizamento && new Date(dadosDoProcesso.ajuizamento)
            }
            procsMap[numeroDoProcesso] = dadosDoProcesso
            setProcessosMap({ ...procsMap })
        }

        if (!dadosDoProcesso) {
            procsMap[numeroDoProcesso] = { numeroDoProcesso, pecas: [], pecasSelecionadas: [], missingDadosDoProcesso: true, missingPeticaoInicial: true }
            setProcessosMap({ ...procsMap })
            return procsMap[numeroDoProcesso]
        }

        const peticaoInicialPeca = localizarAPeticaoInicial(dadosDoProcesso)
        const peticaoInicialId = peticaoInicialPeca?.id
        if (!peticaoInicialPeca?.conteudo) {
            dadosDoProcesso.missingPeticaoInicial = true
            if (!dadosDoProcesso.errorMsg) dadosDoProcesso.errorMsg = 'Petição inicial não encontrada.'
        }
        // if (dadosDoProcesso.missingPeticaoInicial !== true) {
        //     if (peticaoInicialPeca && !peticaoInicialPeca.conteudo && peticaoInicialId) {
        //         const peticaoInicialConteudo = await fetcher.get(`/api/v1/process/${numeroDoProcesso}/piece/${peticaoInicialId}/content`)
        //         peticaoInicialPeca.conteudo = peticaoInicialConteudo.content
        //     }
        // }
        setProcessosMap({ ...procsMap })
        return dadosDoProcesso
    }

    const replaceMainProcess = async (numeroDoProcessoPrincipal: string) => {
        if (status) {
            setToast('Aguarde a conclusão antes de realizar a troca de processo principal')
            return
        }
        const n = numeroDoProcesso
        const o = outrosNumerosDeProcessos
        setHidden(true)
        setProcessos([])
        setSimilaridade({})
        setNumeroDoProcesso(numeroDoProcessoPrincipal)
        setOutrosNumerosDeProcessos(fixOutrosNumerosDeProcessos(o + ', ' + n, numeroDoProcessoPrincipal))
    }

    const resetCache = async () => {
        setHidden(true)
        setProcessosMap({})
        setProcessos([])
        setSimilaridade({})
    }

    const startAnalysis = async () => {
        let procs: DadosDoProcessoAndControlType[] = []
        let procsMap: { [key: string]: DadosDoProcessoAndControlType } = processosMap
        const simMap: { [key: string]: DocumentMatch[] } = {}

        setProcessoPrincipal(undefined)
        setProcessos(procs)
        setSimilaridade({})
        setHidden(false)

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

        simMap[dadosDoProcesso.numeroDoProcesso] = matchDocuments(dadosDoProcesso.pecasSelecionadas, dadosDoProcesso.pecasSelecionadas, tipoDeSimilaridade)
        setSimilaridade({ ...simMap })


        // Obter a petição inicial dos outros processos
        const numerosUnicosDeProcessos = fixOutrosNumerosDeProcessos(outrosNumerosDeProcessos, numeroDoProcesso).split(',').map(n => n.trim())
        for (const numeroDoOutroProcesso of numerosUnicosDeProcessos) {
            console.log('numeroDoOutroProcesso', numeroDoOutroProcesso)
            setStatus(`Obtendo dados do processo ${numeroDoOutroProcesso} (${procs.length + 1}/${numerosUnicosDeProcessos.length})...`)
            const dadosDoOutroProcesso = await obterDadosDoProcessoEConteudoDaPeticaoInicial(numeroDoOutroProcesso, procs, procsMap)
            if (!dadosDoOutroProcesso) {
                setStatus(`Processo ${numeroDoOutroProcesso} não encontrado.`)
                procs = [...procs, dadosDoOutroProcesso]
                setProcessos([...procs])
                continue
            }
            simMap[numeroDoOutroProcesso] = matchDocuments(dadosDoProcesso.pecasSelecionadas, dadosDoOutroProcesso.pecasSelecionadas, tipoDeSimilaridade)
            setSimilaridade({ ...simMap })
            procs.push(dadosDoOutroProcesso)
            procs.sort((a, b) => {
                const sa = simMap[a.numeroDoProcesso]
                const sb = simMap[b.numeroDoProcesso]
                if (sa === undefined && sb === undefined) return 0
                if (sa === undefined) return 1
                if (sb === undefined) return -1
                return sb[0].similarity - sa[0].similarity
            })
            setProcessos([...procs])
        }

        setProcessoPrincipal(dadosDoProcesso)
        setTextos(await getPiecesWithContent(dadosDoProcesso, numeroDoProcesso))

        setStatus('')
    }

    const principal: DadosDoProcessoAndControlType = processosMap[numeroDoProcesso]

    return (
        <div id="printDiv" className="mb-3">
            <h2 className="mt-3">Avaliação de Litigância Abusiva</h2>
            <div className="h-print">
                <PromptConfig kind="litigancia-predatoria" setPromptConfig={setPromptConfig} />
                <div className="row mb-3 mt-3">
                    <div className="col col-6">
                        <div className="form-group">
                            <label>Número do Principal Processo Suspeito</label>
                            <input type="text" id="key" name="key" placeholder="" autoFocus={true} className="form-control" onChange={(e: React.ChangeEvent<HTMLInputElement>) => numeroDoProcessoChanged(e.target.value.replace(/\D/g, ""))} value={numeroDoProcesso} autoComplete='' />
                        </div>
                    </div>
                    <div className="col col-6">
                        <div className="form-group">
                            <label>Tipo de Similaridade</label>
                            <select className="form-control" value={tipoDeSimilaridade} onChange={(e) => tipoDeSimilaridadeChanged(e.target.value as SimilarityType)}>
                                {Object.keys(SimilarityType).map((key) => (
                                    <option key={key} value={SimilarityType[key]}>{SimilarityType[key]}</option>
                                ))}
                            </select>
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
                    <Button disabled={!numeroDoProcesso.trim()} className="mt-3" onClick={() => startAnalysis()}>Analisar</Button>
                    <Button disabled={!numeroDoProcesso.trim()} className="mt-3 ms-3" variant='secondary' onClick={() => resetCache()}>Limpar o Cache</Button>
                </>}
                {status && <div className="mt-3 alert alert-warning">{status}</div>}
            </div>
            {!hidden && processos && processos.length > 0 && <>
                <h2 className="mt-3">Processos Analisados</h2>
                <table className="table table-striped table-sm">
                    <thead className="table-dark">
                        <tr>
                            <th className="text-end">#</th>
                            <th>Número do Processo</th>
                            <th className="text-center">Ajuizamento</th>
                            {principal.pecasSelecionadas?.map(p => <th key={p.rotulo} className="text-end">{p.rotulo.toLowerCase()}</th>)}
                            <th className="text-end">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processos.map((processo, index) => (
                            <tr key={index}>
                                <td className="text-end" title="Clique para tornar o principal" style={{ cursor: 'pointer' }} onClick={e => replaceMainProcess(processo.numeroDoProcesso)}>{index + 1}</td>
                                <td>{NAVIGATE_TO_PROCESS_URL ? (<a href={NAVIGATE_TO_PROCESS_URL.replace('{numero}', processo.numeroDoProcesso)} style={{ color: 'rgb(33, 37, 41)', textDecoration: 'none' }} target="_blank" title="Clique para visualizar o processo">{processo.numeroDoProcesso}</a>) : processo.numeroDoProcesso}</td>
                                <td className="text-center">{formatBrazilianDate(processo.ajuizamento)}</td>
                                {principal.pecasSelecionadas?.map((p, index) => <td key={p.rotulo} className="text-end">{formatSimilarity(similaridade[processo.numeroDoProcesso][index].similarity)}</td>)}
                                <td className="text-end">{processo.errorMsg?.split(' - Error:')[0]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </>}

            {!hidden && processoPrincipal && textos && <>
                <h2 className="mt-3">Análise Qualitativa</h2>
                <AiContent key={numeroDoProcesso + outrosNumerosDeProcessos}
                    definition={getInternalPrompt('litigancia-predatoria')}
                    data={{ textos }}
                    options={{ cacheControl: true }} config={promptConfig} />
            </>}
            <Toast onClose={() => setToast('')} show={!!toast} delay={3000} bg="danger" autohide key={toast} style={{ position: 'fixed', top: 10, right: 10 }}>
                <Toast.Header>
                    <strong className="me-auto">Erro</strong>
                </Toast.Header>
                <Toast.Body>{toast}</Toast.Body>
            </Toast>
            <Print numeroDoProcesso={numeroDoProcesso} />
        </div>
    )
}