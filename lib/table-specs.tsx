import { formatDate } from "@/lib/utils"
import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from 'next/link'

const tableSpecs = {
    CountersByPromptKinds: {
        columns: [
            { header: 'Tipo', accessorKey: 'kind', enableSorting: true, cell: data => <Link href={`kind/${data.row.original.kind}`}>{data.row.original.kind.toUpperCase()}</Link> },
            { header: 'Prompts', accessorKey: 'prompts', enableSorting: true, style: { textAlign: "right" } },
            { header: 'Casos de Teste', accessorKey: 'testsets', enableSorting: true, style: { textAlign: "right" } },
        ],
    },
    PromptsByKind: {
        columns: [
            { header: 'Nome', accessorKey: 'name', enableSorting: true },
            { header: 'Data de Criação', accessorKey: 'created_at', enableSorting: true, cell: data => <span>{formatDate(data.row.original.created_at)}</span> },
            { header: 'Oficial', accessorKey: 'official_at', enableSorting: true, cell: data => <a href={`prompts/${data.row.original.slug}/${data.row.original.official_id}/edit`}>{formatDate(data.row.original.official_at)}</a> },
            { header: 'Última Modificação', accessorKey: 'modified_at', enableSorting: true, cell: data => <a href={`prompts/${data.row.original.slug}/${data.row.original.modified_id}/edit`}>{formatDate(data.row.original.modified_at)}</a> },
            { header: 'Versões', accessorKey: 'versions', enableSorting: true, style: { textAlign: "right" }, cell: data => <a href={`prompts/${data.row.original.slug}`}>{data.row.original.versions}</a> },
        ]
    },
    TestsetsByKind: {
        columns: [
            { header: 'Nome', accessorKey: 'name', enableSorting: true },
            { header: 'Data de Criação', accessorKey: 'created_at', enableSorting: true, cell: data => <span>{formatDate(data.row.original.created_at)}</span> },
            { header: 'Oficial', accessorKey: 'official_at', enableSorting: true, cell: data => <a href={`testsets/${data.row.original.slug}/${data.row.original.official_id}/edit`}>{formatDate(data.row.original.official_at)}</a> },
            { header: 'Última Modificação', accessorKey: 'modified_at', enableSorting: true, cell: data => <a href={`testsets/${data.row.original.slug}/${data.row.original.modified_id}/edit`}>{formatDate(data.row.original.modified_at)}</a> },
            { header: 'Versões', accessorKey: 'versions', enableSorting: true, style: { textAlign: "right" }, cell: data => <a href={`testsets/${data.row.original.slug}`}>{data.row.original.versions}</a> },
        ]
    },

    PromptsByKindAndSlug: {
        columns: [
            { header: 'Data e Hora', accessorKey: 'created_at', enableSorting: true, cell: data => <a href={`${data.row.original.id}/edit`}>{formatDate(data.row.original.created_at)}</a> },
            { header: 'Teste Padrão', accessorKey: 'testset_name', enableSorting: true, cell: data => <a href={`../prompts/${data.row.original.testset_id}`}>{data.row.original.testset_name}</a> },
            { header: 'Resultado', accessorKey: 'score', enableSorting: true },
            { header: 'Oficial', accessorKey: 'is_official', enableSorting: true, style: { textAlign: "right" }, cell: data => data.row.original.is_official ? <span><FontAwesomeIcon icon={faCheck} /></span> : '' },
        ]
    },

    TestsetsByKindAndSlug: {
        columns: [
            { header: 'Data e Hora', accessorKey: 'created_at', enableSorting: true, cell: data => <a href={`${data.row.original.id}/edit`}>{formatDate(data.row.original.created_at)}</a> },
            { header: 'Teste Padrão', accessorKey: 'testset_name', enableSorting: true, cell: data => <a href={`../testsets/${data.row.original.testset_id}`}>{data.row.original.testset_name}</a> },
            { header: 'Resultado', accessorKey: 'score', enableSorting: true },
            { header: 'Oficial', accessorKey: 'is_official', enableSorting: true, style: { textAlign: "right" }, cell: data => data.row.original.is_official ? <span><FontAwesomeIcon icon={faCheck} /></span> : '' },
        ]
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
