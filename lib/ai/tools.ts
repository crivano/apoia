import { tool } from "ai"
import { UserType } from "../user"
import { CargaDeConteudoEnum, obterDadosDoProcesso } from "../proc/process"
import { TextoType } from "./prompt-types"
import { slugify } from "../utils/utils"
import { formatText } from "./prompt"
import { z } from "zod"
import ProcessContents from "@/app/community/process-contents"
import { PecaConteudoType } from "../proc/process-types"

export const getProcessMetadataTool = (pUser: Promise<UserType>) => tool({
    description: 'Obtém os metadados de um processo judicial a partir do número do processo.',
    parameters: z.object({
        processNumber: z.string().describe('O número do processo.'),
    }),
    execute: async ({ processNumber }) => {
        try {
            const dadosDoProcesso = await obterDadosDoProcesso({ numeroDoProcesso: processNumber, pUser, conteudoDasPecasSelecionadas: CargaDeConteudoEnum.NAO })
            return dadosDoProcesso
            // return `<dadosDoProcesso numero=${processNumber}>${JSON.stringify(dadosDoProcesso, null, 2)}</dadosDoProcesso>`
        } catch (error) {
            console.error('Error executing getProcessMetadataTool:', error)
            return `Error fetching metadata for process ${processNumber}: ${error instanceof Error ? error.message
                : 'Unknown error'}`
        }
    },
})

export const getPieceContentTool = (pUser: Promise<UserType>) => tool({
    description: 'Obtém o conteúdo de uma ou mais peças processuais a partir do número do processo e dos identificadores das peças.',
    parameters: z.object({
        processNumber: z.string().describe('O número do processo.'),
        pieceIdArray: z.array(z.string()).describe('Os identificadores das peças processuais a serem obtidas.'),
    }),
    execute: async ({ processNumber, pieceIdArray }) => {
        try {
            const dadosDoProcesso = await obterDadosDoProcesso({ numeroDoProcesso: processNumber, idDaPeca: pieceIdArray, pUser, conteudoDasPecasSelecionadas: CargaDeConteudoEnum.SINCRONO })
            let pecasComConteudo: TextoType[] = []
            for (const peca of dadosDoProcesso.pecasSelecionadas) {
                if (peca.pConteudo) {
                    const conteudo: PecaConteudoType = await peca.pConteudo
                    if (conteudo.errorMsg) throw new Error(conteudo.errorMsg)
                    peca.conteudo = conteudo.conteudo
                }
                if (!peca.conteudo) continue
                const slug = slugify(peca.descr)
                pecasComConteudo.push({ id: peca.id, event: peca.numeroDoEvento, idOrigem: peca.idOrigem, label: peca.rotulo, descr: peca.descr, slug, pTexto: peca.pConteudo, texto: peca.conteudo })
            }
            const result = pecasComConteudo.map(p => formatText(p)).join('\n\n')
            return result || `Não foi possível obter o conteúdo das peças ${pieceIdArray.join(', ')} do processo ${processNumber}`
        } catch (error) {
            console.error('Error executing getPieceContentTool:', error)
            return `Error fetching content for process ${processNumber}, pieces ${pieceIdArray.join(', ')}: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
    },
})

