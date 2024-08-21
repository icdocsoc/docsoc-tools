"use client";

import TanstackTable from "@/components/tables/TanStackTable";
import { Group, Text, Stack } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import React from "react";

import { DeleteProduct } from "./DeleteProduct";

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
    productId: number;
}

export const VariantsTable: React.FC<VariantsTableProps> = ({ variants, productId }) => {
    if (!variants || variants.length === 0) {
        return (
            <Group>
                <Text>No variants added yet</Text>
                <DeleteProduct productId={productId} />
            </Group>
        );
    }

    const allVariantsHaveCountZero = variants.every((variant) => variant.count === 0);

    return (
        <Stack gap="sm">
            <Group>
                {(!variants || variants.length === 0) && <Text>No variants added yet</Text>}
                {(!variants || variants.length === 0 || allVariantsHaveCountZero) && (
                    <DeleteProduct productId={productId} />
                )}
            </Group>
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
        </Stack>
    );
};
