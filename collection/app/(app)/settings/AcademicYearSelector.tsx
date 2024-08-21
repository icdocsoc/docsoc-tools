"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { setAcademicYear } from "@/lib/config";
import { getAcademicYears, isValidAcademicYear } from "@docsoc/eactivities";
import { Button, Group, Modal, Text, Stack, Title, NativeSelect } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
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

    return (
        <Group>
            <ConfirmModal
                onConfirm={async () => setAcademicYear(form.values.academicYear)}
                confirmButtonText={`Change to ${form.values.academicYear}`}
                opened={opened}
                close={close}
            >
                <Text>
                    Changing to an academic year you are not a committee member in may{" "}
                    <strong>prevent you from accessing this system.</strong>
                </Text>
                <Text>
                    Only users who are committee members during the selected academic year will be
                    allowed to login.
                </Text>
                <Text>
                    In the event of a mistake, please login as docsoc@ic.ac.uk using SSO and change
                    the setting back.
                </Text>
            </ConfirmModal>

            <form onSubmit={form.onSubmit(({ academicYear }) => open())}>
                <NativeSelect
                    label="Academic Year"
                    name="academicYear"
                    key={form.key("academicYear")}
                    description="E.g. 23-24, 24-25"
                    data={getAcademicYears(new Date())}
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
