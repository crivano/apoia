import { getCurrentUser, assertCurrentUser } from '../../../../../lib/user'
import { analyze } from '@/lib/ai/analysis'

export const maxDuration = 60
// export const runtime = 'edge'


/**
 * @swagger
 * 
 * /api/batch/{name}/{number}:
 *   post:
 *     description: Seleciona a combinação de peças e produtos para um processo e gera os resumos e o conteúdo de cada produto
 *     tags:
 *       - batch
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *       - in: path
 *         name: number 
 *         required: true
 *       - in: header
 *         name: model-and-api-key
 *         schema:
 *           type: string
 *         description: Modelo e chave de API separados por ':', codificados em base64
 *     responses:
 *       200:
 *         description: OK, processo analisado e resultado armazenado no banco de dados
 */
export async function POST(req: Request, { params }: { params: { name: string, number: string } }) {
  const { name, number } = params
  const url = new URL(req.url)
  const complete: boolean = url.searchParams.get('complete') === 'true'
  try {
    const user = await getCurrentUser()
    if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })

    const msg = await analyze(name, number, complete)
    return Response.json({ status: 'OK', msg })
  } catch (error) {
    console.error('Erro analisando', error)
    return Response.json({ errormsg: error.message }, { status: 500 })
  }
}

