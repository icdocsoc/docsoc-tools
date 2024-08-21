import { auth } from "@/auth";
import { Title } from "@mantine/core";
import { redirect } from "next/navigation";
import React from "react";

import styles from "./page.module.scss";

export default async function Index() {
    const session = await auth();

    if (!session) redirect("/auth/login");

    return (
        <div className={styles.page}>
            <Title order={1}>DoCSoc</Title>
        </div>
    );
}
