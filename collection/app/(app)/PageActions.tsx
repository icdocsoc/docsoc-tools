import { AcademicYear } from "@docsoc/eactivities";
import { Paper, MultiSelect, Group } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import React, { Suspense } from "react";

import { CSVImport } from "./CSVImport";

export const PageActions = ({
    formHook,
    academicYears,
}: {
    formHook: UseFormReturnType<{ academicYears: AcademicYear[]; shortcode: string }>;
    academicYears: string[];
}) => {
    return (
        <Paper p="lg" withBorder>
            <Group justify="space-between">
                <MultiSelect
                    label="Show purchases from academic years"
                    description=" "
                    key={formHook.key("academicYears")}
                    data={academicYears}
                    {...formHook.getInputProps("academicYears")}
                />
                <CSVImport />
            </Group>
        </Paper>
    );
};
