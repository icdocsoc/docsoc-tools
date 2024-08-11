import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { BuyerItemsTable } from "@/components/tables/BuyerItemsTable";
import { Stack, Title } from "@mantine/core";
import { redirect } from "next/navigation";
import React from "react";

import styles from "./page.module.scss";

export default async function Index() {
    const session = await auth();

    if (!session) redirect("/auth/login");

    return (
        <Stack gap="lg">
            <Title order={1}>DoCSoc Collection System</Title>
            <BuyerItemsTable purchases={[]} />
        </Stack>
    );
}
