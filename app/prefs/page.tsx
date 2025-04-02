import { Container } from 'react-bootstrap'
import { assertCurrentUser } from '../../lib/user'
import { getPrefs } from '../../lib/utils/prefs'
import { EMPTY_PREFS_COOKIE, PrefsCookieType } from '@/lib/utils/prefs-types'
import PrefsForm from './prefs-form'
import { ModelProvider } from '@/lib/ai/model-types'
import { envString } from '@/lib/utils/env'
import { cookies } from 'next/headers';
import { StatusDeLancamento } from '@/lib/proc/process-types'

// export const runtime = 'edge'
export const preferredRegion = 'home'
export const dynamic = 'force-dynamic'

export default async function Home() {
  // await assertCurrentUser()
  const prefs = getPrefs()

  let initialState: PrefsCookieType = EMPTY_PREFS_COOKIE
  if (prefs)
    initialState = prefs

  const availableApiKeys = Object.values(ModelProvider).filter((model) => envString(model.apiKey)).map((model) => model.apiKey)

  const statusCookie = (await cookies()).get('beta-tester')?.value
  const statusDeLancamento = statusCookie ? JSON.parse(statusCookie) : StatusDeLancamento.PUBLICO


  return (<>
    <Container fluid={false}>
      <PrefsForm initialState={initialState} availableApiKeys={availableApiKeys} defaultModel={envString('MODEL')} statusDeLancamento={statusDeLancamento} />
    </Container>
  </>)
}