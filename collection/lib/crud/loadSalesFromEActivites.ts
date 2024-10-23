"use server";

import { auth } from "@/auth";
import { isValidAcademicYear, Sale } from "@docsoc/eactivities";
import { createLogger } from "@docsoc/util";
import { RootItem } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";

import prisma from "../db";
import getEactivities from "../eactivites";
import { StatusReturn } from "../types";

const logger = createLogger("collection.syncEActivities");

/**
 * Sync all sales from eActivities that we can find
 *
 * TODO: Reduce requests to the API.
 */
export async function loadSalesFromEActivites(
    productIdsFromDB: number[] = [],
    academicYearsToSync: string[],
): Promise<StatusReturn> {
    // Action so auth needed
    const session = await auth();

    if (!session) {
        return {
            status: "error",
            error: "Unauthorized",
        };
    }

    // Validate academic years
    if (!academicYearsToSync.every(isValidAcademicYear)) {
        return {
            status: "error",
            error: "Invalid academic year in list to sync",
        };
    }

    const eActivities = await getEactivities();

    // 1: Find all products that have an eActivities ID
    let products: RootItem[];

    if (productIdsFromDB.length > 0) {
        products = await prisma.rootItem.findMany({
            where: {
                AND: {
                    eActivitiesId: {
                        not: null,
                    },
                    id: {
                        in: productIdsFromDB,
                    },
                },
            },
        });
    } else {
        products = await prisma.rootItem.findMany({
            where: {
                eActivitiesId: {
                    not: null,
                },
            },
        });
    }

    // 2: Fetch all sales for the academic years in question
    // Doing simultaneously is tempting but would probably hit the API rate limit
    const allSales: Sale[] = [];
    for (const academicYear of academicYearsToSync) {
        let salesReq: Awaited<ReturnType<typeof eActivities.getAllSales>>;
        try {
            salesReq = await eActivities.getAllSales(undefined, academicYear);
            allSales.push(...salesReq.data);
        } catch (e) {
            if (axios.isAxiosError(e)) {
                const message = e.response?.data?.Message ?? e?.message ?? e?.toString();
                return {
                    status: "error",
                    error: `Failed to fetch sales for academic year ${academicYear} - ${message}.`,
                };
            } else {
                return {
                    status: "error",
                    error: `Failed to fetch sales for academic year ${academicYear} - ${e?.toString()}.`,
                };
            }
        }
    }

    // 0.1: Create import
    // Name: <csv file name> DD/MM/YYYY HH:MM
    const importName = `eActivities @ ${new Date().toLocaleString("en-GB")}`;
    const importItem = await prisma.orderItemImport.create({
        data: {
            name: importName,
        },
    });

    revalidatePath("/"); // so it shows up

    // 2: For each product, fetch the sales from eActivities & insert
    for (const product of products) {
        // 2.1: Fetch the sales from eActivities
        if (typeof product.eActivitiesId !== "number") {
            logger.warn(`Product ${product.id} has an invalid eActivities ID, so skipping!`);
        }

        // Filter out sales
        const sales = allSales.filter((sale) => sale.ProductID === product.eActivitiesId);
        if (sales.length === 0) {
            logger.warn(`No sales found for product ${product.name} id ${product.id} - skipping`);
            continue;
        }

        // If length of sales === number of sales for product, skip
        const existingSales = await prisma.variant.findMany({
            select: {
                _count: {
                    select: {
                        OrderItem: true,
                    },
                },
            },
            where: {
                rootItemId: product.id,
            },
        });

        const existingSalesCount = existingSales.reduce(
            (acc, curr) => acc + curr._count.OrderItem,
            0,
        );

        if (existingSalesCount === sales.length) {
            logger.warn(
                `All sales for product ${product.name} id ${product.id} already imported, skipping. (${existingSalesCount} sales already imported)`,
            );
            continue;
        }

        // Pull product data as well
        let productData: Awaited<ReturnType<typeof eActivities.getProductById>>;
        try {
            productData = await eActivities.getProductById(
                undefined,
                product.eActivitiesId as number,
            );
        } catch (e) {
            if (axios.isAxiosError(e)) {
                const message = e.response?.data?.Message ?? e?.message ?? e?.toString();
                return {
                    status: "error",
                    error: `Failed to fetch sales for product ${product.id} - ${message}. Any imports up to this point have been preserved.`,
                };
            } else {
                return {
                    status: "error",
                    error: `Failed to fetch sales for product ${
                        product.id
                    } - ${e?.toString()}. Any imports up to this point have been preserved.`,
                };
            }
        }

        if (productData.status !== 200) {
            return {
                status: "error",
                error: `Failed to fetch product data for product ${product.id}: ${productData.status} with ${productData.statusText}`,
            };
        }
        // 2.2: Insert the sales into the database
        for (const sale of sales) {
            // 1: If user exists, get user
            const user = await prisma.imperialStudent.upsert({
                where: {
                    shortcode: sale.Customer.Login,
                },
                update: {
                    cid: sale.Customer.CID,
                    firstName: sale.Customer.FirstName,
                    lastName: sale.Customer.Surname,
                    email: sale.Customer.Email,
                },
                create: {
                    cid: sale.Customer.CID,
                    shortcode: sale.Customer.Login,
                    firstName: sale.Customer.FirstName,
                    lastName: sale.Customer.Surname,
                    email: sale.Customer.Email,
                },
            });

            // 2: Create order
            const order = await prisma.order.upsert({
                where: {
                    orderNo: parseInt(sale.OrderNumber, 10),
                },
                update: {},
                create: {
                    orderDate: new Date(sale.SaleDateTime),
                    orderNo: parseInt(sale.OrderNumber, 10),
                    academicYearReference: {
                        connect: {
                            year: product.academicYear,
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
            const variantID = sale.ProductLineID;

            // Find variant in product data
            const variant = productData.data.ProductLines.find(
                (line) => line.ID === variantID,
            )?.Name;

            if (!variant) {
                logger.warn(
                    `Variant ${variantID} not found in product data for product ${product.id}`,
                );
                continue;
            }
            const quantity = sale.Quantity;

            const varientDB = await prisma.variant.upsert({
                where: {
                    variantName_rootItemId: {
                        rootItemId: product.id,
                        variantName: variant,
                    },
                },
                update: {},
                create: {
                    variantName: variant,
                    RootItem: {
                        connect: {
                            id: product.id,
                        },
                    },
                },
            });

            // Add order item
            // skip if this orderId already exists for this user & variant
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
        revalidatePath("/");
    }

    return {
        status: "success",
        message: "Sales imported successfully",
    };
}
