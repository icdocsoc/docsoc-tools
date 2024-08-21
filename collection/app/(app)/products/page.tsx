import TanstackTable from "@/components/tables/TanStackTable";
import {
    getProductsAndVariantByAcademicYearWithCounts,
    ProductsAndVariantsByAcademicYear,
} from "@/lib/crud/products";
import { Alert, Grid, GridCol, Stack, Title } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import React from "react";
import { FaInfoCircle } from "react-icons/fa";

import { VariantsTable } from "./VariantsTable";
import { YearProducts } from "./YearProducts";

const columnHelper = createColumnHelper<ProductsAndVariantsByAcademicYear>();

const columns = [
    columnHelper.accessor("year", {
        cell: (info) => info.getValue(),
        header: "Academic Year",
        id: "year",
        sortingFn: "alphanumeric",
    }),
    columnHelper.accessor("RootItem.name", {
        cell: (info) => info.getValue(),
        header: "Item Name",
        id: "itemName",
        sortingFn: "alphanumeric",
    }),
    columnHelper.accessor("RootItem.Variant.variantName", {
        cell: (info) => info.getValue(),
        header: "Variant",
        id: "variant",
        sortingFn: "alphanumeric",
    }),
];

export const ProductsPage = async () => {
    const data = await getProductsAndVariantByAcademicYearWithCounts();
    return (
        <Stack gap="xl">
            <Title order={1}>Products by Academic Year</Title>
            <Alert color="blue" title="Note" icon={<FaInfoCircle />}>
                Variants will be added automatically on import
            </Alert>
            {data.map((year, i) => (
                <Stack gap="lg" key={i}>
                    <Title order={2}>{year.year}</Title>
                    <YearProducts products={year.RootItem} />
                </Stack>
            ))}
        </Stack>
    );
};

export default ProductsPage;
