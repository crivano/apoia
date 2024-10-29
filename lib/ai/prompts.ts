import ementa from '@/prompts/ementa.md'
import int_testar from "@/prompts/int-testar.md"
import int_gerar_perguntas from "@/prompts/int-gerar-perguntas.md"
import resumo_peca from "@/prompts/resumo-peca.md"
import resumo_peticao_inicial from "@/prompts/resumo-peticao-inicial.md"
import resumo_contestacao from "@/prompts/resumo-contestacao.md"
import resumo_informacao_em_mandado_de_seguranca from "@/prompts/resumo-informacao-em-mandado-de-seguranca.md"
import resumo_sentenca from "@/prompts/resumo-sentenca.md"
import resumo_recurso_inominado from "@/prompts/resumo-recurso-inominado.md"
import analise from "@/prompts/analise.md"
import analise_tr from "@/prompts/analise-tr.md"
import resumo from "@/prompts/resumo.md"
import revisao from "@/prompts/revisao.md"
import refinamento from "@/prompts/refinamento.md"
import sentenca from "@/prompts/sentenca.md"
import int_identificar_tipo_de_documento from '@/prompts/int-identificar-tipo-de-documento.md'

import { CoreMessage, jsonSchema } from "ai"
import { slugify } from "@/lib/utils/utils"
import { PromptData, PromptType, PromptTypeParams } from "@/lib/ai/prompt-types"
import { buildFormatter } from "@/lib/ai/format"

export const applyTextsAndVariables = (text: string, data: PromptData): string => {
    const allTexts = `${data.textos.reduce((acc, txt) => acc + `${txt.descr}:\n<${txt.slug}>\n${txt.texto}\n</${txt.slug}>\n\n`, '')}`
    text = text.replace('{{textos}}', allTexts)

    text = text.replace(/{{textos\.([a-z_]+)}}/g, (match, slug) => {
        const found = data.textos.find(txt => txt.slug === slug)
        if (!found) throw new Error(`Slug '${slug}' não encontrado`)
        return `${found.descr}:\n<${found.slug}>\n${found.texto}\n</${found.slug}>\n\n`
    })

    return text
}

export const promptDefinitionFromMarkdown = (md: string): (data: PromptData) => PromptType => {
    const regex = /(?:^# (?<tag>SYSTEM PROMPT|PROMPT|JSON SCHEMA|FORMAT)\s*)$/gms;

    // Create an object with the different parts of the markdown
    const parts = md.split(regex).reduce((acc, part, index, array) => {
        if (index % 2 === 0) {
            const tag = array[index - 1]?.trim()
            if (tag) {
                acc[slugify(tag).replace('-', '_')] = part.trim()
            }
        }
        return acc;
    }, {} as { prompt: string, system_prompt?: string, json_schema?: string, format?: string })

    const { prompt, system_prompt, json_schema, format } = parts

    const promptBuilder = (data: PromptData): PromptType => {
        const message: CoreMessage[] = []
        if (system_prompt)
            message.push({ role: 'system', content: system_prompt })

        const promptContent: string = prompt.replace('{{textos}}', `${data.textos.reduce((acc, txt) => acc + `${txt.descr}:\n<${txt.slug}>\n${txt.texto}\n</${txt.slug}>\n\n`, '')}`)
        message.push({ role: 'user', content: promptContent })

        const params: PromptTypeParams = {}
        if (json_schema)
            params.structuredOutputs = { schemaName: 'structuredOutputs', schemaDescription: 'Structured Outputs', schema: jsonSchema(JSON.parse(json_schema)) }
        if (format)
            params.format = buildFormatter(format)
        return { message, params }
    }

    return promptBuilder
}

// Enum for the different types of prompts
export default {
    ementa: promptDefinitionFromMarkdown(ementa),
    int_testar: promptDefinitionFromMarkdown(int_testar),
    int_gerar_perguntas: promptDefinitionFromMarkdown(int_gerar_perguntas),
    resumo_peca: promptDefinitionFromMarkdown(resumo_peca),
    resumo_peticao_inicial: promptDefinitionFromMarkdown(resumo_peticao_inicial),
    resumo_contestacao: promptDefinitionFromMarkdown(resumo_contestacao),
    resumo_informacao_em_mandado_de_seguranca: promptDefinitionFromMarkdown(resumo_informacao_em_mandado_de_seguranca),
    resumo_sentenca: promptDefinitionFromMarkdown(resumo_sentenca),
    resumo_recurso_inominado: promptDefinitionFromMarkdown(resumo_recurso_inominado),
    analise: promptDefinitionFromMarkdown(analise),
    analise_tr: promptDefinitionFromMarkdown(analise_tr),
    resumo: promptDefinitionFromMarkdown(resumo),
    revisao: promptDefinitionFromMarkdown(revisao),
    refinamento: promptDefinitionFromMarkdown(refinamento),
    sentenca: promptDefinitionFromMarkdown(sentenca),
    int_identificar_tipo_de_documento: promptDefinitionFromMarkdown(int_identificar_tipo_de_documento),

}