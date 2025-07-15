"use client"

import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

export default function MiniAction(params) {
    const [timestamp, setTimestamp] = useState(undefined as string | undefined);
    const handleClose = () => { setTimestamp(params.timestamp) }

    return (<>
        <Modal show={params.message && params.message !== 'success' && timestamp !== params.timestamp} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Erro</Modal.Title>
            </Modal.Header>
            <Modal.Body>{params.message}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    </>)
}