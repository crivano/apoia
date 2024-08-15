'use server'

import fs from 'fs'

export default async (data) => {
    const prompt: string = fs.readFileSync('prompts/acordao/prompt.txt', 'utf8').replace('{{textos}}', `${data.textos.reduce((acc, txt) => acc + `${txt.descr}:\n<${txt.slug}>\n${txt.texto}\n</${txt.slug}>\n\n`, '')}`)
    const system: string = fs.readFileSync('prompts/acordao/system-prompt.txt', 'utf8')

    // console.log('acordao-prompt', JSON.stringify([{ role: 'system', content: system }, { role: 'user', content: prompt }]))

    return [{ role: 'system', content: system }, { role: 'user', content: prompt }]
}
