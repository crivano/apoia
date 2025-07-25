import { Button, Dropdown, Form } from 'react-bootstrap'
import ReactTextareaAutosize from 'react-textarea-autosize'
import { z, ZodTypeAny, ZodError } from 'zod';
import _ from 'lodash'
import { Dispatch } from 'react';
// import dynamic from 'next/dynamic'
import Editor from '../../components/EditorComponent';

export const numericString = (schema: ZodTypeAny) => z.preprocess((a) => {
    if (typeof a === 'string') {
        return parseInt(a, 10)
    } else if (typeof a === 'number') {
        return a;
    } else {
        return undefined;
    }
}, schema);


type FieldErrorProps = {
    formState: FormState
    name: string
}

type FormErrorProps = {
    formState: FormState
}

const FieldError = ({ formState, name }: FieldErrorProps) => {
    if (!formState.fieldErrors || !formState.fieldErrors[name]) return ''
    return (
        <span className="text-danger">
            {formState.fieldErrors[name]?.[0]}
        </span>
    )
}

const FormError = ({ formState }: FormErrorProps) => {
    if (formState.status !== "ERROR") return ''
    return (
        <span className="text-danger align-middle">
            <strong>Erro! </strong>{formState?.message} <span style={{ display: 'none' }}>{JSON.stringify(formState)}</span>
        </span>
    )
}

export { FieldError, FormError }

export type FormState = {
    status: 'UNSET' | 'SUCCESS' | 'ERROR'
    message: string
    fieldErrors: Record<string, string[] | undefined>
    timestamp: number
}

export const EMPTY_FORM_STATE: FormState = {
    status: 'UNSET' as const,
    message: '',
    fieldErrors: {},
    timestamp: Date.now(),
}

export const getPathReference = (path: (string | number)[]): string => {
    const segments = path.reduce((acc: string, segment, index) => {
        if (typeof segment === 'number') {
            return `${acc}[${segment}]`
        } else {
            return index === 0 ? `${segment}` : `${acc}.${segment}`
        }
    }, '');
    return segments as string;
}

export const fromErrorToFormState = (error: unknown) => {
    if (error instanceof ZodError) {
        const fieldErrors = error.errors.reduce((acc, e) => {
            if (!acc[getPathReference(e.path)])
                acc[getPathReference(e.path)] = [e.message]
            else
                acc[getPathReference(e.path)].push(e.message)
            return acc
        }, {})
        return {
            status: 'ERROR' as const,
            message: '',
            fieldErrors,
            timestamp: Date.now()
        }
    } else if (error instanceof Error) {
        return {
            status: 'ERROR' as const,
            message: error.message,
            fieldErrors: {},
            timestamp: Date.now(),
        }
    } else {
        return {
            status: 'ERROR' as const,
            message: 'An unknown error occurred',
            fieldErrors: {},
            timestamp: Date.now(),
        }
    }
}

// export const FormInput = ({ label, name, state, width }: { label: string, name: string, state: any, width?: number }) => {
//     return (
//         <Form.Group className={`mt-3 col col-12 col-md-${width || 12}`} controlId={name}>
//             <Form.Label className={this.compact ? 'mb-0' : ''}>{label}</Form.Label>
//             <Form.Control name={name} type="text" defaultValue={state[name]} placeholder="" />
//             <FieldError formState={state} name={name} />
//         </Form.Group>
//     )
// }

// export const FormTextArea = ({ label, name, state, width, onChange }: { label: string, name: string, state: any, onChange?, width?: number }) => {
//     return (
//         <Form.Group className={`mt-3 col col-12 col-md-${width || 12}`} controlId={name}>
//             <Form.Label className={this.compact ? 'mb-0' : ''}>{label}</Form.Label>
//             <ReactTextareaAutosize className="form-control" name={name} defaultValue={state[name]} placeholder="" onChange={onChange} />
//             <FieldError formState={state} name={name} />
//         </Form.Group>
//     )
// }

// export const FormSelect = ({ label, name, state, options, width }: { label: string, name: string, state: any, options: [{ id: number, name: string }], width?: number }) => {
//     return (
//         <Form.Group className={`mt-3 col col-12 col-md-${width || 12}`} controlId={name}>
//             <Form.Label className={this.compact ? 'mb-0' : ''}>{label}</Form.Label>
//             <Form.Select name={name} defaultValue={state[name]}>
//                 {options.map(c => (<option value={'' + c.id} key={c.id}  >{c.name}</option>))}
//             </Form.Select>
//             <FieldError formState={state} name={name} />
//         </Form.Group >
//     )
// }

