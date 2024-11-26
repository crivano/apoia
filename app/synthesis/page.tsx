import { Container } from 'react-bootstrap'
import SynthesisPage from './SynthesisPage'
import { assertModel } from '@/lib/ai/model-server'

export default async function Revison() {
    await assertModel()

    return (<Container fluid={false}>
        <SynthesisPage />
    </Container>)
}