import { removeAccents } from '@/lib/utils/utils'
import commonFirstNames from './common-first-names.json'
import commonLastNames from './common-last-names.json'

const names = [...commonFirstNames, ...commonLastNames]

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
function anonymizeText(text: string): { text: string; substitutions: number } {
    let currentText = text;
    let totalSubstitutions = 0;

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

    replaceAndCount(NUMERIC_PATTERN, '000');
    replaceAndCount(IDENTIDADE_PATTERN, '000');
    replaceAndCount(ENDERECO_PATTERN, '---');
    replaceAndCount(TELEFONE_FIXO_PATTERN, '000');
    replaceAndCount(EMAIL_PATTERN, '---');
    replaceAndCount(OAB_PATTERN, '000');
    replaceAndCount(URL_PATTERN, '---');
    replaceAndCount(CRM_PATTERN, '000');

    return { text: currentText, substitutions: totalSubstitutions };
}

// Function to create a diacritic-insensitive pattern for a word
export function diacriticInsensitive(word: string): string {
    const mapping: { [key: string]: string } = {
        'a': 'aàáâãäå',
        'e': 'eèéêë',
        'i': 'iìíîï',
        'o': 'oòóôõö',
        'u': 'uùúûü',
        'c': 'cç'
    };

    const mappingUppercase: { [key: string]: string } = {
        'a': 'AÀÁÂÃÄÅ',
        'e': 'EÈÉÊË',
        'i': 'IÌÍÎÏ',
        'o': 'OÒÓÔÕÖ',
        'u': 'UÙÚÛÜ',
        'c': 'CÇ'
    };

    let pattern = "";
    for (const ch of word) {
        const baseNoDiacritics = removeAccents(ch).toLowerCase();
        if (mapping[baseNoDiacritics]) {
            pattern += `[${mapping[baseNoDiacritics]}]`;
        } else {
            // Escape special characters
            pattern += ch.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }
    }
    return pattern;
}

/**
 * Anonymizes names by replacing them with initials
 * @param text The text to anonymize
 * @param selectedText Optional selected text to specifically anonymize
 * @param namesFilePath Path to file containing common names
 * @returns The anonymized text and the number of substitutions made
 */
function anonymizeNameInitials(
    text: string,
    selectedText: string = "",
): { text: string; substitutions: number } {
    let currentText = text;
    let totalSubstitutions = 0;



    if (selectedText) {
        // Process selected text
        const words = selectedText.split(/\s+/);
        const initials = words
            .map(word => word.charAt(0).toUpperCase())
            .join(".");

        const ignoreWords = new Set(["de", "da", "do", "dos", "das"]);
        const patternParts: string[] = [];

        words.forEach((word, i) => {
            if (ignoreWords.has(removeAccents(word.toLowerCase()))) {
                const patternWord = diacriticInsensitive(word);
                if (i === 0) {
                    patternParts.push(patternWord);
                } else {
                    patternParts.push(`(?:\\s+${patternWord})?`);
                }
            } else {
                const fullWordPattern = diacriticInsensitive(word);
                const abbrevPattern = diacriticInsensitive(word[0]);
                if (i === 0) {
                    patternParts.push(`(?:${fullWordPattern}|${abbrevPattern}\\.?)`);
                } else {
                    patternParts.push(`(?:\\s+(?:${fullWordPattern}|${abbrevPattern}\\.?))`);
                }
            }
        });

        const patternStr = `\\b${patternParts.join("")}\\b`;
        const pattern = new RegExp(patternStr, 'gi');

        let subs = 0;
        currentText = currentText.replace(pattern, () => {
            subs++;
            return initials;
        });

        totalSubstitutions += subs;
    } else {
        // Handle common names from file
        // Note: In a browser environment, you'd need to load this differently
        // This is a Node.js example
        try {
            const fs = require('fs');
            const namesList = names;

            for (const name of namesList) {
                const replacement = `${name[0].toUpperCase()}.`;
                const namePattern = diacriticInsensitive(name);
                const pattern = new RegExp(`\\b${namePattern}\\b`, 'gi');

                let subs = 0;
                currentText = currentText.replace(pattern, () => {
                    subs++;
                    return replacement;
                });

                totalSubstitutions += subs;
            }
        } catch (e) {
            console.error(`Error anonymizing name initials: ${e}`);
        }
    }

    return { text: currentText, substitutions: totalSubstitutions };
}
