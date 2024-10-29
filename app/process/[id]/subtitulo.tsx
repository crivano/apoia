import { formatBrazilianDate } from "../../../lib/utils/utils"
import { tua } from '../../../lib/proc/tua'

const Subtitulo = async ({ pDadosDoProcesso }) => {
    const dadosDoProcesso = await pDadosDoProcesso
    const ajuizamento = dadosDoProcesso?.ajuizamento
    const nomeDaClasse = tua[dadosDoProcesso?.codigoDaClasse]

    // return SubtituloLoading()

    return (<>
        {nomeDaClasse
            ? <div className="text-center">{nomeDaClasse}</div>
            : ''}
        {ajuizamento
            ? <div className="text-center">{`Ajuizado em ${formatBrazilianDate(ajuizamento)}`}</div>
            : ''}
        <div className="mb-4"></div>
    </>
    )
}

export const SubtituloLoading = () => {
    return <div className="placeholder-glow mb-4">
        <div className="row justify-content-center">
            <div className="col-4"><div className="placeholder w-100"></div></div>
        </div>
        <div className="row justify-content-center">
            <div className="col-2"><div className="placeholder w-100"></div></div>
        </div>
    </div>
}

export default Subtitulo
