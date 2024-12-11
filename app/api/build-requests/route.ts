import { NextResponse } from 'next/server'
import { TextoType } from '@/lib/ai/prompt-types'
import { CombinacaoValida } from '@/lib/proc/combinacoes'
import { buildRequests } from '@/lib/ai/analysis'

export const maxDuration = 60

export async function POST(request: Request) {
    // const body = JSON.parse(JSON.stringify(request.body))
    const body = await request.json()
    // console.log('body', JSON.stringify(body))

    const combinacao: CombinacaoValida = body.combinacao
    const pecasComConteudo: TextoType[] = body.pecasComConteudo

    const requests = buildRequests(combinacao, pecasComConteudo)
    return NextResponse.json({ requests });
}
