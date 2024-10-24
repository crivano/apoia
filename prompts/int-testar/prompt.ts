import { applyTextsAndVariables, PromptData, PromptType } from '../_prompts'
import promptText from './prompt.txt'
import systemText from './system-prompt.txt'
import structuredOutputs from './structured-outputs'

export default (data: PromptData): PromptType => {
    const prompt: string = applyTextsAndVariables(promptText, data)
    const system: string = systemText
    return {
        message: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
        params: { structuredOutputs }
    }
}

