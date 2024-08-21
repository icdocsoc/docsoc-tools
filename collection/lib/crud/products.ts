"use server";

import { isValidAcademicYear } from "@docsoc/eactivities";
import { RootItem } from "@prisma/client";
import { revalidatePath } from "next/cache";

import prisma from "../db";
import { StatusReturn } from "../types";

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

export async function getProductsAndVariantByAcademicYearWithCounts(): Promise<
    ProductsAndVariantsByAcademicYear[]
> {
    return await prisma.academicYear.findMany({
        select: {
            year: true,
            RootItem: {
                select: {
                    id: true,
                    name: true,
                    Variant: {
                        select: {
                            id: true,
                            variantName: true,
                            _count: {
                                select: {
                                    OrderItem: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export interface ProductsAndVariantsByAcademicYear {
    year: string;
    RootItem: {
        id: number;
        name: string;
        Variant: {
            id: number;
            variantName: string;
            _count: {
                OrderItem: number;
            };
        }[];
    }[];
}

export async function addProducts(academicYear: string, products: string[]): Promise<StatusReturn> {
    if (products.length === 0) {
        return {
            status: "error",
            error: "No products provided",
        };
    }

    if (!isValidAcademicYear(academicYear)) {
        return {
            status: "error",
            error: "Invalid academic year",
        };
    }

    try {
        await prisma.rootItem.createMany({
            data: products
                .map((product) => product.trim())
                .filter((product) => product !== "")
                .map((product) => ({
                    academicYear,
                    name: product,
                })),
        });
    } catch (e: any) {
        if (e?.code === "P2002" && e?.meta?.target?.includes("name")) {
            return {
                status: "error",
                error: "Product already exists",
            };
        } else {
            return {
                status: "error",
                error: e.message ?? e.toString(),
            };
        }
    }

    revalidatePath("/products");
    revalidatePath("/");

    return {
        status: "success",
    };
}

export async function deleteProduct(productId: number): Promise<StatusReturn> {
    try {
        await prisma.rootItem.delete({
            where: {
                id: productId,
            },
        });
    } catch (e: any) {
        return {
            status: "error",
            error: e.message ?? e.toString(),
        };
    }

    revalidatePath("/products");
    revalidatePath("/");

    return {
        status: "success",
    };
}
