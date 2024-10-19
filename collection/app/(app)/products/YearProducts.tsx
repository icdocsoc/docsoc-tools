"use client";

import { ProductsAndVariantsByAcademicYear } from "@/lib/crud/products";
import { Grid, Text } from "@mantine/core";
import React from "react";

import Product from "./Product";

interface YearProductsProps {
    products: ProductsAndVariantsByAcademicYear["RootItem"];
    academicYears: string[];
    productAcademicYear: string;
}

export const YearProducts: React.FC<YearProductsProps> = ({
    products,
    academicYears,
    productAcademicYear,
}) => {
    if (!products || products.length === 0) {
        return <Text>No products added yet</Text>;
    }
    return (
        <Grid columns={2} gutter="xl">
            {products.map((product, j) => (
                <Grid.Col key={j} span={1}>
                    <Product
                        product={product}
                        academicYears={academicYears}
                        productAcademicYear={productAcademicYear}
                    />
                </Grid.Col>
            ))}
        </Grid>
    );
};
