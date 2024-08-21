"use server";

import { AcademicYear } from "@docsoc/eactivities";
import { createLogger } from "@docsoc/util";
import { OrderItemImport } from "@prisma/client";
import { parse } from "csv-parse";
import { revalidatePath, revalidateTag } from "next/cache";

import prisma from "../db";
import { StatusReturn } from "../types";

const logger = createLogger("collection.importCsv");

async function importFile(
    fileContents: string,
    fileName: string,
    itemId: number,
    academicYear: AcademicYear,
) {
    logger.info("Importing file for: ", itemId);

    const iter = parse(fileContents, {
        columns: true,
    });

    // 0: Prep academic year
    const academicYearDB = await prisma.academicYear.upsert({
        where: {
            year: academicYear,
        },
        update: {},
        create: {
            year: academicYear,
        },
    });

    const academicYearReference = academicYearDB.year;

    // 0.1: Create import
    // Name: <csv file name> DD/MM/YYYY HH:MM
    const importName = `${fileName} @ ${new Date().toLocaleString("en-GB")}`;
    const importItem = await prisma.orderItemImport.create({
        data: {
            name: importName,
        },
    });

    for await (const record of iter) {
        logger.debug(`Record: ${JSON.stringify(record)}`);

        // 1: If user exists, get user
        const user = await prisma.imperialStudent.upsert({
            where: {
                shortcode: record["Login"],
            },
            update: {
                cid: record["CID/Card Number"],
                firstName: record["First Name"],
                lastName: record["Surname"],
                email: record["Email"],
            },
            create: {
                cid: record["CID/Card Number"],
                shortcode: record["Login"],
                firstName: record["First Name"],
                lastName: record["Surname"],
                email: record["Email"],
            },
        });

        // 2: Create order
        // If already exists, skip
        const orderNo = parseInt(record["Order No"]);
        const dateString = record["Date"];
        const [day, month, year] = dateString.split("/");
        const isoDateString = `${year}-${month}-${day}`;
        const date = new Date(isoDateString);
        const order = await prisma.order.upsert({
            where: {
                orderNo: orderNo,
            },
            update: {},
            create: {
                orderDate: date,
                orderNo: orderNo,
                academicYearReference: {
                    connect: {
                        year: academicYearReference,
                    },
                },
                ImperialStudent: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        });

        // 3: Create variant if needed
        const variant = record["Product Name"];
        const quantity = parseInt(record["Quantity"]);

        const varientDB = await prisma.variant.upsert({
            where: {
                variantName_rootItemId: {
                    rootItemId: itemId,
                    variantName: variant,
                },
            },
            update: {},
            create: {
                variantName: variant,
                RootItem: {
                    connect: {
                        id: itemId,
                    },
                },
            },
        });

        // Add order item
        // kip if this orderId already exists for this user & variant
        if (
            await prisma.orderItem.findFirst({
                where: {
                    orderId: order.id,
                    variantId: varientDB.id,
                },
            })
        ) {
            continue;
        }

        // Else, create order item
        await prisma.orderItem.create({
            data: {
                orderId: order.id,
                variantId: varientDB.id,
                quantity: quantity,
                collected: false,
                importId: importItem.id,
            },
        });
    }
}
export interface CSVFormValues {
    csv: File[];
    productId: string;
    academicYear: string;
}

export async function importCsv(
    fileContents: string,
    fileName: string,
    productId: number,
    academicYear: AcademicYear,
): Promise<StatusReturn> {
    const product = await prisma.rootItem.findUnique({
        where: {
            id: productId,
        },
    });

    try {
        await importFile(fileContents, fileName, productId, academicYear);
    } catch (e: any) {
        return {
            status: "error",
            error: e.message ?? e.toString(),
        };
    }

    revalidatePath("/");
    revalidateTag("purchases:*");

    return {
        status: "success",
        message: `Data imported for ${product?.name} in ${academicYear}`,
    };
}

export async function getImportList() {
    return prisma.orderItemImport.findMany({
        orderBy: {
            date: "asc",
        },
        select: {
            id: true,
            name: true,
            date: true,
            _count: {
                select: {
                    OrderItem: true,
                },
            },
        },
    });
}

export type ImportList = Awaited<ReturnType<typeof getImportList>>;

export async function getItemsInImport(importId: string) {
    return prisma.orderItemImport.findUnique({
        where: {
            id: importId,
        },
        include: {
            OrderItem: {
                select: {
                    quantity: true,
                    Variant: {
                        select: {
                            variantName: true,
                            RootItem: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    Order: {
                        select: {
                            orderNo: true,
                            orderDate: true,
                            ImperialStudent: {
                                select: {
                                    shortcode: true,
                                },
                            },
                            academicYear: true,
                        },
                    },
                },
            },
        },
    });
}

export interface ImportItemList extends OrderItemImport {
    OrderItem: {
        quantity: number;
        Variant: {
            variantName: string;
            RootItem: {
                name: string;
            };
        };
        Order: {
            orderNo: number;
            orderDate: Date;
            ImperialStudent: {
                shortcode: string;
            };
            academicYear: string;
        };
    }[];
}

export async function rollbackImport(importId: string) {
    if (!importId || typeof importId !== "string") {
        return {
            status: "error",
            error: "No import ID provided",
        };
    }

    await prisma.orderItemImport.delete({
        where: {
            id: importId,
        },
    });

    revalidatePath("/");
    revalidateTag("purchases:*");
}
