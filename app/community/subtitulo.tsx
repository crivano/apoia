import { tua } from '@/lib/proc/tua'
import { DadosDoProcessoType } from "@/lib/proc/process-types"
import { ReactNode } from 'react'
import { formatBrazilianDate } from '@/lib/utils/utils'

const Subtitulo = ({ dadosDoProcesso }: { dadosDoProcesso: DadosDoProcessoType }) => {
    const ajuizamento = dadosDoProcesso?.ajuizamento
    const nomeDaClasse = tua[dadosDoProcesso?.codigoDaClasse]

    if (!ajuizamento || !nomeDaClasse) return <></>

    // return SubtituloLoading()

    return (<>
        {nomeDaClasse
            ? <div className="text-center">{nomeDaClasse}</div>
            : ''}
        {ajuizamento
            ? <div className="text-center">{`Ajuizado em ${formatBrazilianDate(ajuizamento)}`}</div>
            : ''}
    </>
    )
}

export const SubtituloLoading = () => {
    return <div className="placeholder-glow">
        <div className="row justify-content-center">
            <div className="col-4"><div className="placeholder w-100"></div></div>
        </div>
        <div className="row justify-content-center">
            <div className="col-2"><div className="placeholder w-100"></div></div>
        </div>
    </div>
}

export default Subtitulo
