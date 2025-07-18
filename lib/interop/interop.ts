import { number } from "zod"
import { DadosDoProcessoType } from "../proc/process-types"
import { InteropMNI } from "./mni"
import { InteropPDPJ } from "./pdpj"
import { InteropProcessoType } from "./interop-types"

export type ObterPecaType = { buffer: ArrayBuffer, contentType: string }

export interface Interop {
    init(): Promise<void>
    autenticar(system: string): Promise<boolean>
    consultarMetadadosDoProcesso(numeroDoProcesso: string): Promise<InteropProcessoType[]>
    consultarProcesso(numeroDoProcesso: string): Promise<DadosDoProcessoType[]>
    obterPeca(numeroDoProcesso: string, idDaPeca: string, binary?: boolean): Promise<ObterPecaType>
}

export const getInterop = (username: string, password: string): Interop => {
    if (!username || !password)
        return new InteropPDPJ()
    return new InteropMNI(username, password)
}