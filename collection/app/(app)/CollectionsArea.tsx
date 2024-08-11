import { BuyerItemsTable } from "@/components/tables/BuyerItemsTable";
import { getPurchasesByShortcode } from "@/lib/crud/purchase";
import { Box, Container } from "@mantine/core";
import React from "react";

export const CollectionsArea = async () => {
    const purchases = await getPurchasesByShortcode("kss22");
    if (purchases.status === "error") {
        return <div>{purchases.message}</div>;
    } else {
        return (
            <Container w="70%">
                <BuyerItemsTable purchases={purchases.orders} />
            </Container>
        );
    }
};
