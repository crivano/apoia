import { parse, ALL } from 'partial-json'
import nunjucks from 'nunjucks'

export function buildFormatter(formatter: string): (s: string) => string {
    return (s: string) => format(formatter, s)
}

export function format(formatter: string, s: string): string {
    if (!s) return ''

    if (!s.startsWith('{')) return s

    const json = parse(s, ALL)
    if (!json) return ''

    const result = nunjucks.renderString(formatter, json)

    return result
}

