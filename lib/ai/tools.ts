import { tool, ToolExecutionOptions } from "ai"
import { UserType } from "../user"
import { CargaDeConteudoEnum, getInteropFromUser, obterDadosDoProcesso } from "../proc/process"
import { TextoType } from "./prompt-types"
import { slugify } from "../utils/utils"
import { formatText } from "./prompt"
import { z } from "zod"
import ProcessContents from "@/app/community/process-contents"
import { PecaConteudoType } from "../proc/process-types"
import { Interop, ObterPecaType } from "../interop/interop"
import { get } from "http"
import { InteropProcessoType } from "../interop/interop-types"

export const getProcessMetadata = async (processNumber: string, interop: Interop): Promise<InteropProcessoType[]> => {
    const processMetadata = await interop.consultarMetadadosDoProcesso(processNumber)
    if (!processMetadata || !processMetadata.length) {
        throw new Error(`Não foi possível obter os metadados do processo ${processNumber}.`)
    }
    return processMetadata
    // const dadosDoProcesso = await obterDadosDoProcesso({ numeroDoProcesso: processNumber, pUser, conteudoDasPecasSelecionadas: CargaDeConteudoEnum.NAO })
    // return dadosDoProcesso
}

export const getProcessMetadataTool = (pUser: Promise<UserType>) => tool({
    description: 'Obtém os metadados de um processo judicial a partir do número do processo.',
    parameters: z.object({
        processNumber: z.string().describe('O número do processo.'),
    }),
    execute: async ({ processNumber }) => {
        try {
            processNumber = processNumber.trim().replace(/[^0-9]/g, '')
            const interop = await getInteropFromUser(await pUser)
            return getProcessMetadata(processNumber, interop)
        } catch (error) {
            console.error('Error executing getProcessMetadataTool:', error)
            return `Error fetching metadata for process ${processNumber}: ${error instanceof Error ? error.message
                : 'Unknown error'}`
        }
    }
})

export const getPieceContentTool = (pUser: Promise<UserType>) => tool({
    description: 'Obtém o conteúdo de uma ou mais peças processuais a partir do número do processo e dos identificadores das peças.',
    parameters: z.object({
        processNumber: z.string().describe('O número do processo.'),
        pieceIdArray: z.array(z.string()).describe('Os identificadores das peças processuais a serem obtidas.'),
    }),
    execute: async ({ processNumber, pieceIdArray }) => {
        try {
            const decoder = new TextDecoder('utf-8')
            const interop = await getInteropFromUser(await pUser)
            const pMetadata = getProcessMetadata(processNumber, interop)
            const pPecas: Promise<ObterPecaType>[] = []
            for (const pieceId of pieceIdArray) {
                if (!pieceId || !pieceId.trim()) {
                    return `Identificador de peça inválido: ${pieceId}`
                }
                if (!/^[a-zA-Z0-9-]+$/.test(pieceId)) {
                    return `Identificador de peça inválido: ${pieceId}. Deve conter apenas letras, números e hífens.`
                }
                pPecas.push(interop.obterPeca(processNumber, pieceId, false))
            }
            const pecas = await Promise.all(pPecas)
            const metadata: InteropProcessoType[] = await pMetadata
            const pecasComConteudo: TextoType[] = await Promise.all(pecas.map(async (p, index) => {
                const pieceId = pieceIdArray[index]

                // Find the document in metadata that matches this pieceId
                let documentInfo = null
                for (const processo of metadata) {
                    for (const movimento of processo.movimentosEDocumentos) {
                        const doc = movimento.documentos.find(d => d.id === pieceId)
                        if (doc) {
                            documentInfo = { doc, movimento, processo }
                            break
                        }
                    }
                    if (documentInfo) break
                }

                // Extract text from the buffer
                const texto = decoder.decode(p.buffer)
                const descr = documentInfo?.doc?.tipoDocumento
                const label = documentInfo?.movimento?.descricao
                const event = documentInfo?.movimento?.sequencia

                return {
                    id: pieceId,
                    idOrigem: pieceId,
                    event,
                    label,
                    descr,
                    slug: slugify(descr),
                    texto
                }
            }))
            const result = pecasComConteudo.map(p => formatText(p)).join('\n\n')
            return result || `Não foi possível obter o conteúdo das peças ${pieceIdArray.join(', ')} do processo ${processNumber}`
        } catch (error) {
            console.error('Error executing getPieceContentTool:', error)
            return `Error fetching content for process ${processNumber}, pieces ${pieceIdArray.join(', ')}: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
    },
})

