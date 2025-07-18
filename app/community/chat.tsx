'use client';

import { applyTextsAndVariables } from '@/lib/ai/prompt';
import { PromptDataType, PromptDefinitionType } from '@/lib/ai/prompt-types';
import { faEdit, faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faFileLines, faSackDollar, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToolInvocation } from 'ai';
import { Message, useChat } from 'ai/react'
import showdown from 'showdown'
import { ReactElement, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const converter = new showdown.Converter({ tables: true })

export type SuggestionType = {
    suggestion: string;
    icon: any;
    label: string;
}

function preprocessar(texto: string, role: string) {
    if (!texto) return ''
    return converter.makeHtml(`<span class="d-none"><b>${role === 'user' ? 'Usuário' : 'Assistente'}</b>: </span>${texto}`)
}

function toolMessage(i: ToolInvocation) {
    const regexPiece = /^(.+):$\n<[a-z\-]+ event="([^"]+)"/gm
    if (!i) return ''
    if (i.toolName === 'getProcessMetadata') {
        return `<span class="text-secondary">Obtendo dados do processo: ${i.args.processNumber}</span>`
    } else if (i.toolName === 'getPiecesText') {
        const result = (i as any).result
        if (result) {
            const matches = []
            let match
            regexPiece.lastIndex = 0 // Reset regex state
            while ((match = regexPiece.exec((i as any).result)) !== null) {
                const kind = match[1].trim()
                const eventNumber = match[2]
                matches.push(`${kind} (${eventNumber})`)
            }

            if (matches.length === 1) {
                return `<span class="text-secondary">Obtendo conteúdo da peça: ${matches[0]}</span>`
            }
            if (matches.length > 1) {
                return `<span class="text-secondary">Obtendo conteúdo das peças: ${matches.join(', ')}</span>`
            }
        }
        if (i.args.pieceIdArray?.length === 1) {
            return `<span class="text-secondary">Obtendo conteúdo da peça: ${i.args.pieceIdArray[0]}</span>`
        }
        if (i.args.pieceIdArray?.length > 1) {
            return `<span class="text-secondary">Obtendo conteúdo das peças: ${i.args.pieceIdArray.join(', ')}</span>`
        }
    } else {
        return `<span class="text-secondary">Ferramenta desconhecida: ${i.toolName}</span>`
    }
}


export default function Chat(params: { definition: PromptDefinitionType, data: PromptDataType, suggestions?: SuggestionType[], footer?: ReactElement }) {
    const [showModal, setShowModal] = useState(false);
    const [processNumber, setProcessNumber] = useState('');
    const [currentSuggestion, setCurrentSuggestion] = useState('');

    const initialMessages: Message[] = [{ id: "system", role: 'system', content: applyTextsAndVariables(params.definition.systemPrompt, params.data) }]
    const { messages, setMessages, input, setInput, handleInputChange, handleSubmit } = useChat({ api: '/api/v1/chat', initialMessages })

    const handleEditMessage = (idx: number) => {
        const message = messages[idx]
        if (message.role === 'user') {
            setInput(message.content as any)
            setMessages(messages.slice(0, idx))
        }
        setFocusToChatInput()
    }

    const setFocusToChatInput = () => {
        setTimeout(() => {
            const inputElement = document.getElementById('chat-input') as HTMLInputElement;
            if (inputElement) {
                inputElement.focus();
                const length = inputElement.value.length;
                inputElement.setSelectionRange(length, length);
            }
        }, 200);
    }

    const handleSubmitAndSetFocus = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.trim() === '') return;
        handleSubmit(e);
        setFocusToChatInput()
    }

    const alreadyLoadedProcessMetadata = messages.some(m => m.role === 'assistant' && m.parts?.some(part => part.type === 'tool-invocation' && part.toolInvocation.toolName === 'getProcessMetadata'))

    const handleModalSubmit = () => {
        if (processNumber) {
            const fullSuggestion = `Sobre o processo ${processNumber}, ${currentSuggestion.toLowerCase()}`
            setInput(fullSuggestion)
            // Create a synthetic event for handleSubmit
            setShowModal(false)
            setProcessNumber('')
            setFocusToChatInput()
        }
    };

    const handleSuggestion = (suggestion: string) => {
        if (!alreadyLoadedProcessMetadata) {
            setCurrentSuggestion(suggestion);
            setShowModal(true);
        } else {
            setInput(suggestion);
            const syntheticEvent = new Event('submit') as any;
            syntheticEvent.preventDefault = () => { };
            handleSubmit(syntheticEvent);
            setFocusToChatInput()
        }
    }


    // console.log('Chat messages:', messages)

    return (
        <div className={messages.find(m => m.role === 'assistant') ? '' : 'd-print-none h-print'}>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Informar número do processo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Por favor, informe o número do processo:</Form.Label>
                        <Form.Control
                            type="text"
                            value={processNumber}
                            onChange={(e) => setProcessNumber(e.target.value)}
                            name="numeroDoProcesso"
                            autoFocus
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleModalSubmit}>
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>

            <h2>Chat</h2>

            <div className={`alert alert-dark bg-dark text-white p-2 pt-3 pb-3 chat-box ${params.footer ? 'mb-1' : 'mb-3'}`}>
                <div className='container'>
                    {messages.map((m, idx) => (
                        m.role === 'user' ?
                            <div className="row justify-content-end ms-5 g-2 chat-user-container" key={m.id}>
                                <div className={`col col-auto mb-0 icon-container`}>
                                    <FontAwesomeIcon onClick={() => handleEditMessage(idx)} icon={faEdit} className="text-white align-bottom" />
                                </div>
                                <div className={`col col-auto mb-0`}>
                                    <div className={`text-wrap mb-3 rounded chat-content chat-user`} dangerouslySetInnerHTML={{ __html: preprocessar(m.content, m.role) }} />
                                </div>
                            </div>
                            : m.role === 'assistant' &&
                            <div className="row justify-content-start me-5" key={m.id}>
                                {m?.parts?.find((part) => part.type === 'tool-invocation') && <div className={`mb-1`}>
                                    {m?.parts?.filter((part) => part.type === 'tool-invocation')?.map((part, index) => (
                                        <div key={index} className="mb-0">
                                            <div className={`text-wrap mb-0 chat-tool`} dangerouslySetInnerHTML={{ __html: toolMessage(part.toolInvocation) }} />
                                        </div>
                                    ))}
                                </div>}
                                <div className={`col col-auto mb-0`}>
                                    <div className={`text-wrap mb-3 rounded chat-content chat-ai`} dangerouslySetInnerHTML={{ __html: preprocessar(m.content, m.role) }} />
                                </div>
                            </div>
                    ))}

                    <div className="rowx">
                        <div className="xcol xcol-12">
                            <form onSubmit={handleSubmitAndSetFocus} className="mt-auto">
                                <div className="input-group">
                                    <input
                                        id="chat-input"
                                        className="form-control bg-secondary text-white"
                                        value={input}
                                        placeholder=""
                                        onChange={handleInputChange}
                                    />
                                    <button className="btn btn-secondary btn-outline-light" type="submit">Enviar</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {params.suggestions && <div className="mt-1 text-center">
                        {params.suggestions.map((s, index) => (
                            <button className="btn btn-sm btn-outline-secondary mt-2 ms-1 me-1" onClick={() => handleSuggestion(s.suggestion)} key={index}>
                                <FontAwesomeIcon icon={s.icon} className="me-2" />
                                {s.label}
                            </button>
                        ))}
                    </div>}
                </div>
            </div>
            {params.footer}
        </div>
    );
}