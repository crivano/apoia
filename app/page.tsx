import ProcessNumberForm from '../components/process-number-form'
import { Container } from 'react-bootstrap'

import { assertCurrentUser } from '../lib/user'
import { assertModel } from '@/lib/ai/model-server'
import { redirect } from 'next/navigation'

// export const runtime = 'edge'
export const preferredRegion = 'home'
export const dynamic = 'force-dynamic'


export default async function Home() {
  await assertCurrentUser()
  redirect('/community')
}