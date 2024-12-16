import { CoreMessage, jsonSchema } from "ai"
import { slugify } from "@/lib/utils/utils"
import { PromptDataType, PromptExecuteType, PromptExecuteParamsType, PromptDefinitionType, PromptOptionsType, TextoType } from "@/lib/ai/prompt-types"
import { buildFormatter } from "@/lib/ai/format"


export const formatText = (txt: TextoType) => {
    let s: string = txt.descr
    s += `:\n<${txt.slug}${txt.event ? ` event="${txt.event}"` : ''}${txt.label ? ` label="${txt.label}"` : ''}>\n${txt.texto}\n</${txt.slug}>\n\n`
    return s
}

export const applyTextsAndVariables = (text: string, data: PromptDataType): string => {
    const allTexts = `${data.textos.reduce((acc, txt) => acc + formatText(txt), '')}`
    text = text.replace('{{textos}}', allTexts)

    text = text.replace(/{{textos\.([a-z_]+)}}/g, (match, slug) => {
        const found = data.textos.find(txt => txt.slug === slug)
        if (!found) throw new Error(`Slug '${slug}' não encontrado`)
        return `${found.descr}:\n<${found.slug}>\n${found.texto}\n</${found.slug}>\n\n`
    })

    return text
}

export const waitForTexts = async (data: PromptDataType): Promise<void> => {
    if (data?.textos) {
        for (const texto of data.textos) {
            if (!texto.pTexto) continue
            texto.texto = await texto.pTexto
            delete texto.pTexto
        }
    }
}

export const promptExecuteBuilder = (definition: PromptDefinitionType, data: PromptDataType): PromptExecuteType => {
    const message: CoreMessage[] = []
    if (definition.systemPrompt)
        message.push({ role: 'system', content: definition.systemPrompt })

    const promptContent: string = applyTextsAndVariables(definition.prompt, data)
    message.push({ role: 'user', content: promptContent })

    const params: PromptExecuteParamsType = {}
    if (definition.jsonSchema)
        params.structuredOutputs = { schemaName: 'structuredOutputs', schemaDescription: 'Structured Outputs', schema: jsonSchema(JSON.parse(definition.jsonSchema)) }
    if (definition.format)
        params.format = buildFormatter(definition.format)
    return { message, params }
}

export const promptDefinitionFromDefinitionAndOptions = (definition: PromptDefinitionType, options: PromptOptionsType): PromptDefinitionType => {
    return {
        kind: definition.kind,
        systemPrompt: options.overrideSystemPrompt !== undefined ? options.overrideSystemPrompt : definition.systemPrompt,
        prompt: options.overridePrompt !== undefined ? options.overridePrompt : definition.prompt,
        jsonSchema: options.overrideJsonSchema !== undefined ? options.overrideJsonSchema : definition.jsonSchema,
        format: options.overrideFormat !== undefined ? options.overrideFormat : definition.format,
        model: options.overrideModel !== undefined ? options.overrideModel : definition.model,
        cacheControl: options.cacheControl !== undefined ? options.cacheControl : definition.cacheControl
    }
}

export const promptDefinitionFromMarkdown = (slug, md: string): PromptDefinitionType => {
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

    return { kind: slug, prompt, systemPrompt: system_prompt, jsonSchema: json_schema, format, cacheControl: true }
}


export const promptExecutionFromMarkdown = (md: string): (data: PromptDataType) => PromptExecuteType => {
    const definition = promptDefinitionFromMarkdown('md', md)

    return (data) => promptExecuteBuilder(definition, data)
}

export function getPromptIdentifier(prompt: string) {
    let promptUnderscore = prompt.replace(/-/g, '_')
    let buildPrompt = internalPrompts[promptUnderscore]
    if (!buildPrompt && prompt.startsWith('resumo-')) {
        promptUnderscore = 'resumo_peca'
    }
    return promptUnderscore
}

export function getInternalPrompt(slug: string): PromptDefinitionType {
    return internalPrompts[getPromptIdentifier(slug)]
}

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
import analise_completa from '@/prompts/analise-completa.md'
import resumo from "@/prompts/resumo.md"
import revisao from "@/prompts/revisao.md"
import refinamento from "@/prompts/refinamento.md"
import sentenca from "@/prompts/sentenca.md"
import int_identificar_categoria_de_peca from '@/prompts/int-identificar-categoria-de-peca.md'
import litigancia_predatoria from '@/prompts/litigancia-predatoria.md'
import pedidos_de_peticao_inicial from '@/prompts/pedidos-de-peticao-inicial.md'

// Enum for the different types of prompts
export const internalPrompts = {
    ementa: promptDefinitionFromMarkdown('ementa', ementa),
    int_testar: promptDefinitionFromMarkdown('int_testar', int_testar),
    int_gerar_perguntas: promptDefinitionFromMarkdown('int_gerar_perguntas', int_gerar_perguntas),
    resumo_peca: promptDefinitionFromMarkdown('resumo_peca', resumo_peca),
    resumo_peticao_inicial: promptDefinitionFromMarkdown('resumo_peticao_inicial', resumo_peticao_inicial),
    resumo_contestacao: promptDefinitionFromMarkdown('resumo_contestacao', resumo_contestacao),
    resumo_informacao_em_mandado_de_seguranca: promptDefinitionFromMarkdown('resumo_informacao_em_mandado_de_seguranca', resumo_informacao_em_mandado_de_seguranca),
    resumo_sentenca: promptDefinitionFromMarkdown('resumo_sentenca', resumo_sentenca),
    resumo_recurso_inominado: promptDefinitionFromMarkdown('resumo_recurso_inominado', resumo_recurso_inominado),
    analise: promptDefinitionFromMarkdown('analise', analise),
    analise_tr: promptDefinitionFromMarkdown('analise_tr', analise_tr),
    analise_completa: promptDefinitionFromMarkdown('analise_completa', analise_completa),
    resumo: promptDefinitionFromMarkdown('resumo', resumo),
    revisao: promptDefinitionFromMarkdown('revisao', revisao),
    refinamento: promptDefinitionFromMarkdown('refinamento', refinamento),
    sentenca: promptDefinitionFromMarkdown('sentenca', sentenca),
    int_identificar_categoria_de_peca: promptDefinitionFromMarkdown('int_identificar_categoria_de_peca', int_identificar_categoria_de_peca),
    litigancia_predatoria: promptDefinitionFromMarkdown('litigancia_predatoria', litigancia_predatoria),
    pedidos_de_peticao_inicial: promptDefinitionFromMarkdown('pedidos_de_peticao_inicial', pedidos_de_peticao_inicial),
}

