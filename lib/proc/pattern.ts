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


export class DocumentPatternMatcher {
  match(documents: Documento[], pattern: MatchOperator[]): Documento[] | null {
    const result = this.matchFromIndex(documents, pattern, pattern.length - 1, documents.length - 1);
    if (result) return result;
    return null;
  }

  private matchFromIndex(
    documents: Documento[],
    pattern: MatchOperator[],
    patternIdx: number,
    docIdx: number,
    matched: Documento[] = []
  ): Documento[] | null {
    if (patternIdx < 0 && docIdx < 0) return matched
    if (patternIdx < 0 || docIdx < 0) return null

    const operator = pattern[patternIdx];
    const document = documents[docIdx];

    switch (operator.type) {
      case 'EXACT':
        if (document.tipo === operator.docType) {
          return this.matchFromIndex(
            documents,
            pattern,
            patternIdx - 1,
            docIdx - 1,
            [document, ...matched]
          );
        }
        return null;
      case 'OR':
        if (operator.docTypes.includes(document.tipo)) {
          return this.matchFromIndex(
            documents,
            pattern,
            patternIdx - 1,
            docIdx - 1,
            [document, ...matched]
          );
        }
        return null;
      case 'ANY': {
        let currentIdx = docIdx;
        const collected: Documento[] = [];

        while (currentIdx >= 0) {
          const currentDoc = documents[currentIdx]
          if (operator.options?.except?.includes(currentDoc.tipo)) return null

          if (operator.options?.capture && operator.options.capture.includes(currentDoc.tipo))
            collected.unshift(currentDoc)

          const matchPrevious = this.matchFromIndex(
            documents,
            pattern,
            patternIdx - 1,
            currentIdx - 1,
            [...collected, ...matched]
          )

          if (matchPrevious) return matchPrevious
          currentIdx--;
        }

        return null;
      }
      case 'SOME': {
        let currentIdx = docIdx;
        const collected: Documento[] = [];

        while (currentIdx >= 0) {
          const currentDoc = documents[currentIdx];
          if (operator.options?.except?.includes(currentDoc.tipo)) break

          if (operator.options?.capture && operator.options.capture.includes(currentDoc.tipo))
            collected.unshift(currentDoc)

          if (collected.length) {
            const matchPrevious = this.matchFromIndex(
              documents,
              pattern,
              patternIdx - 1,
              currentIdx - 1,
              [...collected, ...matched]
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

}

