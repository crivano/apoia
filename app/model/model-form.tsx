'use client';

import React, { useState, FormEvent } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { Button, Form } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { enumSortById, Model, ModelProvider } from '@/lib/ai/model-types';
import { EMPTY_FORM_STATE, FormHelper } from '@/lib/ui/form-support';

const Frm = new FormHelper()

export default function ModelForm(params) {
    const router = useRouter();
    noStore()
    const [apiKey, setApiKey] = useState(params.apiKey)
    const [model, setModel] = useState(params.model)
    const [processing, setProcessing] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const [data, setData] = useState({ ...(params.initialState || {}) })
    const [formState, setFormState] = useState(EMPTY_FORM_STATE)
    Frm.update(data, setData, formState)

    const handleClick = (e) => {
        setProcessing(true);
        e.preventDefault();
        const cookie = btoa(JSON.stringify(data))
        document.cookie = `prefs=${cookie}; path=/;`
        // document.cookie = `model=${cookie}; path=/; Secure; SameSite=Strict; HttpOnly;`
        router.replace(`/`)
        router.refresh()
        // setProcessing(false);
    }

    const handleClear = (e) => {
        e.preventDefault();
        document.cookie = `prefs=; path=/;`
        router.push(`/`)
        router.refresh()
    }

    return (
        <>
            <div className="row justify-content-center">
                <div className="col col-12 col-md-8 col-xxl-6">
                    <h4 className="text-center mt-3 mb-2">Modelo de Inteligência Artificial</h4>
                    <p className="text-center">Informe suas chaves de API no formulário abaixo. Elas ficarão armazenadas no seu próprio navegador e só serão transferidas para a ApoIA no momento do uso.</p>
                </div>
            </div>
            <div >
                <form className="row justify-content-center" autoComplete='off'>
                    <div className="col col-12 col-md-8 col-xxl-6">
                        <div className=" d-block mx-auto mb-3 alert-secondary alert">
                            <div >
                                <div className="row mb-2">
                                    <Frm.Select label="Modelo Padrão" name="model" options={[{ id: '', name: '[Selecionar Automaticamente Baseado no Prompt]' }, ...enumSortById(Model).map(e => ({ id: e.value.name, name: e.value.name }))]} />
                                </div>
                                {enumSortById(ModelProvider).map((provider) => (
                                    <div className="row mb-2">
                                        <Frm.Input label={`${provider.value.name}: Chave da API`} name={`params['${provider.value.apiKey}']`} />
                                    </div>))}
                                {/* <div className="row mb-3">
                                    <div className="col">
                                        <div className="form-group">
                                            <label>Chave da API</label>
                                            <input type="text" id="key" name="key" placeholder="" autoFocus={true} className="form-control" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)} value={apiKey} autoComplete='off' />
                                        </div>
                                    </div>
                                </div> */}
                                <div className="row pt-3">
                                    <div className="col">
                                        <button onClick={handleClear} className="btn btn-warning" style={{ width: '10em' }}>Limpar</button>
                                    </div>
                                    <div className="col">
                                        <button onClick={handleClick} disabled={processing} className="btn btn-primary float-end" style={{ width: '10em' }}>{processing
                                            ? (<span className="spinner-border text-white opacity-50" style={{ width: '1em', height: '1em' }} role="status"><span className="visually-hidden">Loading...</span></span>)
                                            : 'Salvar'}</button>

                                    </div>
                                    {/* {JSON.stringify(data)} */}
                                </div>
                            </div>
                        </div>
                    </div>
                </form >
            </div >
        </>
    )
}