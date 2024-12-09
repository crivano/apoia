export async function GET(req: Request) {
    return Response.json({
        build: {
            name: 'ApoIA',
            description: 'Ferramenta de Inteligência Artificial Generativa',
            version: '1.0.0'
        }
    })
}