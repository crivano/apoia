import { unstable_noStore as noStore } from 'next/cache'
import { Suspense } from 'react'
import { assertCurrentUser } from '../../../lib/user'
import { ListaDeProdutos } from './lista-produtos'
import { ProdutoLoading } from '@/components/loading'
import { obterDadosDoProcesso } from '../../../lib/mni'
import PrintServerContents from './print-server-contents'
import ErrorMsg from './error-msg'
import Subtitulo, { SubtituloLoading } from './subtitulo'

export const maxDuration = 60 // seconds
export const dynamic = 'force-dynamic'

export default async function ShowProcess(params) {
    noStore()

    const pUser = assertCurrentUser()

    const id = (params?.id?.toString() || '').replace(/[^0-9]/g, '')

    const pDadosDoProcesso = obterDadosDoProcesso(id, pUser)

    return (
        <div className="row juia main-show-row mb-3">
            <div className="col col-12 main-view">
                <Suspense fallback={SubtituloLoading()}>
                    <Subtitulo pDadosDoProcesso={pDadosDoProcesso} />
                </Suspense>
                <Suspense fallback=''>
                    <ErrorMsg pDadosDoProcesso={pDadosDoProcesso} />
                </Suspense>
                <Suspense fallback={<>{ProdutoLoading()}{ProdutoLoading()}{ProdutoLoading()}</>}>
                    <ListaDeProdutos pDadosDoProcesso={pDadosDoProcesso} />
                </Suspense>
                <Suspense fallback=''>
                    <PrintServerContents pDadosDoProcesso={pDadosDoProcesso} numeroDoProcesso={id} />
                </Suspense>
                <hr className="mt-5" />
                <p style={{ textAlign: 'center' }}>Este documento foi gerado pela ApoIA, ferramenta de inteligência artificial desenvolvida exclusivamente para facilitar a triagem de acervo, e não substitui a elaboração de relatório específico em cada processo, a partir da consulta manual aos eventos dos autos. Textos gerados por inteligência artificial podem conter informações imprecisas ou incorretas.</p>
            </div>
        </div>
    )
}