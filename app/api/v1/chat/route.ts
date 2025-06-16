import { generateAndStreamContent } from '@/lib/ai/generate'
import { getModel } from '@/lib/ai/model-server'
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
    const user = await getCurrentUser()
    if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })

    const user_id = await Dao.assertIAUserId(user.preferredUsername || user.name)
    const court_id = user?.corporativo?.[0]?.seq_tribunal_pai || envString('NODE_ENV') === 'development' ? 1 : undefined

    if (!court_id) throw new Error('Não foi possível identificar o tribunal do usuário')
    await Dao.assertIAUserDailyUsageId(user_id, court_id)

    const { messages } = await req.json()

    const { model, modelRef, apiKeyFromEnv } = await getModel()

    if (envString('ANONIMYZE')) {
        messages.forEach((message: any) => {
            if (message.role === 'user' && message.content) {
                message.content = anonymizeText(message.content).text
            }
        })
    }

    const result = await generateAndStreamContent(
        model,
        undefined, // structuredOutputs
        false, // cacheControl
        'chat', // kind
        modelRef,
        messages,
        '', // sha256
        { user_id, court_id }, // results
        null, // attempt
        apiKeyFromEnv
    )

    if (typeof result === 'string') {
        return new Response(result, { status: 200 })
    }

    return ((await result) as StreamTextResult<Record<string, CoreTool<any, any>>, any>).toDataStreamResponse()
}