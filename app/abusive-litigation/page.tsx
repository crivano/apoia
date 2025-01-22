import { Container } from 'react-bootstrap'
import AbusiveLitigationPage from './AbusiveLitigationPage'
import { assertModel } from '@/lib/ai/model-server'

export default async function Revison() {
    await assertModel()
    
    return (<Container fluid={false}>
        <AbusiveLitigationPage />
    </Container>)
}