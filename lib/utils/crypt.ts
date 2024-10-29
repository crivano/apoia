import Cryptr from 'cryptr'

const cryptr = new Cryptr(process.env.PWD_SECRET as string, { encoding: 'base64' })

export const encrypt = (text: string) => cryptr.encrypt(text)

export const decrypt = (text: string) => cryptr.decrypt(text)