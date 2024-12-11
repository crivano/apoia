import { Suspense } from 'react'
import { maiusculasEMinusculas } from '../../../lib/utils/utils'
import { Produto } from './produto'
import { buildRequests, getPiecesWithContent } from '@/lib/ai/analysis'
import { ResumoDePecaLoading } from '@/components/loading'
import { getInternalPrompt } from '@/lib/ai/prompt'
import { calcSha256 } from '@/lib/utils/hash'
import { DadosDoProcessoType } from '@/lib/proc/process'
import { infoDeProduto } from '@/lib/proc/info-de-produto'

export const ListaDeProdutos = async ({ pDadosDoProcesso, kind, pieces }) => {
    const dadosDoProcesso: DadosDoProcessoType = await pDadosDoProcesso

    if (!dadosDoProcesso || dadosDoProcesso.errorMsg) return ''

    const tipoDeSintese = dadosDoProcesso.tipoDeSintese
    const produtos = dadosDoProcesso.produtos
    if (!tipoDeSintese || !produtos || produtos.length === 0) return ''

    const pecasComConteudo = await getPiecesWithContent(dadosDoProcesso, dadosDoProcesso.numeroDoProcesso)

    const requests = buildRequests(produtos.map(p => infoDeProduto(p), pecasComConteudo), pecasComConteudo)

    return requests.map((request) => {
        return (<div key={request.title}>
            <h2>{maiusculasEMinusculas(request.title)}</h2>
            <Suspense fallback={ResumoDePecaLoading()}>
                <Produto definition={getInternalPrompt(request.promptSlug)} data={request.data} />
            </Suspense>
        </div>
        )
    })
}


