import fs from 'fs'
import nunjucks from 'nunjucks'
import { PromptData, PromptType } from '../_prompts'
import { z } from 'zod'
import { parse, ALL } from 'partial-json'
import promptText from './prompt.txt'
import systemText from './system-prompt.txt'

export default (data: PromptData): PromptType => {
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

    const result = nunjucks.renderString(`_**Ementa:**_ <span style="font-variant: small-caps slashed-zero;">{{cabecalho}}</span>

{% if casoEmExame %}<h4 style="font-variant: small-caps slashed-zero;">I. Caso em exame</h4>

1. {{casoEmExame}}{% endif %}
{% if questaoEmDiscussao %}<h4 style="font-variant: small-caps slashed-zero;">II. Questão em discussão</h4>

2. {{questaoEmDiscussao}}{% endif %}
{% if decisoes %}<h4 style="font-variant: small-caps slashed-zero;">III. Razões de decidir</h4>

{% for d in decisoes %}
{{loop.index + 2}}. {{ d.decisaoEFundamentos }}
{% endfor %}{% endif %}
{% if dispositivo %}<h4 style="font-variant: small-caps slashed-zero;">IV. Dispositivo</h4>

{{decisoes | length + 3}}. {{dispositivo}}{% endif %}
{% if dispositivosRelevantesCitados %}
---

_Dispositivos relevantes citados_: {% for d in dispositivosRelevantesCitados %}{{ "" if loop.first else ("; e " if loop.last else "; ") }}{{ d }}{{"." if loop.last else ""}}{% endfor %}{% endif %}
{% if jurisprudenciaRelevanteCitada %}
_Jurisprudência relevante citada_: {% for d in jurisprudenciaRelevanteCitada %}{{ "" if loop.first else ("; e " if loop.last else "; ") }}{{ d }}{{"." if loop.last else ""}}{% endfor %}
{% endif %}`, json)

    return result
}

