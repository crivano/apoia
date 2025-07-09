import { Container, Button, Row, Col, Card, CardBody, CardTitle, CardText } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faList, faFileText, faLightbulb, faRobot, faKey } from '@fortawesome/free-solid-svg-icons'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { assertCurrentUser, isUserCorporativo } from '@/lib/user'
import { getSelectedModelParams } from '@/lib/ai/model-server'

export default async function HomePage() {
    const user = await assertCurrentUser()
    if (!!(await isUserCorporativo(user)))
        return <Container><div className="alert alert-danger mt-5">
            Para acessar a Apoia, entre em <Link href="https://www.jus.br">https://www.jus.br</Link> e faça o login utilizando CPF e senha.
            O <strong>login via Gov.BR não dá acesso à Apoia</strong> porque ela não está disponível para qualquer cidadão.
            É necessário ser magistrado ou servidor para acessá-la. Para mais informações, consulte o <Link href="https://trf2.gitbook.io/apoia/entrando-na-apoia">Manual da Apoia</Link>.</div></Container>

    const { model, apiKey } = await getSelectedModelParams()
    const apiKeyProvided = !!apiKey

    const features = [
        {
            icon: faList,
            title: "Síntese",
            description: "Gere automaticamente resumos de peças processuais",
            href: "/community?category=sintese",
            color: "text-success"
        },
        {
            icon: faCog,
            title: "Banco de Prompts",
            description: "Prompts para Inteligência Artificial por categoria jurídica",
            href: "/community",
            color: "text-info"
        },
        {
            icon: faFileText,
            title: "Revisão de Texto",
            description: "Revise e aprimore textos jurídicos com IA",
            href: "/community?category=revisao",
            color: "text-warning"
        },
        {
            icon: faLightbulb,
            title: "Ementa",
            description: "Crie ementas jurídicas com base em decisões",
            href: "/community?category=ementa",
            color: "text-secondary"
        }
    ]

    return (
        <Container className="mt-4" fluid={false}>
            {/* Header Section */}
            <div className="text-center mb-5">
                <h1 className="display-4 mb-0">Bem-vindo à Apoia</h1>
                <p className="lead text-muted">
                    Plataforma de Inteligência Artificial para magistrados e servidores do Poder Judiciário
                </p>
            </div>

            {/* API Key Notice */}
            {!apiKeyProvided && (
                <div className="alert alert-info text-center mb-4" role="alert">
                    <FontAwesomeIcon icon={faKey} className="me-2" />
                    Para utilizar as funcionalidades de IA, é necessário cadastrar sua{' '}
                    <Link href="/prefs" className="alert-link">Chave de API</Link>.
                </div>
            )}

            {/* Features Section */}
            <div className="mb-5">
                <h2 className="text-center mb-4">Escolha uma das ferramentas abaixo para começar:</h2>

                <Row className="g-4">
                    {features.map((feature, index) => (
                        <Col key={index} md={6} lg={3}>
                            <Link href={feature.href} className="text-decoration-none text-dark">
                                <Card className="h-100 text-center">
                                    <CardBody className="d-flex flex-column">
                                        <div className="mb-3">
                                            <FontAwesomeIcon
                                                icon={feature.icon}
                                                size="3x"
                                                className={feature.color}
                                            />
                                        </div>
                                        <CardTitle className="h5 mb-3">
                                            <Link href={feature.href} className="text-decoration-none">
                                                {feature.title}
                                            </Link>
                                        </CardTitle>
                                        <CardText className="text-muted flex-grow-1">
                                            {feature.description}
                                        </CardText>
                                    </CardBody>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Additional Info Section */}
            <div className="bg-light rounded p-4 mb-4">
                <Row>
                    <Col>
                        <h3 className="h4 mb-3">Sobre a Apoia</h3>
                        <p>
                            A Apoia é uma ferramenta de Inteligência Artificial Generativa que oferece diversas funcionalidades para otimizar o trabalho de magistrados, servidores e operadores do Direito.
                            Integrada a sistemas do Judiciário, como o DataLake/Codex, a Apoia permite acesso seguro às peças dos processos e oferece recursos de análise e automação de atividades complexas.
                        </p>
                        <p>As principais vantagens da Apoia incluem:
                            <ul className="list-unstyled">
                                <li>• Obtenção de peças diretamente pelo número do processo</li>
                                <li>• Decisão de próximos passos com base na lista de peças</li>
                                <li>• Repositório de prompts cuidadosamente preparados</li>
                                <li>• Centralização de custos e controle de limites de uso</li>
                                <li>• Proteção de informações sigilosas por meio de APIs próprias</li>
                            </ul>
                        </p>
                        <p className="mb-0">
                            Para saber mais e explorar todas as funcionalidades, consulte o <Link href="https://trf2.gitbook.io/apoia">Manual da Apoia</Link>.
                        </p>
                    </Col>
                </Row>
            </div>
        </Container>
    )
}
