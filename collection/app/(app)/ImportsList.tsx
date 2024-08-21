"use client";

import { ImportTable } from "@/components/tables/ImportTable";
import { ImportList } from "@/lib/crud/importCsv";
import { Accordion, Badge, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import React from "react";
import { FaUndo } from "react-icons/fa";

interface ImportsListProps {
    imports: ImportList;
}

export const ImportsList: React.FC<ImportsListProps> = ({ imports }) => {
    return (
        <Paper p="lg" withBorder mt="xl">
            <Stack>
                <Title order={3}>Previous Imports</Title>
                <Accordion>
                    {imports.map((importItem, index) => (
                        <Accordion.Item key={index} value={importItem.id}>
                            <Accordion.Control>
                                <Group justify="space-between" mr="md">
                                    <Text>{importItem.name}</Text>
                                    <Badge color="blue">{importItem._count.OrderItem}</Badge>
                                </Group>
                            </Accordion.Control>
                            <Accordion.Panel pl="md" pr="md">
                                <Stack gap="xl">
                                    <Paper p="md" withBorder>
                                        <Group justify="space-between">
                                            <Title order={5}>Actions</Title>
                                            <Group>
                                                <Button
                                                    color="red"
                                                    variant="outline"
                                                    leftSection={<FaUndo />}
                                                >
                                                    Rollback Import
                                                </Button>
                                            </Group>
                                        </Group>
                                    </Paper>
                                    <ImportTable importId={importItem.id} />
                                </Stack>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </Stack>
        </Paper>
    );
};
