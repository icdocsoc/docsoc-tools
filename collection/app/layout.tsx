import { DEFAULT_COLOR_SCHEME } from "@/lib/constants";
import "@/styles/global.scss";
import { ColorSchemeScript } from "@mantine/core";
import "@mantine/core/styles.css";

import { ClientWrapper } from "./ClientWrapper";

export const metadata = {
    title: "DoCSoc Collction",
    description: "App to track collections for DoCSoc",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <ColorSchemeScript defaultColorScheme={DEFAULT_COLOR_SCHEME} />
            </head>
            <body>
                <ClientWrapper>{children}</ClientWrapper>
            </body>
        </html>
    );
}
