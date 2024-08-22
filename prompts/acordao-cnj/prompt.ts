import fs from 'fs'
import nunjucks from 'nunjucks'
import { PromptType } from '../_prompts'
import { z } from 'zod'
import { parse, ALL } from 'partial-json'
import promptText from './prompt.txt'
import systemText from './system-prompt.txt'

export default async (data): Promise<PromptType> => {
    const prompt: string = promptText.replace('{{textos}}', `${data.textos.reduce((acc, txt) => acc + `${txt.descr}:\n<${txt.slug}>\n${txt.texto}\n</${txt.slug}>\n\n`, '')}`)
    const system: string = systemText

    // console.log('acordao-prompt', JSON.stringify([{ role: 'system', content: system }, { role: 'user', content: prompt }]))

    return {
        message: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
        params: {
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
            },
            format
        }
    }
}

function format(s: string): string {
    if (!s) return ''

    if (!s.startsWith('{')) return s

    const json = parse(s, ALL)
    if (!json) return ''

    const result = nunjucks.renderString(`**Ementa:** {{cabecalho}}

{% if casoEmExame %}1. {{casoEmExame}}{% endif %}
{% if decisoes %}{% for d in decisoes %}
{{loop.index + 1}}. {{ d.decisaoEFundamentos }}
{% endfor %}{% endif %}
{% if dispositivo %}{{decisoes | length + 2}}. **{{dispositivo}}**{% endif %}
{% if dispositivosRelevantesCitados %}
---

_Dispositivos relevantes citados_: {% for d in dispositivosRelevantesCitados %}{{ "" if loop.first else ("; e " if loop.last else "; ") }}{{ d }}{{"." if loop.last else ""}}{% endfor %}{% endif %}
{% if jurisprudenciaRelevanteCitada %}
_Jurisprudência relevante citada_: {% for d in jurisprudenciaRelevanteCitada %}{{ "" if loop.first else ("; e " if loop.last else "; ") }}{{ d }}{{"." if loop.last else ""}}{% endfor %}
{% endif %}`, json)

    return result
}

