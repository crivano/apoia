import { Container } from 'react-bootstrap'
import PromptTests from '../../../prompt-tests'
import { Dao } from '@/lib/mysql'

export default async function New({ params }: { params: { kind: string, slug: string, id: number } }) {
    const { kind, slug, id } = params

    const record = await Dao.retrievePromptById(null, id)
    if (!record) throw new Error('Prompt not found')
    const models = await Dao.retrieveModels(null)
    const prompts = await Dao.retrieveOfficialPromptsIdsAndNamesByKind(null, kind)
    const testsets = await Dao.retrieveOfficialTestsetsIdsAndNamesByKind(null, kind)

    record.base_prompt_id = record.id
    return (<Container fluid={false}>
        <h1 className="mt-5 mb-3">Testes de Prompt</h1>
        <PromptTests record={record} models={models} testsets={testsets} />
    </Container>)
}