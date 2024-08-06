import { Suspense } from 'react'
import { maiusculasEMinusculas } from '../../../lib/utils'
import { infoDeProduto, ProdutosValidos } from '../../../lib/combinacoes'
import { Produto } from './produto'
import { buildRequests, getPiecesWithContent } from '@/lib/analysis'
import { ResumoDePecaLoading } from '@/components/loading'

export const ListaDeProdutos = async ({ pDadosDoProcesso }) => {
    const dadosDoProcesso = await pDadosDoProcesso

    if (!dadosDoProcesso || dadosDoProcesso.errorMsg) return ''

    const combinacao = dadosDoProcesso.combinacao
    if (!combinacao || !combinacao.produtos || combinacao.produtos.length === 0) return ''

    const pecasComConteudo = await getPiecesWithContent(dadosDoProcesso, dadosDoProcesso.numeroDoProcesso)

    const requests = buildRequests(combinacao, pecasComConteudo)

    return requests.map((request) => {
        return (<div key={request.infoDeProduto.titulo}>
            <h2>{maiusculasEMinusculas(request.infoDeProduto.titulo)}</h2>
            <Suspense fallback={ResumoDePecaLoading()}>
                <Produto infoDeProduto={request.infoDeProduto} data={request.data} />
            </Suspense>
        </div>
        )
    })
}


