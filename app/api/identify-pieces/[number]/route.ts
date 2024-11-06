import { getCurrentUser } from '@/lib/user'
import { analyze } from '@/lib/ai/analysis'
import { obterDadosDoProcesso } from '@/lib/proc/process'

export const maxDuration = 60
// export const runtime = 'edge'


/**
 * @swagger
 * 
 * /api/identify-pieces/{number}:
 *   post:
 *     description: Utiliza IA para identificar o tipo das peças que estão marcadas como "OUTROS"
 *     tags:
 *       - batch
 *     security:
 *       - BearerAuth: []
 *     parameters:
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
  try {
    const pUser = getCurrentUser()
    if (!await pUser) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })

    const dadosDoProcesso = await obterDadosDoProcesso(number, pUser, undefined, true)
    if (dadosDoProcesso.errorMsg) throw new Error(dadosDoProcesso.errorMsg)

    return Response.json({ status: 'OK', dadosDoProcesso })
  } catch (error) {
    console.error('Erro identificando peças', error)
    return Response.json({ errormsg: error.message }, { status: 500 })
  }
}

