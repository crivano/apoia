import { streamContent } from '../../../../lib/ai/generate'
import { NextResponse } from 'next/server'
import Fetcher from '../../../../lib/utils/fetcher'
import { PromptDefinitionType, PromptOptionsType } from '@/lib/ai/prompt-types'
import { getInternalPrompt, promptDefinitionFromDefinitionAndOptions } from '@/lib/ai/prompt'
import { Dao } from '@/lib/db/mysql'
import { IAPrompt } from '@/lib/db/mysql-types'
import { getCurrentUser } from '@/lib/user'

export const maxDuration = 60

async function getPromptDefinition(kind: string, promptSlug?: string, promptId?: number): Promise<PromptDefinitionType> {
    let prompt: IAPrompt | undefined = undefined
    if (promptId) {
        prompt = await Dao.retrievePromptById(promptId)
        if (!prompt)
            throw new Error(`Prompt not found: ${promptId}`)
    } else if (kind && promptSlug) {
        const prompts = await Dao.retrievePromptsByKindAndSlug(kind, promptSlug)
        if (prompts.length === 0)
            throw new Error(`Prompt not found: ${kind}/${promptSlug}`)
        let found = prompts.find(p => p.is_official)
        if (!found)
            found = prompts[0]
        if (found)
            prompt = await Dao.retrievePromptById(found.id)
    }

    const definition: PromptDefinitionType =
        prompt ? {
            kind: prompt.kind,
            systemPrompt: prompt.content.system_prompt || undefined,
            prompt: prompt.content.prompt || '',
            jsonSchema: prompt.content.json_schema || undefined,
            format: prompt.content.format || undefined,
        } : getInternalPrompt(kind)

    return definition
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })

        // const body = JSON.parse(JSON.stringify(request.body))
        const body = await request.json()
        // console.log('body', JSON.stringify(body))
        const kind: string = body.kind
        const promptSlug: string | undefined = body.promptSlug
        const promptId: number | undefined = body.promptId

        const definition = await getPromptDefinition(kind, promptSlug, promptId)
        const data: any = body.data
        const options: PromptOptionsType = {
            overrideSystemPrompt: body.overrideSystemPrompt,
            overridePrompt: body.overridePrompt,
            overrideJsonSchema: body.overrideJsonSchema,
            overrideFormat: body.overrideFormat,
            cacheControl: body.cacheControl,
        }

        const definitionWithOptions = promptDefinitionFromDefinitionAndOptions(definition, options)

        if (body.modelSlug)
            definitionWithOptions.model = body.modelSlug

        if (body.extra)
            definitionWithOptions.prompt += '\n\n' + body.extra

        const result = await streamContent(definitionWithOptions, data)
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
