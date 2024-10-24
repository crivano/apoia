import { Container } from 'react-bootstrap'
import { Dao } from '@/lib/mysql'
import TestBuilder from './test-builder'
import { TestTable } from './test-table'
import Link from 'next/link'


export default async function TestResult({ params }: { params: { kind: string, testset: number, prompt: number, model: number } }) {
    const testset = await Dao.retrieveTestsetById(null, params.testset)
    const prompt = await Dao.retrievePromptById(null, params.prompt)
    const model = await Dao.retrieveModelById(null, params.model)
    const test = await Dao.retrieveTestByTestsetIdPromptIdAndModelId(null, params.testset, params.prompt, params.model)

    if (!testset || !prompt || !model) {
        return <Container fluid={false}>
            <h1 className="mt-5 mb-3">Teste</h1>
            <p className="alert alert-danger">Coleção de testes, prompt or modelo não encontrados</p>
        </Container>
    }

    const Cabecalho = () => <>
        <>
            <h1 className="mt-5 mb-3">Teste de Prompt</h1>
            <div className="row">
                <div className="col col-auto">
                    <p><strong>Tipo de Prompt:</strong> {params.kind.toUpperCase()}<br /><strong>Prompt:</strong> {prompt.name}<br /></p>
                </div>
                <div className="col col-auto">
                    <p><strong>Coleção de Testes:</strong> {testset.name}<br /><strong>Modelo:</strong> {model.name}</p>
                </div>
            </div>
        </>
    </>

    const { kind } = params

    if (!test) {
        return <Container fluid={false}>
            <Cabecalho />
            <TestBuilder kind={params.kind} testset={testset} prompt={prompt} model={model} />
            <Link href={`/arena/kind/${kind}/ranking`} className="btn btn-light">Voltar</Link>
        </Container>
    }

    return <Container fluid={false}>
        <Cabecalho />
        <TestTable testset={testset} test={test} promptFormat={prompt.content.format} />
        <Link href={`/arena/kind/${kind}/ranking`} className="btn btn-light">Voltar</Link>
    </Container>
}