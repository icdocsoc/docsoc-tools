"use client";

import { loadCommitteeForCurrYear } from "@/lib/crud/committee";
import { Group, Tooltip, Button } from "@mantine/core";
import { AcademicYear } from "common/eactivities/dist";
import React, { useTransition } from "react";

export const UserActions = ({ academicYear }: { academicYear: AcademicYear }) => {
    const [isPending, startTransition] = useTransition();
    return (
        <Group justify="flex-end">
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
            <Tooltip label={`Clear all users for academic year ${academicYear}`}>
                <Button color="red">Clear users</Button>
            </Tooltip>
        </Group>
    );
};
