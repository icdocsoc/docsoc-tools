"use client";

/**
 * Table with the items of a buyer
 */
import { formatDateDDMMYYYY } from "@/lib/util";
import { Checkbox } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import React from "react";

import TanstackTable from "./TanStackTable";

interface PurchaseRow {
    orderNo: number;
    date: Date;
    itemName: string;
    variant: string;
    quantity: number;
    collected: boolean;
}

const columnHelper = createColumnHelper<PurchaseRow>();

const columns = [
    columnHelper.accessor("orderNo", {
        id: "orderNo",
        header: "Order No",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("date", {
        id: "date",
        header: "Date",
        cell: (info) => formatDateDDMMYYYY(info.getValue()),
    }),
    columnHelper.accessor("itemName", {
        id: "itemName",
        header: "Item Name",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("variant", {
        id: "variant",
        header: "Variant",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("quantity", {
        id: "quantity",
        header: "Quantity",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("collected", {
        header: "Collected",
        cell: (info) => (
            <Checkbox
                checked={info.getValue()}
                onChange={() => {
                    // Add your onChange action here
                }}
            />
        ),
    }),
];

export const BuyerItemsTable = ({ purchases }: { purchases: PurchaseRow[] }) => {
    return (
        <TanstackTable
            enableSearch={false}
            enablePagination={false}
            columns={columns}
            data={purchases}
        />
    );
};
