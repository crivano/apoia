'use client'

import { Suspense, useState } from 'react'
import { maiusculasEMinusculas } from '../../../lib/utils/utils'
import { ResumoDePecaLoading } from '@/components/loading'
import { calcSha256 } from '@/lib/utils/hash'
import { DadosDoProcessoType } from '@/lib/proc/process'
import { ContentType, GeneratedContent } from '@/lib/ai/prompt-types'
import AiContent from '@/components/ai-content'
import { EMPTY_FORM_STATE, FormHelper } from '@/lib/ui/form-support'
import { P } from '@/lib/proc/combinacoes'
import Chat from './chat'

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

    const pedidos = Frm.get('pedidos')
    if (request.produto === P.PEDIDOS && pedidos) {
        const tiposDeLiminar = [
            { id: 'NAO', name: 'Não' },
            { id: 'SIM', name: 'Sim' },
        ]
        const tiposDePedido = [
            { id: 'CONDENAR_A_PAGAR', name: 'Condenar a Pagar' },
            { id: 'CONDENAR_A_FAZER', name: 'Condenar a Fazer' },
            { id: 'CONDENAR_A_DEIXAR_DE_FAZER', name: 'Condenar a Deixar de Fazer' },
            { id: 'CONSTITUIR_RELACAO_JURIDICA', name: 'Constituir Relação Jurídica' },
            { id: 'ANULAR_RELACAO_JURIDICA', name: 'Anular Relação Jurídica' },
            { id: 'DECLARAR_EXISTENCIA_DE_FATO', name: 'Declarar Existência de Fato' },
            { id: 'DECLARAR_INEXISTENCIA_DE_FATO', name: 'Declarar Inexistência de Fato' },
        ]
        const tiposDeVerba = [
            { id: 'SALARIO', name: 'Salário' },
            { id: 'DANO_MORAL', name: 'Dano Moral' },
            { id: 'OUTRA', name: 'Outra' },
            { id: 'NENHUMA', name: 'Nenhuma' },
        ]
        const tiposDeJulgamento = [
            { id: '', name: '' },
            { id: 'PROCEDENTE', name: 'Procedente' },
            { id: 'IMPROCEDENTE', name: 'Improcedente' },
        ]

        const todosForamJulgados = pedidos.every(p => p.julgamento)
        if (todosForamJulgados) {
            return <>
                <h2>{maiusculasEMinusculas(request.title)}</h2>
                <div className="mb-4">
                    <div className="alert alert-success pt-4 pb-2">
                        <ol>
                            {pedidos.map((pedido, i) =>
                                <li className="mb-1" key={i}>
                                    <span>{pedido.liminar === 'SIM' ? <span><b><u>Liminar</u></b> - </span> : ''}</span>
                                    <span>{tiposDePedido.find(o => o.id === pedido.tipoDePedido)?.name} - </span>
                                    {pedido.verba !== 'NENHUMA' && <>
                                        <span>{tiposDeVerba.find(o => o.id === pedido.verba)?.name} - </span>
                                        <span>{pedido.valor} - </span></>}
                                    <span>{pedido.texto}</span>
                                    <span> <b>{tiposDeJulgamento.find(o => o.id === pedido.julgamento)?.name}</b></span>
                                    {pedido.fundamentacao && <span> - {pedido.fundamentacao}</span>}
                                </li>
                            )}
                        </ol>
                    </div>
                </div>
            </>
        }

        return <>
            <h2>{maiusculasEMinusculas(request.title)}</h2>
            {pedidos.map((pedido, i) =>
                <div className="mb-4" key={i}>
                    <div className="alert alert-warning pt-2 pb-3">
                        <div className="row">
                            <Frm.Select label="Liminar" name={`pedidos[${i}].liminar`} options={tiposDeLiminar} width={2} />
                            <Frm.Select label="Tipo de Pedido" name={`pedidos[${i}].tipoDePedido`} options={tiposDePedido} width={2} />
                            <Frm.Select label="Tipo de Verba" name={`pedidos[${i}].verba`} options={tiposDeVerba} width={2} />
                            {Frm.get(`pedidos[${i}].verba`) !== 'NENHUMA' && <Frm.Input label="Valor" name={`pedidos[${i}].valor`} width={2} />}
                            <Frm.TextArea label="Descrição" name={`pedidos[${i}].texto`} width={''} />
                        </div>
                        <div className="row mt-1">
                            <Frm.TextArea label="Fundamentação (opcional)" name={`pedidos[${i}].fundamentacao`} width={''} />
                            <Frm.Select label="Julgamento" name={`pedidos[${i}].julgamento`} options={tiposDeJulgamento} width={2} />
                        </div>
                    </div>
                </div>
            )}
        </>
    } else if (request.produto === P.CHAT) {
        if (Frm.get('pending') > 0) return null
        return <Chat definition={request.internalPrompt} data={request.data} key={calcSha256(request.data)} />
    }

    return <div key={idx}>
        <h2>{maiusculasEMinusculas(request.title)}</h2>
        <Suspense fallback={ResumoDePecaLoading()}>
            <AiContent definition={request.internalPrompt} data={request.data} key={calcSha256(request.data)} onBusy={() => onBusy(Frm, requests, idx)} onReady={(content) => onReady(Frm, requests, idx, content)} />
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


