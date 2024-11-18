import { Container } from 'react-bootstrap'
import PromptForm from '../../../prompt-form'
import { Dao } from '@/lib/db/mysql'

export default async function New({ params }: { params: { kind: string, slug: string, id: number } }) {
    const { kind, slug, id } = params

    const record = await Dao.retrievePromptById(id)
    if (!record) throw new Error('Prompt not found')
    const models = await Dao.retrieveModels()
    const testsets = await Dao.retrieveOfficialTestsetsIdsAndNamesByKind(kind)

    record.base_prompt_id = record.id
    return (<Container fluid={false}>
        <h1 className="mt-5 mb-3">Edição de Prompt</h1>
        <PromptForm record={record} models={models} testsets={testsets} />
    </Container>)
}