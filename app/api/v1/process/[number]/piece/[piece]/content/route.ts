import { summarize } from "@/lib/ai/analysis"
import fetcher from "@/lib/utils/fetcher"
import { filterText } from "@/lib/ui/preprocess"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/user"
import { obterConteudoDaPeca } from "@/lib/proc/piece"
import { obterDadosDoProcesso } from "@/lib/proc/process"

export const maxDuration = 60
// export const runtime = 'edge'

/**
 * @swagger
 * 
 * /api/v1/process/{number}/piece/{piece}/content:
 *   get:
 *     description: Obtem o texto de uma peça processual
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
export async function GET(req: Request, { params }: { params: { number: string, piece: string } }) {
  const pUser = getCurrentUser()
  const user = await pUser
  if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })

  try {
    const dadosDoProcesso = await obterDadosDoProcesso({ numeroDoProcesso: params.number, pUser, idDaPeca: params.piece })
    if (!dadosDoProcesso.pecas[0].conteudo && dadosDoProcesso.pecas[0].pConteudo) {
      dadosDoProcesso.pecas[0].conteudo = await dadosDoProcesso.pecas[0].pConteudo
    }
    return Response.json({ status: 'OK', content: dadosDoProcesso.pecas[0].conteudo })
  } catch (error) {
    const message = fetcher.processError(error)
    return NextResponse.json({ message: `${message}` }, { status: 405 });
  }
}