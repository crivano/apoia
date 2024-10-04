import { Container } from 'react-bootstrap'
import PromptForm from '../prompt-form'
import { Dao } from '@/lib/mysql'

export default async function New({ params }: { params: { kind: string } }) {
    const { kind } = params

    const models = await Dao.retrieveModels(null)
    const testsets = await Dao.retrieveOfficialTestsetsIdsAndNamesByKind(null, kind)

    return (<Container fluid={false}>
        <h1 className="mt-5 mb-3">Novo Prompt</h1>
        <PromptForm record={{ kind, content: {} }} models={models} testsets={testsets} />
    </Container>)
}