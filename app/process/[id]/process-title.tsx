import { envString } from '@/lib/utils/env'
import { Container, Navbar } from 'react-bootstrap'

export default async function ProcessTitle(params) {
    const id = (params?.id?.toString() || '').replace(/[^0-9]/g, '')

    return (
        <Container fluid={false}>
            <h1 className="text-center mt-4 mb-0">
                Processo {envString('NAVIGATE_TO_PROCESS_URL') ? (<a href={envString('NAVIGATE_TO_PROCESS_URL').replace('{numero}', id)} style={{color: 'rgb(33, 37, 41)', textDecoration: 'none'}}>{id}</a>) : id}
            </h1>
        </Container>
    )
    // return (
    //     <Navbar bg="primary" expand="lg" className="mb-3">
    //         <Container fluid={false}>
    //             <div className="navbar-brand text-white" style={{ textDecoration: "none", fontSize: "120%", verticalAlign: "middle" }}>
    //                 Processo {id}
    //                 {envString('NAVIGATE_TO_PROCESS_URL') && (<>&nbsp;<a href={envString('NAVIGATE_TO_PROCESS_URL').replace('{numero}', id)} className="text-white" type="submit"><FontAwesomeIcon icon={faUpRightFromSquare} /></a></>)}
    //             </div>
    //         </Container>
    //     </Navbar >
    // )
}