import { Interop, ObterPecaType } from './interop'
import { DadosDoProcessoType, PecaType } from '../proc/process'
import { parseYYYYMMDDHHMMSS } from '../utils/utils'
import { assertNivelDeSigilo, verificarNivelDeSigilo } from '../proc/sigilo'

const mimeTypyFromTipo = (tipo: string): string => {
    switch (tipo) {
        case 'APPLICATION_PDF': return 'application/pdf'
        case 'TEXT_HTML': return 'text/html'
        default: return 'application/pdf'
    }
}

const nivelDeSigiloFromNivel = (nivel: string): string => {
    switch (nivel) {
        case 'PUBLICO': return '0'
        case 'SEGREDO_JUSTICA': return '1'
        case 'SIGILO_MINIMO': return '2'
        case 'SIGILO_MEDIO': return '3'
        case 'SIGILO_INTENSO': return '4'
        case 'SIGILO_ABSOLUTO': return '5'
        default: return '5'
    }
}

export class InteropPDPJ implements Interop {
    private accessToken: string

    async init() {
        // get the access token
        const authResp = await fetch(
            process.env.KEYCLOAK_ISSUER + '/protocol/openid-connect/token',
            {
                method: 'POST',
                headers: {
                    'Accept': '*/*',
                    'User-Agent': 'ApoIA Client',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: process.env.DATALAKE_CLIENT_ID,
                    client_secret: process.env.DATALAKE_CLIENT_SECRET,
                    scope: 'openid',
                    grant_type: 'client_credentials'
                })
            }
        )

        const authRespData = await authResp.json()
        this.accessToken = authRespData.access_token
    }

    public autenticar = async (system: string): Promise<boolean> => {
        throw new Error('Not implemented')
    }

    public consultarProcesso = async (numeroDoProcesso: string): Promise<DadosDoProcessoType> => {
        const response = await fetch(
            process.env.DATALAKE_API_URL + `/processos/${numeroDoProcesso}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Error fetching process data: ${response.statusText}`);
        }

        const data = await response.json();
        const processo = data[0].tramitacoes[data[0].tramitacoes.length - 1]

        if (verificarNivelDeSigilo())
            assertNivelDeSigilo('' + processo.nivelSigilo)

        const ajuizamento = new Date(processo.dataHoraAjuizamento)
        const nomeOrgaoJulgador = processo.tribunal.nome
        const codigoDaClasse = processo.classe[0]?.codigo || 0

        let pecas: PecaType[] = []
        const documentos = processo.documentos
        // console.log('documentos', JSON.stringify(documentos, null, 2))
        for (const doc of documentos) {
            // if (!Object.values(T).includes(doc.attributes.descricao)) continue
            pecas.unshift({
                id: doc.id,
                numeroDoEvento: doc.sequencia,
                descr: doc.tipo.nome.toUpperCase(),
                tipoDoConteudo: mimeTypyFromTipo(doc.arquivo?.tipo),
                sigilo: nivelDeSigiloFromNivel(doc.nivelSigilo),
                pConteudo: undefined,
                conteudo: undefined,
                pDocumento: undefined,
                documento: undefined,
                categoria: undefined,
                rotulo: undefined,
                dataHora: new Date(doc.dataHoraJuntada),
            })
        }
        console.log('pecas', pecas)
        return { numeroDoProcesso, ajuizamento, codigoDaClasse, nomeOrgaoJulgador, pecas }
    }

    public obterPeca = async (numeroDoProcesso, idDaPeca): Promise<ObterPecaType> => {
        const response = await fetch(
            process.env.DATALAKE_API_URL + `/processos/${numeroDoProcesso}/documentos/${idDaPeca}/texto`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                }
            }
        );
        const b = await response.arrayBuffer()
        const ab = b.slice(0, b.byteLength)
        const resultado = { buffer: ab, contentType: response.headers.get('Content-Type') }
        return resultado;
    }
}



