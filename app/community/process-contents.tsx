'use client'

import { IAPrompt, IAPromptList, PromptChainType } from "@/lib/db/mysql-types";
import { DadosDoProcessoType, PecaType } from "@/lib/proc/process-types";
import { ReactNode, useEffect, useState } from "react";
import { InfoDeProduto, P, PieceStrategy, selecionarPecasPorPadrao, T } from "@/lib/proc/combinacoes";
import { GeneratedContent, PromptDataType, PromptDefinitionType, TextoType } from "@/lib/ai/prompt-types";
import { joinReactElementsWithAnd, joinWithAnd, slugify } from "@/lib/utils/utils";
import { getInternalPrompt } from "@/lib/ai/prompt";
import { ProgressBar } from "react-bootstrap";
import Print from "@/components/slots/print";
import Subtitulo from "../../components/slots/subtitulo";
import ChoosePieces from "./choose-pieces";
import ErrorMsg from "./error-msg";
import { ListaDeProdutos } from "../../components/slots/lista-produtos-client";
import { PromptParaCopiar } from "./prompt-to-copy";

export default function ProcessContents({ prompt, prompts, dadosDoProcesso, pieceContent, setPieceContent, apiKeyProvided, model, children }: { prompt: IAPrompt, prompts?: IAPromptList[], dadosDoProcesso: DadosDoProcessoType, pieceContent: any, setPieceContent: (pieceContent: any) => void, apiKeyProvided: boolean, model?: string, children?: ReactNode }) {
    const [selectedPieces, setSelectedPieces] = useState<PecaType[]>([])
    const [chainSelectedPieces, setChainSelectedPieces] = useState<{[promptId: string]: PecaType[]}>({})
    const [loadingPiecesProgress, setLoadingPiecesProgress] = useState(-1)
    const [requests, setRequests] = useState<GeneratedContent[]>([])
    const [readyToStartAI, setReadyToStartAI] = useState(false)
    const [choosingPieces, setChoosingPieces] = useState(false)
    const [choosingChainPieces, setChoosingChainPieces] = useState<string | null>(null)
    const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(false)
    const [predecessorPrompts, setPredecessorPrompts] = useState<{ identifier: string | number, prompt: IAPromptList }[]>([])
    const [successorPrompts, setSuccessorPrompts] = useState<{ identifier: string | number, prompt: IAPromptList }[]>([])
    const [promptResults, setPromptResults] = useState<{[key: string]: any}>({});

    const changeSelectedPieces = (pieces: string[]) => {
        setSelectedPieces(dadosDoProcesso.pecas.filter(p => pieces.includes(p.id)))
    }

    const changeChainSelectedPieces = (promptId: string, pieces: string[]) => {
        setChainSelectedPieces(prev => ({
            ...prev,
            [promptId]: dadosDoProcesso.pecas.filter(p => pieces.includes(p.id))
        }))
    }

    const getPromptFromChain = async (chainItem: { type: PromptChainType, identifier: string | number }): Promise<IAPromptList | null> => {
        if (chainItem.type === PromptChainType.BANCO_DE_PROMPTS) {
            // Buscar do banco de prompts
            return prompts?.find(p => p.id === chainItem.identifier) || null
        } else {
            // Buscar prompt interno - implementar conforme necessário
            return null
        }
    }

    const evaluateCondition = (condition: { variable: string, value: string | boolean }, contextData: any): boolean => {
        // Implementar lógica de avaliação de condições
        // Por enquanto, retorna true. A lógica real dependeria do contexto dos dados gerados
        if (condition.variable.startsWith('Lo_')) {
            // Variáveis booleanas
            return contextData[condition.variable] === condition.value
        } else if (condition.variable.startsWith('Tx_')) {
            // Variáveis de texto
            return contextData[condition.variable] === condition.value
        }
        return true
    }

    const nivelDeSigiloPermitido = (nivel: string, descrDaPeca?) => {
        const nivelMax = 0
        const n = parseInt(nivel)
        return n <= nivelMax
    }

    const chooseSelectedPieces = (allPieces: PecaType[], pieceStrategy: string, pieceDescr: string[]) => {
        const pattern = PieceStrategy[pieceStrategy].pattern
        if (pattern) {
            const pecasAcessiveis = allPieces.filter(p => nivelDeSigiloPermitido(p.sigilo))
            return selecionarPecasPorPadrao(pecasAcessiveis, pattern) || []
        }
        const validDescrs = pieceDescr.map(d => T[d] || d)
        return allPieces.filter(p => validDescrs.includes(p.descr))
    }

    const getSelectedPiecesContents = async () => {
        const startTime = new Date()
        if (selectedPieces.length === 0) return
        const cache = pieceContent
        const loading = {}
        const contents = {}
        for (const peca of selectedPieces) {
            if (cache[peca.id])
                contents[peca.id] = cache[peca.id]
            else
                loading[peca.id] = fetch(`/api/v1/process/${dadosDoProcesso.numeroDoProcesso}/piece/${peca.id}/content`)
        }
        for (const id in loading) {
            setLoadingPiecesProgress(Object.keys(contents).length)
            const resp = await loading[id]
            if (!resp.ok) {
                contents[id] = `Erro ao carregar conteúdo da peça ${id}`
                continue
            }
            const json = await resp.json()
            if (json.errormsg)
                contents[id] = json.errormsg
            else
                contents[id] = json.content
        }
        setPieceContent(contents)
        setLoadingPiecesProgress(-1)

        const minimumTime = 1500
        const elapsedTime = new Date().getTime() - startTime.getTime()
        if (!minimumTimeElapsed && elapsedTime < minimumTime) {
            await new Promise(resolve => setTimeout(resolve, minimumTime - elapsedTime))
        }
        if (!minimumTimeElapsed)
            setMinimumTimeElapsed(true)
        
        const newRequests = await buildRequests(contents)
        setRequests(newRequests)
    }

    const LoadingPieces = () => {
        if (loadingPiecesProgress === -1 || selectedPieces.length === 0) return null
        return <>Carregando Peças...<ProgressBar variant="primary" striped={true} now={loadingPiecesProgress / selectedPieces.length * 100} label={`${loadingPiecesProgress}/${selectedPieces.length}`} /></>
        return <div className="alert alert-info mt-4">{`Carregando peça ${loadingPiecesProgress} de ${selectedPieces.length}`}</div>
    }

    const buildRequests = async (contents: { [key: number]: string }): Promise<GeneratedContent[]> => {
        const requestArray: GeneratedContent[] = []
        
        // Adicionar predecessores
        if (prompt.content.predecessors && prompt.content.predecessors.length > 0) {
            for (const predecessor of prompt.content.predecessors) {
                const predecessorPrompt = await getPromptFromChain(predecessor)
                if (predecessorPrompt) {
                    const predecessorPieces = chainSelectedPieces[`predecessor-${predecessor.identifier}`] || selectedPieces
                    const pecasComConteudo: TextoType[] = predecessorPieces.map(peca => ({ 
                        id: peca.id, 
                        event: peca.numeroDoEvento, 
                        idOrigem: peca.idOrigem, 
                        label: peca.rotulo, 
                        descr: peca.descr, 
                        slug: slugify(peca.descr), 
                        texto: contents[peca.id] 
                    }))

                    const definition: PromptDefinitionType = {
                        kind: `prompt-${predecessorPrompt.id}`,
                        prompt: predecessorPrompt.content.prompt,
                        systemPrompt: predecessorPrompt.content.system_prompt,
                        jsonSchema: predecessorPrompt.content.json_schema,
                        format: predecessorPrompt.content.format,
                        template: predecessorPrompt.content.template,
                        cacheControl: true,
                    }
                    
                    const req: GeneratedContent = {
                        documentCode: null,
                        documentDescr: null,
                        data: { textos: pecasComConteudo },
                        produto: P.RESUMO,
                        promptSlug: slugify(predecessorPrompt.name),
                        internalPrompt: definition,
                        title: `[Predecessor] ${predecessorPrompt.name}`,
                        plugins: [],
                        chainType: 'predecessor',
                        chainId: `predecessor-${predecessor.identifier}`
                    }
                    requestArray.push(req)
                }
            }
        }

        const pecasComConteudo: TextoType[] = selectedPieces.map(peca => ({ id: peca.id, event: peca.numeroDoEvento, idOrigem: peca.idOrigem, label: peca.rotulo, descr: peca.descr, slug: slugify(peca.descr), texto: contents[peca.id] }))
        let produtos: (InfoDeProduto | P)[] = []
        if (prompt.content.summary === 'SIM') {
            for (const peca of pecasComConteudo) {
                const definition = getInternalPrompt(`resumo-${peca.slug}`)
                const data: PromptDataType = { textos: [peca] }
                requestArray.push({ documentCode: peca.id || null, documentDescr: peca.descr, documentLocation: peca.event, documentLink: `/api/v1/process/${dadosDoProcesso.numeroDoProcesso}/piece/${peca.id}/binary`, data, title: peca.descr, produto: P.RESUMO_PECA, promptSlug: definition.kind, internalPrompt: definition })
            }
        }

        // Prompt principal
        {
            const definition: PromptDefinitionType = {
                kind: `prompt-${prompt.id}`,
                prompt: prompt.content.prompt,
                systemPrompt: prompt.content.system_prompt,
                jsonSchema: prompt.content.json_schema,
                format: prompt.content.format,
                template: prompt.content.template,
                cacheControl: true,
            }
            const req: GeneratedContent = {
                documentCode: null,
                documentDescr: null,
                data: { textos: pecasComConteudo },
                produto: P.RESUMO,
                promptSlug: slugify(prompt.name),
                internalPrompt: definition,
                title: prompt.name,
                plugins: [],
                chainType: 'main'
            }
            requestArray.push(req)
        }

        // Adicionar sucessores (condicionalmente baseado nos resultados)
        if (prompt.content.successors && prompt.content.successors.length > 0) {
            for (const successor of prompt.content.successors) {
                // Avaliar condição se existe
                let shouldIncludeSuccessor = true
                if (successor.condition && successor.condition.variable) {
                    shouldIncludeSuccessor = evaluateCondition(successor.condition, promptResults)
                }

                if (shouldIncludeSuccessor) {
                    const successorPrompt = await getPromptFromChain(successor)
                    if (successorPrompt) {
                        const successorPieces = chainSelectedPieces[`successor-${successor.identifier}`] || selectedPieces
                        const pecasComConteudo: TextoType[] = successorPieces.map(peca => ({ 
                            id: peca.id, 
                            event: peca.numeroDoEvento, 
                            idOrigem: peca.idOrigem, 
                            label: peca.rotulo, 
                            descr: peca.descr, 
                            slug: slugify(peca.descr), 
                            texto: contents[peca.id] 
                        }))

                        const definition: PromptDefinitionType = {
                            kind: `prompt-${successorPrompt.id}`,
                            prompt: successorPrompt.content.prompt,
                            systemPrompt: successorPrompt.content.system_prompt,
                            jsonSchema: successorPrompt.content.json_schema,
                            format: successorPrompt.content.format,
                            template: successorPrompt.content.template,
                            cacheControl: true,
                        }
                        
                        const req: GeneratedContent = {
                            documentCode: null,
                            documentDescr: null,
                            data: { textos: pecasComConteudo },
                            produto: P.RESUMO,
                            promptSlug: slugify(successorPrompt.name),
                            internalPrompt: definition,
                            title: `[Sucessor] ${successorPrompt.name}`,
                            plugins: [],
                            chainType: 'successor',
                            chainId: `successor-${successor.identifier}`,
                            chainCondition: successor.condition
                        }
                        requestArray.push(req)
                    }
                }
            }
        }

        // Chat
        {
            const definition = getInternalPrompt(`chat`)
            const data: PromptDataType = { textos: pecasComConteudo }
            requestArray.push({ documentCode: null, documentDescr: null, data, title: 'Chat', produto: P.CHAT, promptSlug: definition.kind, internalPrompt: definition })
        }

        return requestArray
    }

    useEffect(() => {
        setSelectedPieces(chooseSelectedPieces(dadosDoProcesso.pecas, prompt.content.piece_strategy, prompt.content.piece_descr))
    }, [prompt])

    useEffect(() => {
        // Carregar prompts predecessores
        const loadChainPrompts = async () => {
            if (prompt.content.predecessors && prompt.content.predecessors.length > 0) {
                const predecessors = []
                for (const predecessor of prompt.content.predecessors) {
                    const promptFromChain = await getPromptFromChain(predecessor)
                    if (promptFromChain) {
                        predecessors.push({ identifier: predecessor.identifier, prompt: promptFromChain })
                    }
                }
                setPredecessorPrompts(predecessors)
            }

            if (prompt.content.successors && prompt.content.successors.length > 0) {
                const successors = []
                for (const successor of prompt.content.successors) {
                    const promptFromChain = await getPromptFromChain(successor)
                    if (promptFromChain) {
                        successors.push({ identifier: successor.identifier, prompt: promptFromChain })
                    }
                }
                setSuccessorPrompts(successors)
            }
        }
        
        loadChainPrompts()
    }, [prompt, prompts])

    useEffect(() => {
        setLoadingPiecesProgress(0)
        getSelectedPiecesContents()
    }, [selectedPieces, chainSelectedPieces])

    useEffect(() => {
        if (requests && requests.length && !choosingPieces && !choosingChainPieces && minimumTimeElapsed) {
            setReadyToStartAI(true)
        }
    }, [choosingPieces, choosingChainPieces, requests, minimumTimeElapsed])

    const errorLoadingContent = (id: string): string => {
        if (pieceContent[id] && pieceContent[id].startsWith('Erro ao carregar'))
            return pieceContent[id]
    }

    // Componente para escolher peças de prompts encadeados
    const ChainChoosePieces = ({ chainPrompts, type }: { chainPrompts: { identifier: string | number, prompt: IAPromptList }[], type: 'predecessor' | 'successor' }) => {
        if (!chainPrompts || chainPrompts.length === 0) return null

        return (
            <div className="mt-3">
                <h6 className="text-primary">
                    {type === 'predecessor' ? 'Seleção de Peças para Prompts Predecessores' : 'Seleção de Peças para Prompts Sucessores'}
                </h6>
                <p className="text-muted small">
                    {type === 'predecessor' 
                        ? 'Estes prompts serão executados antes do prompt principal.'
                        : 'Estes prompts serão executados após o prompt principal, baseado nas condições definidas.'
                    }
                </p>
                {chainPrompts.map((item, index) => {
                    const chainId = `${type}-${item.identifier}`
                    const pieces = chainSelectedPieces[chainId] || selectedPieces
                    
                    return (
                        <div key={chainId} className="mb-3 border-start border-primary ps-3">
                            <h6 className="mb-2">{item.prompt.name}</h6>
                            <ChoosePieces 
                                allPieces={dadosDoProcesso.pecas} 
                                selectedPieces={pieces} 
                                onSave={(pieces) => { 
                                    setRequests([])
                                    changeChainSelectedPieces(chainId, pieces)
                                }} 
                                onStartEditing={() => { setChoosingChainPieces(chainId) }} 
                                onEndEditing={() => setChoosingChainPieces(null)} 
                                dossierNumber={dadosDoProcesso.numeroDoProcesso}
                            />
                        </div>
                    )
                })}
            </div>
        )
    }

    return <div>
        <Subtitulo dadosDoProcesso={dadosDoProcesso} />
        {children}
        <ChoosePieces allPieces={dadosDoProcesso.pecas} selectedPieces={selectedPieces} onSave={(pieces) => { setRequests([]); changeSelectedPieces(pieces) }} onStartEditing={() => { setChoosingPieces(true) }} onEndEditing={() => setChoosingPieces(false)} dossierNumber={dadosDoProcesso.numeroDoProcesso} />
        <ChainChoosePieces chainPrompts={predecessorPrompts} type="predecessor" />
        <ChainChoosePieces chainPrompts={successorPrompts} type="successor" />
        <LoadingPieces />
        <ErrorMsg dadosDoProcesso={dadosDoProcesso} />
        <div className="mb-4"></div>
        {readyToStartAI && requests?.length > 0 && (
            apiKeyProvided
                ? <>
                    <ListaDeProdutos dadosDoProcesso={dadosDoProcesso} requests={requests} />
                    <Print numeroDoProcesso={dadosDoProcesso.numeroDoProcesso} />
                </>
                : <PromptParaCopiar dadosDoProcesso={dadosDoProcesso} requests={requests} />
        )
        }
        <hr className="mt-5" />
        <p style={{ textAlign: 'center' }}>Este documento foi gerado pela ApoIA, ferramenta de inteligência artificial desenvolvida exclusivamente para facilitar a triagem de acervo, e não substitui a elaboração de relatório específico em cada processo, a partir da consulta manual aos eventos dos autos. Textos gerados por inteligência artificial podem conter informações imprecisas ou incorretas.</p>
        <p style={{ textAlign: 'center' }}>
            O prompt {`${prompt.name} (${prompt.id})`} utilizou o modelo {model}
            {selectedPieces?.length && <span> e acessou as peças: {joinReactElementsWithAnd(selectedPieces.map(p => <span key={p.id} className={errorLoadingContent(p.id) ? 'text-danger' : ''} title={errorLoadingContent(p.id)}>{`${p.descr?.toLowerCase()} (e.${p.numeroDoEvento})`}</span>))}</span>}
            .</p>
    </div >
}    
