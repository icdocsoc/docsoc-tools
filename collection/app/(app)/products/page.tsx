import TanstackTable from "@/components/tables/TanStackTable";
import { getAcademicYear } from "@/lib/config";
import { getAcademicYearsInDB } from "@/lib/crud/academic-year";
import {
    getProductsAndVariantByAcademicYearWithCounts,
    ProductsAndVariantsByAcademicYear,
} from "@/lib/crud/products";
import { Alert, Grid, GridCol, Group, Stack, Title } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import React from "react";
import { FaInfoCircle } from "react-icons/fa";

import { AddProduct } from "./AddProduct";
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

const ProductsPage = async () => {
    const data = await getProductsAndVariantByAcademicYearWithCounts();
    const academicYears = await getAcademicYearsInDB();
    const currentYear = await getAcademicYear();
    return (
        <Stack gap="xl">
            <Group justify="space-between">
                <Title order={1}>Products by Academic Year</Title>
                <AddProduct academicYears={academicYears} currentYear={currentYear} />
            </Group>
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
