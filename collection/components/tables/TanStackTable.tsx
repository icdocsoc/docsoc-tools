"use client";

// From https://github.com/imperial/cpp-connect/blob/main/components/TanstackTable.tsx
// By Kishan, Alex, Matthew, Brady, Illia

/**
 * Copyright 2024 Imperial College London

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import {
    ActionIcon,
    Button,
    Center,
    Flex,
    Grid,
    Group,
    Loader,
    Select,
    Space,
    Stack,
    Table,
    Text,
    TextInput,
} from "@mantine/core";
import {
    ColumnDef,
    ColumnFiltersState,
    SortDirection,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import React, { useEffect, useMemo, useState } from "react";
import { Pagination } from "react-headless-pagination";
import { FaChevronDown, FaChevronUp, FaMagnifyingGlass, FaSort } from "react-icons/fa6";
import {
    RxChevronLeft,
    RxChevronRight,
    RxDoubleArrowLeft,
    RxDoubleArrowRight,
} from "react-icons/rx";
import { useMediaQuery } from "react-responsive";

import styles from "./tanstack-table.module.scss";

const ICON_SIZE = 20;

interface TanstackTableProps<T> {
    data: T[];
    columns: ColumnDef<T, any>[];
    enablePagination?: boolean;
    enableSearch?: boolean;
}

const getSortingIcon = (isSorted: false | SortDirection): React.ReactNode => {
    switch (isSorted) {
        case false:
            return (
                <FaSort
                    className={styles.isSortableIndicator}
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                />
            );
        case "desc":
            return <FaChevronDown width={ICON_SIZE} height={ICON_SIZE} />;
        case "asc":
            return <FaChevronUp width={ICON_SIZE} height={ICON_SIZE} />;
    }
};

/**
 * NOTE: To allow columns to be filtered, you must ensure that they have an id and a header
 */
export default function TanstackTable<T>({
    data,
    columns,
    enablePagination = true,
    enableSearch = true,
}: TanstackTableProps<T>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: 15, //default page size
    });
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: { columnFilters, sorting, pagination },
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
        onPaginationChange: enablePagination ? setPagination : undefined,
        onColumnFiltersChange: setColumnFilters,
        enableColumnFilters: enableSearch,
    });

    // Under 900px, wrap the pagination
    const isLowWidth = useMediaQuery({ maxWidth: 900 });

    // Do not render if not mounted
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const filterableColumns = useMemo(
        () =>
            table
                .getAllFlatColumns()
                .filter((col) => col.getCanFilter())
                .filter((col) => typeof col.columnDef.header !== "undefined")
                .filter((col) => typeof col.columnDef.id !== "undefined"),
        [table],
    );

    const [searchQuery, setSearchQuery] = useState("");
    const [currentFilteredColumn, setCurrentFilteredColumn] = useState(
        filterableColumns[0]?.id ?? "",
    );

    useEffect(() => {
        table.setColumnFilters([{ id: currentFilteredColumn, value: searchQuery }]);
    }, [table, searchQuery, currentFilteredColumn]);

    if (!isClient) {
        return (
            <Group gap={"md"}>
                <Text>Loading...</Text>
                <Loader size="3" />
            </Group>
        );
    }

    return (
        <Stack gap="md">
            {enableSearch && (
                <Group gap="md" className={styles.searchBarContainer}>
                    <TextInput
                        placeholder={`Search by ${
                            table.getColumn(currentFilteredColumn)?.columnDef.header?.toString() ??
                            "..."
                        }`}
                        className={styles.searchBar}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        value={searchQuery}
                        leftSection={<FaMagnifyingGlass size={16} />}
                        rightSection={<Button variant="subtle">Reset</Button>}
                    />

                    <Select
                        data={filterableColumns.map((col) => ({
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            label: col.columnDef.header!.toString(),
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            value: col.columnDef.id!,
                        }))}
                        defaultValue={filterableColumns[0].id ?? ""}
                        onChange={(value, option) =>
                            setCurrentFilteredColumn(value ?? filterableColumns[0].id ?? "")
                        }
                        title="Filter by column"
                    />
                </Group>
            )}

            <Table>
                <Table.Thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Table.Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <Table.Th
                                    key={header.id}
                                    onClick={() =>
                                        header.column.getCanSort() &&
                                        header.column.toggleSorting(
                                            header.column.getIsSorted() === "asc",
                                        )
                                    }
                                    className={styles.tableHeader}
                                >
                                    <Center>
                                        <span style={{ flex: "1 1 0" }}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef.header,
                                                      header.getContext(),
                                                  )}
                                        </span>
                                        {header.column.getCanSort() &&
                                            getSortingIcon(header.column.getIsSorted())}
                                    </Center>
                                </Table.Th>
                            ))}
                        </Table.Tr>
                    ))}
                </Table.Thead>

                <Table.Tbody className={styles.tanstackBody}>
                    {table.getRowModel().rows.map((row) => (
                        <Table.Tr key={row.id}>
                            {row
                                .getVisibleCells()
                                .map((cell) =>
                                    cell.column.getIsFirstColumn() ? (
                                        <Table.Th key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </Table.Th>
                                    ) : (
                                        <Table.Td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </Table.Td>
                                    ),
                                )}
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            {enablePagination && (
                <Pagination
                    totalPages={table.getPageCount()}
                    middlePagesSiblingCount={isLowWidth ? 1 : 2}
                    edgePageCount={0}
                    currentPage={table.getState().pagination.pageIndex}
                    setCurrentPage={table.setPageIndex}
                    truncableText="..."
                >
                    <nav className={styles.tablePagination}>
                        <Group gap="xl" justify="center" wrap="wrap">
                            <ul>
                                <ActionIcon
                                    variant="subtle"
                                    disabled={!table.getCanPreviousPage()}
                                    onClick={table.firstPage}
                                >
                                    <RxDoubleArrowLeft />
                                </ActionIcon>
                                <Pagination.PrevButton
                                    className=""
                                    as={<ActionIcon variant="subtle" />}
                                >
                                    <RxChevronLeft />
                                </Pagination.PrevButton>
                                <Pagination.PageButton
                                    as={<Button variant="subtle" size="compact-md" />}
                                    activeClassName={styles.activePage}
                                    inactiveClassName=""
                                    className=""
                                />
                                <Pagination.NextButton as={<ActionIcon variant="subtle" />}>
                                    <RxChevronRight />
                                </Pagination.NextButton>
                                <ActionIcon
                                    variant="subtle"
                                    disabled={!table.getCanNextPage()}
                                    onClick={table.lastPage}
                                >
                                    <RxDoubleArrowRight />
                                </ActionIcon>
                            </ul>
                            <Group gap={"md"} align="center" justify="center">
                                <Select
                                    data={["1", "5", "15", "25", "50"].map((i) => ({
                                        label: i,
                                        value: i,
                                    }))}
                                    defaultValue={table.getState().pagination.pageSize.toString()}
                                    onChange={(newPageSize: string | null) =>
                                        table.setPageSize(parseInt(newPageSize ?? "15", 10))
                                    }
                                    size="sm"
                                />
                                <Text className={styles.inlineFlexCenter}>records per page</Text>
                            </Group>
                        </Group>
                    </nav>
                </Pagination>
            )}
        </Stack>
    );
}
