import { SHA256 } from 'crypto-js'
import { canonicalize } from 'json-canonicalize'

export function calcSha256(messages: any): string {
    return SHA256(canonicalize(messages)).toString()
}
