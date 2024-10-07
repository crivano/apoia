
const systemsList = process.env.SYSTEMS?.split(',').map(system => system.trim()) || []
export const systems = systemsList.map(system => ({
    system,
    wsdl: process.env[`${system}_MNI_WSDL_URL`] as string,
    endpoint: process.env[`${system}_MNI_ENDPOINT_URL`] as string,
    validation: process.env[`${system}_VALIDATION_MESSAGE`] as string
})) ?? []
