import { parse, ALL } from 'partial-json'
import nunjucks from 'nunjucks'

export function format(s: string): string {
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