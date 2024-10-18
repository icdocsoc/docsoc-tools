"use server";

import { auth } from "@/auth";
import { revalidatePath, revalidateTag } from "next/cache";

import prisma from "../db";

export interface OrderResponse {
    orderIDInternal: number;
    orderNoShop: number;
    date: Date;

    items: {
        id: number;
        name: string;
        variant: string;
        collected: boolean;
        quantity: number;
    }[];
}

export type GetPurchasesReturn =
    | {
          status: "success";
          orders: OrderResponse[];
      }
    | { status: "error"; message: string };
export const getPurchasesByShortcode = async (
    shortcode: string,
    academicYears: string[],
): Promise<GetPurchasesReturn> => {
    const student = await prisma.imperialStudent.findFirst({
        where: {
            shortcode: shortcode,
        },
        include: {
            Order: {
                include: {
                    OrderItem: {
                        include: {
                            Variant: {
                                include: {
                                    RootItem: true,
                                },
                            },
                        },
                    },
                },
                where: {
                    academicYear: {
                        in: academicYears,
                    },
                },
            },
        },
    });

    if (!student) {
        return {
            status: "error",
            message: "Student not found",
        };
    }

    // Map to interface
    const flatOrderedItems: OrderResponse[] = student.Order.flatMap((order) => {
        return {
            orderIDInternal: order.id,
            orderNoShop: order.orderNo,
            date: order.orderDate,
            items: order.OrderItem.map((orderItem) => {
                return {
                    name: orderItem.Variant.RootItem.name,
                    variant: orderItem.Variant.variantName,
                    collected: orderItem.collected,
                    id: orderItem.id,
                    quantity: orderItem.quantity,
                };
            }),
        };
    });

    return {
        status: "success",
        orders: flatOrderedItems,
    };
};

export const markCollection = async (
    orderNo: number,
    itemID: number,
    collected: boolean,
    shortcode: string,
) => {
    // Action so auth needed
    const session = await auth();

    if (!session) {
        throw new Error("Unauthorized");
    }

    await prisma.orderItem.update({
        where: {
            id: itemID,
            Order: {
                orderNo: orderNo,
            },
        },
        data: {
            collected: collected,
        },
    });

    revalidateTag(`purchases:${shortcode}`);
};
