import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'

const structuredOutputs = {
    schemaName: 'ementa',
    schemaDescription: 'Ementa de Acórdão',
    schema: z.object({
        cabecalho: z.string(),
        casoEmExame: z.string(),
        questaoEmDiscussao: z.string(),
        decisoes: z.array(
            z.object({
                alegacao: z.string(),
                fundamentos: z.array(z.string()),
                decisao: z.string(),
                decisaoEFundamentos: z.string(),
            })),
        dispositivo: z.string(),
        dispositivosRelevantesCitados: z.array(z.string()),
        jurisprudenciaRelevanteCitada: z.array(z.string())
    })
}

export default structuredOutputs

// console.log('Structured output schema loaded', JSON.stringify(zodToJsonSchema(structuredOutputs.schema, 'ementa')))
