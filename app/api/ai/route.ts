import { streamContent } from '../../../lib/ai/generate'
import { NextResponse } from 'next/server'
import Fetcher from '../../../lib/utils/fetcher'
import { PromptOptions } from '@/lib/ai/prompt-types'

export const maxDuration = 60

export async function POST(request: Request) {
    try {
        // const body = JSON.parse(JSON.stringify(request.body))
        const body = await request.json()
        // console.log('body', JSON.stringify(body))
        const prompt: string = body.prompt
        const data: any = body.data
        const date: Date = body.date
        const options: PromptOptions = {
            overrideSystemPrompt: body.overrideSystemPrompt,
            overridePrompt: body.overridePrompt,
            overrideJsonSchema: body.overrideJsonSchema,
            overrideFormat: body.overrideFormat,
            cacheControl: body.cacheControl,
        }
        const result = await streamContent(prompt, data, date, options)
        if (typeof result === 'string') {
            return new Response(result, { status: 200 });
        }
        if (result.toTextStreamResponse) {
            return result.toTextStreamResponse();
        } else {
            throw new Error('Invalid response')
        }
    } catch (error) {
        console.log('error', error)
        const message = Fetcher.processError(error)
        return NextResponse.json({ message: `${message}` }, { status: 405 });
    }
}
