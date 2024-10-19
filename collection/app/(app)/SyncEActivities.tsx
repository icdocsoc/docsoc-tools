"use client";

import { loadSalesFromEActivites } from "@/lib/crud/loadSalesFromEActivites";
import { fetcher } from "@/lib/fetcher";
import { StatusReturn } from "@/lib/types";
import { Product } from "@docsoc/eactivities";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Group,
    Loader,
    Modal,
    MultiSelect,
    Stack,
    Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { RootItem } from "@prisma/client";
import React, { useCallback, useState, useTransition } from "react";
import { FaSync } from "react-icons/fa";
import { FaUpRightFromSquare } from "react-icons/fa6";
import useSWR from "swr";

function CheckboxesForProducts({
    close,
    academicYears,
    currentlySelectedAcademicYears,
}: {
    close: () => void;
    academicYears: string[];
    currentlySelectedAcademicYears: string[];
}) {
    const [value, setValue] = useState<string[]>([]);
    const [status, setStatus] = useState<StatusReturn>({
        status: "pending",
    });

    const [academicYearsToSync, setAcademicYearsToSync] = useState(currentlySelectedAcademicYears);

    const { data: products, isLoading } = useSWR<RootItem[]>("/api/products/syncable", fetcher);

    const [isPending, startTransition] = useTransition();

    const syncEActivities = useCallback(() => {
        setStatus({
            status: "pending",
        });
        startTransition(async () => {
            const res = await loadSalesFromEActivites(
                value.map((id) => parseInt(id, 10)).filter(isFinite),
                academicYearsToSync,
            );
            if (res.status === "error") {
                setStatus(res);
            } else {
                setStatus({
                    status: "success",
                });
                close();
            }
        });
    }, [close, value, academicYearsToSync]);

    const cards = products?.map((product, i) => (
        <Checkbox.Card radius="md" value={product.id.toString(10)} key={i} flex="1 0 0">
            <Group wrap="nowrap" align="center" p="md">
                <Checkbox.Indicator />
                <Group flex="1 0 0">
                    <Box flex="1 0 0">
                        <Text>
                            <b>
                                <u>{product.name}</u>
                            </b>
                        </Text>
                        <Text>
                            <b>eActivites ID:</b> {product.eActivitiesId}
                        </Text>
                        <Text>
                            <b>eActivites Name:</b> {product.eActivitiesName}
                        </Text>
                    </Box>
                    {isLoading ? (
                        <Loader size="md" />
                    ) : (
                        product.eActivitiesURL && (
                            <Button
                                component="a"
                                href={product.eActivitiesURL}
                                target="_blank"
                                rightSection={<FaUpRightFromSquare />}
                            >
                                View on Union Shop
                            </Button>
                        )
                    )}
                </Group>
            </Group>
        </Checkbox.Card>
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
            <MultiSelect
                label="Sync purchases these academic years"
                description=" "
                value={academicYearsToSync}
                onChange={(e) => setAcademicYearsToSync(e)}
                data={academicYears}
            />
            <Checkbox.Group
                value={value}
                onChange={setValue}
                label="Select products to sync"
                description="If you are being IP banned, you might want to wait a few minutes and try fewer products"
            >
                <Stack pt="md" gap="xs">
                    {products && products.length > 0 ? cards : <Text>No products found</Text>}
                </Stack>
            </Checkbox.Group>

            <Group justify="space-between" mt="sm">
                <Button
                    onClick={() =>
                        setValue(products?.map((product) => product.id.toString(10)) ?? [])
                    }
                    color="violet"
                    loading={false}
                >
                    Select all
                </Button>
                <Button onClick={syncEActivities} color="green" loading={isPending}>
                    Sync {value.length} products
                </Button>
            </Group>
        </Stack>
    );
}

export const SyncEActivities = ({
    setActionsError,
    academicYears,
    currentlySelectedAcademicYears,
}: {
    setActionsError: (error: string | null) => void;
    academicYears: string[];
    currentlySelectedAcademicYears: string[];
}) => {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <>
            <Modal opened={opened} onClose={close} title={`Select products to sync`} size="xl">
                <CheckboxesForProducts
                    close={close}
                    academicYears={academicYears}
                    currentlySelectedAcademicYears={currentlySelectedAcademicYears}
                />
            </Modal>
            <Button leftSection={<FaSync />} color="violet" onClick={open}>
                Sync from eActivities
            </Button>
        </>
    );
};
