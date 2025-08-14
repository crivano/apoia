import { parse, ALL } from 'partial-json'
import nunjucks from 'nunjucks'
import { dateAddDays, dateAddMonths, parseDateDDMMYYYY } from '../utils/date'

export function buildFormatter(formatter: string): (s: string) => string {
    return (s: string) => format(formatter, s)
}

export function format(formatter: string, s: string): string {
    if (!s) return ''

    if (!s.startsWith('{')) return s

    const json = parse(s, ALL)
    if (!json) return ''

    if (!formatter) return s

    formatter = formatter.replace(/{=/g, '{{')
    formatter = formatter.replace(/=}/g, '}}')

//    var env = nunjucks.configure()
//    env.addFilter('deProcedencia', arr => arr.filter(e => e.tipo == 'PROCEDENTE'))
//    env.addFilter('deImprocedencia', arr => arr.filter(e => e.tipo == 'IMPROCEDENTE'))

    json.date = parseDateDDMMYYYY
    json.dateAddDays = dateAddDays
    json.dateAddMonths = dateAddMonths

    try {
        const result = nunjucks.renderString(formatter, json)
        return result
    } catch (e) {
        console.error('Error formatting string:', e)
        return `Erro ao formatar: ${e.message}`
    }
}

