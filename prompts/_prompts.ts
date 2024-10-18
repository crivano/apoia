import int_testar from "./int-testar/prompt"
import int_gerar_perguntas from "./int-gerar-perguntas/prompt"
import resumo_peca from "./resumo-peca"
import resumo_peticao_inicial from "./resumo-peticao-inicial"
import resumo_contestacao from "./resumo-contestacao"
import resumo_informacao_em_mandado_de_seguranca from "./resumo-informacao-em-mandado-de-seguranca"
import resumo_sentenca from "./resumo-sentenca"
import resumo_recurso_inominado from "./resumo-recurso-inominado"
import analise from "./analise"
import analise_tr from "./analise-tr"
import resumo from "./resumo"
import triagem from "./triagem"
import acordao from "./acordao-cnj/prompt"
import ementa from "./acordao-cnj/prompt"
import revisao from "./revisao"
import refinamento from "./refinamento"
import sentenca from "./sentenca/prompt"
import { any } from "zod"
import { CoreMessage } from "ai"

export type TextoType = { descr: string; slug: string; pTexto?: Promise<string>; texto?: string }
export type PromptData = { textos: TextoType[] }
export type PromptType = {
    message: CoreMessage[], params?: {
        structuredOutputs?: { schemaName: string, schemaDescription: string, schema: any },
        format?: (s: string) => string,
        cacheControl?: boolean | number
    }
}

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

// Enum for the different types of prompts
export default {
    int_testar,
    int_gerar_perguntas,
    resumo_peca,
    resumo_peticao_inicial,
    resumo_contestacao,
    resumo_informacao_em_mandado_de_seguranca,
    resumo_sentenca,
    resumo_recurso_inominado,
    analise,
    analise_tr,
    resumo,
    triagem,
    acordao,
    revisao,
    refinamento,
    sentenca,
    ementa
}