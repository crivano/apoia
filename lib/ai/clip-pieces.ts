import { Model, ModelValeuType } from "./model-types";
import { TextoType } from "./prompt-types";

/**
 * Representa uma peça com seu tamanho e sua posição original na lista.
 */
interface IndexedPiece {
    size: number;
    originalIndex: number;
}

/**
 * Analisa uma lista de tamanhos de peças e um limite máximo de caracteres,
 * e determina o novo tamanho de cada peça para que o total se ajuste ao limite.
 * A estratégia prioriza "clipar" (reduzir) as peças maiores primeiro de forma justa.
 *
 * @param pieceSizes Uma lista de números representando o tamanho de cada peça.
 * @param maxTotalSize O número máximo de caracteres que a soma de todas as peças pode ter.
 * @returns Uma lista com os novos tamanhos para cada peça, na ordem original.
 */
function computePiecesClipping(pieceSizes: number[], maxTotalSize: number): number[] {
    const numPieces = pieceSizes.length;
    const currentTotalSize = pieceSizes.reduce((sum, size) => sum + size, 0);

    // Se o tamanho total já está dentro do limite, não há nada a fazer.
    if (currentTotalSize <= maxTotalSize) {
        return [...pieceSizes]; // Retorna uma cópia da lista original.
    }

    let overflow = currentTotalSize - maxTotalSize;

    // Mapeia para um objeto para manter o controle do índice original após a ordenação.
    const indexedPieces: IndexedPiece[] = pieceSizes.map((size, index) => ({
        size,
        originalIndex: index,
    }));

    // Ordena as peças em ordem decrescente de tamanho.
    indexedPieces.sort((a, b) => b.size - a.size);

    // Itera pelas peças ordenadas para encontrar o ponto de corte.
    for (let i = 0; i < numPieces; i++) {
        // O número de peças que estamos considerando clipar neste nível.
        const numPiecesInLevel = i + 1;

        // O tamanho da próxima peça na lista (ou 0 se esta for a última).
        // Este é o "piso" para o qual vamos tentar nivelar.
        const nextPieceSize = i + 1 < numPieces ? indexedPieces[i + 1].size : 0;

        // A diferença de altura entre o nível atual e o próximo.
        const heightDifference = indexedPieces[i].size - nextPieceSize;

        // A quantidade total de caracteres que podemos remover ao nivelar todas as peças
        // deste nível para o tamanho da próxima peça.
        const potentialReduction = numPiecesInLevel * heightDifference;

        if (overflow <= potentialReduction) {
            // Encontramos o nível final de clipagem.
            // O excesso restante será distribuído igualmente entre as peças deste nível.
            const amountToClipPerPiece = Math.ceil(overflow / numPiecesInLevel);
            const finalClippedSize = indexedPieces[i].size - amountToClipPerPiece;

            // Preenche a lista de resultados na ordem original.
            const result = new Array(numPieces).fill(0);

            // Aplica o tamanho final às peças que foram clipadas.
            for (let j = 0; j <= i; j++) {
                const piece = indexedPieces[j];
                result[piece.originalIndex] = finalClippedSize;
            }

            // As peças restantes mantêm seu tamanho original.
            for (let j = i + 1; j < numPieces; j++) {
                const piece = indexedPieces[j];
                result[piece.originalIndex] = piece.size;
            }

            return result;

        } else {
            // Ainda não removemos o suficiente. Subtrai a redução deste nível
            // e continua para o próximo, tratando mais peças como parte do "bloco" superior.
            overflow -= potentialReduction;
        }
    }

    // Caso de fallback (não deveria acontecer com a lógica acima, mas é bom ter).
    // Se chegarmos aqui, significa que precisamos clipar todas as peças para um tamanho médio.
    const finalSize = Math.floor(maxTotalSize / numPieces);
    return new Array(numPieces).fill(finalSize);
}

/**
 * Analisa uma lista de peças de texto e, para aquelas que consistem em mais de 90%
 * de números, símbolos e espaços em branco, limita seu tamanho a 10.000 caracteres.
 *
 * @param textos Uma lista de objetos TextoType.
 * @returns Uma nova lista de objetos TextoType com as peças potencialmente clipadas.
 */
function clipNumericAndSymbolicPieces(textos: TextoType[]): TextoType[] {
    const CLIP_LIMIT = 5000;
    const THRESHOLD = 0.9;

    return textos.map((piece, index) => {
        const text = piece.texto;

        // Ignora peças sem texto ou com texto vazio.
        if (!text || text.length === 0) {
            return piece;
        }

        // Conta caracteres que não são letras (ou seja, números, símbolos, espaços).
        const nonAlphabeticMatches = text.match(/[^a-zA-Z]/g);
        const nonAlphabeticCount = nonAlphabeticMatches ? nonAlphabeticMatches.length : 0;

        const ratio = nonAlphabeticCount / text.length;

        // Se a proporção for maior que o limiar e o texto for maior que o limite, clipa.
        if (ratio > THRESHOLD && text.length > CLIP_LIMIT) {
            console.log(`Clipando peça com pouco texto ${index + 1} de ${textos.length} com tamanho ${text.length} para ${CLIP_LIMIT} caracteres.`);
            return {
                ...piece,
                texto: text.slice(0, CLIP_LIMIT) + '...',
            };
        }

        return piece;
    });
}

export function clipPieces(model: string, textos: TextoType[]): TextoType[] {

    textos = clipNumericAndSymbolicPieces(textos)

    const K_TOKENS_PER_CHAR = 1500 / 2000 * 1000
    const modelDetails: ModelValeuType = Object.values(Model).find(m => m.name === model)
    const clipSize = modelDetails?.clip * K_TOKENS_PER_CHAR
    if (!clipSize) return textos

    // Calcula os tamanhos das peças.
    const pieceSizes = textos.map(piece => piece.texto?.length || 0)

    // Calcula o novo tamanho de cada peça para que o total se ajuste ao limite.
    const newSizes = computePiecesClipping(pieceSizes, clipSize)

    // Retorna as peças com os novos tamanhos.
    return textos.map((piece, index) => {
        if (newSizes[index] >= (piece.texto?.length || 0)) return piece; // Não clipa se o novo tamanho é maior ou igual ao original.
        console.log(`Clipando peça ${index + 1} de ${textos.length} de tamanho ${piece.texto?.length} para ${newSizes[index]} caracteres.`);
        return {
            ...piece,
            texto: piece.texto.slice(0, newSizes[index]) + '...',
        }
    })
}
