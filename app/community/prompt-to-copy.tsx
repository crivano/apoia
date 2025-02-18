'use client'

import { Suspense, useState } from 'react'
import { maiusculasEMinusculas } from '@/lib/utils/utils'
import { ResumoDePecaLoading } from '@/components/loading'
import { calcSha256 } from '@/lib/utils/hash'
import { ContentType, GeneratedContent, PromptDefinitionType } from '@/lib/ai/prompt-types'
import AiContent from '@/components/ai-content'
import { EMPTY_FORM_STATE, FormHelper } from '@/lib/ui/form-support'
import { P } from '@/lib/proc/combinacoes'
import Chat from './chat'
import { DadosDoProcessoType } from '@/lib/proc/process-types'
import { IAPromptList } from '@/lib/db/mysql-types'
import { promptExecuteBuilder } from '@/lib/ai/prompt'

const Frm = new FormHelper(true)

const onBusy = (Frm: FormHelper, requests: GeneratedContent[], idx: number) => {
    Frm.set('pending', Frm.get('pending') + 1)
}

const onReady = (Frm: FormHelper, requests: GeneratedContent[], idx: number, content: ContentType) => {
    const request = requests[idx]
    Frm.set('pending', Frm.get('pending') - 1)

    // Frm.set(`flow.ready[${idx}]`, content)
    if (requests[idx].produto === P.PEDIDOS && content.json) {
        Frm.set('pedidos', content.json.pedidos)
    }
}

function requestSlot(Frm: FormHelper, requests: GeneratedContent[], idx: number) {
    const request = requests[idx]
    return <div key={idx}>
        <h2>{maiusculasEMinusculas(request.title)}</h2>
        <Suspense fallback={ResumoDePecaLoading()}>
            <AiContent definition={request.internalPrompt} data={request.data} key={`prompt: ${request.promptSlug} data: ${calcSha256(request.data)}`} onBusy={() => onBusy(Frm, requests, idx)} onReady={(content) => onReady(Frm, requests, idx, content)} />
        </Suspense>
    </div>
}

export const PromptParaCopiar = ({ dadosDoProcesso, requests }: { dadosDoProcesso: DadosDoProcessoType, requests: GeneratedContent[] }) => {
    if (!dadosDoProcesso || dadosDoProcesso.errorMsg) return ''

    const request = requests[requests.length - 2]
    const prompt: PromptDefinitionType = request.internalPrompt

    const exec = promptExecuteBuilder(prompt, request.data)

    const s: string = exec.message.map(m => m.role === 'system' ? `# PROMPT DE SISTEMA\n\n${m.content}\n\n# PROMPT` : m.content).join('\n\n')

    navigator.clipboard.writeText(s)

    return <>
        <p className="alert alert-warning text-center">Prompt copiado para a área de transferência, já com o conteúdo das peças relevantes!</p>
        <h2>{maiusculasEMinusculas(request.title)}</h2>
        <textarea name="prompt" className="form-control" rows={20}>{s}</textarea>
    </>
}