// export const FormInput2 = ({ label, name, value, onChange, formState, width }: { label: string, name: string, value: any, onChange?, formState: FormState, width?: number }) => {
//     return (
//         <Form.Group className={`mt-3 col col-12 col-md-${width || 12}`} controlId={name} onChange={onChange}>
//             <Form.Label className={this.compact ? 'mb-0' : ''}>{label}</Form.Label>
//             <Form.Control name={name} type="text" value={value} placeholder="" />
//             <FieldError formState={formState} name={name} />
//         </Form.Group>
//     )
// }

// export const FormTextArea2 = ({ label, name, value, onChange, formState, width }: { label: string, name: string, value: any, onChange?, formState: FormState, width?: number }) => {
//     return (
//         <Form.Group className={`mt-3 col col-12 col-md-${width || 12}`} controlId={name}>
//             <Form.Label className={this.compact ? 'mb-0' : ''}>{label}</Form.Label>
//             <ReactTextareaAutosize className="form-control" name={name} value={value} placeholder="" onChange={onChange} />
//             <FieldError formState={formState} name={name} />
//         </Form.Group>
//     )
// }

// export const FormSelect2 = ({ label, name, value, onChange, formState, options, width }: { label: string, name: string, value: any, onChange?, formState: FormState, options: [{ id: number, name: string }], width?: number }) => {
//     return (
//         <Form.Group className={`mt-3 col col-12 col-md-${width || 12}`} controlId={name}>
//             <Form.Label className={this.compact ? 'mb-0' : ''}>{label}</Form.Label>
//             <Form.Select name={name} value={value} onChange={onChange}>
//                 {options.map(c => (<option value={c.id} key={c.id}  >{c.name}</option>))}
//             </Form.Select>
//             <FieldError formState={formState} name={name} />
//         </Form.Group >
//     )
// }

export class FormHelper {
    data: any;
    setData: (data: any) => void;
    formState: FormState;
    compact: boolean;

    constructor(compact?: boolean) {
        this.compact = compact || false;
    }


    public update = (data: any, setData: (data: any) => void, formState: FormState) => {
        this.data = data;
        this.setData = setData;
        this.formState = formState;
    }

    // constructor(data: any, setData: (data: any) => void, formState: FormState) {
    //     this.data = data;
    //     this.setData = setData;
    //     this.formState = formState;
    // }

    public get = (name: string) => {
        return _.get(this.data, name)
    }

    public set = (name: string, value: any) => {
        const newData = { ...this.data }
        _.set(newData, name, value)
        this.setData(newData)
        this.data = newData
    }

    public colClass = (width?: string | number) => `${this.compact ? 'mb-0' : 'mt-3'} col ${typeof width === 'string' ? width : `col-12 col-md-${width || 12}`}`

    public Input = ({ label, name, validator, width, visible, explanation }: { label: string, name: string, visible?: boolean, explanation?: string, validator?: (value: string, name: string) => string | undefined, width?: number | string }) => {
        return (
            <Form.Group className={`${this.colClass(width)} ${visible === false ? 'd-none' : ''}`} controlId={name}>
                <Form.Label className={this.compact ? 'mb-0' : ''}>{label}</Form.Label>
                <Form.Control name={name} type="text" value={this.get(name)} onChange={e => { this.set(name, e.target.value); validator && validator(e.target.value, name) }} placeholder="" key={name} />
                <FieldError formState={this.formState} name={name} />
                {explanation && <Form.Text className="text-body-tertiary">{explanation}</Form.Text>}
            </Form.Group>
        )
    }

    public Checkbox = ({ label, name, width, visible, explanation }: { label: string, name: string, width?: number | string, visible?: boolean, explanation?: string }) => {
        return (
            <Form.Group className={`${this.colClass(width)} ${visible === false ? 'd-none' : ''}`} controlId={name}>
                <Form.Label className={this.compact ? 'mb-0' : ''}>&nbsp;</Form.Label>
                <Form.Check
                    type="checkbox"
                    id={name}
                    label={label}
                    checked={!!this.get(name)}
                    onChange={e => this.set(name, e.target.checked)}
                />
                <FieldError formState={this.formState} name={name} />
                {explanation && <Form.Text className="text-body-tertiary">{explanation}</Form.Text>}
            </Form.Group>
        )
    }

    public TextArea = ({ label, name, width, maxRows, explanation }: { label: string, name: string, width?: number | string, maxRows?: number, explanation?: string }) => {
        return (
            <Form.Group className={this.colClass(width)} controlId={name}>
                <Form.Label className={this.compact ? 'mb-0' : ''}>{label}</Form.Label>
                <ReactTextareaAutosize className="form-control" name={name} value={this.get(name)} onChange={e => this.set(name, e.target.value)} placeholder="" key={name} />
                <FieldError formState={this.formState} name={name} />
                {explanation && <Form.Text className="text-body-tertiary">{explanation}</Form.Text>}
            </Form.Group>
        )
    }

