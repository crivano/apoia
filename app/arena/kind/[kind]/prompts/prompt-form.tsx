'use client'

import { Form, Button, Accordion, Nav } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
// import { DeleteForm } from "./record-delete-form"
import dynamic from 'next/dynamic'
import TextareaAutosize from 'react-textarea-autosize'
import { removeOfficial, save, setOfficial } from './prompt-actions'
import { EMPTY_FORM_STATE, FormHelper, FormError, FormInput, FormInput2, FormSelect, FormSelect2, FormState, FormTextArea, FormTextArea2 } from '@/lib/form-support'
import yamlps from 'js-yaml'
import { useState } from 'react'
import _ from 'lodash'
import PromptTest from './prompt-test'
import { IATestset } from '@/lib/mysql-types'
import { useEffect } from 'react'
import { getTestsetById } from '../testsets/testset-actions'
import { slugify } from '@/lib/utils'

// const EditorComp = dynamic(() => import('@/components/EditorComponent'), { ssr: false })

const Frm = new FormHelper()

export default function PromptForm(props) {
    const router = useRouter()
    const initialState = props.record || { content: {} }
    if (!initialState.model_id || (props.models && props.models[0] && !props.models.map(i => i.id).includes(initialState.model_id))) initialState.model_id = props.models && props.models[0] ? props.models[0].id : null
    if (!initialState.testset_id || (props.testsets && props.testsets[0] && !props.testsets.map(i => i.id).includes(initialState.testset_id))) initialState.testset_id = props.testsets && props.testsets[0] ? props.testsets[0].id : null
    const [data, setData] = useState({ ...initialState })
    const [yaml, setYaml] = useState(yamlps.dump(initialState.content))
    const [formState, setFormState] = useState(EMPTY_FORM_STATE)
    const [tab, setTab] = useState('fields')
    Frm.update(data, (d) => { setData(d); updateYaml(d) }, formState)
    const [testset, setTestset] = useState(undefined as IATestset | undefined)

    const loadTests = async () => {
        if (!data.testset_id) {
            setTestset(undefined)
            return
        }
        if (data.testset_id === testset?.id) return
        console.log('loading testset', data.testset_id)
        setTestset(await getTestsetById(data.testset_id))
    }

    const updateYaml = (newData) => {
        setYaml(yamlps.dump(newData.content))
    }

    const handleYamlChanged = (value: string) => {
        setYaml(value)
        setData({ ...data, content: yamlps.load(value) })
    }


    if (formState?.message === 'success') {
        console.log('sucesso')
        handleBack()
    }

    const [pending, setPending] = useState(false)

    function handleBack() {
        console.log('back', props)
        if (data.name && data.id)
            router.push(`/arena/kind/${data.kind}/prompts/${slugify(data.name)}`)
        else
            router.push(`/arena/kind/${data.kind}`)
    }

    async function handleSave() {
        setPending(true)
        const result = await save(data)
        setFormState(result as any)
        setPending(false)
    }

    async function handleSetOfficial() {
        setPending(true)
        const result = await setOfficial(data.id)
        setFormState(result as any)
        setPending(false)
    }

    async function handleRemoveOfficial() {
        setPending(true)
        const result = await removeOfficial(data.id)
        setFormState(result as any)
        setPending(false)
    }

    useEffect(() => {
        console.log('load tests')
        loadTests()
    }, [data.testset_id])

    return (
        <div className="row mb-5">
            <Frm.Input label="Nome" name="name" width={4} />
            <Frm.Select label="Modelo de Linguagem Padrão" name="model_id" options={props.models} width={4} />
            <Frm.Select label="Coleção de Testes Padrão" name="testset_id" options={[{ id: 0, value: '' }, ...props.testsets]} width={4} />

            <div className='col col-12'>
                <Nav variant="underline" defaultActiveKey="fields" onSelect={(eventKey) => { setTab(eventKey || 'fields') }} className="mb-2">
                    <Nav.Item>
                        <Nav.Link eventKey="fields">Campos</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="yaml">YAML</Nav.Link>
                    </Nav.Item>
                </Nav>
                {tab === 'fields'
                    ? (<>
                        <Frm.TextArea label="JSON Schema (opcional)" name="content.json_schema" maxRows={5} />
                        <Frm.TextArea label="Format (opcional)" name="content.format" maxRows={5} />
                        <Frm.TextArea label="Prompt de Sistema (opcional)" name="content.system_prompt" maxRows={5} />
                        <Frm.TextArea label="Prompt" name="content.prompt" maxRows={20} />
                    </>)
                    : (<TextareaAutosize className="form-control" value={yaml} onChange={(e) => handleYamlChanged(e.target.value)} />)}
            </div>
            <div className="col col-auto mt-3 mb-3">
                <Button variant="light" className="" onClick={handleBack}>Voltar</Button>
            </div>

            <div className="col col-auto mt-3 mb-3 ms-auto">
                {_.isEqual(data, initialState) && data.id && (data.is_official
                    ? <Button variant="secondary" disabled={pending} className="me-3" onClick={handleRemoveOfficial}>Desmarcar como Oficial</Button>
                    : <Button variant="secondary" disabled={pending} className="me-3" onClick={handleSetOfficial}>Marcar como Oficial</Button>
                )}
                <Button variant="primary" disabled={pending || _.isEqual(data, initialState)} className="" onClick={handleSave}>Salvar</Button>
                <FormError formState={formState} />

                {/* <Suspense>
                    <DeleteForm id={state.id} />
                </Suspense> */}
            </div>

            {testset && <><hr className="mt-3" /><h2>Testes</h2>
                <PromptTest testset={testset} overrideSystemPrompt={data.content.system_prompt} overridePrompt={data.content.prompt} overrideJsonSchema={data.content.json_schema} overrideFormat={data.content.format} />
            </>}

        </div >
    )
}