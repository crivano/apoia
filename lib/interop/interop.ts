import { number } from "zod"
import { DadosDoProcessoType } from "../proc/process"

export type ObterPecaType = { buffer: ArrayBuffer, contentType: string }

export interface Interop {
    autenticar(system: string, username: string, password: string): Promise<boolean>
    consultarProcesso(numeroDoProcesso: string, username?: string, password?: string): Promise<DadosDoProcessoType>
    obterPeca(numeroDoProcesso: string, idDaPeca: string, username?: string, password?: string): Promise<ObterPecaType>
}