import { auth } from "@/auth";
import { Stack, Title, Group, Select } from "@mantine/core";
import { redirect } from "next/navigation";

import { UsersTable } from "./UsersTable";

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
                <Group>
                    <Select
                        label="Academic Year"
                        description="Set the current academic year"
                        data={["23-24"]}
                    />
                </Group>
            </Stack>
            <Stack gap="lg">
                <Stack gap="xs">
                    <Title order={2}>User Management</Title>
                    <Text>Manage your committee here</Text>
                </Stack>
                <UsersTable />
            </Stack>
        </Stack>
    );
}
