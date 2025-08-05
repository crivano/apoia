'use client'

import { Form, Button, Accordion, Nav, Col } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
// import { DeleteForm } from "./record-delete-form"
import TextareaAutosize from 'react-textarea-autosize'
import { removeOfficial, save, setOfficial } from './prompt-actions'
import { EMPTY_FORM_STATE, FormHelper, FormError } from '@/lib/ui/form-support'
import yamlps from 'js-yaml'
import { useState } from 'react'
import _ from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faRemove } from '@fortawesome/free-solid-svg-icons'
import { enumSorted } from '@/lib/ai/model-types'
import { Instance, Matter, Scope, Target } from '@/lib/proc/process-types'
import { PieceDescr, PieceStrategy } from '@/lib/proc/combinacoes'
import { PromptChainType } from '@/lib/db/mysql-types'
import { findUnclosedMarking } from '@/lib/ai/template'

// const EditorComp = dynamic(() => import('@/components/EditorComponent'), { ssr: false })

const Frm = new FormHelper()

export default function PromptForm(props) {
    const router = useRouter()
    const initialState = props.record || { content: {} }
    
    // Inicializar arrays vazios para encadeamento se não existirem
    if (!initialState.content.predecessors) initialState.content.predecessors = []
    if (!initialState.content.successors) initialState.content.successors = []
    
    // if (!initialState.model_id || (props.models && props.models[0] && !props.models.map(i => i.id).includes(initialState.model_id))) initialState.model_id = props.models && props.models[0] ? props.models[0].id : null
    // if (!initialState.testset_id || (props.testsets && props.testsets[0] && !props.testsets.map(i => i.id).includes(initialState.testset_id))) initialState.testset_id = props.testsets && props.testsets[0] ? props.testsets[0].id : null
    const [data, setData] = useState(_.cloneDeep(initialState))
    const [yaml, setYaml] = useState(yamlps.dump(initialState.content))
    const [formState, setFormState] = useState(EMPTY_FORM_STATE)
    const [tab, setTab] = useState('fields')
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(initialState?.content?.system_prompt || initialState?.content?.json_schema || initialState?.content?.format ? true : false)
    const [isTemplate, setIsTemplate] = useState(initialState?.content?.template || props.template ? true : false)
    Frm.update(data, (d) => { setData(d); updateYaml(d) }, formState)
    const pristine = _.isEqual(data, { ...initialState })

    const updateYaml = (newData) => {
        setYaml(yamlps.dump(newData.content))
    }

    const handleYamlChanged = (value: string) => {
        setYaml(value)
        setData({ ...data, content: yamlps.load(value) })
    }


    if (formState?.message === 'success') {
        handleBack()
    }

    const [pending, setPending] = useState(false)

    function handleBack() {
        if (data.name && data.id)
            router.push(`/community`)
        else
            router.push(`/community`)
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

    const scopeOptions = enumSorted(Scope).map(e => ({ id: e.value.name, name: e.value.descr }))
    const instanceOptions = enumSorted(Instance).map(e => ({ id: e.value.name, name: e.value.descr }))
    const matterOptions = enumSorted(Matter).map(e => ({ id: e.value.name, name: e.value.descr }))
    const targetOptions = enumSorted(Target).map(e => ({ id: e.value.name, name: e.value.descr }))
    const pieceStrategyOptions = enumSorted(PieceStrategy).map(e => ({ id: e.value.name, name: e.value.descr }))
    const pieceDescrOptions = enumSorted(PieceDescr).map(e => ({ id: e.value.name, name: e.value.descr }))
    const summaryOptions = [{ id: 'NAO', name: 'Não' }, { id: 'SIM', name: 'Sim' }]
    const shareOptions = [{ id: 'PADRAO', name: 'Padrão', disabled: true }, { id: 'PUBLICO', name: 'Público', disabled: true }, { id: 'EM_ANALISE', name: 'Público (em análise)' }, { id: 'NAO_LISTADO', name: 'Não Listado' }, { id: 'PRIVADO', name: 'Privado' }]
    const [field, setField] = useState([]);

    const unclosedMarking = isTemplate ? findUnclosedMarking(data.content.template || '') : null

    return (
        <div className="row mb-5">
            <Frm.Input label="Nome" name="name" width={3} explanation="Use maiúsculas e minúsculas." />
            <Frm.Input label="Autor" name="content.author" width={3} explanation="Use maiúsculas e minúsculas." />
            <Frm.MultiSelect label="Segmento" name="content.scope" options={scopeOptions} width={2} />
            <Frm.MultiSelect label="Instância" name="content.instance" options={instanceOptions} width={2} />
            <Frm.MultiSelect label="Natureza" name="content.matter" options={matterOptions} width={2} />
            {/* <Frm.Input label="Descrição" name="content.descr" width={12} /> */}
            <Frm.Select label="Fonte dos Dados" name="content.target" options={targetOptions} width={3} />
            <Frm.Input label="Nome do Campo" name="content.editor_label" width={3} visible={[Target.TEXTO.name, Target.REFINAMENTO.name].includes(data.content.target)} />
            <Frm.Select label="Seleção de Peças" name="content.piece_strategy" options={pieceStrategyOptions} width={3} visible={Target.PROCESSO.name === data.content.target} />
            <Frm.MultiSelect label="Tipos de Peças" name="content.piece_descr" options={pieceDescrOptions} width={2} visible={Target.PROCESSO.name === data.content.target && PieceStrategy.TIPOS_ESPECIFICOS.name === data.content.piece_strategy} />
            <Frm.Select label="Resumir Selecionadas" name="content.summary" options={summaryOptions} width={2} visible={Target.PROCESSO.name === data.content.target} />
            <Frm.Select label="Compartilhamento" name="share" options={shareOptions} width={2} />

            {/* Seção de Encadeamento de Prompts */}
            <div className="col-12 mt-4">
                <h5>Encadeamento de Prompts</h5>
                
                {/* Predecessores */}
                <div className="row mb-3">
                    <div className="col-12">
                        <label className="form-label">Prompts Predecessores</label>
                        {(data.content.predecessors || []).map((predecessor, index) => (
                            <div key={index} className="row align-items-center mb-2">
                                <div className="col-3">
                                    <select 
                                        className="form-select" 
                                        value={predecessor.type} 
                                        onChange={(e) => {
                                            const newPredecessors = [...(data.content.predecessors || [])];
                                            newPredecessors[index].type = e.target.value as PromptChainType;
                                            setData({...data, content: {...data.content, predecessors: newPredecessors}});
                                        }}
                                    >
                                        <option value={PromptChainType.INTERNO}>Interno</option>
                                        <option value={PromptChainType.BANCO_DE_PROMPTS}>Banco de Prompts</option>
                                    </select>
                                </div>
                                <div className="col-6">
                                    <input 
                                        type={predecessor.type === PromptChainType.BANCO_DE_PROMPTS ? 'number' : 'text'}
                                        className="form-control" 
                                        placeholder={predecessor.type === PromptChainType.BANCO_DE_PROMPTS ? 'ID do Prompt' : 'Identificador interno'}
                                        value={predecessor.identifier} 
                                        onChange={(e) => {
                                            const newPredecessors = [...(data.content.predecessors || [])];
                                            newPredecessors[index].identifier = predecessor.type === PromptChainType.BANCO_DE_PROMPTS ? parseInt(e.target.value) || 0 : e.target.value;
                                            setData({...data, content: {...data.content, predecessors: newPredecessors}});
                                        }}
                                    />
                                </div>
                                <div className="col-2">
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={() => {
                                            const newPredecessors = [...(data.content.predecessors || [])];
                                            newPredecessors.splice(index, 1);
                                            setData({...data, content: {...data.content, predecessors: newPredecessors}});
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faRemove} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => {
                                const newPredecessors = [...(data.content.predecessors || []), { type: PromptChainType.INTERNO, identifier: '' }];
                                setData({...data, content: {...data.content, predecessors: newPredecessors}});
                            }}
                        >
                            <FontAwesomeIcon icon={faAdd} /> Adicionar Predecessor
                        </Button>
                    </div>
                </div>

                {/* Sucessores */}
                <div className="row mb-3">
                    <div className="col-12">
                        <label className="form-label">Prompts Sucessores</label>
                        {(data.content.successors || []).map((successor, index) => (
                            <div key={index} className="row align-items-center mb-2">
                                <div className="col-2">
                                    <select 
                                        className="form-select" 
                                        value={successor.type} 
                                        onChange={(e) => {
                                            const newSuccessors = [...(data.content.successors || [])];
                                            newSuccessors[index].type = e.target.value as PromptChainType;
                                            setData({...data, content: {...data.content, successors: newSuccessors}});
                                        }}
                                    >
                                        <option value={PromptChainType.INTERNO}>Interno</option>
                                        <option value={PromptChainType.BANCO_DE_PROMPTS}>Banco de Prompts</option>
                                    </select>
                                </div>
                                <div className="col-3">
                                    <input 
                                        type={successor.type === PromptChainType.BANCO_DE_PROMPTS ? 'number' : 'text'}
                                        className="form-control" 
                                        placeholder={successor.type === PromptChainType.BANCO_DE_PROMPTS ? 'ID do Prompt' : 'Identificador interno'}
                                        value={successor.identifier} 
                                        onChange={(e) => {
                                            const newSuccessors = [...(data.content.successors || [])];
                                            newSuccessors[index].identifier = successor.type === PromptChainType.BANCO_DE_PROMPTS ? parseInt(e.target.value) || 0 : e.target.value;
                                            setData({...data, content: {...data.content, successors: newSuccessors}});
                                        }}
                                    />
                                </div>
                                <div className="col-3">
                                    <input 
                                        type="text"
                                        className="form-control" 
                                        placeholder="Nome da variável (Lo_ ou Tx_)"
                                        value={successor.condition.variable} 
                                        onChange={(e) => {
                                            const newSuccessors = [...(data.content.successors || [])];
                                            newSuccessors[index].condition.variable = e.target.value;
                                            setData({...data, content: {...data.content, successors: newSuccessors}});
                                        }}
                                    />
                                </div>
                                <div className="col-3">
                                    {successor.condition.variable.startsWith('Lo_') ? (
                                        <select 
                                            className="form-select" 
                                            value={successor.condition.value.toString()} 
                                            onChange={(e) => {
                                                const newSuccessors = [...(data.content.successors || [])];
                                                newSuccessors[index].condition.value = e.target.value === 'true';
                                                setData({...data, content: {...data.content, successors: newSuccessors}});
                                            }}
                                        >
                                            <option value="true">true</option>
                                            <option value="false">false</option>
                                        </select>
                                    ) : (
                                        <input 
                                            type="text"
                                            className="form-control" 
                                            placeholder="Valor da condição"
                                            value={successor.condition.value.toString()} 
                                            onChange={(e) => {
                                                const newSuccessors = [...(data.content.successors || [])];
                                                newSuccessors[index].condition.value = e.target.value;
                                                setData({...data, content: {...data.content, successors: newSuccessors}});
                                            }}
                                        />
                                    )}
                                </div>
                                <div className="col-1">
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={() => {
                                            const newSuccessors = [...(data.content.successors || [])];
                                            newSuccessors.splice(index, 1);
                                            setData({...data, content: {...data.content, successors: newSuccessors}});
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faRemove} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => {
                                const newSuccessors = [...(data.content.successors || []), { 
                                    type: PromptChainType.INTERNO, 
                                    identifier: '', 
                                    condition: { variable: '', value: '' } 
                                }];
                                setData({...data, content: {...data.content, successors: newSuccessors}});
                            }}
                        >
                            <FontAwesomeIcon icon={faAdd} /> Adicionar Sucessor
                        </Button>
                    </div>
                </div>
            </div>

            <div className='col col-12'>
                {showAdvancedOptions &&
                    <Nav variant="underline" defaultActiveKey="fields" onSelect={(eventKey) => { setTab(eventKey || 'fields') }} className="mb-2">
                        <Nav.Item>
                            <Nav.Link eventKey="fields">Campos</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="yaml">YAML</Nav.Link>
                        </Nav.Item>
                    </Nav>
                }
                {tab === 'fields'
                    ? (<>
                        {isTemplate
                            ? (<>
                                {showAdvancedOptions && <>
                                    <div className="row">
                                        {data.content.system_prompt !== undefined && <Frm.TextArea label="Prompt de Sistema (opcional)" name="content.system_prompt" maxRows={5} width={""} />}
                                        {data.content.system_prompt !== undefined && <Frm.Button variant="light" onClick={() => { data.content.system_prompt = undefined; setData({ ...data }) }}><FontAwesomeIcon icon={faRemove} /> Prompt de Sistema</Frm.Button>}
                                    </div>
                                    <div className="row">
                                        <Frm.TextArea label="Prompt (opcional)" name="content.prompt" maxRows={5} width={""} />
                                        {data.content.system_prompt === undefined && <Frm.Button variant="light" onClick={() => { data.content.system_prompt = ''; setData({ ...data }) }}><FontAwesomeIcon icon={faAdd} /> Prompt de Sistema</Frm.Button>}
                                    </div>
                                </>}
                                <Frm.Markdown label="Modelo" name="content.template" maxRows={5} width={""} />
                                {unclosedMarking
                                    ? <div className="alert alert-danger mt-3">
                                        Marcação não fechada: <strong>{unclosedMarking.kind}</strong> na linha <strong>{unclosedMarking.lineNumber}</strong> - <span className="template-error" dangerouslySetInnerHTML={{ __html: unclosedMarking.lineContent }} />
                                    </div>

                                    : <div className="text-body-tertiary">Utilize &#39;&#123;&#39; para inclusões e &#39;&#123;&#123;&#39; para condicionais. Mais detalhes no <a href="https://trf2.gitbook.io/apoia/criar-prompt-a-partir-de-um-modelo" target="_blank">manual</a>.</div>
                                }
                            </>)
                                : (<>
                                    {showAdvancedOptions && <>
                                        <div className="row">
                                            {data.content.json_schema !== undefined && <Frm.TextArea label="JSON Schema (opcional)" name="content.json_schema" maxRows={5} width={""} />}
                                            {data.content.json_schema !== undefined && <Frm.Button variant="light" onClick={() => { data.content.json_schema = undefined; setData({ ...data }) }}><FontAwesomeIcon icon={faRemove} /> Schema</Frm.Button>}
                                        </div>
                                        <div className="row">
                                            {data.content.format !== undefined && <Frm.TextArea label="Format (opcional)" name="content.format" maxRows={5} width={""} />}
                                            {data.content.format !== undefined && <Frm.Button variant="light" onClick={() => { data.content.format = undefined; setData({ ...data }) }}><FontAwesomeIcon icon={faRemove} /> Format</Frm.Button>}
                                        </div>
                                        <div className="row">
                                            <Frm.TextArea label="Prompt de Sistema (opcional)" name="content.system_prompt" maxRows={5} width={""} />
                                            {data.content.json_schema === undefined && <Frm.Button variant="light" onClick={() => { data.content.json_schema = ''; setData({ ...data }) }}><FontAwesomeIcon icon={faAdd} /> Schema</Frm.Button>}
                                            {data.content.format === undefined && <Frm.Button variant="light" onClick={() => { data.content.format = ''; setData({ ...data }) }}><FontAwesomeIcon icon={faAdd} /> Format</Frm.Button>}
                                        </div>
                                    </>}
                                    <Frm.TextArea label="Prompt" name="content.prompt" maxRows={20} explanation={`Utilize {{textos}} onde devem ser incluídos os textos capturados ${Target.PROCESSO.name === data.content.target ? 'das peças do processo' : 'do editor de textos'}, ou serão automaticamente incluídos no final.`} />
                                </>)}
                            </>)
                            : (<TextareaAutosize className="form-control" value={yaml} onChange={(e) => handleYamlChanged(e.target.value)} />)}
                    </div>
                <div className="col col-auto mt-3 mb-3">
                    <Button variant="light" className="" onClick={handleBack}>Voltar</Button>
                </div>

                <div className="col col-auto mt-3 mb-3 ms-auto">
                    {showAdvancedOptions
                        ? <Button variant="light" className="me-3" disabled={data.content.system_prompt || data.content.json_schema || data.content.format} onClick={() => { setShowAdvancedOptions(false) }}>Ocultar Opções Avançadas</Button>
                        : <Button variant="light" className="me-3" onClick={() => { setShowAdvancedOptions(true) }}>Exibir Opções Avançadas</Button>}
                    <Button variant="primary" disabled={pending || pristine} className="" onClick={handleSave}>Salvar</Button>
                    <FormError formState={formState} />
                </div>
            </div >
            )
}