"use client";

import DoCSocBannerSvg from "@/public/docsoc-banner.svg";
import { useComputedColorScheme, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import React, { ComponentProps } from "react";

export const DoCSocBanner = (props: ComponentProps<typeof DoCSocBannerSvg>) => {
    const theme = useMantineTheme();
    const computedColorScheme = useComputedColorScheme("light");

    return (
        <DoCSocBannerSvg
            fill={computedColorScheme === "dark" ? theme.white : theme.colors["docsoc"][6]}
            {...props}
        />
    );
};
