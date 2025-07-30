'use client'

import { Suspense, useState } from 'react'
import { maiusculasEMinusculas } from '../../../lib/utils/utils'
import { ResumoDePecaLoading } from '@/components/loading'
import { calcSha256 } from '@/lib/utils/hash'
import { ContentType, GeneratedContent } from '@/lib/ai/prompt-types'
import AiContent from '@/components/ai-content'
import { EMPTY_FORM_STATE, FormHelper } from '@/lib/ui/form-support'
import { P } from '@/lib/proc/combinacoes'
import Chat from './chat'
import { DadosDoProcessoType } from '@/lib/proc/process-types'
import { Pedidos } from './pedidos'
import { PedidosFundamentacoesEDispositivos } from './pedidos-fundamentacoes-e-dispositivos'
import AiTitle from '@/components/ai-title'
import { InformationExtractionForm } from '@/components/InformationExtractionForm'
import { format } from '@/lib/ai/format'
import { preprocess } from '@/lib/ui/preprocess'
import { isInformationExtractionPrompt } from '@/lib/ai/auto-json'

const Frm = new FormHelper(true)

const onBusy = (Frm: FormHelper, requests: GeneratedContent[], idx: number) => {
    Frm.set('pending', Frm.get('pending') + 1)
}

const onReady = (Frm: FormHelper, requests: GeneratedContent[], idx: number, content: ContentType) => {
    const request = requests[idx]
    Frm.set('pending', Frm.get('pending') - 1)
    // console.log('onReady', idx, request.produto, content)

    // Frm.set(`flow.ready[${idx}]`, content)
    if (requests[idx].produto === P.PEDIDOS && content.json) {
        Frm.set('pedidos', content.json.pedidos)
    }
    if (requests[idx].produto === P.PEDIDOS_FUNDAMENTACOES_E_DISPOSITIVOS && content.json) {
        Frm.set('pedidos', content.json.pedidos)
    }
    if (content.json && isInformationExtractionPrompt(requests[idx].internalPrompt?.prompt)) {
        Frm.set('information_extraction', content.json)
    }
}

function requestSlot(Frm: FormHelper, requests: GeneratedContent[], idx: number) {
    const request = requests[idx]

    // console.log('requestSlot', Frm.data, requests, idx, Frm.get('pedidos_fundamentacoes_e_dispositivos'))

    const pedidos = Frm.get('pedidos')
    const information_extraction = Frm.get('information_extraction')
    if (request.produto === P.PEDIDOS && pedidos) {
        return <Pedidos pedidos={pedidos} request={request} Frm={Frm} key={idx} />
    } else if (request.produto === P.PEDIDOS_FUNDAMENTACOES_E_DISPOSITIVOS && pedidos) {
        return <PedidosFundamentacoesEDispositivos pedidos={pedidos} request={request} Frm={Frm} key={idx} />
    } else if (isInformationExtractionPrompt(request.internalPrompt?.prompt) && information_extraction) {
        // console.log('requestSlot: information_extraction', request.internalPrompt?.prompt, information_extraction)
        return <div key={idx}>
            <AiTitle request={request} />
            <InformationExtractionForm promptMarkdown={request.internalPrompt.prompt} promptFormat={request.internalPrompt.format} Frm={Frm} />
        </div>
    } else if (request.produto === P.CHAT) {
        if (Frm.get('pending') > 0) return null
        return <Chat definition={request.internalPrompt} data={request.data} key={calcSha256(request.data)} />
    }

    return <div key={idx}>
        <AiTitle request={request} />
        <Suspense fallback={ResumoDePecaLoading()}>
            <AiContent definition={request.internalPrompt} data={request.data} key={`prompt: ${request.promptSlug}, data: ${calcSha256(request.data)}`} onBusy={() => onBusy(Frm, requests, idx)} onReady={(content) => onReady(Frm, requests, idx, content)} />
        </Suspense>
    </div>
}

export const ListaDeProdutos = ({ dadosDoProcesso, requests }: { dadosDoProcesso: DadosDoProcessoType, requests: GeneratedContent[] }) => {
    const [data, setData] = useState({ pending: 0 } as any)

    if (!dadosDoProcesso || dadosDoProcesso.errorMsg) return ''

    const tipoDeSintese = dadosDoProcesso.tipoDeSintese
    const produtos = dadosDoProcesso.produtos
    if (!tipoDeSintese || !produtos || produtos.length === 0) return ''


    Frm.update(data, setData, EMPTY_FORM_STATE)

    return <>{requests.map((request, idx) => {
        return requestSlot(Frm, requests, idx)
    })}

        {/* <p>{JSON.stringify(data)}</p> */}
    </>
}


