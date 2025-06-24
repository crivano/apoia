export function closeTag(s: string, tag: string): string {
    const openTag = `<${tag}`
    const closeTag = `</${tag}>`;
    let searchFrom = 0;
    while (true) {
        const ifOpenIndex = s.indexOf(openTag, searchFrom);
        if (ifOpenIndex === -1) {
            break;
        }

        const nextIfOpenIndex = s.indexOf(openTag, ifOpenIndex + 1);
        const nextIfCloseIndex = s.indexOf(closeTag, ifOpenIndex + 1);

        const minNextOpen = nextIfOpenIndex > -1 ? nextIfOpenIndex : Infinity;
        const minNextClose = nextIfCloseIndex > -1 ? nextIfCloseIndex : Infinity;
        const nextTagIndex = Math.min(minNextOpen, minNextClose);

        if (nextTagIndex === Infinity) {
            // This is the last <if> tag, close it at the end
            s += closeTag;
            break;
        }

        if (nextTagIndex === nextIfOpenIndex) {
            // The next tag is another <if>, so close the current one before it
            s = s.substring(0, nextTagIndex) + closeTag + s.substring(nextTagIndex);
            // Move search position past the inserted </if>
            searchFrom = nextTagIndex + closeTag.length;
        } else { // The next tag is </if>
            // This <if> is already closed, move search position past the closing tag
            searchFrom = nextIfCloseIndex + closeTag.length;
        }
    }
    return s
}

export function preprocessTemplate(template: string): string {
    let s = template
    s = s.replace(/\\\[/g, '[') // Unescape [
    s = s.replace(/\\\]/g, ']') // Unescape ]
    s = s.replace(/\[(.*?)\]/gs, '<snippet id="ID_PLACEHOLDER" expr="$1"></snippet>')
    s = s.replace(/\{\{\}\}/g, '</outer-if>')
    s = s.replace(/\{\{(.*?)\}\}/gs, '<outer-if id="ID_PLACEHOLDER" expr="$1">')
    s = s.replace(/\{\}/g, '</if>')
    s = s.replace(/\{(.*?)\}/gs, '<if id="ID_PLACEHOLDER" expr="$1">')

    // Close outer-if tags
    s = closeTag(s, 'outer-if');

    // Close if tags
    s = s.split(/(<\/?outer-if.*?>)/g).map(part => {
        if (part.startsWith('<outer-if') || part.startsWith('</outer-if')) {
            return part;
        }
        return closeTag(part, 'if');
    }).join('');

    // Substitute ID_PLACEHOLDER with actual IDs
    let idCounter = 0; s = s.replace(/ID_PLACEHOLDER/g, () => `${idCounter++}`)

    // If there are <snippet> tags in the beggining of a line, add a sufix "x" to the id
    s = s.replace(/^<snippet id="(\d+)" expr="([^"]*?)">/gm, (match, id, expr) => {
        return `<snippet id="${id}x" expr="${expr}">`
    })

    // Replace outer-if tags with if tags
    s = s.replace(/<(\/?)outer-if/g, '<$1if')

    return s
}
