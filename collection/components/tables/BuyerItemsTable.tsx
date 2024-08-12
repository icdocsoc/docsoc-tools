"use client";

/**
 * Table with the items of a buyer
 */
import { markCollection, type OrderResponse } from "@/lib/crud/purchase";
import { formatDateDDMMYYYY } from "@/lib/util";
import { Checkbox, Loader } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import React, { useMemo, useTransition } from "react";

import TanstackTable from "./TanStackTable";

interface OrderUI {
    id: number;
    orderNo: number;
    date: Date;
    item: string;
    variant: string;
    collected: boolean;
    itemID: number;
    quantity: number;
}

const columnHelper = createColumnHelper<OrderUI>();

const CollectionsCheckbox = ({
    collected,
    orderNo,
    itemID,
    shortcode,
    refresh,
}: {
    collected: boolean;
    orderNo: number;
    itemID: number;
    shortcode: string;
    refresh: () => Promise<void>;
}) => {
    const [isPending, startTransition] = useTransition();

    return isPending ? (
        <Loader size="xs" />
    ) : (
        <Checkbox
            checked={collected}
            onChange={(e) => {
                startTransition(async () => {
                    await markCollection(orderNo, itemID, e.target.checked, shortcode);
                    await refresh();
                });
            }}
        />
    );
};

export const BuyerItemsTable = ({
    purchases,
    shortcode,
    refresh,
}: {
    purchases: OrderResponse[];
    shortcode: string;
    refresh: () => Promise<void>;
}) => {
    const flatItems: OrderUI[] = purchases.flatMap((order) =>
        order.items.map((item) => ({
            id: item.id,
            orderNo: order.orderNoShop,
            date: order.date,
            item: item.name,
            variant: item.variant,
            collected: item.collected,
            itemID: item.id,
            quantity: item.quantity,
        })),
    );

    const columns = useMemo(
        () => [
            columnHelper.accessor("id", {
                id: "id",
                header: "DB Id",
                cell: (info) => info.getValue(),
            }),
            columnHelper.accessor("orderNo", {
                id: "orderNo",
                header: "Order No",
                cell: (info) => info.getValue(),
            }),
            columnHelper.accessor("date", {
                id: "date",
                header: "Date",
                cell: (info) => formatDateDDMMYYYY(new Date(info.getValue())),
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
                    <CollectionsCheckbox
                        collected={info.getValue()}
                        orderNo={info.row.original.orderNo}
                        itemID={info.row.original.itemID}
                        shortcode={shortcode}
                        refresh={refresh}
                    />
                ),
            }),
        ],
        [shortcode],
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
            initialSort={[
                {
                    id: "id",
                    desc: false,
                },
            ]}
            invisibleColumns={["id"]}
        />
    );
};
