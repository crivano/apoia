'use server'

import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { Dao } from '@/lib/db/mysql'
import { Col, Container, Form, Row, Spinner } from 'react-bootstrap'
import { IAPrompt } from '@/lib/db/mysql-types'

export async function PromptInfoContents({ pPrompt }: { pPrompt: Promise<IAPrompt> }) {
    const prompt = await pPrompt

    return (
        <Container className="mt-3" fluid={false}>
            <Form>
                <Row className="mb-3">
                    <Col md={3}>
                        <Form.Label>Nome</Form.Label>
                        <Form.Control className="form-control" plaintext readOnly defaultValue={prompt.name} />
                    </Col>
                    <Col md={3}>
                        <Form.Label>Autor</Form.Label>
                        <Form.Control className="form-control" plaintext readOnly defaultValue={prompt.content.author} />
                    </Col>
                    <Col md={2}>
                        <Form.Label>Segmento</Form.Label>
                        <Form.Control className="form-control" plaintext readOnly defaultValue={prompt.content.scope} />
                    </Col>
                    <Col md={2}>
                        <Form.Label>Instância</Form.Label>
                        <Form.Control className="form-control" plaintext readOnly defaultValue={prompt.content.instance} />
                    </Col>
                    <Col md={2}>
                        <Form.Label>Natureza</Form.Label>
                        <Form.Control className="form-control" plaintext readOnly defaultValue={prompt.content.matter} />
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col md={3}>
                        <Form.Label>Alvo</Form.Label>
                        <Form.Control className="form-control" plaintext readOnly defaultValue={prompt.content.target} />
                    </Col>
                    <Col md={3}>
                        <Form.Label>Nome do Campo</Form.Label>
                        <Form.Control className="form-control" plaintext readOnly defaultValue={prompt.content.editor_label} />
                    </Col>
                    <Col md={3}>
                        <Form.Label>Seleção de Peças</Form.Label>
                        <Form.Control className="form-control" plaintext readOnly defaultValue={prompt.content.piece_strategy} />
                    </Col>
                    <Col md={3}>
                        <Form.Label>Tipos de Peças</Form.Label>
                        <Form.Control className="form-control" plaintext readOnly defaultValue={prompt.content.piece_descr} />
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col md={2}>
                        <Form.Label>Resumir Selecionadas</Form.Label>
                        <Form.Control className="form-control" plaintext readOnly defaultValue={prompt.content.summary} />
                    </Col>
                    <Col md={2}>
                        <Form.Label>Compartilhamento</Form.Label>
                        <Form.Control className="form-control" plaintext readOnly defaultValue={prompt.content.share} />
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col>
                        <Form.Label>Prompt</Form.Label>
                        <Form.Control className="form-control"
                            as="textarea"
                            rows={5}
                            plaintext
                            readOnly
                            defaultValue={prompt.content.prompt}
                        />
                    </Col>
                </Row>
                {prompt.content.system_prompt !== undefined && (
                    <Row className="mb-3">
                        <Col>
                            <Form.Label>Prompt de Sistema</Form.Label>
                            <Form.Control className="form-control"
                                as="textarea"
                                rows={5}
                                plaintext
                                readOnly
                                defaultValue={prompt.content.system_prompt}
                            />
                        </Col>
                    </Row>
                )}
                {(prompt.content.json_schema !== undefined || prompt.content.format !== undefined) && (
                    <Row className="mb-3">
                        {prompt.content.json_schema !== undefined && (
                            <Col md={6}>
                                <Form.Label>JSON Schema</Form.Label>
                                <Form.Control className="form-control"
                                    as="textarea"
                                    rows={5}
                                    plaintext
                                    readOnly
                                    defaultValue={prompt.content.json_schema}
                                />
                            </Col>
                        )}
                        {prompt.content.format !== undefined && (
                            <Col md={6}>
                                <Form.Label>Format</Form.Label>
                                <Form.Control className="form-control"
                                    as="textarea"
                                    rows={5}
                                    plaintext
                                    readOnly
                                    defaultValue={prompt.content.format}
                                />
                            </Col>
                        )}
                    </Row>
                )}
            </Form>
        </Container>
    )
}


export default async function Home({ params }: { params: { id: number } }) {
    noStore()

    const pPrompt = Dao.retrieveLatestPromptByBaseId(params.id)

    return (
        <Container className="mt-5" fluid={false}>
            <h1 className="text-center">Informações de Prompt</h1>
            <Suspense fallback={
                <div className="text-center"><Spinner variant='secondary' /></div>
            }>
                <PromptInfoContents pPrompt={pPrompt} />
            </Suspense>
        </Container>
    )
}