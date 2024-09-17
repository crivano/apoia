import { PromptData, PromptType } from '../_prompts'
import promptText from './prompt.txt'
import systemText from './system-prompt.txt'
import format from './format'
import structuredOutputs from './structured-outputs'

export default (data: PromptData): PromptType => {
    const prompt: string = promptText.replace('{{textos}}', `${data.textos.reduce((acc, txt) => acc + `${txt.descr}:\n<${txt.slug}>\n${txt.texto}\n</${txt.slug}>\n\n`, '')}`)
    const system: string = systemText

    // console.log('acordao-prompt', JSON.stringify([{ role: 'system', content: system }, { role: 'user', content: prompt }]))

    return {
        message: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
        params: { structuredOutputs, format }
    }
}

