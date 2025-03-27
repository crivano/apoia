'use client'

import { GeneratedContent } from "@/lib/ai/prompt-types"
import { FormHelper } from "@/lib/ui/form-support"
import { labelToName, maiusculasEMinusculas } from "@/lib/utils/utils"

export const PedidosFundamentacoesEDispositivos = ({ pedidos, request, Frm }: { pedidos: any[], request: GeneratedContent, Frm: FormHelper }) => {
    const tiposDeLiminar = [
        { id: 'NAO', name: 'Não' },
        { id: 'SIM', name: 'Sim' },
    ]
    const tiposDePedido = [
        { id: 'CONDENAR_A_PAGAR', name: 'Condenar a Pagar' },
        { id: 'CONDENAR_A_FAZER', name: 'Condenar a Fazer' },
        { id: 'CONDENAR_A_DEIXAR_DE_FAZER', name: 'Condenar a Deixar de Fazer' },
        { id: 'CONSTITUIR_RELACAO_JURIDICA', name: 'Constituir Relação Jurídica' },
        { id: 'ANULAR_RELACAO_JURIDICA', name: 'Anular Relação Jurídica' },
        { id: 'DECLARAR_EXISTENCIA_DE_FATO', name: 'Declarar Existência de Fato' },
        { id: 'DECLARAR_INEXISTENCIA_DE_FATO', name: 'Declarar Inexistência de Fato' },
    ]
    const tiposDeVerba = [
        { id: 'SALARIO', name: 'Salário' },
        { id: 'DANO_MORAL', name: 'Dano Moral' },
        { id: 'OUTRA', name: 'Outra' },
        { id: 'NENHUMA', name: 'Nenhuma' },
    ]
    const tiposDeJulgamento = [
        { id: '', name: '' },
        { id: 'PROCEDENTE', name: 'Procedente' },
        { id: 'IMPROCEDENTE', name: 'Improcedente' },
    ]

    const todosForamJulgados = pedidos.every(p => p.julgamento)
    if (todosForamJulgados) {
        return <>
            <h2>{maiusculasEMinusculas(request.title)}</h2>
            <div className="mb-4">
                <div className="alert alert-success pt-4 pb-2">
                    <ol>
                        {pedidos.map((pedido, i) =>
                            <li className="mb-1" key={i}>
                                <span>{pedido.liminar === 'SIM' ? <span><b><u>Liminar</u></b> - </span> : ''}</span>
                                <span>{tiposDePedido.find(o => o.id === pedido.tipoDePedido)?.name} - </span>
                                {pedido.verba !== 'NENHUMA' && <>
                                    <span>{tiposDeVerba.find(o => o.id === pedido.verba)?.name} - </span>
                                    <span>{pedido.valor} - </span></>}
                                <span>{pedido.texto}</span>
                                <span> <b>{tiposDeJulgamento.find(o => o.id === pedido.julgamento)?.name}</b></span>
                                {pedido.fundamentacao && <span> - {pedido.fundamentacao}</span>}
                            </li>
                        )}
                    </ol>
                </div>
            </div>
        </>
    }

    return <>
        <h2>{maiusculasEMinusculas(request.title)}</h2>
        {pedidos.map((pedido, i) =>
            <div className="mb-4" key={i}>
                <div className="alert alert-warning pt-2 pb-3">
                    <div className="row">
                        <Frm.Select label="Liminar" name={`pedidos[${i}].liminar`} options={tiposDeLiminar} width={2} />
                        <Frm.Select label="Tipo de Pedido" name={`pedidos[${i}].tipoDePedido`} options={tiposDePedido} width={2} />
                        <Frm.Select label="Tipo de Verba" name={`pedidos[${i}].verba`} options={tiposDeVerba} width={2} />
                        {Frm.get(`pedidos[${i}].verba`) !== 'NENHUMA' && <Frm.Input label="Valor" name={`pedidos[${i}].valor`} width={2} />}
                    </div>
                    <div className="row mt-1">
                        <Frm.TextArea label="Descrição" name={`pedidos[${i}].texto`} width={''} />
                    </div>
                    <div className="row mt-1">
                        <div className="col-6">
                            <Frm.CheckBoxes label="Sugestões de fundamentações pró autor" labelsAndNames={pedidos[i].fundamentacoesProcedencia.map((s, idx) => ({ label: s, name: `pedidos[${i}].fundamentacoesProcedenciaSelecionadas[${idx}]` }))} width={12} />
                        </div>
                        <div className="col-6">
                            <Frm.CheckBoxes label="Sugestões de fundamentações pró réu" labelsAndNames={pedidos[i].fundamentacoesImprocedencia.map((s, idx) => ({ label: s, name: `pedidos[${i}].fundamentacoesImprocedenciaSelecionadas[${idx}]` }))} width={12} />
                        </div>
                    </div>
                    <div className="row mt-1">
                        <Frm.TextArea label="Fundamentação (opcional)" name={`pedidos[${i}].fundamentacao`} width={''} />
                        <Frm.Select label="Julgamento" name={`pedidos[${i}].julgamento`} options={tiposDeJulgamento} width={2} />
                    </div>
                </div>
            </div>
        )}
    </>
}