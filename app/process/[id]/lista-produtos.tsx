import { Suspense } from 'react'
import { maiusculasEMinusculas } from '../../../lib/utils/utils'
import { infoDeProduto, ProdutosValidos } from '../../../lib/proc/combinacoes'
import { Produto } from './produto'
import { buildRequests, getPiecesWithContent } from '@/lib/ai/analysis'
import { ResumoDePecaLoading } from '@/components/loading'
import { getInternalPrompt } from '@/lib/ai/prompt'

export const ListaDeProdutos = async ({ pDadosDoProcesso }) => {
    const dadosDoProcesso = await pDadosDoProcesso

    if (!dadosDoProcesso || dadosDoProcesso.errorMsg) return ''

    const combinacao = dadosDoProcesso.combinacao
    if (!combinacao || !combinacao.produtos || combinacao.produtos.length === 0) return ''

    const pecasComConteudo = await getPiecesWithContent(dadosDoProcesso, dadosDoProcesso.numeroDoProcesso)

    const requests = buildRequests(combinacao, pecasComConteudo)

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


