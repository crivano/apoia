'use client'

import { useEffect, useState } from 'react'

import {
    flexRender,
    PaginationState,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
    RowSelectionState
} from '@tanstack/react-table'
import { Table as BTable, Pagination, Form } from 'react-bootstrap'
import tableSpecs from '@/lib/ui/table-specs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { link } from 'fs'
import { usePathname } from "next/navigation"



export default function Table({ records, spec, linkToAdd, linkToBack, pageSize, selectedIds, onSelectdIdsChanged, children }: {
    records: any[], spec: string, linkToAdd?: string, linkToBack?: string, pageSize?: number,
    selectedIds?: string[], onSelectdIdsChanged?: (ids: string[]) => void, children?: any
}) {
    const [sorting, setSorting] = useState([])
    const [globalFilter, setGlobalFilter] = useState('')
    const pathname = usePathname()
    const { columns, thead, tr, tableClassName } = tableSpecs(pathname)[spec]
    const [rowSelection, setRowSelection] = useState<RowSelectionState>(selectedIds ? selectedIds.reduce((acc, value) => ({ ...acc, [value]: true }), {}) : {})

    const table = useReactTable({
        data: records,
        columns,
        state: { sorting, globalFilter, rowSelection },
        enableRowSelection: true,
        enableMultiRowSelection: true,
        autoResetPageIndex: false,
        onRowSelectionChange: setRowSelection, //hoist up the row selection state to your own scope
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getRowId: row => row.id,
    })
    table.getState().pagination.pageSize = pageSize || 5

    useEffect(() => {
        if (selectedIds)
            table.setRowSelection(selectedIds ? selectedIds.reduce((acc, value) => ({ ...acc, [value]: true }), {}) : {})
    }, [selectedIds])

    useEffect(() => {
        if (onSelectdIdsChanged) {
            const selected = Object.keys(rowSelection).reduce((acc, value) => rowSelection[value] ? [...acc, value] : acc, [] as string[])
            onSelectdIdsChanged(selected)
        }
    }, [rowSelection])

    return (
        <div>
            <table className={tableClassName || 'table table-sm table-striped'}>
                <thead>
                    {thead ? thead() : table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} style={(header.column.columnDef as any)?.style}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {tr
                        ? table.getRowModel().rows.map(row => {
                            const record = row.original;
                            return tr(record)
                        })
                        : table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} style={(cell.column.columnDef as any)?.style}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                </tbody>
            </table>
            <div className="row">
                {children}
                <div className="col col-auto mb-0">
                    {linkToBack &&
                        <Link href={`${pathname}/${linkToBack}`} className="btn btn-light bt d-print-none">Voltar</Link>
                    }
                </div>
                <div className="col col-auto ms-auto mb-0">
                    {linkToAdd &&
                        <Link href={`${pathname}/${linkToAdd}`} className="btn btn-light bt float-end d-print-none"><FontAwesomeIcon icon={faAdd} /></Link>
                    }
                </div>
                <div className="col col-auto mb-0">
                    <Pagination className='mb-0'>
                        <Pagination.Prev onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()} />
                        <Pagination.Item> {table.getState().pagination.pageIndex + 1} of{' '}
                            {table.getPageCount()}</Pagination.Item>
                        <Pagination.Next onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()} />
                    </Pagination>
                </div>
            </div>
        </div>
    )
}