import { Container } from 'react-bootstrap'
import AbusiveLitigationPage from './AbusiveLitigationPage'
import { assertModel } from '@/lib/ai/model-server'
import { envString } from '@/lib/utils/env'

export default async function Revison() {
    await assertModel()

    return (<Container fluid={false}>
        <AbusiveLitigationPage NAVIGATE_TO_PROCESS_URL={envString('NAVIGATE_TO_PROCESS_URL')} />
    </Container>)
}