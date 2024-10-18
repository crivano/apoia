import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'

const structuredOutputs = {
    schemaName: 'int-testar',
    schemaDescription: 'Teste de Resultado de Prompt',
    schema: z.object({
        respostas: z.array(
            z.object({
                pergunta: z.string(),
                trecho: z.string(),
                resposta: z.string(),
                justificativa: z.string(),
            }))
    })
}

export default structuredOutputs

// console.log('Structured output schema loaded', JSON.stringify(zodToJsonSchema(structuredOutputs.schema, 'ementa')))
