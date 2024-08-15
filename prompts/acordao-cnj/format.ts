import { parse, ALL } from 'partial-json'
import nunjucks from 'nunjucks'

export function format(s: string): string {
    if (!s) return ''

    if (!s.startsWith('{')) return s

    const json = parse(s, ALL)
    if (!json) return ''

    const result = nunjucks.renderString(`# EMENTA

{{ementa}}
{% for dispositivo in dispositivos %}
{{loop.index}}. {{ dispositivo }}
{% endfor %}
{% if conclusao %}{{dispositivos.length + 1}}. {{conclusao}}{% endif %}

# ACÓRDÃO

{{acordao}}`, json)

    return result
}