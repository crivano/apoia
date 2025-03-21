import { Container } from 'react-bootstrap'
import AbusiveLitigationPage from './AbusiveLitigationPage'
import { assertModel } from '@/lib/ai/model-server'
import { envString } from '@/lib/utils/env'
import { hasApiKey } from '@/lib/ai/model-server'

export default async function Revison() {
    // await assertModel()
    const isApiKey = await hasApiKey()

    return (<Container fluid={false}>
        <AbusiveLitigationPage NAVIGATE_TO_PROCESS_URL={envString('NAVIGATE_TO_PROCESS_URL')} hasApiKey={isApiKey} />
    </Container>)
}