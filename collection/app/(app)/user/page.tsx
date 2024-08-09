import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { redirect } from "next/navigation";

export default async function UserManagement() {
    const session = await auth();

    if (!session) redirect("/auth/login");

    return <LogoutButton />;
}
