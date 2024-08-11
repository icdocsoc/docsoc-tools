"use client";

import { DoCSocBanner } from "@/components/DoCSocBanner";
import { LogoutButton } from "@/components/auth/LogoutButton";
import {
    AppShell,
    Box,
    Burger,
    Button,
    Container,
    Group,
    NavLink,
    Switch,
    useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { FaMoon, FaSun } from "react-icons/fa6";

// From https://mantine.dev/app-shell/?e=MobileNavbar&s=code

const LinkTo = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const pathname = usePathname();
    return (
        <Button component={Link} href={href} variant={pathname === href ? "light" : "subtle"}>
            {children}
        </Button>
    );
};

export function DoCSocAppShell({ children }: { children: React.ReactNode }) {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const [opened, { toggle }] = useDisclosure();

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 300, breakpoint: "sm", collapsed: { desktop: true, mobile: !opened } }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                    <Group justify="space-between" style={{ flex: 1 }}>
                        <DoCSocBanner width="4em" />
                        <Group ml="xl" gap={5} visibleFrom="sm" wrap="nowrap">
                            <LinkTo href="/">Home</LinkTo>
                            <LinkTo href="/settings">Settings</LinkTo>
                            <LinkTo href="/products">Products</LinkTo>
                            <LogoutButton />
                            <Group ml="lg">
                                <FaSun />
                                <Switch
                                    checked={colorScheme === "dark"}
                                    onChange={() => toggleColorScheme()}
                                />
                                <FaMoon />
                            </Group>
                        </Group>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar py="md" px={4}>
                <NavLink href="/" label="Home" />
                <NavLink href="/settings" label="Settings" />
                <NavLink href="/products" label="Products" />
                <Container mt="lg">
                    <LogoutButton />
                </Container>
            </AppShell.Navbar>

            <AppShell.Main>
                <Container size="xl">{children}</Container>
            </AppShell.Main>
        </AppShell>
    );
}

export default DoCSocAppShell;
