import { number } from "zod"
import { DadosDoProcessoType } from "../proc/process-types"
import { InteropMNI } from "./mni"
import { InteropPDPJ } from "./pdpj"

export type ObterPecaType = { buffer: ArrayBuffer, contentType: string }

export interface Interop {
    init(): Promise<void>
    autenticar(system: string): Promise<boolean>
    consultarProcesso(numeroDoProcesso: string): Promise<DadosDoProcessoType[]>
    obterPeca(numeroDoProcesso: string, idDaPeca: string, allowBinary?: boolean): Promise<ObterPecaType>
}

export const getInterop = (username: string, password: string): Interop => {
    if (!username || !password) 
        return new InteropPDPJ()
    return new InteropMNI(username, password)
}