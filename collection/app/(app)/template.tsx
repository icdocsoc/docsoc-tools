import React from "react";

import DoCSocAppShell from "./AppShell";

export const template = ({ children }: { children: React.ReactNode }) => {
    return <DoCSocAppShell>{children}</DoCSocAppShell>;
};

export default template;
