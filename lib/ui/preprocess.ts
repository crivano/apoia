import showdown from 'showdown'
import { P } from '../proc/combinacoes'
import { PromptDataType, PromptDefinitionType, TextoType } from '../ai/prompt-types'
import { diff as mddiff, diffAndCollapse as diffAndCompact } from './mddiff'
import { format as libFormat } from '../ai/format'

import diff from 'html-diff-ts';

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

export const preprocess = (text: string, definition: PromptDefinitionType, data: PromptDataType, complete: boolean, visualization?: VisualizationEnum, diffSource?: string) => {
    console.log('Preprocessing text', diffSource)
    text = filterText(text)

    if (definition.format)
        text = libFormat(definition.format, text)

    if (complete && visualization !== undefined) {
        let texto = diffSource || data.textos[0].texto

        switch (visualization) {
            case VisualizationEnum.DIFF:
                return converter.makeHtml(mddiff(texto as string, text, true))
            case VisualizationEnum.DIFF_COMPACT:
                return converter.makeHtml(diffAndCompact(texto as string, text))
            case VisualizationEnum.DIFF_HIGHLIGHT_INCLUSIONS:
                return diff(converter.makeHtml(texto as string), converter.makeHtml(text), {
                    blocksExpression: [{ exp: /\[(.*?)\]/g }]
                }).replace(/"diff(ins|del|mod)"/g, '"diff$1-highlight"')
            case VisualizationEnum.TEXT_EDITED:
                return converter.makeHtml(text)
            case VisualizationEnum.TEXT_ORIGINAL:
                return converter.makeHtml(texto as string)
        }
    }

    text = converter.makeHtml(text)
    return text
}

