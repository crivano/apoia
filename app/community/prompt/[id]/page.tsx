'use server'

import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { Dao } from '@/lib/db/mysql'
import { formatDate, maiusculasEMinusculas } from '@/lib/utils/utils'
import TablePlaceholder from '@/components/table-placeholder'
import TableRecords from '@/components/table-records'
import { Button, Container } from 'react-bootstrap'
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import Link from 'next/link'
import { headers } from "next/headers";
import ProcessNumberForm from './process-number-form'
import PromptConfig from '@/components/prompt-config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHomeAlt } from '@fortawesome/free-solid-svg-icons'
import { IAPrompt } from '@/lib/db/mysql-types'
import TargetText from './target-text'


async function Breadcrumbs({ pPrompt }: { pPrompt: Promise<IAPrompt> }) {
    const prompt = await pPrompt
    return <p><Link href="/community"><FontAwesomeIcon className="me" icon={faHomeAlt} /></Link> / {prompt.name}</p>
}

async function Contents({ pPrompt }: { pPrompt: Promise<IAPrompt> }) {
    const prompt = await pPrompt
    if (prompt.content.target === 'PROCESSO')
        return <ProcessNumberForm id={`${prompt.base_id}`} />
    if (prompt.content.target === 'TEXTO')
        return <TargetText prompt={prompt} />
    return ''
}

export default async function Home({ params }: { params: { id: string } }) {
    noStore()
    const pPrompt = Dao.retrieveLatestPromptByBaseId(parseInt(params.id))

    return (<Container className="mt-3" fluid={false}>
        <Suspense fallback={<TablePlaceholder />} ><Breadcrumbs pPrompt={pPrompt} /></Suspense>
        <Suspense fallback={<TablePlaceholder />} ><Contents pPrompt={pPrompt} /></Suspense>
    </Container>)
}