"use client";

import { Alert, Button, Group, Modal, NativeSelect, rem, Stack, Text } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import "@mantine/dropzone/styles.css";
import { useDisclosure } from "@mantine/hooks";
import React from "react";
import {
    FaCircleXmark,
    FaDownload,
    FaTable,
    FaTriangleExclamation,
    FaUpload,
} from "react-icons/fa6";

export const CSVImport = () => {
    const [opened, { open, close }] = useDisclosure(false);

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
                    <form>
                        <Stack gap="xl">
                            <NativeSelect
                                label="Product"
                                name="productId"
                                //key={form.key("academicYear")}
                                description="Product to import the CSV into (variants will be detected from the data automatically)"
                                data={["Product 1", "Product 2", "Product 3"]}
                                defaultValue={""}
                                required
                                //{...form.getInputProps("academicYear")}
                            />

                            <Dropzone
                                onDrop={(files) => console.log("accepted files", files)}
                                onReject={(files) => console.log("rejected files", files)}
                                maxSize={5 * 1024 ** 2}
                                accept={["text/csv"]}
                                maxFiles={1}
                            >
                                <Group
                                    justify="center"
                                    gap="xl"
                                    mih={220}
                                    style={{ pointerEvents: "none" }}
                                >
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
                                            Drag CSV from eActivites&apos; Product Summary here or
                                            click to select a file
                                        </Text>
                                        <Text size="sm" c="dimmed" inline mt={7}>
                                            The CSV size should not exceed 5MB
                                        </Text>
                                    </div>
                                </Group>
                            </Dropzone>
                            <Button type="submit" color="green" leftSection={<FaDownload />}>
                                Import data
                            </Button>
                        </Stack>
                    </form>
                </Stack>
            </Modal>

            <Button leftSection={<FaTable />} onClick={open}>
                Import data from CSV
            </Button>
        </>
    );
};
