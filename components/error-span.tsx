'use client'

import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export default function ErrorSpan({ encrypted }: { encrypted?: string }) {
    const [showModal, setShowModal] = useState(false);

    if (!encrypted) return null;

    const copyErrorToClipboard = () => {
        navigator.clipboard.writeText(encrypted)
            .then(() => {
                // Copied successfully
            })
            .catch(err => {
                // Handle error
            });
    };

    return (
        <>
            <span
                className="text-danger"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowModal(true)}
            >
                Ocorreu um erro, clique aqui para ver detalhes
            </span>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Detalhes do Erro</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ marginBottom: 16 }}>
                        Copie o texto abaixo e envie para o suporte.
                    </div>
                    <Form.Control
                        as="textarea"
                        value={encrypted}
                        readOnly
                        rows={4}
                        style={{ fontFamily: 'monospace', marginBottom: 16 }}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Fechar
                    </Button>
                    <Button variant="primary" onClick={copyErrorToClipboard}>
                        Copiar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