    public Markdown = ({ label, name, width, maxRows, explanation }: { label: string, name: string, width?: number | string, maxRows?: number, explanation?: string }) => {
        // const EditorComp = dynamic(() => import('../../components/EditorComponent'), { ssr: false })

        return (
            <Form.Group className={this.colClass(width)} controlId={name}>
                <Form.Label className={this.compact ? 'mb-0' : ''}>{label}</Form.Label>
                <Editor markdown={this.get(name) || ''} onChange={e => this.set(name, e)} key={name} />
                <FieldError formState={this.formState} name={name} />
                {explanation && <Form.Text className="text-body-tertiary">{explanation}</Form.Text>}
            </Form.Group>
        )
    }

    public Select = ({ label, name, options, width, visible }: { label: string, name: string, options: { id: number | string, name: string, disabled?: boolean, hidden?: boolean }[], visible?: boolean, width?: number | string }) => {
        return (
            <Form.Group className={`${this.colClass(width)} ${visible === false ? 'd-none' : ''}`} controlId={name}>
                <Form.Label className={this.compact ? 'mb-0' : ''}>{label}</Form.Label>
                <Form.Select name={name} value={this.get(name) || ''} onChange={e => this.set(name, e.target.value)}>
                    {options.map(c => (<option value={c.id} key={c.id} disabled={c.disabled === true} hidden={c.hidden === true}>{c.name}</option>))}
                </Form.Select>
                <FieldError formState={this.formState} name={name} />
            </Form.Group >
        )
    }

    public MultiSelect = ({ label, name, options, width, visible }: { label: string, name: string, options: { id: number | string, name: string, disabled?: boolean }[], visible?: boolean, width?: number | string }) => {

        const change = (event) => {
            const id = event.target.value;
            const choosen = event.target.checked;

            if (choosen) {
                this.set(name, [...(this.get(name) || []), id]);
            } else {
                this.set(name, (this.get(name) || []).filter((i) => i !== id));
            }
        };

        return (
            <Form.Group className={`${this.colClass(width)} ${visible === false ? 'd-none' : ''}`} controlId={name}>
                <Form.Label className={this.compact ? 'mb-0' : ''}>{label}</Form.Label>
                <Dropdown>
                    <Dropdown.Toggle as='span' variant="light" id="dropdown-basic" className='form-control'>
                        {(this.get(name) || []).length === 0
                            ? 'Selecione'
                            : this.get(name).length === options.length
                                ? 'Todos'
                                : `${this.get(name).length} selecionado${this.get(name).length > 1 ? 's' : ''}`
                            // options.find(o => o.id === this.get(name)[0])?.name
                        }
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="ps-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {options.map((option) => (
                            <Form.Check
                                className="custom-checkbox ml-3"
                                key={option.id}
                                type="checkbox"
                                id={`option_${option.id}`}
                                label={option.name}
                                checked=
                                {(this.get(name) || []).includes(option.id)}
                                onChange={change}
                                value={option.id}
                            />
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
                {/* {JSON.stringify(this.get(name))} */}
                <FieldError formState={this.formState} name={name} />
            </Form.Group >
        )
    }

    public CheckBoxes = ({ label, labelsAndNames, onClick, width }: { label: string, labelsAndNames: { label: string, name: string }[], onClick?: (label: string, name: string, checked: boolean) => void, width?: number | string }) => {
        return this.setData ? (
            <div className={this.colClass(width)}>
                <Form.Label>{label}</Form.Label>
                {labelsAndNames.filter(c => c != null).map((c, idx) => {
                    return (
                        <Form.Check key={c.name} type="checkbox" label={c.label} checked={this.get(c.name)} onChange={e => { this.set(c.name, e.target.checked); if (onClick) onClick(c.label, c.name, e.target.checked) }} />
                    )
                })}
            </div>
        ) : (
            <div className={this.colClass(width)}>
                <Form.Label>{label}</Form.Label>
                <table className="table table-bordered">
                    <tbody>
                        {labelsAndNames.filter(c => c != null).map((c, idx) => {
                            return (
                                <tr key={c.name}>
                                    <td>{c.label}</td>
                                    <td><strong>{this.get(c.name) ? 'Sim' : 'Não'}</strong></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }

    public Button = ({ onClick, variant, children }: { onClick: () => void, variant?: string, children }) => {
        return (<div className="col col-auto mt-3">
            <label className="form-label">&nbsp;</label><br />
            <Button variant={variant || 'light'} onClick={onClick}>{children}</Button>
        </div>)
    }

}

