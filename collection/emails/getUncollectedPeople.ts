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
    itemsToCollect: {
        rootitem: string;
        variant: string;
        quantity: number;
    }[];
    subject: string;
}

async function getUncollectedPeople() {
    const uncollectedOrders = await prisma.orderItem.findMany({
        where: { collected: false },
        include: {
            Order: {
                include: {
                    ImperialStudent: true,
                },
            },
            Variant: {
                include: {
                    RootItem: true,
                },
            },
        },
    });

    const outputRecords: OutputRecord[] = [];

    const studentMap = new Map<string, OutputRecord>();

    for (const orderItem of uncollectedOrders) {
        const student = orderItem.Order.ImperialStudent;
        const studentKey = student.email;

        // Filter out if rootitem is "Pride Lanyard"
        // (in 2024 we started handing out these lanyard to whoever after the summer collection so
        /// it was likely that anyway who didn't collect it during merch collections got them during the random hand outs we did)
        if (orderItem.Variant.RootItem.name === "Pride Lanyard") {
            console.log(`Skipping ${studentKey} for Pride Lanyard`);
            continue;
        }

        if (!studentMap.has(studentKey)) {
            studentMap.set(studentKey, {
                to: student.email,
                name: `${student.firstName} ${student.lastName}`,
                shortcode: student.shortcode,
                itemsToCollect: [],
                subject: "Collect your remaining DoCSoc Summer Merch",
            });
        }

        const studentRecord = studentMap.get(studentKey)!;
        studentRecord.itemsToCollect.push({
            rootitem: orderItem.Variant.RootItem.name,
            variant: orderItem.Variant.variantName,
            quantity: orderItem.quantity,
        });
    }

    outputRecords.push(...studentMap.values());

    await fs.writeFile("data/reminders.json", JSON.stringify(outputRecords, null, 2));
}

getUncollectedPeople()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
