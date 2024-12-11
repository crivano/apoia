'use client'

import { maiusculasEMinusculas } from "@/lib/utils/utils";
import { faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef, useState } from "react"
import TableRecords from '@/components/table-records'
import { DadosDoProcessoType } from "@/lib/proc/process";
import { Button } from "react-bootstrap";
import { TipoDeSintese, TipoDeSinteseMap } from "@/lib/proc/combinacoes";
import { EMPTY_FORM_STATE, FormHelper } from "@/lib/ui/form-support";

const Frm = new FormHelper()

function ChoosePiecesForm({ dadosDoProcesso, onSave }: { dadosDoProcesso: DadosDoProcessoType, onSave: (kind: TipoDeSintese, pieces: string[]) => void }) {
    const [tipoDeSintese, setTipoDeSintese] = useState(TipoDeSintese.RESUMOS_QUESTAO_CENTRAL_PONTOS_CONTROVERTIDOS)
    const [selectedIds, onSelectdIdsChanged] = useState(dadosDoProcesso.pecasSelecionadas.map(p => p.id) as string[])
    const tipos = Object.values(TipoDeSintese).filter(value => Number.isInteger(value)).map(tipo => ({
        id: tipo,
        name: TipoDeSinteseMap[tipo].nome
    }))

    Frm.update({ tipoDeSintese, selectedIds }, (d) => { setTipoDeSintese(d.tipoDeSintese); onSelectdIdsChanged(d.selectedIds) }, EMPTY_FORM_STATE)

    return <div className="mb-5">
        <div className="alert alert-warning pt-0">
            <div className="row">
                <Frm.Select label="Tipo de Síntese" name="tipoDeSintese" options={tipos} width={''} />
                <Frm.Button onClick={() => onSave(tipoDeSintese, selectedIds)} variant="primary"><FontAwesomeIcon icon={faSave} /></Frm.Button>
            </div>
            <div className="row">
                <TableRecords records={[...dadosDoProcesso.pecas].reverse()} spec="ChoosePieces" pageSize={10} selectedIds={selectedIds} onSelectdIdsChanged={onSelectdIdsChanged} />
            </div>
        </div>
    </div>
}

export default function ChoosePieces({ dadosDoProcesso }) {
    const pathname = usePathname(); // let's get the pathname to make the component reusable - could be used anywhere in the project
    const router = useRouter();
    const currentSearchParams = useSearchParams();

    const [editing, setEditing] = useState(false)
    const ref = useRef(null)

    const handleClick = (e) => {
    }

    const onSave = (kind: TipoDeSintese, pieces: string[]) => {
        setEditing(false)
        const updatedSearchParams = new URLSearchParams(currentSearchParams.toString())
        updatedSearchParams.set("pieces", (pieces || [] as string[]).join(','))
        updatedSearchParams.set("kind", kind.toString())
        router.push(pathname + "?" + updatedSearchParams.toString())
    }

    if (!editing) {
        const l = dadosDoProcesso.pecasSelecionadas.map(p => maiusculasEMinusculas(p.descr))
        let s = `Peças: `
        if (l.length === 0)
            s += 'Nenhuma peça selecionada'
        else if (l.length === 1) {
            s += l[0]
        } else if (l.length === 2) {
            const last = l.pop()
            s += `${l.join(', ')} e ${last}`
        } else {
            s += l[0] + ' + ' + (l.length - 1)
        }
        return <p className="text-muted text-center h-print">{s} - <FontAwesomeIcon onClick={() => { setEditing(true) }} icon={faEdit} /></p>

    }
    return <ChoosePiecesForm onSave={onSave} dadosDoProcesso={dadosDoProcesso} />
}