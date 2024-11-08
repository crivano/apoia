
export type System = {
    system: string,
    wsdl: string,
    endpoint: string,
    validation: string,
    hashable: boolean
}
const systemsList = process.env.SYSTEMS?.split(',').map(system => system.trim()) || []

export const systems = systemsList.map(system => ({
    system,
    wsdl: process.env[`${system}_MNI_WSDL_URL`] as string,
    endpoint: process.env[`${system}_MNI_ENDPOINT_URL`] as string,
    validation: process.env[`${system}_VALIDATION_MESSAGE`] as string || 'Processo não encontrado',
    hashable: process.env?.[`${system}_HASH_PASSWORD`] === 'true'
} as System)) ?? new Array<System>
