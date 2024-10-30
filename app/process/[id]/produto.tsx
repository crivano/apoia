import AiContent from '../../../components/ai-content'
import { PromptDataType, PromptDefinitionType } from '@/lib/ai/prompt-types'
import { waitForTexts } from '@/lib/ai/prompt'
import { InfoDeProduto } from '@/lib/proc/combinacoes'

export const Produto = async (params: { definition: PromptDefinitionType, data: PromptDataType }) => {
    await waitForTexts(params?.data)
    return (<AiContent definition={params.definition} data={params.data} />)
}

