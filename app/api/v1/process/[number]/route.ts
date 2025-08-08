import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/user"
import { CargaDeConteudoEnum, obterDadosDoProcesso2 } from "@/lib/proc/process"
import { UnauthorizedError, withErrorHandler } from "@/lib/utils/api-error"

export const maxDuration = 60
// export const runtime = 'edge'

/**
 * @swagger
 * 
 * /api/v1/process/{number}:
 *   get:
 *     description: Obtem as informações de um processo
 *     tags:
 *       - process
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: number
 *         required: true
 *         description: Número do processo (apenas números)
 *       - in: query
 *         name: kind
 *         required: false
 *         type: string
 *         description: Tipo de síntese para seleção de peças
 *     200:
 *       description: Dados do processo
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     401:
 *       description: Unauthorized
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: Unauthorized
 *     500:
 *       description: Internal Server Error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: An internal server error occurred
 */
async function GET_HANDLER(
  req: NextRequest,
  props: { params: Promise<{ number: string, piece: string }> }
) {
  const params = await props.params;
  const pUser = getCurrentUser()
  const user = await pUser
  if (!user) {
    throw new UnauthorizedError();
  }

  const url = new URL(req.url)
  const kind = url.searchParams.get('kind')
  const obterConteudo = url.searchParams.get('selectedPiecesContent') === 'true'
  // if (kind) {
  //   const dadosDoProcesso = await obterDadosDoProcesso({
  //     numeroDoProcesso: params.number, pUser, kind,
  //     conteudoDasPecasSelecionadas: obterConteudo ? CargaDeConteudoEnum.SINCRONO : CargaDeConteudoEnum.NAO
  //   })
  //   return Response.json(dadosDoProcesso)
  // }
  const dadosDoProcesso = await obterDadosDoProcesso2({
    numeroDoProcesso: params.number, pUser,
    conteudoDasPecasSelecionadas: obterConteudo ? CargaDeConteudoEnum.SINCRONO : CargaDeConteudoEnum.NAO
  })
  return NextResponse.json(dadosDoProcesso)
}

export const GET = withErrorHandler(GET_HANDLER)