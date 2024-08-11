"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { useEnv } from "@/hooks/useEnv";
import { clearUsersForAcademicYear, loadCommitteeForCurrYear } from "@/lib/crud/committee";
import { Group, Tooltip, Button, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AcademicYear } from "common/eactivities/dist";
import { useSession } from "next-auth/react";
import React, {  useTransition } from "react";

export const UserActions = ({ academicYear }: { academicYear: AcademicYear }) => {
    const { data: session } = useSession();
    const [isPending, startTransition] = useTransition();

    const [opened, { open, close }] = useDisclosure(false);
    const env = useEnv();

    const isRoot = session?.user?.email && session?.user?.email === env?.rootUserEmail;
    return (
        <Group justify="flex-end">
            <ConfirmModal
                onConfirm={async () => {
                    await clearUsersForAcademicYear();
                } }
                confirmButtonText="Clear users"
                opened={opened}
                close={close}            >
                    <Text>Are you sure you want to clear all users for this academic year?</Text>
                    <Text>This will prevent committee members logging into the system.</Text>
                    <Text>This action cannot be undone.</Text>
            </ConfirmModal>
            <Tooltip label={`Load in committee as users for academic year ${academicYear}`}>
                <Button
                    loading={isPending}
                    onClick={() => {
                        startTransition(async () => {
                            // Load committee from eActivities
                            try {
                                await loadCommitteeForCurrYear();
                            } catch (e) {
                                console.error(e);
                            }
                        });
                    }}
                >
                    Load committee from eActivities
                </Button>
            </Tooltip>
            <Tooltip label={isRoot ? `Clear all users for academic year ${academicYear}` : `Login as ${env?.rootUserEmail || "the root user"} to clear users for this academic year`}>
                <Button color="red" disabled={!isRoot} onClick={() => open()}>Clear users</Button>
            </Tooltip>
        </Group>
    );
};
