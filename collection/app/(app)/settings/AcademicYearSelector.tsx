"use client";

import { Button, Group, Select } from "@mantine/core";
import React from "react";

/**
 * DANGEROUS selector of the current academic year
 *
 * This component is used to select the current academic year.
 * It saved the academic year in the database - which by extension affects the entire application.
 *
 * By changing the academic year, only the items that are relevant to the academic year will be displayed.
 * Additionally, only users who are committee members during the selected academic year will be displayed.
 */
export const AcademicYearSelector = () => {
    return (
        <Group>
            <Select
                // label="Academic Year"
                // description="Set the current academic year"
                data={["23-24"]}
                defaultValue={"23-24"}
                width="lg"
                inputContainer={(children) => (
                    <Group align="flex-start">
                        {children}
                        <Button color="green">Change Year</Button>
                    </Group>
                )}
            />
        </Group>
    );
};
