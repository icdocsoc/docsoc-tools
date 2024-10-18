"use client";

import { CSVFormValues, importCsv } from "@/lib/crud/importCsv";
import { StatusReturn } from "@/lib/types";
import { isValidAcademicYear } from "@docsoc/eactivities";
import {
    Alert,
    Badge,
    Button,
    Center,
    CloseButton,
    Group,
    Loader,
    Modal,
    NativeSelect,
    rem,
    Stack,
    Text,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import "@mantine/dropzone/styles.css";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { RootItem } from "@prisma/client";
import React, { useState, useTransition } from "react";
import {
    FaCircleCheck,
    FaCircleXmark,
    FaDownload,
    FaTable,
    FaTriangleExclamation,
    FaUpload,
} from "react-icons/fa6";
import useSWR from "swr";

import { fetcher } from "../../lib/fetcher";

interface CSVImportFormProp {
    productsByAcademicYear: Record<string, RootItem[]>;
    /** Current academic year */
    academicYear: string;
    /** Valid academic years */
    validAcademicYears: string[];
}

// TODO: Pass in academic years explicitly, default to current year
const CSVImportForm: React.FC<CSVImportFormProp> = ({
    productsByAcademicYear,
    academicYear,
    validAcademicYears,
}) => {
    const [isPending, startTransition] = useTransition();
    const [formState, setFormState] = useState<StatusReturn>({
        status: "pending",
    });
    console.log(productsByAcademicYear);
    const form = useForm<CSVFormValues>({
        mode: "controlled",
        initialValues: {
            academicYear: academicYear,
            productId:
                productsByAcademicYear[academicYear]?.length > 0
                    ? productsByAcademicYear[academicYear][0].id.toString(10)
                    : "", // sometimes no products are defined
            csv: [],
        },
        validate: {
            productId: (value: string) => {
                if (typeof value !== "string" || value === "") return "Please select a product";
                return;
            },
        },
    });

    const selectedFiles = form.getValues().csv.map((file, index) => (
        <Badge key={file.name} style={{ textTransform: "none" }} variant="outline" size="md">
            <Group gap="sm">
                <span>
                    {file.name} ({(file.size / 1024).toFixed(2)} kb)
                </span>
                <CloseButton
                    size="xs"
                    color="blue"
                    onClick={() =>
                        form.setFieldValue(
                            "csv",
                            form.values.csv.filter((_, i) => i !== index),
                        )
                    }
                />
            </Group>
        </Badge>
    ));

    const formHandler = (values: CSVFormValues) => {
        const productId = parseInt(values.productId, 10);
        const academicYear = values.academicYear;
        if (!productId || !academicYear) {
            return;
        }

        if (values.csv.length === 0) {
            form.setFieldError("csv", "Please select a CSV file to import.");
            return;
        }

        if (!isValidAcademicYear(academicYear)) {
            form.setFieldError("academicYear", "Invalid academic year.");
            return;
        }

        console.log(academicYear);

        startTransition(async () => {
            const csvString = await values.csv[0].text();
            const filename = values.csv[0].name;
            const res = await importCsv(csvString, filename, productId, academicYear);
            setFormState(res);
        });
    };

    return (
        <form onSubmit={form.onSubmit(formHandler)}>
            <Stack gap="md">
                {formState.status === "success" ? (
                    <Alert color="green" icon={<FaCircleCheck />} title="Success">
                        {formState.message ?? "Data imported successfully"}
                    </Alert>
                ) : formState.status === "error" ? (
                    <Alert color="red" icon={<FaCircleXmark />} title="Error">
                        {formState.error}
                    </Alert>
                ) : null}
                <NativeSelect
                    label="Academic year"
                    name="academicYear"
                    key={form.key("academicYear")}
                    description="Import into this academic year (note: applies to new order IDs only)"
                    data={validAcademicYears}
                    required
                    {...form.getInputProps("academicYear")}
                />
                <NativeSelect
                    label="Product"
                    name="productId"
                    key={form.key("productId")}
                    description="Product to import the CSV into (variants will be detected from the data automatically). Product not showing? Add it in the Products page."
                    data={
                        productsByAcademicYear[form.getValues().academicYear]?.map((item) => ({
                            value: item.id.toString(10),
                            label: item.name,
                        })) ?? []
                    }
                    required
                    {...form.getInputProps("productId")}
                />
                {form.errors.csv && (
                    <Alert color="red" icon={<FaCircleXmark />} title="Error">
                        {form.errors.csv}
                    </Alert>
                )}

                <Dropzone
                    onDrop={(files) => form.setFieldValue("csv", files)}
                    onReject={() => form.setFieldError("csv", "Only CSVs are accepted.")}
                    maxSize={5 * 1024 ** 2}
                    accept={{
                        "text/csv": [".csv"],
                        "text/plain": [".csv"],
                        "application/vnd.ms-excel": [".csv"],
                    }}
                    maxFiles={1}
                >
                    <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: "none" }}>
                        <Dropzone.Accept>
                            <FaUpload
                                style={{
                                    width: rem(52),
                                    height: rem(52),
                                    color: "var(--mantine-color-blue-6)",
                                }}
                            />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <FaCircleXmark
                                style={{
                                    width: rem(52),
                                    height: rem(52),
                                    color: "var(--mantine-color-red-6)",
                                }}
                            />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <FaTable
                                style={{
                                    width: rem(52),
                                    height: rem(52),
                                    color: "var(--mantine-color-dimmed)",
                                }}
                            />
                        </Dropzone.Idle>

                        <div>
                            <Text size="xl" inline>
                                Drag CSV from eActivities&apos; Product Summary here or click to
                                select a file
                            </Text>
                            <Text size="sm" c="dimmed" inline mt={7}>
                                The CSV size should not exceed 5MB
                            </Text>
                        </div>
                    </Group>
                </Dropzone>
                {selectedFiles.length > 0 && (
                    <Stack gap="sm">
                        <Text>Selected files:</Text>
                        {selectedFiles}
                    </Stack>
                )}
                <Button
                    type="submit"
                    color="green"
                    leftSection={<FaDownload />}
                    loading={isPending}
                >
                    Import data
                </Button>
            </Stack>
        </form>
    );
};

export const CSVImport = ({
    academicYears,
    currentAcademicYear,
}: {
    academicYears: string[];
    currentAcademicYear: string;
}) => {
    const [opened, { open, close }] = useDisclosure(false);

    const { data } = useSWR<Record<string, RootItem[]>>("/api/products", fetcher);

    return (
        <>
            <Modal opened={opened} onClose={close} title="Import CSV" size="xl">
                <Stack>
                    <Alert
                        color="yellow"
                        title="Warning"
                        variant="light"
                        icon={<FaTriangleExclamation />}
                    >
                        Make sure you have selected the right product below before importing the CSV
                        - or you will need to rollback the import.
                    </Alert>
                    {!data ? (
                        <Stack gap="md">
                            <Center>
                                <Loader size={52} />
                            </Center>
                        </Stack>
                    ) : (
                        <CSVImportForm
                            academicYear={currentAcademicYear}
                            validAcademicYears={academicYears}
                            productsByAcademicYear={data}
                        />
                    )}
                </Stack>
            </Modal>

            <Button leftSection={<FaTable />} onClick={open}>
                Import data from CSV
            </Button>
        </>
    );
};
