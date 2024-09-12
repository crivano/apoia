import { parse, ALL } from 'partial-json'
import nunjucks from 'nunjucks'

export function format(s: string): string {
    if (!s) return ''

    if (!s.startsWith('{')) return s

    const json = parse(s, ALL)
    if (!json) return ''

    const result = nunjucks.renderString(`**Ementa:** {{cabecalho}}

1. {{casoEmExame}}

{% for d in razoesDeDecidir %}
2. {{ d }}
{% endfor %}

{{razoesDeDecidir | length + 2}}. **{{dispositivo}}**

---

_Dispositivos relevantes citados_: {% for d in dispositivosRelevantesCitados %}{{ "" if loop.first else ("; e " if loop.last else "; ") }}{{ d }}{{"." if loop.last else ""}}{% endfor %}


_Jurisprudência relevante citada_: {% for d in jurisprudenciaRelevanteCitada %}{{ "" if loop.first else ("; e " if loop.last else "; ") }}{{ d }}{{"." if loop.last else ""}}{% endfor %}`, json)

    return result
}