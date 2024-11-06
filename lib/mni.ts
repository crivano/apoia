'use server'
import { createHash } from 'node:crypto'

import * as soap from 'soap'
import { systems } from '@/lib/utils/env'
import { assertCurrentUser } from '@/lib/user'

import pLimit from 'p-limit'

const limit = pLimit(process.env.MNI_LIMIT ? parseInt(process.env.MNI_LIMIT) : 1)

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

const criarHash = (senha: string) => {
    const date = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date()).replaceAll('/', '-');

    const input = `${date}${senha}`;
    const hash = createHash('sha256').update(input).digest('hex');
    return hash;
}

export const autenticar = async (system: string, username: string, password: string) => {
    const client = await getClient(system)
    const currentSystem = systems.find(s => s.system === system)
    if (!currentSystem) {
        throw new Error(`Client for system ${system} not found`)
    }
    if (currentSystem.hashable) {
        password = criarHash(password)
    }
    const res = await client.consultarProcessoAsync({
        idConsultante: username,
        senhaConsultante: password,
        numeroProcesso: '00000000000000000000',
        movimentos: false,
        incluirCabecalho: false,
        incluirDocumentos: false
    })
    return res[0].mensagem.includes(currentSystem.validation)
}

export const consultarProcesso = async (numero, username, password) => {
    const client = await getClient(undefined)
    // throw an error if the number is invalid
    if (!numero.match(/^\d{20}$/))
        throw new Error('Número de processo inválido')
    const user = await assertCurrentUser()
    const system = systems.find(s => s.system === user.image.system)
    if (system?.hashable) {
        password = criarHash(password)
    }
    const pConsultarProcesso = client.consultarProcessoAsync({
        idConsultante: username,
        senhaConsultante: password,
        numeroProcesso: numero,
        movimentos: true,
        incluirCabecalho: true,
        incluirDocumentos: true
    })
    return pConsultarProcesso
}

export const obterPeca = async (numeroDoProcesso, idDaPeca, username: string, password: string) =>
    limit(() => obterPecaSemLimite(numeroDoProcesso, idDaPeca, username, password))

export const obterPecaSemLimite = async (numeroDoProcesso, idDaPeca, username: string, password: string) => {
    const client = await getClient(undefined)
    const user = await assertCurrentUser()
    const system = systems.find(s => s.system === user.image.system)
    if (system?.hashable) {
        password = criarHash(password)
    }
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



