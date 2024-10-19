import { ProductsAndVariantsByAcademicYear } from "@/lib/crud/products";
import { Stack, Title, Text, Box, Anchor, Button, Tooltip, Group } from "@mantine/core";
import React from "react";
import { FaSignsPost } from "react-icons/fa6";

import { MapProduct } from "./MapProduct";
import { VariantsTable } from "./VariantsTable";

interface ProductProps {
    product: ProductsAndVariantsByAcademicYear["RootItem"][0];
    academicYears: string[];
    productAcademicYear: string;
}

const Product: React.FC<ProductProps> = ({ product, ...props }) => (
    <Stack gap="sm">
        <Title order={3}>{product.name}</Title>
        <Title order={4}>eActivites info:</Title>
        <Box pl="lg" pr="lg">
            {product?.eActivitiesId ? (
                <Group align="center">
                    <Box flex="1 0 0">
                        <Text>
                            <b>Product ID:</b> {product.eActivitiesId ?? "Not Provided"}
                        </Text>
                        <Text>
                            <b>Product Name:</b> {product.eActivitiesName ?? "Not Provided"}
                        </Text>
                        <Text>
                            <b>URL:</b>{" "}
                            <Anchor href={product.eActivitiesURL ?? "#"} target="_blank">
                                {product.eActivitiesURL ?? "Not Provided"}
                            </Anchor>
                        </Text>
                    </Box>
                    <MapProduct {...props} product={product} editMode />
                </Group>
            ) : (
                <MapProduct {...props} product={product} />
            )}
        </Box>

        <VariantsTable
            variants={product.Variant.map((variant) => ({
                id: variant.id,
                name: variant.variantName,
                count: variant._count.OrderItem,
            }))}
            productId={product.id}
        />
    </Stack>
);

export default Product;
