import { getInternalPrompt } from '@/lib/ai/prompt'
import { PromptDataType, PromptDefinitionType } from '@/lib/ai/prompt-types'
import { DadosDoProcessoType, obterDadosDoProcesso } from '@/lib/proc/process'
import { assertCurrentUser } from '@/lib/user'
import { T, P, ProdutosValidos, Plugin, ProdutoCompleto, CombinacaoValida, InfoDeProduto, ProdutoValido } from '@/lib/proc/combinacoes'
import { slugify } from '@/lib/utils/utils'
import { IAGenerated } from '@/lib/db/mysql-types'
import { Dao } from '@/lib/db/mysql'
import { getTriagem, getNormas, getPalavrasChave } from '@/lib/fix'
import { generateContent } from '@/lib/ai/generate'

type PecaComConteudoType = {
    id: string, // identificador da peça no Eproc
    pTexto: Promise<string>,
    descr: string,
    slug: string,
}

export type GeneratedContent = {
    id?: number,
    documentCode: string | null, // identificador da peça no Eproc
    documentDescr: string | null, // descrição da peça no Eproc
    // infoDeProduto: InfoDeProduto
    title: string,
    promptSlug: string,
    data: PromptDataType,
    plugins?: Plugin[],
    sha256?: string,
    result?: Promise<IAGenerated | undefined>,
    generated?: string,
    peca?: T,
}

export async function summarize(dossierNumber: string, pieceNumber: string): Promise<{ dossierData: any, generatedContent: GeneratedContent }> {
    const pUser = assertCurrentUser()

    // Obter peças
    const pDadosDoProcesso = obterDadosDoProcesso(dossierNumber, pUser, pieceNumber)
    const dadosDoProcesso: DadosDoProcessoType = await pDadosDoProcesso
    if (dadosDoProcesso.errorMsg) throw new Error(dadosDoProcesso.errorMsg)

    // Obter conteúdo das peças
    const pecasComConteudo = await getPiecesWithContent(dadosDoProcesso, dossierNumber)
    const peca = pecasComConteudo[0]

    const definition: PromptDefinitionType = getInternalPrompt(`resumo-${peca.slug}`)

    const data: PromptDataType = { textos: [{ descr: peca.descr, slug: peca.slug, pTexto: peca.pTexto }] }
    const infoDeProduto: InfoDeProduto = { produto: P.RESUMO_PECA, titulo: peca.descr, dados: [peca.descr as T], prompt: definition.kind, plugins: [] }
    const req: GeneratedContent = {
        documentCode: peca.id, documentDescr: peca.descr, data, title: peca.descr, promptSlug: definition.kind
    }

    // Retrieve from cache or generate
    req.result = generateContent(definition, data)
    const result = await req.result as IAGenerated
    req.generated = result.generation
    req.id = result.id

    return { dossierData: dadosDoProcesso, generatedContent: req }
}

export function buildRequests(combinacao: CombinacaoValida, pecasComConteudo: PecaComConteudoType[]): GeneratedContent[] {
    const requests: GeneratedContent[] = []

    // Add product IARequests
    for (const produto of combinacao.produtos) {
        // Add resume for each piece
        if (produto.produto === P.RESUMOS) {
            for (const peca of pecasComConteudo) {
                const definition = getInternalPrompt(`resumo-${peca.slug}`)
                const data: PromptDataType = { textos: [{ descr: peca.descr, slug: peca.slug, pTexto: peca.pTexto }] }
                requests.push({ documentCode: peca.id, documentDescr: peca.descr, data, title: peca.descr, promptSlug: definition.kind })
            }
            continue
        }

        let data: PromptDataType = { textos: pecasComConteudo.map(peca => ({ descr: peca.descr, slug: peca.slug, pTexto: peca.pTexto })) }

        let produtoSimples: P | undefined = undefined
        // if produto is complex filter data.textos
        if (typeof produto === 'object') {
            const complex = produto as any as ProdutoCompleto
            const tipos = Array.isArray(complex.dados) ? complex.dados : [complex.dados]
            if (tipos.length !== 0)
                data.textos = data.textos.filter(peca => tipos.includes(peca.descr as T))
            produtoSimples = complex.produto
        } else {
            produtoSimples = produto
        }

        const produtoValido = ProdutosValidos[produtoSimples]

        const definition = getInternalPrompt(produtoValido.prompt)
        if (!definition) continue

        // const infoDeProduto = { ...produto }

        requests.push({ documentCode: null, documentDescr: null, data, promptSlug: definition.kind, title: produtoValido.titulo, plugins: produtoValido.plugins })
    }
    return requests
}

export async function analyze(batchName: string | undefined, dossierNumber: string, complete: boolean): Promise<{ dossierData: any, generatedContent: GeneratedContent[] }> {
    console.log('analyze', batchName, dossierNumber)
    try {
        const pUser = assertCurrentUser()

        // Obter peças
        const pDadosDoProcesso = obterDadosDoProcesso(dossierNumber, pUser, undefined, undefined, complete)
        const dadosDoProcesso = await pDadosDoProcesso
        if (dadosDoProcesso.errorMsg) throw new Error(dadosDoProcesso.errorMsg)
        if (!dadosDoProcesso?.combinacao) throw new Error(`${dossierNumber}: Nenhuma combinacao válida`)
        const produtos = dadosDoProcesso?.combinacao?.produtos
        // if (dadosDoProcesso?.combinacao?.produtos[0] !== P.ANALISE_TR)
        //   throw new Error(`${numeroDoProcesso}: Combinação inválida`)

        const pecasComConteudo = await getPiecesWithContent(dadosDoProcesso, dossierNumber)

        // console.log('pecasComConteudo', pecasComConteudo)

        const requests: GeneratedContent[] = buildRequests(dadosDoProcesso.combinacao, pecasComConteudo)

        // Retrieve from cache or generate
        for (const req of requests) {
            req.result = generateContent(getInternalPrompt(req.promptSlug), req.data)
        }

        for (const req of requests) {
            const result = await req.result as IAGenerated
            req.generated = result.generation
            req.id = result.id
        }

        if (batchName) {
            const user = await pUser
            const systemCode = user.image.system
            const systemId = await Dao.assertSystemId(null, systemCode)
            storeBatchItem(systemId, batchName, dossierNumber, requests, dadosDoProcesso)
        }

        return { dossierData: dadosDoProcesso, generatedContent: requests }
    } catch (error) {
        console.error('Error processing batch', error)
        throw error
    }
}

