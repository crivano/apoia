'use client';

import React, { useState, FormEvent, useEffect } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { Button, Form } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { enumSortById, Model, ModelProvider } from '@/lib/ai/model-types';
import { EMPTY_FORM_STATE, FormHelper } from '@/lib/ui/form-support';

const Frm = new FormHelper()

export default function PrefsForm(params) {
    noStore()
    const initialState = JSON.parse(JSON.stringify(params.initialState))
    const initialFormState = JSON.parse(JSON.stringify(EMPTY_FORM_STATE))
    const [processing, setProcessing] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [data, setData] = useState(initialState)
    const [formState, setFormState] = useState(initialFormState)
    const [refreshCount, setRefreshCount] = useState(0)
    const router = useRouter();

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
        setData(JSON.parse(JSON.stringify(params.initialState)))
        setFormState(JSON.parse(JSON.stringify(EMPTY_FORM_STATE)))
        setRefreshCount(refreshCount + 1)
        router.push(`/`)
        router.refresh()
    }

    const getAvailabeModel = () => {
        for (const m of enumSortById(Model)) {
            if (data.env && !!data.env[m.value.provider.apiKey])
                return m.value.name
        }
        if (params.defaultModel) return params.defaultModel
        for (const m of enumSortById(Model)) {
            if (params.availableApiKeys.includes(m.value.provider.apiKey))
                return m.value.name
        }
        return ''
    }

    const isDisabled = (model): boolean => {
        const providerApiKey = model.value.provider.apiKey
        const enabled = params.availableApiKeys.includes(providerApiKey) || data.env && !!data.env[providerApiKey]

        return !enabled
    }

    const validator = (value: string, name: string, regex: RegExp): string | undefined => {
        let error: string | undefined = undefined
        if (value && !regex.test(value)) error = 'Chave da API inválida'
        const newFormState = { ...formState }
        if (error) {
            newFormState.fieldErrors[name] = [error]
        } else {
            delete newFormState.fieldErrors[name]
        }
        setFormState(newFormState)
        return error
    }

    const modelOptions = enumSortById(Model)
        .sort((a, b) => a.value.provider.id - b.value.provider.id)
        .map(e => ({ id: e.value.name, name: e.value.name, disabled: isDisabled(e) }))
        .sort((a, b) => a.disabled ? 1 : b.disabled ? -1 : 0)

    useEffect(() => {
        const oldData = data
        const newData = { ...data, model: getAvailabeModel() }
        for (const model of enumSortById(Model)) {
            if (oldData.model === model.value.name && isDisabled(model)) {
                setData(newData)
                return
            }
        }
        if (!oldData.model && newData.model) {
            setData(newData)
            return
        }
    }, [data])

    return (
        <>
            <div className="row justify-content-center">
                <div className="col col-12 col-md-8 col-xxl-6">
                    <h4 className="text-center mt-3 mb-2">Modelo de Inteligência Artificial</h4>
                    <p className="text-center">Antes de usar a ApoIA é necessário selecionar o modelo de IA desejado e fornecer as respectivas chaves de API no formulário abaixo. Veja a <a href="https://github.com/trf2-jus-br/apoia/wiki/Modelos-de-IA-e-Chaves-de-APIs">documentação</a>.</p>
                </div>
            </div>
            <div >
                <form className="row justify-content-center" autoComplete='off'>
                    <div className="col col-12 col-md-8 col-xxl-6">
                        <div className=" d-block mx-auto mb-3 alert-secondary alert">
                            <div key={refreshCount}>
                                <div className="row mb-2">
                                    <Frm.Select label="Modelo Padrão" name="model" options={[{ id: '', name: '[Selecionar]' }, ...modelOptions]} />
                                </div>
                                {enumSortById(ModelProvider).map((provider) => (
                                    <div className="row mb-2" key={provider.value.name}>
                                        <Frm.Input label={`${provider.value.name}: Chave da API`} name={`env['${provider.value.apiKey}']`} validator={(value: string, name: string) => validator(value, name, provider.value.apiKeyRegex)} />
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
                                        <button onClick={handleClick} disabled={processing || (!data.model && !params.defaultModel)} className="btn btn-primary float-end" style={{ width: '10em' }}>{processing
                                            ? (<span className="spinner-border text-white opacity-50" style={{ width: '1em', height: '1em' }} role="status"><span className="visually-hidden">Loading...</span></span>)
                                            : 'Salvar'}</button>

                                    </div>
                                    {/* {JSON.stringify(data)} */}
                                </div>
                            </div>
                        </div>
                    </div>
                </form >
                <div className="row justify-content-center">
                    <div className="col col-12 col-md-8 col-xxl-6">
                        <p>As chaves ficarão armazenadas no seu próprio navegador e só serão transferidas para a ApoIA no momento do uso.</p>
                    </div>
                </div>
            </div >
        </>
    )
}