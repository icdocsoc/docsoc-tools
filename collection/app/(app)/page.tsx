import { auth } from "@/auth";
import { Stack, Title } from "@mantine/core";
import { redirect } from "next/navigation";
import React from "react";

import { CollectionsArea } from "./CollectionsArea";

export default async function Index() {
    const session = await auth();

    if (!session) redirect("/auth/login");

    return (
        <Stack gap="lg">
            <Title order={1}>DoCSoc Collection System</Title>
            <CollectionsArea />
        </Stack>
    );
}
