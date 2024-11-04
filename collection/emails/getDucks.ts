/**
 * Outputs a JSON file with the students who have not collected their merch, for use by the mailmerge tool
 * to send a reminder to these people.
 *
 * Created with co-pilot.
 */
import { PrismaClient } from "@prisma/client";
// Load .env file ".env"
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

const prisma = new PrismaClient();

interface OutputRecord {
    to: string;
    name: string;
    shortcode: string;
    subject: string;
    cid: string;
    orderid: number;
    quantity: number;
}

async function getUncollectedPeople() {
    const uncollectedOrders = await prisma.variant.findFirst({
        where: {
            RootItem: {
                name: "Duck T-Shirt (White)",
            },
            variantName: "S (36\")",
        },
        include: {
            OrderItem: {
                include: {
                    Order: {
                        include: {
                            ImperialStudent: true,
                        },
                    },
                },
            },
        }
    })

    const outputRecords: OutputRecord[] = [];

    const studentMap = new Map<string, OutputRecord>();

    if (!uncollectedOrders) {
        console.error("No uncollected orders found");
        return;
    }

    for (const orderItem of uncollectedOrders.OrderItem) {
        const student = orderItem.Order.ImperialStudent;
        const studentKey = student.email;

        if (orderItem.collected) {
            console.log(`Skipping ${studentKey} as already collected`);
            continue;
        }

        if (!studentMap.has(studentKey)) {
            studentMap.set(studentKey, {
                to: student.email,
                name: `${student.firstName} ${student.lastName}`,
                shortcode: student.shortcode,
                //itemsToCollect: [],
                subject: `Information about the Duck T-Shirt (Small) you ordered`,
                cid: student.cid,
                orderid: orderItem.orderId,
                quantity: orderItem.quantity,
            });
        }

    }

    outputRecords.push(...studentMap.values());

    await fs.writeFile("data/duck-refund.json", JSON.stringify(outputRecords, null, 2));
}

getUncollectedPeople()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
