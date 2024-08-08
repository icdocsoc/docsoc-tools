"use client";

/**
 * Wrap the page in everything needed for client-side rendering.
 */
import { MantineProvider, createTheme, MantineColorsTuple } from "@mantine/core";
import React from "react";

const docsoc: MantineColorsTuple = [
    "#eef4fb",
    "#dde6f1",
    "#b5cae4",
    "#8badd8",
    "#6995cf",
    "#5386c9",
    "#477fc7",
    "#396cb1",
    "#2f609e",
    "#21538c",
];

const theme = createTheme({
    colors: {
        docsoc,
    },
    primaryColor: "docsoc",
});

export const ClientWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <MantineProvider theme={theme}>{children}</MantineProvider>;
};
