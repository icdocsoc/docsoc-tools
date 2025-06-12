"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { ImportTable } from "@/components/tables/ImportTable";
import { ImportList, rollbackImport } from "@/lib/crud/importCsv";
import { Accordion, Badge, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useState } from "react";
import { FaUndo } from "react-icons/fa";

interface ImportsListProps {
    imports: ImportList;
}

const ImportItem: React.FC<{ importItem: ImportList[0] }> = ({ importItem }) => {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <Stack gap="xl">
            <Paper p="md" withBorder mt="md">
                <ConfirmModal
                    onConfirm={async () => {
                        await rollbackImport(importItem.id);
                    }}
                    confirmButtonText={`Rollback Import`}
                    opened={opened}
                    close={close}
                >
                    <Text>
                        This will delete all <strong>{importItem._count.OrderItem}</strong> items
                        imported in the import <strong>{importItem.name}</strong>!
                    </Text>
                    <Text>This action cannot be undone. Are you sure you want to proceed?</Text>
                </ConfirmModal>
                <Group justify="space-between">
                    <Title order={5}>Actions</Title>
                    <Group>
                        <Button
                            color="red"
                            variant="outline"
                            leftSection={<FaUndo />}
                            onClick={open}
                        >
                            Rollback Import
                        </Button>
                    </Group>
                </Group>
            </Paper>
            <ImportTable importId={importItem.id} />
        </Stack>
    );
};

export const ImportsList: React.FC<ImportsListProps> = ({ imports }) => {
    const [currentlyOpen, setCurrentlyOpen] = useState<string | null>("");

    return (
        <Paper p="lg" withBorder mt="xl">
            <Stack>
                <Title order={3}>Previous Imports</Title>

                <Accordion onChange={setCurrentlyOpen}>
                    {imports.map((importItem, index) => (
                        <Accordion.Item key={index} value={importItem.id}>
                            <Accordion.Control>
                                <Group justify="space-between" mr="md">
                                    <Text>{importItem.name}</Text>
                                    <Badge color="blue">{importItem._count.OrderItem}</Badge>
                                </Group>
                            </Accordion.Control>
                            <Accordion.Panel pl="md" pr="md">
                                {currentlyOpen === importItem.id && (
                                    <ImportItem importItem={importItem} />
                                )}
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </Stack>
        </Paper>
    );
};
