import { auth } from "@/auth";
import { getAcademicYear } from "@/lib/config";
import { Stack, Title } from "@mantine/core";
import { redirect } from "next/navigation";
import React from "react";

import { UserSearch } from "./UserSearch";
import { getAcademicYearsInDB } from "@/lib/crud/academic-year";

export default async function Index() {
    const session = await auth();

    if (!session) redirect("/auth/login");

    // Get academic years
    const currentAcademicYear = await getAcademicYear();
    const academicYears = await getAcademicYearsInDB();

    return (
        <Stack gap="lg">
            <Title order={1}>DoCSoc Collection System</Title>
            <UserSearch
                currentAcademicYear={currentAcademicYear}
                validAcaemicYears={academicYears}
            />
        </Stack>
    );
}
