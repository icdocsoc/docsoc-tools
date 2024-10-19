"use client";

import { loadSalesFromEActivites } from "@/lib/crud/loadSalesFromEActivites";
import { Button } from "@mantine/core";
import React, { useTransition } from "react";
import { FaSync } from "react-icons/fa";

export const SyncEActivities = ({
    setActionsError,
}: {
    setActionsError: (error: string | null) => void;
}) => {
    const [isPending, startTransition] = useTransition();

    const syncEActivities = () => {
        setActionsError(null);
        startTransition(async () => {
            const res = await loadSalesFromEActivites();
            if (res.status === "error") {
                setActionsError(res.error);
            }
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
