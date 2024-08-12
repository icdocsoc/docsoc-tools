"use client";

import { BuyerItemsTable } from "@/components/tables/BuyerItemsTable";
import { getPurchasesByShortcode, OrderResponse } from "@/lib/crud/purchase";
import { Group, TextInput, Button, Alert, Container, Center, Stack } from "@mantine/core";
import React, { useState, useTransition } from "react";
import { FaSearch, FaTimesCircle } from "react-icons/fa";

export const CollectionsArea = () => {
    const [error, setError] = useState<string | null>(null);
    const [purchases, setPurchases] = useState<OrderResponse[]>([]);
    const [isPending, startTransition] = useTransition();

    const submitAction = async (formState: FormData) => {
        setError(null);
        const shortcode = formState.get("shortcode")?.toString().trim();

        if (typeof shortcode !== "string") {
            setError("Please enter a shortcode");
        }

        const purchases = await getPurchasesByShortcode(shortcode as string);
        if (purchases.status === "error") {
            setError(purchases.message);
            setPurchases([]);
        } else {
            setPurchases(purchases.orders);
        }
    };
    const submitActionWithTransition = (formState: FormData) => {
        startTransition(async () => await submitAction(formState));
    };

    return (
        <Stack>
            <Center>
                <Stack w="60%" justify="centre" align="centre">
                    <form
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                        action={submitActionWithTransition}
                    >
                        <Group w="100%">
                            <TextInput
                                placeholder="Enter shortcode"
                                leftSection={<FaSearch />}
                                w="60%"
                                flex={1}
                                required
                                name="shortcode"
                                id="shortcode"
                            />
                            <Button loading={isPending} type="submit">
                                Submit
                            </Button>
                        </Group>
                    </form>
                    {error && (
                        <Alert title="Error" color="red" mt="md" icon={<FaTimesCircle />}>
                            {error}
                        </Alert>
                    )}
                </Stack>
            </Center>
            <Container w="70%">
                {!error ? <BuyerItemsTable purchases={purchases} /> : <></>}
            </Container>
        </Stack>
    );
};
