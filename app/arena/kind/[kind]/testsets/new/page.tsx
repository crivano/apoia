import { Container } from 'react-bootstrap'
import TestsetForm from '../testset-form'
import { Dao } from '@/lib/mysql'

export default async function New({ params }: { params: { kind: string } }) {
    const { kind } = params

    const models = await Dao.retrieveModels(null)
    const testsets = await Dao.retrieveOfficialTestsetsIdsAndNamesByKind(null, kind)

    return (<Container fluid={false}>
        <h1 className="mt-5">Nova Coleção de Testes</h1>
        <TestsetForm record={{ kind, content: { tests: [] } }} models={models} testsets={testsets} />
    </Container>)
}