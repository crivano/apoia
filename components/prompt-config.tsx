'use client'

import { EMPTY_FORM_STATE, FormHelper } from '@/lib/form-support'
import { useEffect, useState } from 'react'
import _ from 'lodash'
import { IAModel, IAPrompt, IARankingType, IATestset, SelectableItem, SelectableItemWithLatestAndOfficial } from '@/lib/mysql-types'
import { loadModels, loadPrompts } from '@/lib/prompt-config'
import { PromptConfigType } from '@/lib/prompt-types'
import { updateWithLatestAndOfficial } from '@/lib/mysql-types'
import Link from 'next/link'
import { Button } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { faSave } from '@fortawesome/free-regular-svg-icons'

const Frm = new FormHelper()

function PromptConfigForm({ kind, config, onSave }: { kind: string, config: PromptConfigType, onSave: (config: PromptConfigType) => void }) {
    const [prompts, setPrompts] = useState([] as SelectableItem[])
    const [models, setModels] = useState([] as SelectableItem[])
    const [prompt_id, setPromptId] = useState(config.prompt_id ? config.prompt_id.toString() : undefined)
    const [model_id, setModelId] = useState(config.model_id ? config.model_id.toString() : undefined)
    const [extra, setExtra] = useState(config.extra)

    useEffect(() => {
        const asyncSetData = async () => {
            const promptRecords = await loadPrompts(kind, config.prompt_id)
            setPrompts(updateWithLatestAndOfficial(promptRecords) as SelectableItemWithLatestAndOfficial[])
            const modelRecords = await loadModels(kind, config.model_id)
            setModels(modelRecords as SelectableItemWithLatestAndOfficial[])
        }
        asyncSetData()
    }, [kind])

    const returnConfig = () => {
        console.log('returnConfig', prompts, prompt_id, model_id, extra)
        const prompt_name = prompts.find(p => p.id == prompt_id)?.name
        const model_name = models.find(m => m.id == model_id)?.name
        onSave({ prompt_id: prompt_id ? parseInt(prompt_id) : undefined, prompt_name, model_id: model_id ? parseInt(model_id) : undefined, model_name, extra })
    }

    Frm.update({ prompt_id, model_id, extra }, (d) => { setPromptId(d.prompt_id); setModelId(d.model_id); setExtra(d.extra) }, EMPTY_FORM_STATE)

    return <div className="mb-5">
        <div className="alert alert-info pt-0">
            <div className="row">
                <Frm.Select label="Prompt" name="prompt_id" options={[{ id: 0, name: '' }, ...prompts]} width={6} />
                <Frm.Select label="Modelo de Linguagem" name="model_id" options={[{ id: 0, name: '' }, ...models]} width={6} />
                <Frm.TextArea label="Personalização do Prompt" name="extra" width={''} />
                <Frm.Button onClick={returnConfig} variant="primary"><FontAwesomeIcon icon={faSave} /></Frm.Button>
            </div>
        </div>
    </div >
}

export default function PromptConfig({ kind, config }: { kind: string, config: PromptConfigType }) {
    const [editing, setEditing] = useState(false)
    const [current, setCurrent] = useState(config)

    const onSave = (newConfig: PromptConfigType) => {
        console.log('onSave', newConfig)
        setCurrent(newConfig)
        setEditing(false)
    }

    if (!editing)
        return <p className="text-muted">Prompt: {current.prompt_name || 'Padrão'}, modelo de linguagem: {current.model_name || 'Padrão'}{current.extra && `, Personalização do Prompt: ${current.extra}`} - <FontAwesomeIcon onClick={() => { setEditing(true) }} icon={faEdit} /></p>
    return <PromptConfigForm kind={kind} config={current} onSave={onSave} />
}