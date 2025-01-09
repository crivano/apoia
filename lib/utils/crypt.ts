import Cryptr from 'cryptr'
import { envString } from './env'

const cryptr = new Cryptr(envString('PWD_SECRET') as string, { encoding: 'base64' })

export const encrypt = (text: string) => cryptr.encrypt(text)

export const decrypt = (text: string) => cryptr.decrypt(text)