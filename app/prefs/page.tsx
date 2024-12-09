import { Container } from 'react-bootstrap'
import { assertCurrentUser } from '../../lib/user'
import { getPrefs } from '../../lib/utils/prefs'
import { EMPTY_PREFS_COOKIE, PrefsCookieType } from '@/lib/utils/prefs-types'
import PrefsForm from './prefs-form'

// export const runtime = 'edge'
export const preferredRegion = 'home'
export const dynamic = 'force-dynamic'

export default async function Home() {
  // await assertCurrentUser()
  const prefs = getPrefs()

  let initialState: PrefsCookieType = EMPTY_PREFS_COOKIE
  if (prefs)
    initialState = prefs

  return (<>
    <Container fluid={false}>
      <PrefsForm initialState={initialState} />
    </Container>
  </>)
}