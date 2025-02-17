'use client'

import { IAPrompt } from "@/lib/db/mysql-types";
import { DadosDoProcessoType, PecaType } from "@/lib/proc/process-types";
import { ReactNode, useEffect, useState } from "react";
import { InfoDeProduto, P, PieceStrategy, selecionarPecasPorPadrao } from "@/lib/proc/combinacoes";
import { GeneratedContent, PromptDataType, PromptDefinitionType, TextoType } from "@/lib/ai/prompt-types";
import { slugify } from "@/lib/utils/utils";
import { getInternalPrompt } from "@/lib/ai/prompt";
import { ProgressBar } from "react-bootstrap";
import Print from "@/app/process/[id]/print";
import Subtitulo from "./subtitulo";
import ChoosePieces from "./choose-pieces";
import ErrorMsg from "./error-msg";
import { ListaDeProdutos } from "./lista-produtos-client";

export default function ProcessContents({ prompt, dadosDoProcesso, pieceContent, setPieceContent, children }: { prompt: IAPrompt, dadosDoProcesso: DadosDoProcessoType, pieceContent: any, setPieceContent: (pieceContent: any) => void, children?: ReactNode }) {
    const [selectedPieces, setSelectedPieces] = useState<PecaType[]>([])
    const [loadingPiecesProgress, setLoadingPiecesProgress] = useState(-1)
    const [requests, setRequests] = useState<GeneratedContent[]>([])
    const [readyToStartAI, setReadyToStartAI] = useState(false)

    const changeSelectedPieces = (pieces: string[]) => {
        setSelectedPieces(dadosDoProcesso.pecas.filter(p => pieces.includes(p.id)))
    }

    const nivelDeSigiloPermitido = (nivel: string, descrDaPeca?) => {
        const nivelMax = 0
        const n = parseInt(nivel)
        return n <= nivelMax
    }

    const chooseSelectedPieces = (allPieces: PecaType[], pieceStrategy: string, pieceDescr: string[]) => {
        console.log('pieceStrategy2', PieceStrategy)
        const pattern = PieceStrategy[pieceStrategy].pattern
        if (pattern) {
            const pecasAcessiveis = allPieces.filter(p => nivelDeSigiloPermitido(p.sigilo))
            return selecionarPecasPorPadrao(pecasAcessiveis, pattern) || []
        }
        return allPieces.filter(p => pieceDescr.includes(p.descr))
    }

    const getSelectedPiecesContents = async () => {
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
        setRequests(buildRequests(contents))
        setReadyToStartAI(true)
    }

    const LoadingPieces = () => {
        if (loadingPiecesProgress === -1 || selectedPieces.length === 0) return null
        return <>Carregando Peças...<ProgressBar variant="primary" striped={true} now={loadingPiecesProgress / selectedPieces.length * 100} label={`${loadingPiecesProgress}/${selectedPieces.length}`} /></>
        return <div className="alert alert-info mt-4">{`Carregando peça ${loadingPiecesProgress} de ${selectedPieces.length}`}</div>
    }

    const buildRequests = (contents: { [key: number]: string }): GeneratedContent[] => {
        const requestArray: GeneratedContent[] = []
        const pecasComConteudo: TextoType[] = selectedPieces.map(peca => ({ id: peca.id, event: peca.numeroDoEvento, label: peca.rotulo, descr: peca.descr, slug: slugify(peca.descr), texto: contents[peca.id] }))
        let produtos: (InfoDeProduto | P)[] = []
        if (prompt.content.summary === 'TODAS') {
            for (const peca of pecasComConteudo) {
                const definition = getInternalPrompt(`resumo-${peca.slug}`)
                const data: PromptDataType = { textos: [peca] }
                requestArray.push({ documentCode: peca.id || null, documentDescr: peca.descr, data, title: peca.descr, produto: P.RESUMO_PECA, promptSlug: definition.kind, internalPrompt: definition })
            }
        }

        {
            const definition: PromptDefinitionType = {
                kind: `prompt-${prompt.id}`,
                prompt: prompt.content.prompt,
                systemPrompt: prompt.content.system_prompt,
                jsonSchema: prompt.content.json_schema,
                format: prompt.content.format,
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
                plugins: []
            }
            requestArray.push(req)
        }

        {
            const definition = getInternalPrompt(`chat`)
            const data: PromptDataType = { textos: pecasComConteudo }
            requestArray.push({ documentCode: null, documentDescr: null, data, title: 'Chat', produto: P.CHAT, promptSlug: definition.kind, internalPrompt: definition })
        }

        return requestArray
    }

    useEffect(() => {
        console.log('prompt', prompt)
        setSelectedPieces(chooseSelectedPieces(dadosDoProcesso.pecas, prompt.content.piece_strategy, prompt.content.piece_descr))
    }, [prompt])

    useEffect(() => {
        setLoadingPiecesProgress(0)
        getSelectedPiecesContents()
    }, [selectedPieces])

    return <div>
        <Subtitulo dadosDoProcesso={dadosDoProcesso} />
        {children}
        <ChoosePieces allPieces={dadosDoProcesso.pecas} selectedPieces={selectedPieces} onSave={changeSelectedPieces} />
        <LoadingPieces />
        <ErrorMsg dadosDoProcesso={dadosDoProcesso} />
        <div className="mb-4"></div>
        {readyToStartAI && requests && requests.length && <>
            <ListaDeProdutos dadosDoProcesso={dadosDoProcesso} requests={requests} />
        </>}

        <Print numeroDoProcesso={dadosDoProcesso.numeroDoProcesso} />
        <hr className="mt-5" />
        <p style={{ textAlign: 'center' }}>Este documento foi gerado pela ApoIA, ferramenta de inteligência artificial desenvolvida exclusivamente para facilitar a triagem de acervo, e não substitui a elaboração de relatório específico em cada processo, a partir da consulta manual aos eventos dos autos. Textos gerados por inteligência artificial podem conter informações imprecisas ou incorretas.</p>

    </div>
}    
