"use client";

import DoCSocBannerSvg from "@/public/docsoc-banner.svg";
import { useMantineTheme } from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import React, { ComponentProps } from "react";

export const DoCSocBanner = (props: ComponentProps<typeof DoCSocBannerSvg>) => {
    const theme = useMantineTheme();
    const lightDark = useColorScheme();

    return <DoCSocBannerSvg fill={lightDark === "dark" ? theme.white : theme.black} {...props} />;
};
