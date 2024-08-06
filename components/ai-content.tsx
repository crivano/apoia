'use client'

import { useEffect, useRef, useState } from 'react'
import EvaluationModal from './ai-evaluation'
import { evaluate } from '../lib/generate'
import { preprocess, Visualization, VisualizationEnum } from '@/lib/preprocess'
import { ResumoDePecaLoading } from '@/components/loading'
import { InfoDeProduto, P } from '@/lib/combinacoes'
import { Texto } from '@/prompts/_prompts'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsDown } from '@fortawesome/free-regular-svg-icons'
import { faRefresh } from '@fortawesome/free-solid-svg-icons'
import { Form } from 'react-bootstrap'

export const dynamic = 'force-dynamic'

export default function AiContent(params: { infoDeProduto: InfoDeProduto, textos: Texto[] }) {
    const [current, setCurrent] = useState('')
    const [complete, setComplete] = useState(false)
    const [errormsg, setErrormsg] = useState('')
    const [show, setShow] = useState(false)
    const [evaluated, setEvaluated] = useState(false)
    const [visualizationId, setVisualizationId] = useState<number>(VisualizationEnum.DIFF)
    const initialized = useRef(false)
    const prompt = params.infoDeProduto.prompt

    const handleClose = async (evaluation_id: number, descr: string | null) => {
        setShow(false)
        if (evaluation_id) setEvaluated(await evaluate(prompt, params, evaluation_id, descr))
    }
    const handleShow = () => setShow(true)

    const getColor = (text, errormsg) => {
        let color = 'info'
        if (text && text.includes('<scratchpad>'))
            color = 'warning'
        if (text && text.includes('<result>'))
            color = 'success'
        if (errormsg)
            color = 'danger'
        return color
    }


    const fetchStream = async () => {
        const response = await fetch('/api/ai', {
            method: 'POST',
            body: JSON.stringify({
                prompt,
                data: { textos: params.textos.map(t => ({ descr: t.descr, slug: t.slug, texto: t.texto })) },
                date: new Date()
            })
        })
        const reader = response.body?.getReader()

        if (reader) {
            while (true) {
                const { done, value } = await reader.read()
                if (done) {
                    setComplete(true)
                    break
                }
                setCurrent(prev => prev + new TextDecoder().decode(value))
            }
        }
    }

    const run = async () => {
        setCurrent('')
        setErrormsg('')
        setComplete(false)
        setEvaluated(false)
        try {
            fetchStream()
        } catch (e) {
            setErrormsg(e.message)
        }
    }

    useEffect(() => {
        if (initialized.current) return
        initialized.current = true
        run()
    }, [])

    const color = getColor(current, errormsg)

    const spinner = (s: string, complete: boolean): string => {
        if (complete) return s
        // if s ends with a tag, add a flashing cursor before it
        if (s && s.match(/<\/[a-z]+>$/)) {
            s = s.replace(/(?:\s*<\/[a-z]+>)+$/, '<span class="blinking-cursor">&#x25FE;</span>$&')
        }
        return s
    }

    function getEnumKeys<
        T extends string,
        TEnumValue extends string | number,
    >(enumVariable: { [key in T]: TEnumValue }) {
        return Object.keys(enumVariable) as Array<T>;
    }

    console.log('VisualizationEnum',)

    return <>
        {current || errormsg
            ? <div className={`alert alert-${color} ai-content`}>
                {color === 'warning' && <h1 className="mt-0">Rascunho</h1>}
                {complete || errormsg
                    ? evaluated
                        ? <button className="btn btn-sm bt float-end d-print-none" onClick={() => { setCurrent(''); run() }}><FontAwesomeIcon icon={faRefresh} /></button>
                        : <button className="btn btn-sm bt float-end d-print-none" onClick={() => { handleShow() }}><FontAwesomeIcon icon={faThumbsDown} /></button>
                    : null}
                {errormsg
                    ? <span>{errormsg}</span>
                    : <div dangerouslySetInnerHTML={{ __html: spinner(preprocess(current, params.infoDeProduto, params.textos, complete, visualizationId), complete) }} />}
                <EvaluationModal show={show} onClose={handleClose} />
            </div>
            : <ResumoDePecaLoading />
        }

        {params.infoDeProduto.produto === P.REFINAMENTO && complete &&
            <div className="row d-print-none">
                <div className="col col-auto">
                    <Form.Select aria-label="Tipo de Visualização" value={visualizationId} onChange={e => setVisualizationId(parseInt(e.target.value))} className='w-100 mt-2'>
                        {Visualization.map(e => (
                            <option key={e.id} value={e.id}>{e.descr}</option>))}
                    </Form.Select>
                </div>
            </div>
        }
    </>
}