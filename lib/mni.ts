'use server'

import * as soap from 'soap'
import { systems } from '@/lib/utils/env'
import { assertCurrentUser } from '@/lib/user'

const clientMap = new Map<string, soap.Client>()

const getClient = async (system: string | undefined) => {
    if (system === undefined) {
        const user = await assertCurrentUser()
        system = user.image.system
    }
    let client = clientMap.get(system as string)
    if (client !== undefined)
        return client
    const systemData = systems.find(s => s.system === system)
    client = await soap.createClientAsync(
        systemData?.wsdl as string,
        { parseReponseAttachments: true },
        systemData?.endpoint as string)
    clientMap.set(system as string, client)
    return client
}


export const autenticar = async (system: string, username: string, password: string) => {
    const client = await getClient(system)
    const res = await client.consultarProcessoAsync({
        idConsultante: username,
        senhaConsultante: password,
        numeroProcesso: '00000000000000000000',
        movimentos: false,
        incluirCabecalho: false,
        incluirDocumentos: false
    })
    return res[0].mensagem.includes('Processo não encontrado')
}

export const consultarProcesso = async (numero, username, password) => {
    const client = await getClient(undefined)
    // throw an error if the number is invalid
    if (!numero.match(/^\d{20}$/))
        throw new Error('Número de processo inválido')
    const pConsultarProcesso = client.consultarProcessoAsync({
        idConsultante: username,
        senhaConsultante: password,
        numeroProcesso: numero,
        movimentos: false,
        incluirCabecalho: true,
        incluirDocumentos: true
    })
    return pConsultarProcesso
}

export const obterPeca = async (numeroDoProcesso, idDaPeca, username: string, password: string) => {
    const client = await getClient(undefined)
    const respPeca = await client.consultarProcessoAsync({
        idConsultante: username,
        senhaConsultante: password,
        numeroProcesso: numeroDoProcesso,
        movimentos: false,
        incluirCabecalho: false,
        incluirDocumentos: false,
        documento: [idDaPeca]
    })
    const arquivo = client.lastResponseAttachments.parts[0]
    const b = arquivo.body
    const ab = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
    const resultado = { buffer: ab, contentType: respPeca[0].processo.documento[0].attributes.mimetype }
    return resultado
}



