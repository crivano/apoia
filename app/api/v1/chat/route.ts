import { getModel } from '@/lib/ai/model'
import { getCurrentUser } from '@/lib/user'
import { streamText } from 'ai'

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

    const { messages } = await req.json()

    const { model, modelRef } = getModel()

    const result = streamText({
        model: modelRef,
        messages,
    })

    return (await result).toDataStreamResponse()
}