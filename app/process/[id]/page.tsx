import { unstable_noStore as noStore } from 'next/cache'
import ProcessServerContents from './process-server-contents'
import Fetcher from '../../../lib/utils/fetcher'
import { Suspense } from 'react'
import ProcessTitle from './process-title'
import { Container } from 'react-bootstrap'

export const maxDuration = 60 // seconds
export const dynamic = 'force-dynamic'

export default async function ShowProcess({ params }) {
    // await assertCurrentUser()
    const id: string = (params?.id?.toString() || '').replace(/[^0-9]/g, '') as string

    try {
        noStore()

        const loading = () => {
            return <div className="spinner-border text-secondary opacity-50 text-center mt-4" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        }

        return (
            <div id="printDiv">
                <ProcessTitle id={id} />
                <Container fluid={false}>
                    <Suspense fallback={loading()}><ProcessServerContents id={id} /></Suspense>
                </Container>
            </div>)
    } catch (error) {
        const message = Fetcher.processError(error)
        return (<div className='alert alert-danger mt-5'>Erro ao buscar dados do processo: {message}</div>)
    }
}