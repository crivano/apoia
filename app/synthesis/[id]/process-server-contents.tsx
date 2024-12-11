import { unstable_noStore as noStore } from 'next/cache'
import { Suspense } from 'react'
import { assertCurrentUser } from '@/lib/user'
// import { ListaDeProdutos } from './lista-produtos'
import { ProdutoLoading } from '@/components/loading'
import { obterDadosDoProcesso } from '@/lib/proc/process'
import PrintServerContents from './print-server-contents'
import ErrorMsg from './error-msg'
import Subtitulo, { SubtituloLoading } from './subtitulo'
import ChoosePieces from './choose-pieces'
import { ListaDeProdutos } from './lista-produtos'

export const maxDuration = 60 // seconds
export const dynamic = 'force-dynamic'

export async function ChoosePiecesServer({ pDadosDoProcesso }) {
    const dadosDoProcesso = await pDadosDoProcesso
    // console.log('dadosDoProcesso', dadosDoProcesso)
    if (!dadosDoProcesso || dadosDoProcesso.errorMsg)
        return ''

    return <ChoosePieces dadosDoProcesso={dadosDoProcesso} />
}

export default async function ShowProcess({id, kind, pieces}) {
    noStore()

    const pUser = assertCurrentUser()

    id = (id?.toString() || '').replace(/[^0-9]/g, '')

    const pDadosDoProcesso = obterDadosDoProcesso({numeroDoProcesso: id, pUser, kind, pieces})

    return (
        <div className="row juia main-show-row mb-3">
            <div className="col col-12 main-view">
                <Suspense fallback={SubtituloLoading()}>
                    <Subtitulo pDadosDoProcesso={pDadosDoProcesso} />
                </Suspense>
                <Suspense fallback=''>
                    <ErrorMsg pDadosDoProcesso={pDadosDoProcesso} />
                </Suspense>
                <Suspense fallback=''>
                    <ChoosePiecesServer pDadosDoProcesso={ pDadosDoProcesso} />
                </Suspense>
                <Suspense fallback={<>{ProdutoLoading()}{ProdutoLoading()}{ProdutoLoading()}</>}>
                    <ListaDeProdutos pDadosDoProcesso={pDadosDoProcesso} kind={kind} pieces={pieces} />
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