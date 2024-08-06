export const systems = process.env.SYSTEMS?.split(',').map(s => ({
    system: s.trim(),
    wsdl: process.env[`${s}_MNI_WSDL_URL`] as string,
    endpoint: process.env[`${s}_MNI_ENDPOINT_URL`] as string
})) ?? []

