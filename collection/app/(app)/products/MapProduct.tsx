"use client";

import {
    addProducts,
    ProductsAndVariantsByAcademicYear,
    updateProductWithEActivitesMetadata,
} from "@/lib/crud/products";
import { fetcher } from "@/lib/fetcher";
import { StatusReturn } from "@/lib/types";
import { Product } from "@docsoc/eactivities";
import {
    ActionIcon,
    Alert,
    Button,
    Group,
    InputLabel,
    Modal,
    NativeSelect,
    Radio,
    Stack,
    TextInput,
    Tooltip,
    Text,
    Anchor,
    Box,
    Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import React, { useEffect, useState, useTransition } from "react";
import { FaEdit } from "react-icons/fa";
import { FaPlus, FaSignsPost, FaTrash, FaUpRightFromSquare } from "react-icons/fa6";
import useSWR from "swr";

interface MapProductProps {
    academicYears: string[];
    productAcademicYear: string;
    product: ProductsAndVariantsByAcademicYear["RootItem"][0];
    editMode?: boolean;
}

type MapProductFormProps = MapProductProps & {
    close: () => void;
};

const MapProductForm: React.FC<MapProductFormProps> = ({
    academicYears,
    productAcademicYear,
    close,
    product,
}) => {
    const [isPending, startTransition] = useTransition();
    const [isPendingProducts, startTransitionProducts] = useTransition();
    const [status, setStatus] = useState<StatusReturn>({
        status: "pending",
    });

    const [academicYear, setAcademicYear] = useState(productAcademicYear);
    const [products, setProducts] = useState<Product[]>([]);
    const [productSelectedId, setProductSelectedId] = useState<string | null>(null);

    const submit = () => {
        startTransition(async () => {
            if (!productSelectedId) {
                setStatus({ status: "error", error: "No product selected" });
                return;
            }

            const idBackToNumber = parseInt(productSelectedId, 10);

            const foundData = products.find((product) => product.ID === idBackToNumber);

            if (!foundData) {
                setStatus({ status: "error", error: "Product not found" });
                return;
            }

            const res = await updateProductWithEActivitesMetadata({
                productID: product.id,
                eActivitiesID: idBackToNumber,
                eActivitiesData: foundData,
            });
            if (res.status === "error") {
                setStatus(res);
            } else {
                close();
            }
        });
    };

    // Fetch on change of academic year
    useEffect(() => {
        setProducts([]);
        setProductSelectedId(null);
        startTransitionProducts(() => {
            return fetch(`/api/eactivities/products?academicYear=${academicYear}`)
                .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) {
                        throw new Error(data.message);
                    }
                    return data;
                })
                .then((data) => {
                    setProducts(data);
                })
                .catch((error) => {
                    setStatus({ status: "error", error: `Server error: ${error?.message}` });
                });
        });
    }, [academicYear]);

    const cards = products.map((product) => (
        <Radio.Card radius="md" key={product.ID} value={product.ID.toString(10)} flex="1 0 0">
            <Group wrap="nowrap" align="center" p="md">
                <Radio.Indicator />
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
        </Radio.Card>
    ));

    return (
        <Stack>
            {
                // Display error if there is one
                status.status === "error" && (
                    <Alert color="red" title="Error">
                        {status.error}
                    </Alert>
                )
            }
            <NativeSelect
                label="Academic year"
                name="academicYear"
                description="Add products to this academic year"
                data={academicYears}
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.currentTarget.value)}
            />
            <Radio.Group
                value={productSelectedId}
                onChange={setProductSelectedId}
                label="Select a product"
                description="Choose a product from eActivities to map to this product"
            >
                {isPendingProducts ? (
                    <Loader p="lg" />
                ) : (
                    <Stack pt="md" gap="xs">
                        {cards}
                    </Stack>
                )}
            </Radio.Group>

            <Group justify="right" mt="sm">
                <Button onClick={submit} color="green" loading={isPending}>
                    Map to:{" "}
                    {
                        products.find((product) => product.ID.toString(10) === productSelectedId)
                            ?.Name
                    }
                </Button>
            </Group>
        </Stack>
    );
};

export const MapProduct: React.FC<MapProductProps> = (props) => {
    const [opened, { open, close }] = useDisclosure(false);
    return (
        <>
            <Modal
                opened={opened}
                onClose={close}
                title={`Map Product "${props.product.name}"`}
                size="xl"
            >
                <MapProductForm {...props} close={close} />
            </Modal>
            <Tooltip label="Tell us what product on the Union Shop this product refers to, to enable auto-imports of sales.">
                {props.editMode ? (
                    <ActionIcon onClick={open}>
                        <FaEdit />
                    </ActionIcon>
                ) : (
                    <Button leftSection={<FaSignsPost />} onClick={open}>
                        Map to eActivities Product
                    </Button>
                )}
            </Tooltip>
        </>
    );
};
