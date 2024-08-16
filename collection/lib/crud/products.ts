"use server";

import { RootItem } from "@prisma/client";

import prisma from "../db";

export const getProductsByAcademicYear = async (): Promise<Record<string, RootItem[]>> => {
    // group by res.academic year, just need name and id
    const res = await prisma.rootItem.findMany({
        select: {
            academicYear: true,
            id: true,
            name: true,
        },
    });

    const output: Record<string, RootItem[]> = {};
    for (const item of res) {
        if (output[item.academicYear] === undefined) {
            output[item.academicYear] = [];
        }
        output[item.academicYear].push(item);
    }

    return output;
};
