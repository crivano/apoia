'use client'

import { useRef, useState } from "react"
import { Button, Form } from "react-bootstrap"

export default function Print(params) {
    const [html, setHtml] = useState('Testando...')
    const ref = useRef(null)

    const handleClick = (e) => {
        const printDiv = document.querySelector('#printDiv')
        const innerHTML = printDiv ? printDiv.innerHTML : ''
        const printHtml = document.querySelector('#printHtml')
        if (printHtml) {
            printHtml.setAttribute('value', innerHTML)
        }
        let htm = document.documentElement.innerHTML
        htm = htm.replace(/<(table|th|td)(>| )/g, '<$1 style="border-collapse: collapse; padding: .2em; border: 1px solid;"$2')
        console.log('htm', htm)
        setHtml(htm)

        const printForm = document.querySelector('#printForm') as HTMLFormElement
        if (printForm) {
            printForm.submit()
        }
    }

    return (
        <div className="h-print" style={{height: '1em'}}>
            <Form id="printForm" className="float-end" action={`/api/pdf/${params.numeroDoProcesso}`} method="post" ref={ref} >
                <input id="printHtml" type="text" name="html" value={html} />
                <Button variant="primary" type="button" onClick={(e) => handleClick(e)}>PDF</Button>
            </Form>
        </div>
    )
}