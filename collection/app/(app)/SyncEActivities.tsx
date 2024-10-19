"use client";

import { loadSalesFromEActivites } from "@/lib/crud/loadSalesFromEActivites";
import { Button } from "@mantine/core";
import React, { useTransition } from "react";
import { FaSync } from "react-icons/fa";

export const SyncEActivities = () => {
    const [isPending, startTransition] = useTransition();

    const syncEActivities = () => {
        startTransition(async () => {
            await loadSalesFromEActivites();
        });
    };

    return (
        <Button
            leftSection={<FaSync />}
            color="violet"
            loading={isPending}
            onClick={syncEActivities}
        >
            Sync from eActivities
        </Button>
    );
};
