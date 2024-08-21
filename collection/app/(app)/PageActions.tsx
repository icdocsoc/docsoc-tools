import { AcademicYear } from "@docsoc/eactivities";
import { Paper, MultiSelect, Group } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";

import { CSVImport } from "./CSVImport";

export const PageActions = ({
    formHook,
    academicYears,
    currentAcademicYear,
}: {
    formHook: UseFormReturnType<{ academicYears: AcademicYear[]; shortcode: string }>;
    academicYears: string[];
    currentAcademicYear: string;
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
                <CSVImport
                    academicYears={academicYears}
                    currentAcademicYear={currentAcademicYear}
                />
            </Group>
        </Paper>
    );
};
