import { CargaDeConteudoEnum, obterDadosDoProcesso2 } from "@/lib/proc/process"
import { getCurrentUser } from "@/lib/user"
import { paramsList } from "@/lib/utils/env"

export async function GET(req: Request) {
    const pUser = getCurrentUser()
    const user = await pUser
    if (!user) return Response.json({ errormsg: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const dadosDoProcesso = await obterDadosDoProcesso2({ numeroDoProcesso: '01015894820201000000', pUser, conteudoDasPecasSelecionadas: CargaDeConteudoEnum.NAO })


    const r: any = {
        pass: undefined,
        tests: [
            {
                name: 'user',
                descr: 'verifica se o usuário está autenticado corretamente',
                pass: user ? true : 'USUÁRIO NÃO AUTORIZADO'
            },
            {
                name: 'process',
                descr: 'verifica se um processo pode ser obtido no DataLake e se ele contém peças além das peças públicas',
                pass: dadosDoProcesso.errorMsg ? dadosDoProcesso.errorMsg : !!dadosDoProcesso.arrayDeDadosDoProcesso[0].pecas.find(p => p.descr === 'OUTRAS PEÇAS') ? true : 'PEÇAS NÃO LOCALIZADAS'
            },
        ]
    }

    r.pass = Object.values(r.tests).every(v => v === true)

    return Response.json(r)
}