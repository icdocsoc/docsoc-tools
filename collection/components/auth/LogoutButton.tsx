"use client";

import { Button } from "@mantine/core";
import { signOut } from "next-auth/react";
import React from "react";

export const LogoutButton = () => {
    return <Button onClick={() => signOut()}>Logout</Button>;
};
