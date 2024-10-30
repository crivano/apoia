import { analyze, GeneratedContent } from '@/lib/ai/analysis'
import fetcher from '@/lib/utils/fetcher'
import { NextResponse } from 'next/server'
import { filterText } from '@/lib/ui/preprocess'

export const maxDuration = 60
// export const runtime = 'edge'

/**
 * @swagger
 * 
 * /api/process/{number}/analysis:
 *   get:
 *     description: Analisa um processo judicial, produzindo resumo das principais peças e gerando o conteúdo dos produtos pertinentes
 *     tags:
 *       - ai
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: number
 *         required: true
 *         description: Número do processo (apenas números)
 *       - in: header
 *         name: model-and-api-key
 *         schema:
 *           type: string
 *         description: Modelo e chave de API separados por ':', codificados em base64
 *       - in: query
 *         name: format
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - json
 *             - markdown
 *             - html
 *             - pdf
 *         description: Formato do resultado (json, markdown, html, pdf)
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
 *                   description: OK se a análise foi realizada com sucesso
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       descr:
 *                         type: string
 *                         description: Descrição do produto
 *                       prompt:
 *                         type: string
 *                         description: Prompt para geração do produto
 *                       generated:
 *                         type: string
 *                         description: Conteúdo gerado
 */
export async function GET(req: Request, { params }: { params: { number: string } }) {
  try {
    const analysis = await analyze(undefined, params.number)
    const resp = analysis.generatedContent.map((content: GeneratedContent) => ({ descr: content.title, prompt: content.promptSlug, generated: filterText(content.generated) }))
    return Response.json({ status: 'OK', products: resp })
  } catch (error) {
    const message = fetcher.processError(error)
    return NextResponse.json({ message: `${message}` }, { status: 405 });
  }
}