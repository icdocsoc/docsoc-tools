"use client";

import TanstackTable from "@/components/tables/TanStackTable";
import { Text } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import React from "react";

interface Variant {
    id: number;
    name: string;
    count: number;
}

const columnHelper = createColumnHelper<Variant>();

const columns = [
    columnHelper.accessor("name", {
        cell: (info) => info.getValue(),
        header: "Variant",
        id: "name",
        sortingFn: "alphanumeric",
    }),
    columnHelper.accessor("count", {
        cell: (info) => info.getValue(),
        header: "Count",
        id: "count",
        sortingFn: "alphanumeric",
    }),
];

interface VariantsTableProps {
    variants: Variant[];
}

export const VariantsTable: React.FC<VariantsTableProps> = ({ variants }) => {
    if (!variants || variants.length === 0) {
        return <Text>No variants added yet</Text>;
    }

    return (
        <TanstackTable
            columns={columns}
            data={variants}
            enablePagination={false}
            enableSearch={false}
            tableProps={{
                striped: true,
                withTableBorder: true,
                withColumnBorders: true,
                verticalSpacing: "sm",
                highlightOnHover: true,
            }}
            differentHeaderColour
            initialSort={[{ id: "name", desc: false }]}
        />
    );
};
