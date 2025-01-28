'use client'

import AiContent from '../../../components/ai-content'
import { PromptDataType, PromptDefinitionType } from '@/lib/ai/prompt-types'
import { calcSha256 } from '@/lib/utils/hash'

export const Produto = async (params: { definition: PromptDefinitionType, data: PromptDataType }) => {
    return (<AiContent definition={params.definition} data={params.data} key={calcSha256(params.data)} />)
}

