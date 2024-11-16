'use client';

import React, { useState, FormEvent } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { Button, Form } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

export default function ModelForm(params) {
    const router = useRouter();
    noStore()
    const [apiKey, setApiKey] = useState(params.apiKey)
    const [model, setModel] = useState(params.model)
    const [processing, setProcessing] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')


    const handleClick = (e) => {
        setProcessing(true);
        e.preventDefault();
        const cookie = btoa(JSON.stringify({ model, apiKey }))
        document.cookie = `model=${cookie}; path=/;`
        // document.cookie = `model=${cookie}; path=/; Secure; SameSite=Strict; HttpOnly;`
        router.replace(`/`)
        router.refresh()
        // setProcessing(false);
    }

    const handleClear = (e) => {
        e.preventDefault();
        document.cookie = `model=; path=/;`
        router.push(`/`)
        router.refresh()
    }

    return (
        <>
            <div className="row justify-content-center">
                <div className="col col-12 col-md-8 col-xxl-6">
                    <h4 className="text-center mt-5 mb-2">Modelo de Inteligência Artificial</h4>
                    <p className="text-center">Para ter acesso ao melhor modelo, você precisa se <a href="https://www.google.com/search?q=Como+obter+uma+chave+de+API+da+OpenAI" target="_blank">inscrever na API da OpenAI</a> e comprar alguns créditos. Depois, selecione o modelo GPT-4o e informe a chave da API no formulário abaixo.</p>
                </div>
            </div>
            <div >
                <form className="row justify-content-center" autoComplete='off'>
                    <div className="col col-12 col-md-8 col-xxl-6">
                        <div className=" d-block mx-auto pt-5 pb-5 mb-3 alert-secondary alert">
                            <div >
                                <div className="row mb-3">
                                    <div className="col">
                                        <div className="form-group">
                                            <label>Modelo</label>
                                            <select id="model" name="model" placeholder="" autoFocus={true} className="form-control" onChange={(e) => setModel(e.target.value)} value={model} autoComplete='off'>
                                            <option value="gpt-4o-2024-08-06">GPT-4o</option>
                                            <option value="gpt-4o-mini-2024-07-18">GPT-4o-Mini</option>
                                            <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                                            <option value="gemini-1.5-pro-002">Gemini 1.5 Pro 002</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col">
                                        <div className="form-group">
                                            <label>Chave da API</label>
                                            <input type="text" id="key" name="key" placeholder="" autoFocus={true} className="form-control" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)} value={apiKey} autoComplete='off' />
                                        </div>
                                    </div>
                                </div>
                                <div className="row pt-3">
                                    <div className="col">
                                        <button onClick={handleClear} className="btn btn-warning" style={{ width: '10em' }}>Limpar</button>
                                    </div>
                                    <div className="col">
                                        <button onClick={handleClick} disabled={processing || apiKey?.length < 20} className="btn btn-primary float-end" style={{ width: '10em' }}>{processing
                                            ? (<span className="spinner-border text-white opacity-50" style={{ width: '1em', height: '1em' }} role="status"><span className="visually-hidden">Loading...</span></span>)
                                            : 'Salvar'}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form >
            </div >
        </>
    )
}