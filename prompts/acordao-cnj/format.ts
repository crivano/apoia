import { parse, ALL } from 'partial-json'
import nunjucks from 'nunjucks'

export default function format(s: string): string {
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

