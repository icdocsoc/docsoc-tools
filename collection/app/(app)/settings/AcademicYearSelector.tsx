"use client";

import { setAcademicYear, setAcademicYearForm } from "@/lib/config";
import { Button, Group, Modal, TextInput, Text, Stack, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { isValidAcademicYear } from "common/eactivities/dist";
import React, { useTransition } from "react";
import { FaExclamationTriangle } from "react-icons/fa";

/**
 * DANGEROUS selector of the current academic year
 *
 * This component is used to select the current academic year.
 * It saved the academic year in the database - which by extension affects the entire application.
 *
 * By changing the academic year, only the items that are relevant to the academic year will be displayed.
 * Additionally, only users who are committee members during the selected academic year will be displayed.
 */
export const AcademicYearSelector = ({ currentYear }: { currentYear: string }) => {
    const form = useForm({
        validateInputOnBlur: true,
        validateInputOnChange: true,
        initialValues: {
            academicYear: currentYear,
        },
        validate: {
            academicYear: (value: string) =>
                isValidAcademicYear(value) ? null : "Invalid academic year",
        },
    });

    const [opened, { open, close }] = useDisclosure(false);
    const [isPending, startTransition] = useTransition();

    return (
        <Group>
            <Modal opened={opened} onClose={close} withCloseButton={false}>
                <Stack p="md">
                    <Group c="yellow">
                        <FaExclamationTriangle size={24} />
                        <Title order={3}>Warning</Title>
                    </Group>
                    <Text>
                        Changing to an academic year you are not a committee member in may{" "}
                        <strong>prevent you from accessing this system.</strong>
                    </Text>
                    <Text>
                        Only users who are committee members during the selected academic year will
                        be allowed to login.
                    </Text>
                    <Text>
                        In the event of a mistake, please login as docsoc@ic.ac.uk using SSO and
                        change the setting back.
                    </Text>

                    <Group align="flex-end" justify="flex-end">
                        <Button onClick={close} variant="light">
                            Cancel
                        </Button>
                        <Button
                            loading={isPending}
                            onClick={async () => {
                                startTransition(async () => {
                                    await setAcademicYear(form.values.academicYear);
                                    close();
                                });
                                close();
                            }}
                            color="red"
                        >
                            Change to {form.values.academicYear}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
            <form onSubmit={form.onSubmit(({ academicYear }) => open())}>
                <TextInput
                    label="Academic Year"
                    name="academicYear"
                    key={form.key("academicYear")}
                    description="E.g. 23-24, 24-25"
                    width="lg"
                    inputContainer={(children) => (
                        <Group align="flex-start">
                            {children}
                            <Button
                                style={{ marginTop: "calc(var(--mantine-spacing-xs) / 2)" }}
                                color="green"
                                type="submit"
                            >
                                Change Year
                            </Button>
                        </Group>
                    )}
                    {...form.getInputProps("academicYear")}
                />
            </form>
        </Group>
    );
};
