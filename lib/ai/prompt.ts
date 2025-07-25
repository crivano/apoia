import { CoreMessage, jsonSchema } from "ai"
import { slugify } from "@/lib/utils/utils"
import { PromptDataType, PromptExecuteType, PromptExecuteParamsType, PromptDefinitionType, PromptOptionsType, TextoType } from "@/lib/ai/prompt-types"
import { buildFormatter } from "@/lib/ai/format"
import { DadosDoProcessoType } from "@/lib/proc/process-types"
import { promptJsonSchemaFromPromptMarkdown } from "./auto-json"

export const formatText = (txt: TextoType, limit?: number) => {
    let s: string = txt.descr
    s += `:\n<${txt.slug}${txt.event ? ` event="${txt.event}"` : ''}${txt.idOrigem ? ` id="${txt.idOrigem}"` : ''}${txt.label ? ` label="${txt.label}"` : ''}>\n${limit ? txt.texto?.substring(0, limit) : txt.texto}\n</${txt.slug}>\n\n`
    return s
}

export const applyTextsAndVariables = (text: string, data: PromptDataType, jsonSchema?: string, template?: string): string => {
    if (!text) return ''
    const allTexts = `${data.textos.reduce((acc, txt) => acc + formatText(txt), '')}`

    text = text.replace('{{jsonSchema}}', jsonSchema || 'JSON Schema não definido')

    text = text.replace('{{textos}}', allTexts)

    text = text.replace('{{template}}', template ? `<template>\n${template}\n</template>` : '')

    text = text.replace(/{{textos\.limit\((\d+)\)}}/g, (match, limit) => {
        const limitNumber = parseInt(limit, 10)
        const limitedTexts = data.textos.reduce((acc, txt) => acc + formatText(txt, limitNumber), '')
        return limitedTexts
    })

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
            const c = await texto.pTexto
            if (c === undefined) throw new Error(`Conteúdo não encontrado para ${texto.label} (${texto.descr}) no evento ${texto.event}`)
            if (c?.errorMsg) throw new Error(c.errorMsg)
            texto.texto = c?.conteudo
            delete texto.pTexto
        }
    }
}

export async function getPiecesWithContent(dadosDoProcesso: DadosDoProcessoType, dossierNumber: string, skipError: boolean = false): Promise<TextoType[]> {
    let pecasComConteudo: TextoType[] = []
    for (const peca of dadosDoProcesso.pecasSelecionadas) {
        if (peca.pConteudo === undefined && peca.conteudo === undefined && !skipError) {
            // console.log('peca', peca)
            throw new Error(`Conteúdo não encontrado no processo ${dossierNumber}, peça ${peca.id}, rótulo ${peca.rotulo}`)
        }
        const slug = await slugify(peca.descr)
        pecasComConteudo.push({ id: peca.id, event: peca.numeroDoEvento, idOrigem: peca.idOrigem, label: peca.rotulo, descr: peca.descr, slug, pTexto: peca.pConteudo, texto: peca.conteudo })
    }
    return pecasComConteudo
}

export const promptExecuteBuilder = (definition: PromptDefinitionType, data: PromptDataType): PromptExecuteType => {
    const message: CoreMessage[] = []
    if (definition.systemPrompt)
        message.push({ role: 'system', content: applyTextsAndVariables(definition.systemPrompt, data, definition.jsonSchema, definition.template) })

    // add {{textos}} to the prompt if it doesn't have it
    let prompt = definition.prompt
    if (prompt && !prompt.includes('{{') && (!definition.systemPrompt || !definition.systemPrompt.includes('{{')))
        prompt = `${prompt}\n\n{{textos}}`

    if (prompt && !definition.jsonSchema) {
        definition.jsonSchema = promptJsonSchemaFromPromptMarkdown(prompt)
    }

    const promptContent: string = applyTextsAndVariables(prompt, data, definition.jsonSchema, definition.template)
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
        template: options.overrideTemplate !== undefined ? options.overrideTemplate : definition.template,
        model: options.overrideModel !== undefined ? options.overrideModel : definition.model,
        cacheControl: options.cacheControl !== undefined ? options.cacheControl : definition.cacheControl
    }
}

