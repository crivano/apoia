'use client';

import { applyTextsAndVariables } from '@/lib/ai/prompt';
import { PromptDataType, PromptDefinitionType } from '@/lib/ai/prompt-types';
import { Message, useChat } from 'ai/react'
import showdown from 'showdown'

const converter = new showdown.Converter({ tables: true })

function preprocessar(texto: string, role: string) {
    if (!texto) return ''
    return converter.makeHtml(`<span class="d-none"><b>${role === 'user' ? 'Usuário' : 'Assistente'}</b>: </span>${texto}`)
}


export default function Chat(params: { definition: PromptDefinitionType, data: PromptDataType }) {
    const initialMessages: Message[] = [{ id: "system", role: 'system', content: applyTextsAndVariables(params.definition.systemPrompt, params.data) }]
    const { messages, input, handleInputChange, handleSubmit } = useChat({ api: '/api/v1/chat', initialMessages });
    return (
        <div className="">
            <h2>Chat</h2>

            <div className="alert alert-dark bg-dark text-white p-2 pt-3 pb-3 chat-box">
                <div className='container'>
                    {messages.map(m => (
                        m.role === 'user'
                            ? <div className="row justify-content-end ms-5">
                                <div key={m.id} className={`col col-auto mb-0`}>
                                    <div className={`text-wrap mb-3 rounded chat-content chat-user`} dangerouslySetInnerHTML={{ __html: preprocessar(m.content, m.role) }} />
                                </div>
                            </div>
                            : m.role === 'assistant' &&
                            <div className="row justify-content-start me-5">
                                <div key={m.id} className={`col col-auto mb-0`}>
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
                </div></div>
        </div >
    );
}