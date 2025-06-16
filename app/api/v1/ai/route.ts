import { streamContent } from '../../../../lib/ai/generate'
import { NextResponse } from 'next/server'
import Fetcher from '../../../../lib/utils/fetcher'
import { PromptDefinitionType, PromptExecutionResultsType, PromptOptionsType } from '@/lib/ai/prompt-types'
import { getInternalPrompt, promptDefinitionFromDefinitionAndOptions } from '@/lib/ai/prompt'
import { Dao } from '@/lib/db/mysql'
import { IAPrompt } from '@/lib/db/mysql-types'
import { getCurrentUser } from '@/lib/user'
import { envString } from '@/lib/utils/env'

export const maxDuration = 60

async function getPromptDefinition(kind: string, promptSlug?: string, promptId?: number): Promise<PromptDefinitionType> {
    let prompt: IAPrompt | undefined = undefined
    if (promptId) {
        prompt = await Dao.retrievePromptById(promptId)
        if (!prompt)
            throw new Error(`Prompt not found: ${promptId}`)
        if (!prompt.kind)
            prompt.kind = `prompt-${prompt.id}`
        if (prompt.content.template && (!prompt.content.prompt || !prompt.content.system_prompt)) {
            const promptTemplate = getInternalPrompt('template')
            if (!prompt.content.prompt) prompt.content.prompt = promptTemplate.prompt
            if (!prompt.content.system_prompt) prompt.content.system_prompt = promptTemplate.systemPrompt
        }
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
            template: prompt.content.template || undefined,
        } : getInternalPrompt(kind)

    return definition
}

/**
 * @swagger
 * 
 * /api/v1/ai:
 *   post:
 *     description: Gera uma resposta a partir de diversos parâmetros de configuração de prompt e dados obtido de um processo
 *     tags:
 *       - ai
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         description: Parâmetros de configuração do prompt e dados
 *     responses:
 *       200:
 *         description: Resposta do assistente
 */
export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })

        const user_id = await Dao.assertIAUserId(user.preferredUsername || user.name)
        const court_id = user?.corporativo?.[0]?.seq_tribunal_pai || envString('NODE_ENV') === 'development' ? 1 : undefined

        if (!court_id) throw new Error('Não foi possível identificar o tribunal do usuário')
        await Dao.assertIAUserDailyUsageId(user_id, court_id)

        // const body = JSON.parse(JSON.stringify(request.body))
        const body = await request.json()
        // console.log('body', JSON.stringify(body))
        const kind: string = body.kind
        const promptSlug: string | undefined = body.promptSlug
        let promptId: number | undefined = body.promptId
        if (!promptId && kind.startsWith('prompt-')) {
            const parts = kind.split('-')
            if (parts.length === 2) {
                promptId = parseInt(parts[1])
            }
        }

        const definition = await getPromptDefinition(kind, promptSlug, promptId)
        const data: any = body.data
        const options: PromptOptionsType = {
            overrideSystemPrompt: body.overrideSystemPrompt,
            overridePrompt: body.overridePrompt,
            overrideJsonSchema: body.overrideJsonSchema,
            overrideFormat: body.overrideFormat,
            overrideTemplate: body.overrideTemplate,
            cacheControl: body.cacheControl,
        }

        const definitionWithOptions = promptDefinitionFromDefinitionAndOptions(definition, options)

        if (body.modelSlug)
            definitionWithOptions.model = body.modelSlug

        if (body.extra)
            definitionWithOptions.prompt += '\n\n' + body.extra

        const executionResults: PromptExecutionResultsType = { user_id, court_id }
        const result = await streamContent(definitionWithOptions, data, executionResults)

        if (typeof result === 'string') {
            return new Response(result, { status: 200 })
        }
        if (result) {
            const reader: ReadableStreamDefaultReader = (result as any).fullStream.getReader()
            const { value, done } = await reader.read()
            if (value?.type === 'error') {
                const error = value.error;
                throw new Error(`Erro na comunicação com o provedor de inteligência artificial: ${error}`)
            }
            const feederStream = new ReadableStream({
                start(controller) {
                    if (value?.type === 'text-delta')
                        controller.enqueue(value)
                    function pump() {
                        reader.read().then(({ done, value }) => {
                            if (done) {
                                controller.close()
                                return
                            }
                            switch (value.type) {
                                case 'text-delta': {
                                    controller.enqueue(value.textDelta)
                                    break;
                                }
                                case 'error': {
                                    const error = value.error;
                                    controller.enqueue(`Erro na comunicação com o provedor de inteligência artificial: ${error}`)
                                }
                            }
                            pump()
                        })
                    }
                    pump()
                },
            })
            return new Response(feederStream, { status: 200 })
        } else {
            throw new Error('Invalid response')
        }
    } catch (error) {
        console.log('error', error)
        const message = Fetcher.processError(error)
        return NextResponse.json({ errormsg: `${message}` }, { status: 405 })
    }
}
