import ms from 'ms'

export const timeAgo = (timestamp: Date, timeOnly?: boolean): string => {
  if (!timestamp) return 'never'
  return `${ms(Date.now() - new Date(timestamp).getTime())}${timeOnly ? '' : ' ago'
    }`
}

export const maiusculasEMinusculas = (s) => {
  let sb = "";
  let f = true;

  for (let i = 0; i < s.length; i++) {
    const ch = s.substring(i, i + 1);
    if (ch.toUpperCase() !== ch.toLowerCase()) {
      if (f) {
        sb += ch.toUpperCase();
        f = false;
      } else {
        sb += ch.toLowerCase();
      }
    } else {
      sb += ch;
      f = true;
    }
  }

  s = sb;

  s = s.replace(" E ", " e ");
  s = s.replace(" Da ", " da ");
  s = s.replace(" Das ", " das ");
  s = s.replace(" De ", " de ");
  s = s.replace(" Do ", " do ");
  s = s.replace(" Dos ", " dos ");

  return s;
}

export const getNumberOfDaysInMonth = (year: number, month: number): number => {
  // Create a new Date object with the given year and month (months are zero-based)
  const date = new Date(year, month - 1, 1);

  // Get the last day of the month by subtracting one day from the first day of the next month
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  // Return the day component of the last day, which gives the number of days in the month
  return lastDay.getDate();
}


// Format date as YYYY-MM-DD HH:mm:ss
export const formatDate = (date: Date): string =>
  date ? date.toISOString().replace('T', ' ').replace(/\..+/, '') : ''


export const convertBrazilianValueToNumber = (value) => {
  if (typeof value === 'string') {
    value = value.replace(/\./g, '').replace(',', '.')
  }
  return value
}

export const slugify = (str) => {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, remove numbers etc
  const from = "àáäâãèéëêìíïîòóöôõùúüûñç·/_,:;";
  const to = "aaaaaeeeeiiiiooooouuuunc------";

  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars and numbers
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-') // collapse dashes
    .replace(/-+$/g, '') // remove trailing -
    .replace(/^-+/g, '') // remove leading -

  return str;
}


export const parseYYYYMMDDHHMMSS = (dataAjuizamento: any) => {
  let dt = new Date(
    dataAjuizamento.slice(0, 4),
    dataAjuizamento.slice(4, 6) - 1,
    dataAjuizamento.slice(6, 8),
    dataAjuizamento.slice(8, 10),
    dataAjuizamento.slice(10, 12),
    dataAjuizamento.slice(12, 14)
  )
  // dt.setTime(dt.getTime() - dt.getTimezoneOffset() * 60 * 1000)
  // dt.setTime(dt.getTime() - 3 * 60 * 1000)
  return dt
}

export const formatBrazilianDateTime = (dt: Date) => {
  // dt.setTime(dt.getTime() + dt.getTimezoneOffset() * 60 * 1000)
  return dt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', timeZoneName: 'short' })
}

export const formatBrazilianDate = (dt: Date) => {
  return dt.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

export const addBlockQuote = (str: string) => {
  const regex = /(<p[^>]+class="paragrafoComRecuo"[^>]*>.*?<\/p>)/gm
  const subst = `<blockquote>$1</blockquote>`
  const result = str.replace(regex, subst)
  return result
}

export const removeEmptyKeys = (payload: any) => {
    Object.keys(payload).forEach(key => {
        if (payload[key] === '') {
            delete payload[key]
        }
    })
}

export const intOrUndefined = (v: string | number | undefined): number | undefined => {
  if (typeof v === 'string') {
    return parseInt(v)
  }
  return v
}
