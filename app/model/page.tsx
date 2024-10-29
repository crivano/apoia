import ModelForm from './model-form'
import { Container } from 'react-bootstrap'
import { assertCurrentUser } from '../../lib/user'
import { getModelAndApiKeyCookieValue } from './cookie'

// export const runtime = 'edge'
export const preferredRegion = 'home'
export const dynamic = 'force-dynamic'

export default async function Home() {
  await assertCurrentUser()
  const byCookie = getModelAndApiKeyCookieValue()
  let model: string, apiKey: string
  if (byCookie) {
    model = byCookie.model
    apiKey = byCookie.apiKey
  } else {
    model = process.env.MODEL as string
    apiKey = ''
  }

  return (<>
    <Container fluid={false}>
      <ModelForm model={model} apiKey={apiKey} />
    </Container>
  </>)
}