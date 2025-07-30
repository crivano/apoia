'use client'

import React from 'react'
import { FormHelper } from '@/lib/ui/form-support'
import { flatternPromptVariables, parsePromptVariablesFromMarkdown, PromptVariableType } from '@/lib/ai/auto-json'
import { Button } from 'react-bootstrap'
import { preprocess } from '@/lib/ui/preprocess'
import { PromptDefinitionType } from '@/lib/ai/prompt-types'

export type PromptFormProps = {
    promptMarkdown: string
    promptFormat: string
    Frm: FormHelper
}

const PromptField = (variable: PromptVariableType, Frm: FormHelper) => {
    switch (variable.type) {
        case 'boolean':
            return (
                <Frm.Checkbox
                    key={variable.name}
                    label={variable.label || variable.name}
                    name={`information_extraction.${variable.name}`}
                    width={6}
                />
            )
        case 'number':
        case 'date':
            return (
                <Frm.Input
                    key={variable.name}
                    label={variable.label || variable.name}
                    name={`information_extraction.${variable.name}`}
                    width={6}
                />
            )
        case 'string-long':
            return (
                <Frm.TextArea
                    key={variable.name}
                    label={variable.label || variable.name}
                    name={`information_extraction.${variable.name}`}
                    width={12}
                />
            )
        case 'string':
        default:
            return (
                <Frm.Input
                    key={variable.name}
                    label={variable.label || variable.name}
                    name={`information_extraction.${variable.name}`}
                    width={6}
                />
            )
    }
}

export const InformationExtractionForm: React.FC<PromptFormProps> = ({ promptMarkdown, promptFormat, Frm }) => {
    const variables = flatternPromptVariables(parsePromptVariablesFromMarkdown(promptMarkdown))
    // if (!variables || variables.length === 0) return null
    // console.log(`InformationExtractionForm: variables: ${JSON.stringify(variables, null, 2)}`)

    if (!Frm.get('information_extraction_editing')) {
        let promptFormatPreprocessed = promptFormat
        promptFormatPreprocessed = promptFormatPreprocessed.replace(/{{/g, '<ins class="diffins-highlight">{{')
        promptFormatPreprocessed = promptFormatPreprocessed.replace(/}}/g, '}}</ins>')
        promptFormatPreprocessed = promptFormatPreprocessed.replace(/{=/g, '{{')
        promptFormatPreprocessed = promptFormatPreprocessed.replace(/=}/g, '}}')
        // console.log(`Prompt format preprocessed: ${promptFormatPreprocessed}`)
        const html = preprocess(JSON.stringify(Frm.get('information_extraction')), { format: promptFormatPreprocessed } as PromptDefinitionType, undefined, true).text
        return <>
            <div className="alert alert-info ai-content mb-3" dangerouslySetInnerHTML={{ __html: html }} />
            <div className="row h-print mb-3">
                <div className="col"> <Button className="float-end" variant="info" onClick={() => Frm.set('information_extraction_editing', true)}>
                    Editar Informações Extraídas
                </Button>
                </div>
            </div>
        </>
    }


    return (<>
        <div className="alert alert-warning">
            <div className="row">
                {variables.map((variable, index) => (
                    <>
                        {variable.separatorName && <div className="col-12"><h4 className={`${index ? 'mt-3' : 'mt-0'} mb-1`}>{variable.separatorName.replace(/_/g, ' ')}</h4></div>}
                        {PromptField(variable, Frm)}
                    </>
                ))}
            </div>
        </div>
        {Frm.get('information_extraction') &&
            <div className="row h-print">
                <div className="col">
                    <Button className="float-end mb-3" variant="warning" onClick={() => Frm.set('information_extraction_editing', false)}>
                        Concluir a Edição
                    </Button>
                </div>
            </div>}
    </>
    )
}