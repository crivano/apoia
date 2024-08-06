import { slugify } from '../../../lib/utils'
import AiContent from '../../../components/ai-content'
import Placeholder from 'react-bootstrap/Placeholder'
import { PromptData } from '../../../prompts/_prompts'
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

