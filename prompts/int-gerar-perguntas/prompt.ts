import { applyTextsAndVariables } from '../_prompts'
import { PromptData, PromptType } from '@/lib/prompt-types'
import promptText from './prompt.txt'
import systemText from './system-prompt.txt'

export default (data: PromptData): PromptType => {
    const prompt: string = applyTextsAndVariables(promptText, data)
    const system: string = systemText

    // console.log('acordao-prompt', JSON.stringify([{ role: 'system', content: system }, { role: 'user', content: prompt }]))

    return {
        message: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
        params: {}
    }
}

