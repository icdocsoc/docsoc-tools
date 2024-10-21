/**
 * You can safely ignore this file. It is used to merge the data from Jay's dump with the local database.
 *
 * Jay was a webmaster who got a old version of this system working on their machine, and we needed to import the collections from that DB into the working copy.
 */
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

const prisma = new PrismaClient();

async function getStudentShortcode(orderItemId: number) {
    const orderItem = await prisma.orderItem.findUnique({
        where: { id: orderItemId },
        include: {
            Order: {
                include: {
                    ImperialStudent: true,
                },
            },
        },
    });

    if (!orderItem) {
        throw new Error(`OrderItem with ID ${orderItemId} does not exist.`);
    }

    const studentShortcode = orderItem.Order.ImperialStudent.shortcode;
    return studentShortcode;
}

async function mergeJayDump() {
    // Load Jay's dump
    const jayDumpContent = await fs.readFile("data/jay-dump.csv", "utf-8");
    const jayDumpRecords = await parse(jayDumpContent, {
        columns: true,
        delimiter: "\t",
    });

    for await (const record of jayDumpRecords) {
        const orderItemId = parseInt(record.id, 10);
        const jayCollected = record.collected === "t";

        // Check if the order item exists in the local database
        const localOrderItem = await prisma.orderItem.findUnique({
            where: { id: orderItemId },
        });

        if (!localOrderItem) {
            // throw new Error(
            //     `OrderItem with ID ${orderItemId} does not exist in the local database.`,
            // );
            console.error(`OrderItem with ID ${orderItemId} does not exist in the local database!`);
            continue;
        }

        if (jayCollected && !localOrderItem.collected) {
            // Update the local database to mark the item as collected
            // await prisma.orderItem.update({
            //     where: { id: orderItemId },
            //     data: { collected: true },
            // });
            console.warn(
                `JAY TRUE, KISHAN FALSE: OrderItem with ID ${orderItemId} marked as collected in the local database. Shortcode: ${await getStudentShortcode(
                    orderItemId,
                )}`,
            );

            // Print shortcode of the student
        }

        // if I have it marked as true, but Jay has it marked as false, report this
        if (localOrderItem.collected && !jayCollected) {
            console.warn(
                `KISHAN TRUE, JAY FALSE: OrderItem with ID ${orderItemId} marked as collected in the local database, but not in Jay's dump.`,
            );
        }
    }
}

mergeJayDump()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
