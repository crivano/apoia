import { T } from "./combinacoes";

// Interface para documentos do processo
export interface Documento {
  id: string;
  tipo: T;
}

export interface MatchOptions {
  capture?: T[];
  except?: T[];
}

// Tipos de operadores
export type MatchOperator =
  | { type: 'EXACT'; docType: T }
  | { type: 'OR'; docTypes: T[] }
  | { type: 'ANY'; options?: MatchOptions }
  | { type: 'SOME'; options?: MatchOptions };

export const EXACT = (docType: T) => ({ type: 'EXACT' as const, docType })
export const OR = (...docTypes: T[]) => ({ type: 'OR' as const, docTypes })
export const ANY = (options?: MatchOptions) => ({ type: 'ANY' as const, options })
export const SOME = (options?: MatchOptions) => ({ type: 'SOME' as const, options })

export type MatchResultItem = { operator: MatchOperator, captured: Documento[] }
export type MatchResult = MatchResultItem[] | null

function matchFromIndex(
  documents: Documento[],
  pattern: MatchOperator[],
  patternIdx: number,
  docIdx: number,
  matched: MatchResultItem[] = []
): MatchResult {
  if (patternIdx < 0 && docIdx < 0) return matched
  if (patternIdx < 0) return null

  const operator = pattern[patternIdx];
  const document = docIdx >= 0 ? documents[docIdx] : { id: null, tipo: null };
  
  switch (operator.type) {
    case 'EXACT':
      if (document.tipo === operator.docType) {
        return matchFromIndex(
          documents,
          pattern,
          patternIdx - 1,
          docIdx - 1,
          [{ operator, captured: [document] }, ...matched]
        );
      }
      return null;
    case 'OR':
      if (operator.docTypes.includes(document.tipo)) {
        return matchFromIndex(
          documents,
          pattern,
          patternIdx - 1,
          docIdx - 1,
          [{ operator, captured: [document] }, ...matched]
        );
      }
      return null;
    case 'ANY': {
      let currentIdx = docIdx;
      const captured: Documento[] = [];

      // Try to match the empty sequence
      const matchSkipping = matchFromIndex(
        documents,
        pattern,
        patternIdx - 1,
        currentIdx,
        [{ operator, captured }, ...matched]
      )
      if (matchSkipping) return matchSkipping

      while (currentIdx >= 0) {
        const currentDoc = documents[currentIdx]
        if (operator.options?.except?.includes(currentDoc.tipo)) return null

        if (operator.options?.capture && (operator.options.capture.length === 0 || operator.options.capture.includes(currentDoc.tipo)))
          captured.unshift(currentDoc)

        const matchPrevious = matchFromIndex(
          documents,
          pattern,
          patternIdx - 1,
          currentIdx - 1,
          [{ operator, captured }, ...matched]
        )

        if (matchPrevious) return matchPrevious
        currentIdx--;
      }

      return null;
    }
    case 'SOME': {
      let currentIdx = docIdx;
      const captured: Documento[] = [];

      while (currentIdx >= 0) {
        const currentDoc = documents[currentIdx];
        if (operator.options?.except?.includes(currentDoc.tipo)) break

        if (operator.options?.capture && (operator.options.capture.length === 0 || operator.options.capture.includes(currentDoc.tipo)))
          captured.unshift(currentDoc)

        if (captured.length) {
          const matchPrevious = matchFromIndex(
            documents,
            pattern,
            patternIdx - 1,
            currentIdx - 1,
            [{ operator, captured }, ...matched]
          )
          if (matchPrevious) return matchPrevious
        }
        currentIdx--;
      }
      return null;
    }
    default:
      return null;
  }
}

export function match(documents: Documento[], pattern: MatchOperator[]): MatchResult {
  const result = matchFromIndex(documents, pattern, pattern.length - 1, documents.length - 1);
  if (result) return result;
  return null;
}

