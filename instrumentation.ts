export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        if (!process.env.APP_CODE || !process.env.APP_HOST || !process.env.APP_PORT || !process.env.APP_REGISTRY_HOST || !process.env.APP_REGISTRY_PORT) return
        //await import('lib/eureka')
    }
}