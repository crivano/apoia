import { Container } from 'react-bootstrap'
import PromptForm from '../prompt-form'
import { Dao } from '@/lib/db/mysql'
import { assertCurrentUser } from '@/lib/user'
import { maiusculasEMinusculas } from '@/lib/utils/utils'
import { Instance, Matter, Scope } from '@/lib/proc/process-types'

export default async function New({ params, searchParams }: { params: { kind: string }, searchParams: { copyFrom: string } }) {
    const { kind } = params
    const user = await assertCurrentUser()
    const author = maiusculasEMinusculas(user.name)
    const emptyRecord = {
        share: "PRIVADO",
        content: {
            scope: Object.keys(Scope),
            author,
            instance: Object.keys(Instance),
            matter: Object.keys(Matter),
            target: "PROCESSO",
            editor_label: "Texto",
            piece_strategy: "MAIS_RELEVANTES",
            piece_descr: [],
            summary: "SIM",
        }
    }

    let record: any = emptyRecord
    const copyFromId = searchParams.copyFrom
    if (copyFromId) {
        record = await Dao.retrievePromptById(parseInt(copyFromId))
        record.share = "PRIVADO"
        if (!record) throw new Error('Prompt not found')
        const newName = record.name.replace(/\((\d+)\)$/, (_, n) => `(${Number(n) + 1})`)
        record.name = record.name === newName ? record.name + ' (1)' : newName
        record.content.author = author
        record.base_id = undefined
    }

    return (<Container fluid={false}>
        <h1 className="mt-5 mb-3">Novo Prompt</h1>
        <PromptForm record={record} />
    </Container>)
}