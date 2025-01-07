import { Suspense } from 'react'
import { maiusculasEMinusculas } from '../../../lib/utils/utils'
import { Produto } from './produto'
import { buildRequests, getPiecesWithContent } from '@/lib/ai/analysis'
import { ResumoDePecaLoading } from '@/components/loading'
import { getInternalPrompt, waitForTexts } from '@/lib/ai/prompt'
import { calcSha256 } from '@/lib/utils/hash'
import { DadosDoProcessoType } from '@/lib/proc/process'
import { infoDeProduto } from '@/lib/proc/info-de-produto'
import { ListaDeProdutos } from './lista-produtos-client'

export const ListaDeProdutosServer = async ({ pDadosDoProcesso, kind, pieces }) => {
    const dadosDoProcesso: DadosDoProcessoType = await pDadosDoProcesso

    if (!dadosDoProcesso || dadosDoProcesso.errorMsg) return ''

    const tipoDeSintese = dadosDoProcesso.tipoDeSintese
    const produtos = dadosDoProcesso.produtos
    if (!tipoDeSintese || !produtos || produtos.length === 0) return ''

    const pecasComConteudo = await getPiecesWithContent(dadosDoProcesso, dadosDoProcesso.numeroDoProcesso)

    await waitForTexts({ textos: pecasComConteudo })

    const requests = buildRequests(produtos.map(p => infoDeProduto(p), pecasComConteudo), pecasComConteudo)

    return <ListaDeProdutos dadosDoProcesso={dadosDoProcesso} requests={requests} />
}