type JsonSchemaPropertyType = {
    type: string
    description: string
    properties?: Record<string, JsonSchemaPropertyType>
}

function mapToOrderedObject(value: any): any {
    if (value instanceof Map) {
        const orderedObj: Record<string, any> = {};
        for (const [key, val] of value.entries()) {
            orderedObj[key] = mapToOrderedObject(val); // chamada recursiva
        }
        return orderedObj;
    } else if (Array.isArray(value)) {
        return value.map(item => mapToOrderedObject(item)); // trata arrays que podem conter Maps
    } else {
        return value; // valor primitivo ou objeto comum
    }
}

function mapToOrderedJson<T>(map: Map<string, T>, pretty: boolean = false): string {
    const orderedObj = mapToOrderedObject(map);
    return JSON.stringify(orderedObj, null, pretty ? 2 : 0);
}

export const promptDefinitionFromMarkdown = (slug, md: string): PromptDefinitionType => {
    const regex = /(?:^# (?<tag>SYSTEM PROMPT|PROMPT|JSON SCHEMA|FORMAT)\s*)$/gms;

    // Create an object with the different parts of the markdown
    const parts = md.split(regex).reduce((acc, part, index, array) => {
        if (index % 2 === 0) {
            const tag = array[index - 1]?.trim()
            if (tag) {
                acc[slugify(tag).replaceAll('-', '_')] = part.trim()
            }
        }
        return acc;
    }, {} as { prompt: string, system_prompt?: string, json_schema?: string, format?: string, template?: string })

    const { prompt, system_prompt, json_schema, format, template } = parts

    return { kind: slug, prompt, systemPrompt: system_prompt, jsonSchema: json_schema, format, template, cacheControl: true }
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
import pedidos_fundamentacoes_e_dispositivos from '@/prompts/pedidos-fundamentacoes-e-dispositivos.md'
import indice from '@/prompts/indice.md'
import chat from '@/prompts/chat.md'
import relatorio_de_processo_coletivo_ou_criminal from '@/prompts/relatorio-de-processo-coletivo-ou-criminal.md'
import chat_standalone from '@/prompts/chat-standalone.md'
import relatorio_completo_criminal from '@/prompts/relatorio-completo-criminal.md'
import minuta_de_despacho_de_acordo_9_dias from '@/prompts/minuta-de-despacho-de-acordo-9-dias.md'
import template from '@/prompts/template.md'
import sentenca_prev_bi_laudo_favoravel from '@/prompts/sentenca-prev-bi-laudo-favoravel.md'

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
    pedidos_fundamentacoes_e_dispositivos: promptDefinitionFromMarkdown('pedidos_fundamentacoes_e_dispositivos', pedidos_fundamentacoes_e_dispositivos),
    indice: promptDefinitionFromMarkdown('indice', indice),
    chat: promptDefinitionFromMarkdown('chat', chat),
    relatorio_de_processo_coletivo_ou_criminal: promptDefinitionFromMarkdown('relatorio_de_processo_coletivo_ou_criminal', relatorio_de_processo_coletivo_ou_criminal),
    chat_standalone: promptDefinitionFromMarkdown('chat_standalone', chat_standalone),
    relatorio_completo_criminal: promptDefinitionFromMarkdown('relatorio_completo_criminal', relatorio_completo_criminal),
    minuta_de_despacho_de_acordo_9_dias: promptDefinitionFromMarkdown('minuta_de_despacho_de_acordo_9_dias', minuta_de_despacho_de_acordo_9_dias),
    template: promptDefinitionFromMarkdown('template', template),
    sentenca_prev_bi_laudo_favoravel: promptDefinitionFromMarkdown('sentenca_prev_bi_laudo_favoravel', sentenca_prev_bi_laudo_favoravel)
}
