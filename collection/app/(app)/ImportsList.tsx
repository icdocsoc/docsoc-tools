"use client";

import { Accordion, Paper, Stack, Title } from "@mantine/core";
import { OrderItemImport } from "@prisma/client";
import React from "react";

interface ImportsListProps {
    imports: OrderItemImport[];
}

export const ImportsList: React.FC<ImportsListProps> = ({ imports }) => {
    return (
        <Paper p="lg" withBorder mt="xl">
            <Stack>
                <Title order={3}>Previous Imports</Title>
                <Accordion>
                    {imports.map((importItem, index) => (
                        <Accordion.Item key={index} value={importItem.id}>
                            <Accordion.Control>{importItem.name}</Accordion.Control>
                            <Accordion.Panel>
                                <div>{importItem.name}</div>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </Stack>
        </Paper>
    );
};
