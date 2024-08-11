import { auth } from "@/auth";
import { getAcademicYear } from "@/lib/config";
import { getCommitteeMembers } from "@/lib/crud/committee";
import { Stack, Title, Text, Group, Button, Tooltip } from "@mantine/core";
import { redirect } from "next/navigation";

import { AcademicYear } from "./AcademicYear";
import { UserActions } from "./UserActions";
import { UsersTable } from "../../../components/tables/UsersTable";

export default async function Settings() {
    const session = await auth();

    if (!session) redirect("/auth/login");

    return (
        <Stack>
            <Title order={1}>Application Settings</Title>
            <Stack gap="lg">
                <Stack gap="xs">
                    <Title order={2}>Global Settings</Title>
                    <Text>Application wide settings that affect the data displayed & stored</Text>
                </Stack>
                <AcademicYear />
            </Stack>
            <Stack gap="lg">
                <Group justify="space-between">
                    <Stack gap="xs">
                        <Title order={2}>User Management</Title>
                        <Text>Manage your committee here</Text>
                    </Stack>
                    <UserActions academicYear={await getAcademicYear()} />
                </Group>
                <UsersTable users={await getCommitteeMembers(await getAcademicYear())} />
            </Stack>
        </Stack>
    );
}
