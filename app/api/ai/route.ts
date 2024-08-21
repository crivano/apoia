import { streamContent } from '../../../lib/generate'
import { NextResponse } from 'next/server'
import Fetcher from '../../../lib/fetcher'
import { CoreTool, StreamingTextResponse, StreamObjectResult } from 'ai'

export const maxDuration = 60

export async function POST(request: Request) {
    try {
        // const body = JSON.parse(JSON.stringify(request.body))
        const body = await request.json()
        // console.log('body', JSON.stringify(body))
        const prompt: string = body.prompt
        const data: any = body.data
        const date: Date = body.date
        const result = await streamContent(prompt, data, date)
        if (typeof result === 'string') {
            return new Response(result, { status: 200 });
        }
        // console.log('result', result)
        if (result.toTextStreamResponse)
            return result.toTextStreamResponse();
        else {
            const objectResult = result as unknown as StreamObjectResult<Record<string, CoreTool<any, any>>>
            return new StreamingTextResponse(objectResult.fullStream)
        }
    } catch (error) {
        const message = Fetcher.processError(error)
        return NextResponse.json({ message: `${message}` }, { status: 405 });
    }
}
