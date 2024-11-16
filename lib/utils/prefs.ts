import { PrefsCookieType } from '@/lib/utils/prefs-types';
import { headers, cookies } from 'next/headers'

export function getPrefs(): PrefsCookieType | undefined {

    // Get from model-and-api-key header, which is a JSON encoded object withi the model and the *_API_KEY params encoded in base64
    const headersList = headers();
    const prefsHeader = headersList.get("prefs")
    if (prefsHeader) {
        const s = atob(prefsHeader)
        const json = JSON.parse(s)
        const model = json.model
        const env = json.env
        return { model, env }
    }

    const prefsCookie = cookies().get('prefs')?.value
    if (prefsCookie)
        return JSON.parse(atob(prefsCookie))


    return undefined
}