import { AcademicYear } from "@docsoc/eactivities";
import { Paper, MultiSelect, Group } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";

import { CSVImport } from "./CSVImport";
import { SyncEActivities } from "./SyncEActivities";

export const PageActions = ({
    formHook,
    academicYears,
    currentAcademicYear,
    setActionsError,
}: {
    formHook: UseFormReturnType<{ academicYears: AcademicYear[]; shortcode: string }>;
    academicYears: string[];
    currentAcademicYear: string;
    setActionsError: (error: string | null) => void;
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
                <Group>
                    <SyncEActivities
                        setActionsError={setActionsError}
                        academicYears={academicYears}
                        currentlySelectedAcademicYears={formHook.getValues().academicYears}
                    />
                    <CSVImport
                        academicYears={academicYears}
                        currentAcademicYear={currentAcademicYear}
                    />
                </Group>
            </Group>
        </Paper>
    );
};
