import { headers, cookies } from 'next/headers'

export function getModelAndApiKeyCookieValue(): { model: string, apiKey: string, automatic: boolean } {

    // Get from model-and-api-key header, which is model and apiKey separated by ':' and encoded in base64
    const headersList = headers();
    const modelAndApiKey = headersList.get("model-and-api-key")
    if (modelAndApiKey) {
        const s = atob(modelAndApiKey)
        var i = s.indexOf(':');
        const model = s.slice(0, i)
        const apiKey = s.slice(i + 1)
        return { model, apiKey, automatic: false }
    }

    const modelCookie = cookies().get('model')?.value
    if (modelCookie)
        return JSON.parse(atob(modelCookie))


    return { model: process.env.MODEL as string, apiKey: process.env.OPENAI_API_KEY as string, automatic: true }
}