import showdown from 'showdown'
import { P } from '../proc/combinacoes'
import { PromptDataType, PromptDefinitionType, TextoType } from '../ai/prompt-types'
import { diff, diffAndCollapse as diffAndCompact } from './mddiff'
import { format as libFormat } from '../ai/format'

const converter = new showdown.Converter({ tables: true })

export const enum VisualizationEnum {
    DIFF,
    DIFF_COMPACT,
    TEXT_EDITED,
    TEXT_ORIGINAL
}

export const Visualization = [
    { id: VisualizationEnum.DIFF, descr: 'Diferença' },
    { id: VisualizationEnum.DIFF_COMPACT, descr: 'Diferença Compacta' },
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

export const preprocess = (text: string, definition: PromptDefinitionType, data: PromptDataType, complete: boolean, visualization?: VisualizationEnum) => {
    text = filterText(text)

    if (definition.format)
        text = libFormat(definition.format, text)

    if (complete && visualization !== undefined) {
        let texto = data.textos[0].texto

        switch (visualization) {
            case VisualizationEnum.DIFF:
                return converter.makeHtml(diff(texto as string, text, true))
            case VisualizationEnum.DIFF_COMPACT:
                return converter.makeHtml(diffAndCompact(texto as string, text))
            case VisualizationEnum.TEXT_EDITED:
                return converter.makeHtml(text)
            case VisualizationEnum.TEXT_ORIGINAL:
                return converter.makeHtml(texto as string)
        }
    }

    text = converter.makeHtml(text)
    return text
}

