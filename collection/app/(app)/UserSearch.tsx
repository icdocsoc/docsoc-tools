"use client";

import { UserInfo } from "@/components/UserInfo";
import { BuyerItemsTable } from "@/components/tables/BuyerItemsTable";
import { OrderResponse } from "@/lib/crud/purchase";
import { Group, TextInput, Button, Alert, Container, Center, Stack } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { FaSearch, FaTimesCircle } from "react-icons/fa";

import { PageActions } from "./PageActions";

export const UserSearch = () => {
    const [error, setError] = useState<string | null>(null);
    const [purchases, setPurchases] = useState<OrderResponse[]>([]);
    const [isPending, startTransition] = useTransition();

    // Need to allow clearing on route change to home
    const [shortcodeFormState, setSetshortcodeFormState] = useState("");

    const searchParams = useSearchParams();
    const router = useRouter();
    const shortcode = useMemo(() => searchParams.get("shortcode") || "", [searchParams]);

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
        <Container w="70%">
            <Stack gap="lg">
                <PageActions />
                <Center>
                    <Stack w="90%" justify="centre" align="centre">
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
                                    onChange={(e) =>
                                        setSetshortcodeFormState(e.currentTarget.value)
                                    }
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
                <Center>
                    <UserInfo shortcode={shortcode} />
                </Center>

                {!error ? (
                    <BuyerItemsTable
                        shortcode={shortcode}
                        purchases={purchases}
                        refresh={() => fetchPurchases(shortcode)}
                    />
                ) : (
                    <></>
                )}
            </Stack>
        </Container>
    );
};
