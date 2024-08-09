import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { redirect } from "next/navigation";

import styles from "./page.module.scss";

export default async function Index() {
    const session = await auth();

    if (!session) redirect("/auth/login");

    return (
        <div className={styles.page}>
            <LogoutButton />
        </div>
    );
}
