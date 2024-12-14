import { formatDate } from "@/lib/utils/utils"
import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from 'next/link'
import { Form } from "react-bootstrap"

const tableSpecs = (pathname: string) => {
    return {
        ChoosePieces: {
            columns: [
                {
                    id: 'select-col',
                    header: ({ table }) => (
                        <Form.Check
                            checked={table.getIsAllRowsSelected()}
                            // indeterminate={table.getIsSomeRowsSelected()}
                            onChange={table.getToggleAllRowsSelectedHandler()} //or getToggleAllPageRowsSelectedHandler
                        />
                    ),
                    cell: ({ row }) => (
                        <Form.Check
                            checked={row.getIsSelected()}
                            // disabled={!row.getCanSelect()}
                            onChange={row.getToggleSelectedHandler()}
                        />
                    ),
                },
                { header: 'Evento', accessorKey: 'numeroDoEvento', enableSorting: true },
                { header: 'Rótulo', accessorKey: 'rotulo', enableSorting: true },
                { header: 'Tipo', accessorKey: 'descr', enableSorting: true, cell: data => <span>{data.row.original.descr.toUpperCase()}</span> },
                { header: 'Sigilo', accessorKey: 'sigilo', enableSorting: true, cell: data => <span>{data.row.original.sigilo}</span> },
            ],
        },
        CountersByPromptKinds: {
            columns: [
                { header: 'Tipo', accessorKey: 'kind', enableSorting: true, cell: data => <Link href={`${pathname}/kind/${data.row.original.kind}`}>{data.row.original.kind.toUpperCase()}</Link> },
                { header: 'Prompts', accessorKey: 'prompts', enableSorting: true, style: { textAlign: "right" }, cell: data => data.row.original.prompts || '' },
                { header: 'Conjuntos de Teste', accessorKey: 'testsets', enableSorting: true, style: { textAlign: "right" }, cell: data => data.row.original.testsets || '' },
            ],
        },
        PromptsByKind: {
            columns: [
                { header: 'Nome', accessorKey: 'name', enableSorting: true },
                { header: 'Data de Criação', accessorKey: 'created_at', enableSorting: true, style: { textAlign: "center", width: "15%" }, cell: data => <span>{formatDate(data.row.original.created_at)}</span> },
                { header: 'Oficial', accessorKey: 'official_at', enableSorting: true, style: { textAlign: "center", width: "15%" }, cell: data => <a href={`${pathname}/prompts/${data.row.original.slug}/${data.row.original.official_id}/edit`}>{formatDate(data.row.original.official_at)}</a> },
                { header: 'Última Modificação', accessorKey: 'modified_at', enableSorting: true, style: { textAlign: "center", width: "15%" }, cell: data => <a href={`${pathname}/prompts/${data.row.original.slug}/${data.row.original.modified_id}/edit`}>{formatDate(data.row.original.modified_at)}</a> },
                { header: 'Versões', accessorKey: 'versions', enableSorting: true, style: { textAlign: "right", width: "10%" }, cell: data => <a href={`${pathname}/prompts/${data.row.original.slug}`}>{data.row.original.versions}</a> },
            ]
        },
        TestsetsByKind: {
            columns: [
                { header: 'Nome', accessorKey: 'name', enableSorting: true },
                { header: 'Data de Criação', accessorKey: 'created_at', enableSorting: true, style: { textAlign: "center", width: "15%" }, cell: data => <span>{formatDate(data.row.original.created_at)}</span> },
                { header: 'Oficial', accessorKey: 'official_at', enableSorting: true, style: { textAlign: "center", width: "15%" }, cell: data => <a href={`${pathname}/testsets/${data.row.original.slug}/${data.row.original.official_id}/edit`}>{formatDate(data.row.original.official_at)}</a> },
                { header: 'Última Modificação', accessorKey: 'modified_at', enableSorting: true, style: { textAlign: "center", width: "15%" }, cell: data => <a href={`${pathname}/testsets/${data.row.original.slug}/${data.row.original.modified_id}/edit`}>{formatDate(data.row.original.modified_at)}</a> },
                { header: 'Versões', accessorKey: 'versions', enableSorting: true, style: { textAlign: "right", width: "10%" }, cell: data => <a href={`${pathname}/testsets/${data.row.original.slug}`}>{data.row.original.versions}</a> },
            ]
        },

        PromptsByKindAndSlug: {
            columns: [
                { header: 'Data e Hora', accessorKey: 'created_at', enableSorting: true, cell: data => <a href={`${pathname}/${data.row.original.id}/edit`}>{formatDate(data.row.original.created_at)}</a> },
                { header: 'Teste Padrão', accessorKey: 'testset_name', enableSorting: true, cell: data => <a href={`${pathname}/../prompts/${data.row.original.testset_id}`}>{data.row.original.testset_name}</a> },
                { header: 'Resultado', accessorKey: 'score', enableSorting: true },
                { header: 'Oficial', accessorKey: 'is_official', enableSorting: true, style: { textAlign: "right" }, cell: data => data.row.original.is_official ? <span><FontAwesomeIcon icon={faCheck} /></span> : '' },
            ]
        },

        TestsetsByKindAndSlug: {
            columns: [
                { header: 'Data e Hora', accessorKey: 'created_at', enableSorting: true, cell: data => <a href={`${pathname}/${data.row.original.id}/edit`}>{formatDate(data.row.original.created_at)}</a> },
                { header: 'Teste Padrão', accessorKey: 'testset_name', enableSorting: true, cell: data => <a href={`${pathname}/../testsets/${data.row.original.testset_id}`}>{data.row.original.testset_name}</a> },
                { header: 'Resultado', accessorKey: 'score', enableSorting: true },
                { header: 'Oficial', accessorKey: 'is_official', enableSorting: true, style: { textAlign: "right" }, cell: data => data.row.original.is_official ? <span><FontAwesomeIcon icon={faCheck} /></span> : '' },
            ]
        },

        Ranking: {
            columns: [
                { header: 'Coleção de Testes', accessorKey: 'testset_name', enableSorting: true, cell: data => <a href={`${pathname}/../testsets/${data.row.original.testset_slug}/${data.row.original.testset_id}/edit`}>{data.row.original.testset_name}</a> },
                { header: 'Prompt', accessorKey: 'prompt_name', enableSorting: true, cell: data => <a href={`${pathname}/../prompts/${data.row.original.prompt_slug}/${data.row.original.prompt_id}/edit`}>{data.row.original.prompt_name}</a> },
                { header: 'Modelo', accessorKey: 'model_name', enableSorting: true },
                { header: 'Nota %', accessorKey: 'score', enableSorting: true, style: { textAlign: "right" }, cell: data => <a href={`${pathname}/../test/${data.row.original.testset_id}/${data.row.original.prompt_id}/${data.row.original.model_id}`}>{(data.row.original.score).toFixed(1)}</a> },
            ]
        },
    }
}

export default tableSpecs



// thead: () => {
//     return (<tr>
//         <th>Identificador</th>
//         <th>Nome</th>
//         <th style={{ textAlign: 'right' }}>Versões</th>
//         <th style={{ textAlign: 'center' }}>Início</th>
//         <th style={{ textAlign: 'center' }}>Término</th>
//     </tr>)
// },
// tr: record => (<tr key={record.identifier} >
//     <td><a href={`/prompts/${record.identifier}`}>{record.identifier}</a><a href={`/record/${record.id}`}></a></td>
//     <td style={{ wordBreak: 'break-all' }}>{record.name}</td>
//     <td style={{ textAlign: 'right' }}>{record.qtd}</td>
//     <td style={{ textAlign: 'center' }}>{formatDate(record.first_date).substring(5, 10)}</td>
//     <td style={{ textAlign: 'center' }}>{formatDate(record.last_date).substring(5, 10)}</td>
// </tr>)
