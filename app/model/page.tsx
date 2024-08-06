import ModelForm from './model-form'
import { Container } from 'react-bootstrap'
import { assertCurrentUser } from '../../lib/user'
import { getModelAndApiKeyCookieValue } from './cookie'

// export const runtime = 'edge'
export const preferredRegion = 'home'
export const dynamic = 'force-dynamic'

export default async function Home() {
  await assertCurrentUser()
  const { model, apiKey, automatic } = getModelAndApiKeyCookieValue()

  return (<>
    <Container fluid={false}>
      <ModelForm model={model} apiKey={!automatic ? apiKey : ''} />
    </Container>
  </>)
}