"use client";

/**
 * Table with the items of a buyer
 */
import { markCollection, type OrderResponse } from "@/lib/crud/purchase";
import { formatDateDDMMYYYY } from "@/lib/util";
import { Checkbox } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import React from "react";

import TanstackTable from "./TanStackTable";

interface OrderUI {
    orderNo: number;
    date: Date;
    item: string;
    variant: string;
    collected: boolean;
    itemID: number;
    quantity: number;
}

const columnHelper = createColumnHelper<OrderUI>();

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
    columnHelper.accessor("item", {
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
                onChange={async (e) => {
                    await markCollection(
                        info.row.original.orderNo,
                        info.row.original.itemID,
                        e.target.checked,
                    );
                }}
            />
        ),
    }),
];

export const BuyerItemsTable = ({ purchases }: { purchases: OrderResponse[] }) => {
    const flatItems: OrderUI[] = purchases.flatMap((order) =>
        order.items.map((item) => ({
            orderNo: order.orderNoShop,
            date: order.date,
            item: item.name,
            variant: item.variant,
            collected: item.collected,
            itemID: item.id,
            quantity: item.quantity,
        })),
    );

    return (
        <TanstackTable
            enableSearch={false}
            enablePagination={false}
            columns={columns}
            data={flatItems}
            tableProps={{
                striped: true,
                withTableBorder: true,
                withColumnBorders: true,
                verticalSpacing: "sm",
                highlightOnHover: true,
            }}
            differentHeaderColour
        />
    );
};
