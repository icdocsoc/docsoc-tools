import { Paper, MultiSelect, Group, Button } from "@mantine/core";
import React from "react";

export const PageActions = () => {
    return (
        <Paper p="lg" withBorder>
            <Group justify="space-between">
                <MultiSelect
                    label="Show purchases from academic years"
                    description=" "
                    defaultValue={["23-24"]}
                    data={["23-24", "24-25"]}
                />
                <Button>Import data from eActivities</Button>{" "}
            </Group>
        </Paper>
    );
};
