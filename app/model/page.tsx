import ModelForm from './model-form'
import { Container } from 'react-bootstrap'
import { assertCurrentUser } from '../../lib/user'
import { getModelAndApiKeyCookieValue } from '../../lib/utils/prefs'
import { EMPTY_MODEL_COOKIE, ModelCookieType } from '@/lib/ai/model-types'

// export const runtime = 'edge'
export const preferredRegion = 'home'
export const dynamic = 'force-dynamic'

export default async function Home() {
  await assertCurrentUser()
  const byCookie = getModelAndApiKeyCookieValue()
  let model: string, apiKey: string

  let initialState: ModelCookieType = EMPTY_MODEL_COOKIE
  if (byCookie) {
    initialState = byCookie
  } else {
    initialState = { model: process.env.MODEL as string, params: {} }
  }

  return (<>
    <Container fluid={false}>
      <ModelForm initialState />
    </Container>
  </>)
}