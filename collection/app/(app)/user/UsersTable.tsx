"use client";

import TanstackTable from "@/components/tables/TanStackTable";
import { createColumnHelper } from "@tanstack/react-table";
import React from "react";

type UserRow = {
    id: number;
    name: string;
    email: string;
};

const columnHelper = createColumnHelper<UserRow>();
const columns = [
    columnHelper.accessor("name", {
        cell: (info) => info.getValue(),
        header: "Name",
        id: "name",
        sortingFn: "alphanumeric",
    }),
    columnHelper.accessor("email", {
        cell: (info) => info.getValue(),
        header: "Email",
        id: "email",
        sortingFn: "alphanumeric",
    }),
];

const data: UserRow[] = [
    { id: 1, name: "Alice", email: "alice@docsoc.co.uk" },
    {
        id: 2,
        name: "Bob",
        email: "bob@docsoc.ic.ac.uk",
    },
];

export const UsersTable = () => {
    return <TanstackTable columns={columns} data={data} />;
};