export async function getPiecesWithContent(dadosDoProcesso: DadosDoProcessoType, dossierNumber: string): Promise<PecaComConteudoType[]> {
    let pecasComConteudo: PecaComConteudoType[] = []
    for (const peca of dadosDoProcesso.pecas) {
        if (peca.pConteudo === undefined) {
            // console.log('peca', peca)
            throw new Error(`Conteúdo não encontrado no processo ${dossierNumber}, peça ${peca.id}, rótulo ${peca.rotulo}`)
        }
        const slug = await slugify(peca.descr)
        pecasComConteudo.push({ id: peca.id, descr: peca.descr, slug, pTexto: peca.pConteudo })
    }
    return pecasComConteudo
}

// Insert into database as part of a batch
async function storeBatchItem(systemId: number, batchName: string, dossierNumber: string, requests: GeneratedContent[], dadosDoProcesso: any) {
    const batch_id = await Dao.assertIABatchId(null, batchName)
    console.log('batch_id', batch_id)
    const dossier_id = await Dao.assertIADossierId(null, dossierNumber, systemId, dadosDoProcesso.codigoDaClasse, dadosDoProcesso.ajuizamento)
    await Dao.deleteIABatchDossierId(null, batch_id, dossier_id)
    const batch_dossier_id = await Dao.assertIABatchDossierId(null, batch_id, dossier_id)
    let seq = 0
    for (const req of requests) {
        const document_id = req.documentCode ? await Dao.assertIADocumentId(null, dossier_id, req.documentCode, req.documentDescr) : null
        await Dao.insertIABatchDossierItem(null, { batch_dossier_id, document_id, generation_id: req.id as number, descr: req.title, seq })
        seq++

        // process plugins
        if (!req.plugins || !req.plugins.length) continue
        for (const plugin of req.plugins) {
            switch (plugin) {
                case Plugin.TRIAGEM: {
                    const triage = getTriagem(req.generated)
                    const enum_id = await Dao.assertIAEnumId(null, Plugin.TRIAGEM)
                    const enum_item_id = await Dao.assertIAEnumItemId(null, triage, enum_id)
                    await Dao.assertIABatchDossierEnumItemId(null, batch_dossier_id, enum_item_id)
                    break
                }
                case Plugin.TRIAGEM_JSON: {
                    if (req.generated) {
                        const triage = JSON.parse(req.generated).triagem
                        if (triage) {
                            const enum_id = await Dao.assertIAEnumId(null, Plugin.TRIAGEM)
                            const enum_item_id = await Dao.assertIAEnumItemId(null, triage, enum_id)
                            await Dao.assertIABatchDossierEnumItemId(null, batch_dossier_id, enum_item_id)
                            break
                        }
                    }
                }
                case Plugin.NORMAS: {
                    const normas = getNormas(req.generated)
                    const enum_id = await Dao.assertIAEnumId(null, Plugin.NORMAS)
                    for (const norma of normas) {
                        const enum_item_id = await Dao.assertIAEnumItemId(null, norma, enum_id)
                        await Dao.assertIABatchDossierEnumItemId(null, batch_dossier_id, enum_item_id)
                    }
                    break
                }
                case Plugin.NORMAS_JSON: {
                    if (req.generated) {
                        const normas = JSON.parse(req.generated).normas
                        if (normas) {
                            const enum_id = await Dao.assertIAEnumId(null, Plugin.NORMAS)
                            for (const norma of normas) {
                                const enum_item_id = await Dao.assertIAEnumItemId(null, norma, enum_id)
                                await Dao.assertIABatchDossierEnumItemId(null, batch_dossier_id, enum_item_id)
                            }
                            break
                        }
                    }
                }
                case Plugin.PALAVRAS_CHAVE: {
                    const palavrasChave = getPalavrasChave(req.generated)
                    const enum_id = await Dao.assertIAEnumId(null, Plugin.PALAVRAS_CHAVE)
                    for (const palavraChave of palavrasChave) {
                        const enum_item_id = await Dao.assertIAEnumItemId(null, palavraChave, enum_id)
                        await Dao.assertIABatchDossierEnumItemId(null, batch_dossier_id, enum_item_id)
                    }
                    break
                }
                case Plugin.PALAVRAS_CHAVE_JSON: {
                    if (req.generated) {
                        const palavrasChave = JSON.parse(req.generated).palavrasChave
                        if (palavrasChave) {
                            const enum_id = await Dao.assertIAEnumId(null, Plugin.PALAVRAS_CHAVE)
                            for (const palavraChave of palavrasChave) {
                                const enum_item_id = await Dao.assertIAEnumItemId(null, palavraChave, enum_id)
                                await Dao.assertIABatchDossierEnumItemId(null, batch_dossier_id, enum_item_id)
                            }
                            break
                        }
                    }
                }
            }
        }
    }
}