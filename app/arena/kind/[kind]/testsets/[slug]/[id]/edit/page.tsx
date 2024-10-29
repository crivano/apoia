import { Container } from 'react-bootstrap'
import TestsetForm from '../../../testset-form'
import { Dao } from '@/lib/db/mysql'

export default async function New({ params }: { params: { kind: string, slug: string, id: number } }) {
    const { kind, slug, id } = params

    const record = await Dao.retrieveTestsetById(null, id)
    if (!record) throw new Error('Prompt not found')
    const models = await Dao.retrieveModels(null)
    const testsets = await Dao.retrieveOfficialTestsetsIdsAndNamesByKind(null, kind)

    record.base_testset_id = record.id
    return (<Container fluid={false}>
        <h1 className="mt-5 mb-3">Edição de Coleção de Testes</h1>
        <TestsetForm record={record} models={models} testsets={testsets} />
    </Container>)
}