import { auth } from "@/auth";
import { Stack, Title, Text } from "@mantine/core";
import { redirect } from "next/navigation";

export default async function UserManagement() {
    const session = await auth();

    if (!session) redirect("/auth/login");

    return (
        <Stack>
            <Stack gap="xs">
                <Title order={1}>User Management</Title>
                <Text>Manage your committee here</Text>
            </Stack>
        </Stack>
    );
}
