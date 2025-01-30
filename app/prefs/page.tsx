import { Container } from 'react-bootstrap'
import { assertCurrentUser } from '../../lib/user'
import { getPrefs } from '../../lib/utils/prefs'
import { EMPTY_PREFS_COOKIE, PrefsCookieType } from '@/lib/utils/prefs-types'
import PrefsForm from './prefs-form'
import { ModelProvider } from '@/lib/ai/model-types'
import { envString } from '@/lib/utils/env'

// export const runtime = 'edge'
export const preferredRegion = 'home'
export const dynamic = 'force-dynamic'

export default async function Home() {
  // await assertCurrentUser()
  const prefs = getPrefs()

  let initialState: PrefsCookieType = EMPTY_PREFS_COOKIE
  if (prefs)
    initialState = prefs

  const availableApiKeys =  Object.values(ModelProvider).filter((model) => envString(model.apiKey)).map((model) => model.apiKey)

  return (<>
    <Container fluid={false}>
      <PrefsForm initialState={initialState} availableApiKeys={availableApiKeys} defaultModel={envString('MODEL')} />
    </Container>
  </>)
}