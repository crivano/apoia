import { diff_match_patch, DIFF_INSERT, DIFF_EQUAL, DIFF_DELETE } from 'diff-match-patch';

export function diff(oldText: string, newText: string, replaceDeletedNewlines?: boolean): string {
    const dmp = new diff_match_patch();
    const diffs = dmp.diff_main(oldText, newText);
    dmp.diff_cleanupSemantic(diffs);

    let result = '';
    for (let [op, text] of diffs) {
        switch (op) {
            case DIFF_DELETE:
                result += `<span class="editOldInline">${replaceDeletedNewlines ? text.replace("\n", "¶") : text}</span>`;
                break;
            case DIFF_INSERT:
                if (text)
                    result += `<span class="editNewInline">${text}</span>`;
                break;
            case DIFF_EQUAL:
                result += text;
                break;
        }
    }
    result = result.replaceAll(`<span class="editNewInline">> </span>`, '> ')
    result = result.replaceAll(`<span class="editOldInline">¶</span><span class="editNewInline">>
> </span>`, '\n> ')
    result = result.replace(`<span class="editOldInline">¶</span><span class="editNewInline">>
> </span>`, '\n> ')

    return result;
}

export function diffAndCollapse(oldText: string, newText: string): string {
    let s = diff(oldText, newText, true);
    s = s.replace(
        /(?:<span class="editOldInline">([^<]+?)<\/span><span class="editNewInline">([^<]+?)<\/span>)/g,
        '<span class="replaceInline" title="$1">$2</span>'
    );
    return s;
}
