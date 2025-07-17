import { Container, Row, Col, Card, CardBody, CardTitle, CardText } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faList, faFileText, faDatabase, faAlignJustify, faComment, faComments } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import ApiKeyMissing from '@/components/api-key-missing'
import { assertCurrentUser } from '@/lib/user'

export default async function HomePage() {
    const user = await assertCurrentUser()

    const features = [
        {
            icon: faComments,
            title: "Chat",
            description: "Converse com um Agente de IA sobre processos específicos",
            href: "/chat",
            color: "text-primary"
        },
        {
            icon: faList,
            title: "Síntese",
            description: "Gere automaticamente resumos de peças processuais",
            href: "/process",
            color: "text-success"
        },
        {
            icon: faDatabase,
            title: "Prompts",
            description: "Banco de Prompts para Inteligência Artificial por categoria jurídica",
            href: "/community",
            color: "text-info"
        },
        {
            icon: faFileText,
            title: "Revisão de Texto",
            description: "Revise e aprimore textos jurídicos com IA",
            href: "/revision",
            color: "text-warning"
        },
        {
            icon: faAlignJustify,
            title: "Ementa",
            description: "Crie ementas jurídicas com base em decisões",
            href: "/headnote",
            color: "text-secondary"
        }
    ]

    return (
        <Container className="mt-4" fluid={false}>
            {/* Header Section */}
            <div className="text-center mb-4">
                <h1 className="display-4 mb-0">Bem-vindo à Apoia</h1>
                <p className="lead text-muted">
                    Plataforma de Inteligência Artificial para magistrados e servidores do Poder Judiciário
                </p>
                <ApiKeyMissing />

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
                                                <span className="alert-link">{feature.title}</span>
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
            </div>
            <div>
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
            </div>
        </Container>
    )
}
