import { number } from "zod"
import { DadosDoProcessoType } from "../proc/process"
import { InteropMNI } from "./mni"

export type ObterPecaType = { buffer: ArrayBuffer, contentType: string }

export interface Interop {
    autenticar(system: string): Promise<boolean>
    consultarProcesso(numeroDoProcesso: string): Promise<DadosDoProcessoType>
    obterPeca(numeroDoProcesso: string, idDaPeca: string): Promise<ObterPecaType>
}

export const getInterop = (username: string, password: string): Interop => {
    return new InteropMNI(username, password)
}