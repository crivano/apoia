let fs = require('fs')

module.exports = async function({ vars, provider }) {
    let systemPrompt = fs.readFileSync('./system-prompt.txt', 'utf8')
    let prompt = fs.readFileSync('./prompt.txt', 'utf8')

    return [{
            role: 'system',
            content: systemPrompt,
        },
        {
            role: 'user',
            content: prompt,
        },
    ];
};