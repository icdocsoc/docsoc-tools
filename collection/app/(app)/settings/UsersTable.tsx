"use client";

import TanstackTable from "@/components/tables/TanStackTable";
import { createColumnHelper } from "@tanstack/react-table";
import React from "react";

type UserRow = {
    id: number;
    firstName: string;
    surname: string;
    email: string;
    shortcode: string;
    position: string;
};

const columnHelper = createColumnHelper<UserRow>();
const columns = [
    columnHelper.accessor("firstName", {
        cell: (info) => info.getValue(),
        header: "First Name",
        id: "firstName",
        sortingFn: "alphanumeric",
    }),
    columnHelper.accessor("surname", {
        cell: (info) => info.getValue(),
        header: "Surname",
        id: "surname",
        sortingFn: "alphanumeric",
    }),
    columnHelper.accessor("shortcode", {
        cell: (info) => info.getValue(),
        header: "Shortcode",
        id: "shortcode",
        sortingFn: "alphanumeric",
    }),
    columnHelper.accessor("position", {
        cell: (info) => info.getValue(),
        header: "Position",
        id: "position",
        sortingFn: "alphanumeric",
    }),
];

const data: UserRow[] = [
    {
        id: 1,
        firstName: "Kishan",
        surname: "Sambhi",
        email: "kss22@ic.ac.uk",
        shortcode: "kss22",
        position: "Vice President",
    },
];

export const UsersTable = () => {
    return <TanstackTable columns={columns} data={data} enablePagination={false} />;
};
