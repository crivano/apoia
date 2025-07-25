import { generateAndStreamContent } from '@/lib/ai/generate'
import { getModel } from '@/lib/ai/model-server'
import { getTools } from '@/lib/ai/tools'
import { anonymizeText } from '@/lib/anonym/anonym'
import { Dao } from '@/lib/db/mysql'
import { getCurrentUser } from '@/lib/user'
import { envString } from '@/lib/utils/env'
import { CoreTool, StreamTextResult } from 'ai'

// Allow streaming responses up to 30 seconds
export const maxDuration = 60

/**
 * @swagger
 * 
 * /api/v1/chat:
 *   post:
 *     description: Executa uma operação de chat com o modelo de linguagem padrão
 *     tags:
 *       - ai
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: body
 *         name: messages
 *         required: true
 *         description: Mensagens do chat
 *     responses:
 *       200:
 *         description: Resposta do assistente
 */
export async function POST(req: Request) {
    const pUser = getCurrentUser()
    const user = await pUser
    if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })

    const user_id = await Dao.assertIAUserId(user.preferredUsername || user.name)

    const { messages } = await req.json()

    const { model, modelRef, apiKeyFromEnv } = await getModel()

    const anonymize = req.headers.get('cookie')?.includes('anonymize=true')
    if (anonymize) {
        messages.forEach((message: any) => {
            if (message.role === 'user' && message.content) {
                message.content = anonymizeText(message.content).text
            }
        })
    }

    const { searchParams } = new URL(req.url)
    const withTools = searchParams.get('withTools') === 'true'

    const result = await generateAndStreamContent(
        model,
        undefined, // structuredOutputs
        false, // cacheControl
        'chat', // kind
        modelRef,
        messages,
        '', // sha256
        {}, // results
        null, // attempt
        apiKeyFromEnv,
        withTools ? await getTools(pUser) : undefined
    )

    if (typeof result === 'string') {
        return new Response(result, { status: 200 })
    }

    return ((await result) as StreamTextResult<Record<string, CoreTool<any, any>>, any>).toDataStreamResponse()
}