import showdown from 'showdown'
import { P } from '../proc/combinacoes'
import { PromptDataType, PromptDefinitionType, TextoType } from '../ai/prompt-types'
import { diff as mddiff, diffAndCollapse as diffAndCompact } from './mddiff'
import { format as libFormat } from '../ai/format'

import diff from 'diff-htmls';

const converter = new showdown.Converter({ tables: true })

export const enum VisualizationEnum {
    DIFF,
    DIFF_COMPACT,
    DIFF_HIGHLIGHT_INCLUSIONS,
    TEXT_EDITED,
    TEXT_ORIGINAL
}

export const Visualization = [
    { id: VisualizationEnum.DIFF, descr: 'Diferença' },
    { id: VisualizationEnum.DIFF_COMPACT, descr: 'Diferença Compacta' },
    { id: VisualizationEnum.DIFF_HIGHLIGHT_INCLUSIONS, descr: 'Destacar Inclusões' },
    { id: VisualizationEnum.TEXT_EDITED, descr: 'Texto Refinado' },
    { id: VisualizationEnum.TEXT_ORIGINAL, descr: 'Texto Original' }
]

export const filterText = (text) => {
    // if text is an array os strings, join them
    if (Array.isArray(text)) {
        text = text.join('')
    }
    let s = text

    if (s.includes('<scratchpad>'))
        s = s.split('<scratchpad>')[1]
    if (s.includes('</scratchpad>'))
        s = s.split('</scratchpad>')[1]
    if (s.includes('<result>'))
        s = s.split('<result>')[1]
    if (s.includes('</result>'))
        s = s.split('</result>')[0]
    s = s
    return s.trim()
}

export const buildTemplateMap = (template: string) => {
    const templateMap = {}
    const regex = /<(snippet|if)\s+id="([^"]*)"\s+expr="([^"]+)"\s*\/?>/g
    let match
    while ((match = regex.exec(template)) !== null) {
        const id = match[2]
        const expr = match[3]
        templateMap[id] = expr
    }
    return templateMap
}

export const diffTable = (template: string, text: string) => {
    const templateMap = buildTemplateMap(template)

    let table = `<table class="diff-table">
        <thead>
            <tr>
                <th>#</th>
                <th>Expressão</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Justificativa</th>
            </tr>
        </thead>
        <tbody>`

    const regex = /<(snippet|if)\s+id="([^"]*)"\s+justification="([^"]*)"\s*(?:\/>|>(.*?)<\/\1>)/gs
    let i = 1
    for (const match of text.matchAll(regex)) {
        const [fullMatch, type, id, justification, value] = match
        table += `<tr>
                <td>${id}</td>
                <td>${templateMap[id]}</td>
                <td>${type}</td>
                <td>${(value || '').trim()}</td>
                <td>${justification}</td>
            </tr>`
    }

    table += `</tbody></table>`
    return table
}

export const preprocess = (text: string, definition: PromptDefinitionType, data: PromptDataType, complete: boolean, visualization?: VisualizationEnum, diffSource?: string) => {
    text = filterText(text)

    if (definition.format)
        text = libFormat(definition.format, text)

    if (complete && visualization !== undefined) {
        let textoOriginal = diffSource || data.textos[0].texto

        // text = text.replace(/<snippet>/g, '[').replace(/<\/snippet>/g, ']')

        const blocksExpression = [
            { exp: /\<snippet id="\d+x?" justification="[^"]*?"\s?\/\>/g },
            { exp: /\<snippet id="\d+x?" justification="[^"]*?"\>(.*?)\<\/snippet\>/g },
            { exp: /\<if id="\d+x?" justification="[^"]*?"\s?\/\>/g },
            { exp: /\<if id="\d+x?" justification="[^"]*?"\>(.*?)\<\/if\>/g },
        ]

        switch (visualization) {
            case VisualizationEnum.DIFF:
                // return converter.makeHtml(mddiff(texto as string, text, true))
                return diff(converter.makeHtml(textoOriginal as string), converter.makeHtml(text), { blocksExpression })
            case VisualizationEnum.DIFF_COMPACT:
                return converter.makeHtml(diffAndCompact(textoOriginal as string, text))
            case VisualizationEnum.DIFF_HIGHLIGHT_INCLUSIONS: {
                let textoOriginalLimpo = textoOriginal.replace(/<snippet id="\d+x?" expr="[^"]*?"><\/snippet>/g, '')
                textoOriginalLimpo = textoOriginalLimpo.replace(/<if id="\d+x?" expr="[^"]*?">/g, '')
                textoOriginalLimpo = textoOriginalLimpo.replace(/<\/if>/g, '')
                let d = diff(converter.makeHtml(textoOriginalLimpo), converter.makeHtml(text), { blocksExpression })
                d = d.replace(/"diff(ins|del|mod)"/g, '"diff$1-highlight"')
                d = d.replace(/<\/p>(?<delAntes>(?:\s*<del[^>]*>[^<]<\/del>\s*|\s*<p>\s*<del[^>]*>[^<]*<\/del>\s*<\/p>\s*)*)<p>\s*(?<delDepois>(?:<del[^>]*>[^<]*<\/del>\s*)*)(?<ins><ins[^>]*><snippet id="\d+" .+?<\/ins>)/g,
                    (match, delAntes, delDepois, ins) => {
                        if (delAntes) delAntes = delAntes.replace(/<p>/g, '').replace(/<\/p>/g, '')
                        return `${delAntes}${delDepois}${ins}`
                    })
                if (textoOriginal.includes('<snippet '))
                    d += diffTable(textoOriginal as string, text)
                return d
            }
            case VisualizationEnum.TEXT_EDITED:
                return converter.makeHtml(text)
            case VisualizationEnum.TEXT_ORIGINAL:
                return converter.makeHtml(textoOriginal as string)
        }
    }

    text = converter.makeHtml(text)
    return text
}

