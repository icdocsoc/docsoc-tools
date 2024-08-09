"use client";

import { DoCSocBanner } from "@/components/DoCSocBanner";
import { AppShell, Burger, Button, Container, Group, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

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
                            <LinkTo href="/user">User Management</LinkTo>
                            <LinkTo href="/products">Products</LinkTo>
                        </Group>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar py="md" px={4}>
                <NavLink href="/" label="Home" />
                <NavLink href="/user" label="User Management" />
                <NavLink href="/products" label="Products" />
            </AppShell.Navbar>

            <AppShell.Main>
                <Container size="xl">{children}</Container>
            </AppShell.Main>
        </AppShell>
    );
}

export default DoCSocAppShell;
