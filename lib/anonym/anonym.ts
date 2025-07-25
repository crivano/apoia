import { anonymizeNames } from './name-anonymizer';

const NUMERIC_PATTERN = /\b(?:\d[\.\-/()]?){9,20}\b/;

const IDENTIDADE_PATTERN = /\b(?:Identidade|Id\.?|Ident\.?|RG\.?|RG)\s*(?:n[.º]?\.?\s*)?\s*(\d[\d.\-/]{4,8}\d)\b/i;

const CPF_PATTERN = /\b(?!\d{8,9}-\d)\d{1,3}\.?\d{3}\.?\d{3}-?\d{2}\b/;

const ENDERECO_PATTERN = /\b(?:Rua|R\.|Avenida|Av\.?|Travessa|Trav\.?|T\.|Praça|Rodovia|Rod\.?|Estrada|Estr\.?|Estr)\b\s+[^\n,]+(?:,?\s*(?:n[.ºº]?\.?\s*\d+))?/i;

const TELEFONE_FIXO_PATTERN = /\b\d{4}-?\d{4}\b/;

const TELEFONE_MOVEL_PATTERN = /\b1?[- ]?\d{4,5}[- ]?\d{4}\b/;

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;

const OAB_PATTERN = /\b(?:OAB(?:\/[A-Z]{2}| [A-Z]{2})?:?\s*(?:n\.?|nº\.?)?\s*\d{2,6}(?:\.\d{3})?|OAB\s*\d{2,6}(?:\.\d{3})?\s*(?:\/?\s*[A-Z]{2})|\d{2,6}(?:\.\d{3})?\s*(?:\/[A-Z]{2}| [A-Z]{2})\s*OAB)\b/i;

const URL_PATTERN = /\b(?:https?|www)\.?[a-zA-Z0-9._%+-]*(?:\.[a-zA-Z0-9._%+-]+)+\b/i;

const CRM_PATTERN = /\b(?:CRM(?:\/RJ|RJ|ERJ)?|CREMERJ)\s*(?:\d{2,10}|\d{2,3}\.\d{3})(?:\/\?\s?[A-Z]{2})?\b/i;


/**
 * Anonymizes text by replacing sensitive information with placeholders
 * @param text The text to anonymize
 * @returns The anonymized text and the number of substitutions made
 */
export function anonymizeText(
    text: string,
    options: {
        numeric?: boolean;
        identidade?: boolean;
        endereco?: boolean;
        telefoneFixo?: boolean;
        telefoneMovel?: boolean;
        email?: boolean;
        oab?: boolean;
        url?: boolean;
        crm?: boolean;
        names?: boolean;
    } = {}
): { text: string; substitutions: number } {
    let currentText = text;
    let totalSubstitutions = 0;

    const {
        numeric = true,
        identidade = true,
        endereco = true,
        telefoneFixo = true,
        telefoneMovel = true,
        email = true,
        oab = true,
        url = true,
        crm = true,
        names = true,
    } = options;

    // Helper function to replace all matches and count them
    function replaceAndCount(pattern: RegExp, replacement: string): void {
        // Create a copy of the pattern with the global flag
        const globalPattern = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');

        // Count occurrences by doing replacements with a callback
        let subs = 0;
        currentText = currentText.replace(globalPattern, () => {
            subs++;
            return replacement;
        });

        totalSubstitutions += subs;
    }

    if (numeric) replaceAndCount(NUMERIC_PATTERN, '000');
    if (identidade) replaceAndCount(IDENTIDADE_PATTERN, '000');
    if (endereco) replaceAndCount(ENDERECO_PATTERN, '---');
    if (telefoneFixo) replaceAndCount(TELEFONE_FIXO_PATTERN, '000');
    if (telefoneMovel) replaceAndCount(TELEFONE_MOVEL_PATTERN, '000');
    if (email) replaceAndCount(EMAIL_PATTERN, '---');
    if (oab) replaceAndCount(OAB_PATTERN, '000');
    if (url) replaceAndCount(URL_PATTERN, '---');
    if (crm) replaceAndCount(CRM_PATTERN, '000');

    if (names) {
        const r = anonymizeNames(currentText);
        totalSubstitutions += r.substitutions;
        currentText = r.text;
    }

    return { text: currentText, substitutions: totalSubstitutions };
}

