import { Interop, ObterPecaType } from './interop'
import { DadosDoProcessoType, PecaType } from '../proc/process-types'
import { parseYYYYMMDDHHMMSS } from '../utils/utils'
import { assertNivelDeSigilo, verificarNivelDeSigilo } from '../proc/sigilo'
import { getCurrentUser } from '../user'
import { envString } from '../utils/env'
import { tua } from '../proc/tua'

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
        const user = await getCurrentUser()

        // Utiliza um token fixo, previamente configurado
        if (envString('DATALAKE_TOKEN')) {
            this.accessToken = envString('DATALAKE_TOKEN')
            return
        }

        // Obter o token de acesso do usuário logado pelo keycloak
        if (user.accessToken) {
            this.accessToken = user.accessToken
            return
        }

        // Obtem um token de aplicação
        if (envString('DATALAKE_CLIENT_ID') && envString('DATALAKE_CLIENT_SECRET')) {
            const authResp = await fetch(
                envString('KEYCLOAK_ISSUER') + '/protocol/openid-connect/token',
                {
                    method: 'POST',
                    headers: {
                        'Accept': '*/*',
                        'User-Agent': 'ApoIA Client',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        client_id: envString('DATALAKE_CLIENT_ID'),
                        client_secret: envString('DATALAKE_CLIENT_SECRET'),
                        scope: 'openid',
                        grant_type: 'client_credentials'
                    })
                }
            )

            const authRespData = await authResp.json()
            this.accessToken = authRespData.access_token
            return
        }
        throw new Error('Não foi possível obter o token de acesso ao DataLake')
    }

    public autenticar = async (system: string): Promise<boolean> => {
        throw new Error('Not implemented')
    }

    public consultarProcesso = async (numeroDoProcesso: string): Promise<DadosDoProcessoType[]> => {
        const response = await fetch(
            envString('DATALAKE_API_URL') + `/processos/${numeroDoProcesso}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`,
                    'User-Agent': 'curl'
                }
            }
        );


        let data: any = {}

        try {
            const b = await response.arrayBuffer()
            const decoder = new TextDecoder('utf-8')
            const texto = decoder.decode(b)
            if (response.headers.get('Content-Type') === 'application/json') {
                data = JSON.parse(texto)
            }
        } catch (e) {
            throw new Error(`Não foi possível acessar o processo ${numeroDoProcesso} no DataLake/Codex da PDPJ (${e})`)
        }

        if (response.status !== 200) {
            if (data.message)
                throw new Error(data.message)
            throw new Error(`Não foi possível acessar o processo ${numeroDoProcesso} no DataLake/Codex da PDPJ (${response.statusText})`)
        }

        const resp: DadosDoProcessoType[] = []
        for (const processo of data[0].tramitacoes) {
            if (verificarNivelDeSigilo())
                assertNivelDeSigilo('' + processo.nivelSigilo)

            const ajuizamento = new Date(processo.dataHoraAjuizamento)
            const nomeOrgaoJulgador = processo.tribunal.nome
            const codigoDaClasse = processo.classe[0]?.codigo || 0
            const segmento = processo.tribunal.segmento
            const instancia = processo.instancia
            const materia = processo.natureza

            let pecas: PecaType[] = []
            const documentos = processo.documentos

            // Para descobrir qual o número do evento que está relacionado a cada documento é necessário
            // ver se existe um movimento em "processo.movimentos" que tenha o "idDocumento" igual ao "id" do documento
            // Se houver, o número do evento será igual ao "sequencia" do movimento. Se não houver,
            // o número do evento será igual ao "sequencia" do movimento do documento anterior.
            // A lista de documentos deve ser varrida de trás para frente, para começar pela petição incial.

            // Inicialmente, vamos criar um mapa para relacionar os idDocumento com os movimentos
            const movimentosMap: Map<string, any> = new Map()
            for (const mov of processo.movimentos) {
                if (mov.idDocumento)
                    movimentosMap.set(mov.idDocumento, mov)
            }

            // Agora, vamos varrer os documentos de trás para frente
            let mov = processo.movimentos[processo.movimentos.length - 1]
            for (let i = documentos.length - 1; i >= 0; i--) {
                const doc = documentos[i]
                const relatedMov = movimentosMap.get(doc.id)
                if (relatedMov) mov = relatedMov
                pecas.push({
                    id: doc.id,
                    numeroDoEvento: mov.sequencia,
                    descricaoDoEvento: mov.descricao,
                    descr: doc.tipo.nome.toUpperCase(),
                    tipoDoConteudo: mimeTypyFromTipo(doc.arquivo?.tipo),
                    sigilo: nivelDeSigiloFromNivel(doc.nivelSigilo),
                    pConteudo: undefined,
                    conteudo: undefined,
                    pDocumento: undefined,
                    documento: undefined,
                    categoria: undefined,
                    rotulo: doc.nome,
                    dataHora: new Date(doc.dataHoraJuntada),
                })
            }
            const classe = tua[codigoDaClasse]
            resp.push({ numeroDoProcesso, ajuizamento, codigoDaClasse, classe, nomeOrgaoJulgador, pecas, segmento, instancia, materia })
        }
        return resp
    }

    public obterPeca = async (numeroDoProcesso, idDaPeca): Promise<ObterPecaType> => {
        const response = await fetch(
            envString('DATALAKE_API_URL') + `/processos/${numeroDoProcesso}/documentos/${idDaPeca}/texto`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`,
                    'User-Agent': 'curl'
                }
            }
        );
        const b = await response.arrayBuffer()
        if (response.status !== 200) {
            try {
                const decoder = new TextDecoder('utf-8')
                const texto = decoder.decode(b)
                if (response.headers.get('Content-Type') === 'application/json') {
                    const data = JSON.parse(texto)
                    throw new Error(data.message)
                }
            } catch (e) {
                throw new Error(`Não foi possível obter o texto da peça no DataLake/Codex da PDPJ. (${e} - ${numeroDoProcesso}/${idDaPeca})`)
            }
        }
        const ab = b.slice(0, b.byteLength)
        const resultado = { buffer: ab, contentType: response.headers.get('Content-Type') }
        return resultado;
    }
}



