export const EMPTY_PREFS_COOKIE: PrefsCookieType = { model: '', env: {} }
export type PrefsCookieType = { model: string, env: { [key: string]: string } }