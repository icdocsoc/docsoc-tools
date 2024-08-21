"use client";

import { ProductsAndVariantsByAcademicYear } from "@/lib/crud/products";
import { Grid, Stack, Text, Title } from "@mantine/core";
import React from "react";

import { VariantsTable } from "./VariantsTable";

interface YearProductsProps {
    products: ProductsAndVariantsByAcademicYear["RootItem"];
}

export const YearProducts: React.FC<YearProductsProps> = ({ products }) => {
    if (!products || products.length === 0) {
        return <Text>No products added yet</Text>;
    }
    return (
        <Grid columns={2} gutter="xl">
            {products.map((product, j) => (
                <Grid.Col key={j} span={1}>
                    <Stack gap="sm">
                        <Title order={3}>{product.name}</Title>
                        <VariantsTable
                            variants={product.Variant.map((variant) => ({
                                id: variant.id,
                                name: variant.variantName,
                                count: variant._count.OrderItem,
                            }))}
                        />
                    </Stack>
                </Grid.Col>
            ))}
        </Grid>
    );
};
