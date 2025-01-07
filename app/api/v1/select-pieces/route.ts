import { TipoDeSinteseMap } from '@/lib/proc/combinacoes';
import { PecaType, selecionarPecasPorPadrao, selecionarUltimasPecas } from '@/lib/proc/process';

export const maxDuration = 60
// export const runtime = 'edge'


/**
 * @swagger
 * 
 * /api/v1/select-pieces:
 *   post:
 *     description: Seleciona as peças que serão utilizadas na síntese
 *     tags:
 *       - process
 *     parameters:
 *       - in: body
 *         name: body
 *         schema:
 *           properties:
 *             pieces:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: 
 *                     type: string
 *                   descr: 
 *                     type: string
 *               required: true
 *               description: Lista completa de peças do processo
 *             kind: 
 *               type: string
 *               required: true
 *               description: Tipo de síntese a ser realizada
 *     responses:
 *       200:
 *         description: OK, peças selecionadas
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pieces, kind } = body;

    let pecasSelecionadas: PecaType[] | null = null

    // Localiza um tipo de síntese válido
    pecasSelecionadas = selecionarPecasPorPadrao(pieces, TipoDeSinteseMap[kind].padroes)

    return Response.json({ status: 'OK', selectedIds: pecasSelecionadas ? pecasSelecionadas.map(p => p.id) : [] })
  } catch (error) {
    console.error('Erro selecionando peças', error)
    return Response.json({ errormsg: error.message }, { status: 500 })
  }
}

