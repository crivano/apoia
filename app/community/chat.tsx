'use client';

import { applyTextsAndVariables } from '@/lib/ai/prompt';
import { PromptDataType, PromptDefinitionType } from '@/lib/ai/prompt-types';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToolInvocation } from 'ai';
import { Message, useChat } from 'ai/react'
import showdown from 'showdown'

const converter = new showdown.Converter({ tables: true })

function preprocessar(texto: string, role: string) {
    if (!texto) return ''
    return converter.makeHtml(`<span class="d-none"><b>${role === 'user' ? 'Usuário' : 'Assistente'}</b>: </span>${texto}`)
}

function toolMessage(i: ToolInvocation) {
    if (!i) return ''
    if (i.toolName === 'getProcessMetadata') {
        return `<span class="text-secondary">Obtendo metadados do processo: ${i.args.processNumber}</span>`
    } else if (i.toolName === 'getPiecesText') {
        return `<span class="text-secondary">Obtendo conteúdo das peças: ${i.args.pieceIdArray.join(', ')}</span>`
    } else {
        return `<span class="text-secondary">Ferramenta desconhecida: ${i.toolName}</span>`
    }
}


export default function Chat(params: { definition: PromptDefinitionType, data: PromptDataType }) {
    const initialMessages: Message[] = [{ id: "system", role: 'system', content: applyTextsAndVariables(params.definition.systemPrompt, params.data) }]
    const { messages, setMessages, input, setInput, handleInputChange, handleSubmit } = useChat({ api: '/api/v1/chat', initialMessages })

    const handleEditMessage = (idx: number) => {
        const message = messages[idx]
        if (message.role === 'user') {
            setInput(message.content as any)
            setMessages(messages.slice(0, idx))
        }
    }

    console.log('Chat messages:', messages)

    return (
        <div className={messages.find(m => m.role === 'assistant') ? '' : 'd-print-none h-print'}>
            <h2>Chat</h2>

            <div className="alert alert-dark bg-dark text-white p-2 pt-3 pb-3 chat-box">
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
                                {m?.parts?.filter((part) => part.type === 'tool-invocation')?.map((part, index) => (
                                    <div key={index} className="col col-auto mb-0">
                                        <div className={`text-wrap mb-3 chat-tool`} dangerouslySetInnerHTML={{ __html: toolMessage(part.toolInvocation) }} />
                                    </div>
                                ))}
                                <div className={`col col-auto mb-0`}>
                                    <div className={`text-wrap mb-3 rounded chat-content chat-ai`} dangerouslySetInnerHTML={{ __html: preprocessar(m.content, m.role) }} />
                                </div>
                            </div>
                    ))}

                    <div className="rowx">
                        <div className="xcol xcol-12">
                            <form onSubmit={handleSubmit} className="mt-auto">
                                <div className="input-group">
                                    <input
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
                </div>
            </div>
        </div >
    );
}