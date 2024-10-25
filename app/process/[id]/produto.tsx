import AiContent from '../../../components/ai-content'
import { PromptData } from '@/lib/prompt-types'
import { InfoDeProduto } from '@/lib/combinacoes'

export const Produto = async (params: { infoDeProduto: InfoDeProduto, data: PromptData }) => {
    const textos = params?.data?.textos

    if (textos) {
        for (const texto of textos) {
            if (texto.texto) continue
            if (!texto.pTexto) continue
            texto.texto = await texto.pTexto
        }
    }

    return (<AiContent infoDeProduto={params.infoDeProduto} textos={textos} />)
}

