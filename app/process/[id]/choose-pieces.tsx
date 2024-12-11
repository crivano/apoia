'use client'

import { maiusculasEMinusculas } from "@/lib/utils/utils";
import { faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { use, useEffect, useRef, useState } from "react"
import TableRecords from '@/components/table-records'
import { DadosDoProcessoType } from "@/lib/proc/process";
import { Button } from "react-bootstrap";
import { TipoDeSinteseEnum, TipoDeSinteseMap } from "@/lib/proc/combinacoes";
import { EMPTY_FORM_STATE, FormHelper } from "@/lib/ui/form-support";
import { TiposDeSinteseValido } from "@/lib/proc/info-de-produto";

const Frm = new FormHelper()

function ChoosePiecesForm({ dadosDoProcesso, onSave }: { dadosDoProcesso: DadosDoProcessoType, onSave: (kind: TipoDeSinteseEnum, pieces: string[]) => void }) {
    const [tipoDeSintese, setTipoDeSintese] = useState(dadosDoProcesso.tipoDeSintese)
    const [selectedIds, setSelectedIds] = useState(dadosDoProcesso.pecasSelecionadas.map(p => p.id) as string[])
    const tipos = TiposDeSinteseValido.map(tipo => ({ id: tipo.id, name: tipo.nome }))

    const canonicalPieces = (pieces: string[]) => pieces.sort((a, b) => a.localeCompare(b)).join(',')

    const onSelectedIdsChanged = (ids: string[]) => {
        if (canonicalPieces(ids) !== canonicalPieces(selectedIds))
            setSelectedIds(ids)
    }

    Frm.update({ tipoDeSintese, selectedIds }, (d) => { setTipoDeSintese(d.tipoDeSintese); setSelectedIds(d.selectedIds) }, EMPTY_FORM_STATE)

    const updateSelectedPieces = async () => {
        const res = await fetch('/api/select-pieces', {
            method: 'post',
            body: JSON.stringify({
                kind: tipoDeSintese,
                pieces: dadosDoProcesso.pecas.map(p => ({ id: p.id, descr: p.descr }))
            }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            cache: 'no-store'
        })
        const data = await res.json()
        setSelectedIds(data.selectedIds)
    }

    useEffect(() => {
        updateSelectedPieces()
    }, [tipoDeSintese])

    return <div className="mb-5">
        <div className="alert alert-warning pt-0">
            <div className="row">
                <Frm.Select label="Tipo de Síntese" name="tipoDeSintese" options={tipos} width={''} />
                <Frm.Button onClick={() => onSave(tipoDeSintese, selectedIds)} variant="primary"><FontAwesomeIcon icon={faSave} /></Frm.Button>
            </div>
            <div className="row">
                <TableRecords records={[...dadosDoProcesso.pecas].reverse()} spec="ChoosePieces" pageSize={10} selectedIds={selectedIds} onSelectdIdsChanged={onSelectedIdsChanged} />
            </div>
        </div>
    </div>
}

export const ChoosePiecesLoading = () => {
    return <div className="placeholder-glow">
        <div className="row justify-content-center">
            <div className="col-4"><div className="placeholder w-100"></div></div>
        </div>
    </div>
}


export default function ChoosePieces({ dadosDoProcesso }) {
    const pathname = usePathname(); // let's get the pathname to make the component reusable - could be used anywhere in the project
    const router = useRouter();
    const currentSearchParams = useSearchParams()
    const [editing, setEditing] = useState(false)
    const [reloading, setReloading] = useState(false)
    const ref = useRef(null)

    const handleClick = (e) => {
    }

    const onSave = (kind: TipoDeSinteseEnum, pieces: string[]) => {
        setEditing(false)
        const updatedSearchParams = new URLSearchParams(currentSearchParams.toString())
        const original = updatedSearchParams.toString()
        updatedSearchParams.set("pieces", (pieces || [] as string[]).join(','))
        updatedSearchParams.set("kind", kind)
        const current = updatedSearchParams.toString()
        if (original === current) return
        setReloading(true)
        router.push(pathname + "?" + updatedSearchParams.toString())
    }

    if (reloading) {
        return ChoosePiecesLoading()
    }

    if (!editing) {
        const l = dadosDoProcesso.pecasSelecionadas.map(p => maiusculasEMinusculas(p.descr))
        let s = `Tipo: ${TipoDeSinteseMap[dadosDoProcesso.tipoDeSintese]?.nome} - Peças: `
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