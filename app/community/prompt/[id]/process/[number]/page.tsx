'use server'

import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { Dao } from '@/lib/db/mysql'
import { Container, Spinner } from 'react-bootstrap'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHomeAlt } from '@fortawesome/free-solid-svg-icons'
import ProcessTitle from '@/app/process/[id]/process-title'
import { CargaDeConteudoEnum, obterDadosDoProcesso2 } from '@/lib/proc/process'
import { assertCurrentUser } from '@/lib/user'
import { IAPrompt } from '@/lib/db/mysql-types'
import { DadosDoProcessoType } from '@/lib/proc/process-types'
import ProcessContents from './process-contents'

async function Breadcrumbs({ params }: { params: { id: string, number: string } }) {
    const prompt = await Dao.retrieveLatestPromptByBaseId(parseInt(params.id))
    return <p><Link href="/community"><FontAwesomeIcon className="me" icon={faHomeAlt} /></Link> / <Link href={`/community/prompt/${prompt.base_id}`}>{prompt.name}</Link> / {params.number}</p>
}

async function Contents({ pPrompt, pDadosDoProcesso }: { pPrompt: Promise<IAPrompt>, pDadosDoProcesso: Promise<DadosDoProcessoType> }) {
    const prompt = await pPrompt
    if (!prompt) throw new Error('Prompt not found')
    const dadosDoProcesso = await pDadosDoProcesso
    if (!dadosDoProcesso) throw new Error('Dados do processo not found')
    return <ProcessContents prompt={prompt} dadosDoProcesso={dadosDoProcesso} />
}

export default async function Home({ params }: { params: { id: string, number: string } }) {
    noStore()
    const pUser = assertCurrentUser()

    const id = parseInt(params.id)
    const pPrompt = Dao.retrieveLatestPromptByBaseId(id)

    const number = params.number
    const pDadosDoProcesso = obterDadosDoProcesso2({ numeroDoProcesso: params.number, pUser, conteudoDasPecasSelecionadas: CargaDeConteudoEnum.NAO })


    return (<Container className="mt-3" fluid={false}>
        <Suspense fallback={<div className="text-center"><Spinner variant='secondary' /></div>} ><Breadcrumbs params={params} /></Suspense>
        <div id="printDiv">
            <ProcessTitle id={number} />
            <Suspense fallback={''}><Contents pPrompt={pPrompt} pDadosDoProcesso={pDadosDoProcesso} /></Suspense>
        </div>
    </Container>)
}