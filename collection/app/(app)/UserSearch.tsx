"use client";

import { BuyerItemsTable } from "@/components/tables/BuyerItemsTable";
import { OrderResponse } from "@/lib/crud/purchase";
import { Group, TextInput, Button, Alert, Container, Center, Stack } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState, useTransition } from "react";
import { FaSearch, FaTimesCircle } from "react-icons/fa";

export const UserSearch = () => {
    const [error, setError] = useState<string | null>(null);
    const [purchases, setPurchases] = useState<OrderResponse[]>([]);
    const [isPending, startTransition] = useTransition();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Need to allow clearing on route change to home
    const [shortcodeFormState, setSetshortcodeFormState] = useState("");

    const shortcode = searchParams.get("shortcode") || "";

    const fetchPurchases = useCallback(async (shortcode: string) => {
        const res = await fetch(`/api/purchases/${shortcode}`, {
            next: { tags: [`purchases:${shortcode}`] },
        });
        if (!res.ok) {
            setError("An error occurred");
            return;
        }

        const purchases = await res.json();
        if (purchases.status === "error") {
            setError(purchases.message);
            setPurchases([]);
        } else {
            setPurchases(purchases.orders);
        }
    }, []);

    useEffect(() => {
        if (shortcode) {
            setSetshortcodeFormState(shortcode);
            fetchPurchases(shortcode);
        } else {
            setPurchases([]);
            setSetshortcodeFormState("");
        }
    }, [shortcode, fetchPurchases]);

    const submitAction = useCallback(
        async (formState: FormData) => {
            setError(null);
            const shortcode = formState.get("shortcode")?.toString().trim();

            if (typeof shortcode !== "string") {
                setError("Please enter a shortcode");
                return;
            }

            router.push("/?shortcode=" + shortcode);
        },
        [router],
    );

    const submitActionWithTransition = useCallback(
        (formState: FormData) => {
            startTransition(async () => await submitAction(formState));
        },
        [submitAction],
    );

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
                                defaultValue={shortcode}
                                onChange={(e) => setSetshortcodeFormState(e.currentTarget.value)}
                                value={shortcodeFormState}
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
                {!error ? (
                    <BuyerItemsTable
                        shortcode={shortcode}
                        purchases={purchases}
                        refresh={() => fetchPurchases(shortcode)}
                    />
                ) : (
                    <></>
                )}
            </Container>
        </Stack>
    );
};
