import { ColorSchemeScript } from "@mantine/core";
import "@mantine/core/styles.css";

import { ClientWrapper } from "./ClientWrapper";
import "./global.css";

export const metadata = {
    title: "DoCSoc Collction",
    description: "App to track collections for DoCSoc",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <ColorSchemeScript />
            </head>
            <body>
                <ClientWrapper>{children}</ClientWrapper>
            </body>
        </html>
    );
}
