// for method GET
export async function GET() {
    var data = {
        nomeServico: 'ApoIA',
        descricao: 'Inteligência Artificial Generativa',
        iconePequenoUrl: 'https://apoia.cnj.jus.br/apoia-logo.svg',
        iconeGrandeUrl: 'https://apoia.cnj.jus.br/apoia-logo.svg',
        swaggerUrl: 'https://apoia.cnj.jus.br/api-doc',
        frontendUrl: null,
        documentacaoUsuarioUrl: null,
        documentacaoTecnicaUrl: null
    }

    return Response.json({ data })
}