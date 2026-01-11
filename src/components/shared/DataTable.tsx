"use client";

import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getFilteredRowModel,
    RowSelectionState,
    OnChangeFn,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

interface DataTableProps<TData, TValue> {
    title?: string;
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    tableAction?: () => void;
    tableActionText?: string;
    searchKey?: string; // e.g., "name" or "customer_code"
    actions?: (item: TData) => React.ReactNode;
    onRowClick?: (item: TData) => void;
    customFilter?: React.ReactNode;
    highlightId?: string;
    rowSelection?: RowSelectionState;
    setRowSelection?: OnChangeFn<RowSelectionState>;
    getRowId?: (row: TData) => string;
}

export function DataTable<TData, TValue>({
    title,
    columns,
    data,
    tableAction,
    tableActionText="Add New",
    searchKey,
    actions,
    onRowClick,
    customFilter,
    highlightId,
    rowSelection,
    setRowSelection,
    getRowId
}: DataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data,
        columns,
        state: {
            rowSelection, columnFilters
        },
        onRowSelectionChange: setRowSelection, // Bind the setter
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        getRowId: getRowId
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                {/* Left Side: Title */}
                {title && <h1 className="text-2xl font-bold">{title}</h1>}

                {/* Right Side: Search and Button Container */}
                <div className="flex items-center gap-2">
                    {/* If 'customFilter' is provided, show it. Otherwise, show default Search */}
                    {customFilter ? (
                        customFilter
                    ) : (
                        searchKey && (
                            <div className="flex items-center">
                                <Input
                                    placeholder={`Search ${searchKey}...`}
                                    value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                                    onChange={(event) =>
                                        table.getColumn(searchKey)?.setFilterValue(event.target.value)
                                    }
                                    className="max-w-sm bg-white"
                                />
                            </div>
                        )
                    )}
                    {(tableAction && (
                        <Button className="justify-end bg-sky-600 hover:bg-sky-700" onClick={tableAction}>
                            {tableActionText}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Main Table UI */}
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader className="bg-sky-50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                                {actions && <th className="py-2 px-3 font-medium text-black dark:text-white">Actions</th>}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.id === highlightId ? "selected" : ""} onClick={() => onRowClick && onRowClick(row.original)}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                    {actions && (
                                        <td className="border-b border-[#eee] py-2 px-4 dark:border-strokedark">
                                            {actions(row.original)}
                                        </td>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}