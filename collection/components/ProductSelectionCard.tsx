import { Product } from "@docsoc/eactivities";
import { Checkbox, Group, Radio, Text, Box, Button } from "@mantine/core";
import React from "react";
import { FaUpRightFromSquare } from "react-icons/fa6";

interface ProductSelectionCardProps {
    cardParent: typeof Radio.Card | typeof Checkbox.Card;
    indicator: typeof Radio.Indicator | typeof Checkbox.Indicator;
    product: Product;
}

export const ProductSelectionCard: React.FC<ProductSelectionCardProps> = ({
    cardParent: CardParent,
    indicator: Indicator,
    product,
}) => {
    return (
        <CardParent radius="md" key={product.ID} value={product.ID.toString(10)} flex="1 0 0">
            <Group wrap="nowrap" align="center" p="md">
                <Indicator />
                <Group flex="1 0 0">
                    <Box flex="1 0 0">
                        <Text>
                            <b>
                                <u>{product.Name}</u>
                            </b>
                        </Text>
                        <Text>
                            <b>ID:</b> {product.ID}
                        </Text>
                        <Text>
                        <b>Variants:</b>{" "}
                            {product.ProductLines?.map((line) => line.Name).join(" | ")}
                        </Text>
                    </Box>
                    <Button
                        component="a"
                        href={product.URL}
                        target="_blank"
                        rightSection={<FaUpRightFromSquare />}
                    >
                        View on Union Shop
                    </Button>
                </Group>
            </Group>
        </CardParent>
    );
};
