"use client"

import { getRootUserEmail } from "@/lib/env";
import { useEffect, useState } from "react";

interface Environment {
    rootUserEmail?: string;
}

export function useEnv(): Environment {
    const [rootUserEmail, setRootUserEmail] = useState<string | undefined>(undefined);

    useEffect(() => {
        getRootUserEmail().then(setRootUserEmail);
    }, []);

    return {
        rootUserEmail,
    };
}