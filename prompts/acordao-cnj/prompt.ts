'use server'

import fs from 'fs'
import { z } from 'zod'
import { PromptType } from '../_prompts'

export default async (data): Promise<PromptType> => {
    const prompt: string = fs.readFileSync('prompts/acordao-cnj/prompt.txt', 'utf8').replace('{{textos}}', `${data.textos.reduce((acc, txt) => acc + `${txt.descr}:\n<${txt.slug}>\n${txt.texto}\n</${txt.slug}>\n\n`, '')}`)
    const system: string = fs.readFileSync('prompts/acordao-cnj/system-prompt.txt', 'utf8')

    // console.log('acordao-prompt', JSON.stringify([{ role: 'system', content: system }, { role: 'user', content: prompt }]))

    return {
        message: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
        structuredOutputs: {
            schemaName: 'ementa',
            schemaDescription: 'Ementa de Acórdão',
            schema: z.object({
                cabecalho: z.string(),
                casoEmExame: z.string(),
                decisoes: z.array(
                    z.object({
                        alegacao: z.string(),
                        fundamentos: z.array(z.string()),
                        decisao: z.string(),
                        decisaoEFundamentos: z.string(),
                    })),
                dispositivo: z.string(),
            })
        }
    }
}
