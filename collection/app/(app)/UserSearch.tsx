"use client";

import { UserInfo } from "@/components/UserInfo";
import { BuyerItemsTable } from "@/components/tables/BuyerItemsTable";
import { OrderResponse } from "@/lib/crud/purchase";
import { AcademicYear } from "@docsoc/eactivities";
import { Group, TextInput, Button, Alert, Container, Center, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { FaSearch, FaTimesCircle } from "react-icons/fa";

import { PageActions } from "./PageActions";

interface UserSearchProps {
    currentAcademicYear: AcademicYear;
    validAcaemicYears: string[];
}

export const UserSearch: React.FC<UserSearchProps> = ({
    currentAcademicYear,
    validAcaemicYears,
}) => {
    const [error, setError] = useState<string | null>(null);
    const [actionsError, setActionsError] = useState<string | null>(null);
    const [purchases, setPurchases] = useState<OrderResponse[]>([]);
    const [isPending, startTransition] = useTransition();

    const searchParams = useSearchParams();
    const router = useRouter();
    const shortcodeURLParam = useMemo(() => searchParams.get("shortcode") || "", [searchParams]);

    // Form
    // 2 fields: shortcode & academic year purcahses.
    // Default value of shortcode is from the URL if possible
    const form = useForm({
        initialValues: { shortcode: shortcodeURLParam, academicYears: [currentAcademicYear] },

        validate: {
            shortcode: (value) => {
                if (typeof value !== "string") return "Please enter a shortcode";
                return;
            },
        },
    });

    const fetchPurchases = useCallback(
        async (shortcode: string) => {
            const res = await fetch(
                `/api/purchases/${shortcode}?` +
                    new URLSearchParams({
                        academicYears: form.getValues().academicYears.join(","),
                    }),
                {
                    next: { tags: [`purchases:${shortcode}`] },
                },
            );
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
        },
        [form],
    );

    // This looks a bit weird, but effectively prevent an infinite loop of fetching purchases
    const [prevURLParam, setPrevURLParam] = useState(shortcodeURLParam);
    useEffect(() => {
        if (!shortcodeURLParam) {
            // only allow one rerender when the shortcode is clear
            // by tracking the previous value
            if (prevURLParam) {
                setPurchases([]);
                form.setFieldValue("shortcode", "");
                setPrevURLParam("");
            }
        }
    }, [shortcodeURLParam, prevURLParam, form]);

    // Fetch purchases if academic year changes
    form.watch("academicYears", (academicYears) => {
        if (form.getValues().shortcode) {
            startTransition(async () => {
                setError(null);
                await fetchPurchases(form.getValues().shortcode);
            });
        }
    });

    const submitAction = useCallback(
        ({ shortcode }: { shortcode: string }) => {
            startTransition(async () => {
                setError(null);
                await fetchPurchases(shortcode);
                router.push("/?shortcode=" + shortcode);
            });
        },
        [router, fetchPurchases],
    );

    // Run fetchPurchases on initial render
    useEffect(() => {
        if (shortcodeURLParam) {
            startTransition(async () => {
                await fetchPurchases(shortcodeURLParam);
            });
        }
    }, []);

    return (
        <Container w="70%">
            <Stack gap="lg">
                {actionsError && (
                    <Alert title="Error" color="red" mt="md" icon={<FaTimesCircle />}>
                        {actionsError}
                    </Alert>
                )}
                <PageActions
                    currentAcademicYear={currentAcademicYear}
                    academicYears={validAcaemicYears}
                    formHook={form}
                    setActionsError={setActionsError}
                />
                <Center>
                    <Stack w="90%" justify="centre" align="centre">
                        <form
                            style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                            onSubmit={form.onSubmit(submitAction)}
                            // eslint-disable-next-line @typescript-eslint/no-empty-function
                            action={() => {}}
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
                                    {...form.getInputProps("shortcode")}
                                />
                                <Button loading={isPending} type="submit">
                                    Submit
                                </Button>
                                <Button
                                    color="pink"
                                    onClick={() => {
                                        setPurchases([]);
                                        router.push("/");
                                    }}
                                >
                                    Clear
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
                    <UserInfo shortcode={shortcodeURLParam} />
                </Center>

                {!error ? (
                    <BuyerItemsTable
                        shortcode={shortcodeURLParam}
                        purchases={purchases}
                        refresh={() => fetchPurchases(shortcodeURLParam)}
                    />
                ) : (
                    <></>
                )}
            </Stack>
        </Container>
    );
};
