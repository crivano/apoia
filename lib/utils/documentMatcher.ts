import strcomp from "string-comparison"
import { PecaType } from "@/lib/proc/process-types"

export type DocumentMatch = { closestDocument: PecaType, similarity: number }

export enum SimilarityType {
    JACCARD = 'Jaccard',
    DICE = 'Soerensen-Dice'
}

// Função para associar os documentos mais semelhantes e calcular a similaridade
export function matchDocuments(referenceList: PecaType[], comparisonList: PecaType[], similarityType: SimilarityType = SimilarityType.JACCARD): DocumentMatch[] {
    const referenceMap: Record<string, number[]> = {}
    const comparisonMap: Record<string, number[]> = {}

    // Organizando os documentos por tipo na lista de referência
    referenceList.forEach((doc, index) => {
        if (!referenceMap[doc.descr]) referenceMap[doc.descr] = []
        referenceMap[doc.descr].push(index)
    })

    type MatchDocumentsType = { index: number, closestDocument: number, similarity: number }
    const result: MatchDocumentsType[] = []
    for (let i = 0; i < referenceList.length; i++)
        result.push({ index: i, closestDocument: null, similarity: -1 })

    if (!comparisonList) return result.map(r => ({ closestDocument: null, similarity: r.similarity }))

    // Organizando os documentos por tipo na lista de comparação
    comparisonList.forEach((doc, index) => {
        if (!comparisonMap[doc.descr]) comparisonMap[doc.descr] = []
        comparisonMap[doc.descr].push(index)
    })

    const usedComparisonDocs: Set<number> = new Set() // Para garantir que cada documento da comparação seja usado apenas uma vez

    // Iterando sobre os tipos dos documentos da lista de referência
    Object.keys(referenceMap).forEach(type => {
        let matches: MatchDocumentsType[] = []

        if (comparisonMap[type]) {
            const referenceIndexes = referenceMap[type]
            const comparisonIndexes = comparisonMap[type]

            // Para cada documento da lista de referência
            referenceIndexes.forEach(refIdx => {
                // Para cada documento da lista de comparação
                comparisonIndexes.forEach(compIdx => {
                    const refContent = referenceList[refIdx].conteudo || ''
                    const compContent = comparisonList[compIdx].conteudo || ''
                    const similarity = (refContent === '' || compContent === '')
                        ? 0
                        : (similarityType === SimilarityType.JACCARD ? strcomp.cosine : strcomp.diceCoefficient).similarity(refContent, compContent)
                    matches.push({ index: refIdx, closestDocument: compIdx, similarity })
                }
                )
            })
        }

        matches.sort((a, b) => b.similarity - a.similarity) // Ordenar por similaridade decrescente
        while (matches.length > 0) {
            const bestMatch = matches.shift()
            result[bestMatch.index] = bestMatch
            matches = matches.filter(m => m.index !== bestMatch.index) // Remover os documentos da comparação que já foram usados
            matches = matches.filter(m => m.closestDocument !== bestMatch.closestDocument) // Remover os documentos da comparação que já foram usados
        }
    })

    return result.map(r => ({ closestDocument: comparisonList[r.closestDocument], similarity: r.similarity }))
}