// Import pride merch
// OLD Script, will not work with current codebase
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse";
import { promises as fs } from "fs";

const prisma = new PrismaClient();

async function main(fileName: string) {
    // Create pride
    const lanyard = await prisma.rootItem.upsert({
        where: { name: "Pride Lanyard" },
        update: {},
        create: {
            name: "Pride Lanyard",
            variants: {
                create: {
                    variantName: "Pride Lanyard",
                },
            },
        },
        include: {
            variants: true,
        },
    });

    const fileContents = await fs.open(fileName, "r").then((f) => f.readFile("utf-8"));

    const iter = parse(fileContents, {
        columns: true,
    });

    for await (const record of iter) {
        const email = record["Email"];
        const name = record["Name"];
        const dateWithTime = record["Start time"];

        const shortcode = email.split("@")[0];

        console.log(`Processing ${name} <${email}> (${shortcode})`);

        // User
        const user = await prisma.imperialStudent.upsert({
            where: {
                shortcode,
            },
            update: {},
            create: {
                cid: name,
                shortcode,
                firstName: name,
                lastName: "",
                email: email,
            },
        });

        // Order
        // Basically, if they already have an order containing a pride lanyard, skip
        const lanyardOrders = await prisma.order.findFirst({
            where: {
                studentId: user.id,
                orderItems: {
                    some: {
                        variantId: lanyard.variants[0].id,
                    },
                },
            },
            relationLoadStrategy: "join",
            include: {
                orderItems: true,
            },
        });

        if (lanyardOrders) {
            console.log(`Skipping ${name} as they already have a lanyard order`);
            continue;
        }

        // Add fake lanyard order
        await prisma.order.create({
            data: {
                orderDate: new Date(dateWithTime),
                student: {
                    connect: {
                        id: user.id,
                    },
                },
                orderNo: Math.floor(Math.random() * 100000),
                orderItems: {
                    create: {
                        variantId: lanyard.variants[0].id,
                        quantity: 1,
                        collected: false,
                    },
                },
            },
        });
    }
}

main("./data/Pride Lanyard 26.06.24.csv")
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
