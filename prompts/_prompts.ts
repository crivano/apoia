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
import revisao from "./revisao"
import refinamento from "./refinamento"
import { any } from "zod"
import { CoreMessage } from "ai"

export type Texto = { descr: string; slug: string; pTexto?: Promise<string>; texto?: string }
export type PromptData = { textos: Texto[] }
export type PromptType = {
    message: CoreMessage[], params: {
        structuredOutputs?: { schemaName: string, schemaDescription: string, schema: any },
        format?: (s: string) => string
    }
}

// Enum for the different types of prompts
export default {
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
}