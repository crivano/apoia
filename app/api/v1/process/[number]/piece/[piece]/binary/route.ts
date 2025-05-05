import { summarize } from "@/lib/ai/analysis"
import fetcher from "@/lib/utils/fetcher"
import { filterText } from "@/lib/ui/preprocess"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/user"
import { obterDadosDoProcesso } from "@/lib/proc/process"
import { PecaConteudoType } from "@/lib/proc/process-types"
import { decrypt } from "@/lib/utils/crypt"
import { getInterop } from "@/lib/interop/interop"

export const maxDuration = 60
// export const runtime = 'edge'

/**
 * @swagger
 * 
 * /api/v1/process/{number}/piece/{piece}/binary:
 *   get:
 *     description: Obtem o conteúdo binário de uma peça processual
 *     tags:
 *       - process
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: number
 *         required: true
 *         description: Número do processo (apenas números)
 *       - in: path
 *         name: piece
 *         required: true
 *         description: Identificador da peça processual (apenas números)
 *     responses:
 *       200:
 *         description: Análise do processo no formato solicitado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: OK se o conteúdo foi obtido com sucesso
 *                 content:
 *                   type: string
 *                   description: Conteúdo da peça processual
 */
export async function GET(
  req: Request,
  props: { params: Promise<{ number: string, piece: string }> }
) {
  const params = await props.params;
  const pUser = getCurrentUser()
  const user = await pUser
  if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })

  try {
    const username = user?.email
    const password = user?.image?.password ? decrypt(user?.image.password) : undefined
    const interop = getInterop(username, password)
    await interop.init()

    const { buffer, contentType } = await interop.obterPeca(params.number, params.piece, true)

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
      },
      status: 200,
    })
  } catch (error) {
    const message = fetcher.processError(error)
    return NextResponse.json({ message: `${message}` }, { status: 405 });
  }
}