// Import pride merch
// OLD Script, will not work with current codebase
import { AcademicYear } from "@docsoc/eactivities";
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse";
import { promises as fs } from "fs";

const prisma = new PrismaClient();

// from collection/lib/config.ts
async function getConfigValueFor(key: string) {
    const config = await prisma.config.findFirst({
        where: {
            key,
        },
    });
    return config?.value;
}
const ACADEMIC_YEAR_KEY = "academicYear";
export async function getAcademicYear(): Promise<AcademicYear> {
    return (await getConfigValueFor(ACADEMIC_YEAR_KEY)) as string as AcademicYear;
}

async function main(fileName: string) {
    // Create pride
    const lanyard = await prisma.rootItem.upsert({
        where: { name: "Pride Lanyard" },
        update: {},
        create: {
            name: "Pride Lanyard",
            academicYear: (await getAcademicYear()) as string as AcademicYear,
            Variant: {
                create: {
                    variantName: "Pride Lanyard",
                },
            },
        },
        include: {
            Variant: true,
        },
    });

    const fileContents = await fs.open(fileName, "r").then((f) => f.readFile("utf-8"));

    const iter = parse(fileContents, {
        columns: true,
    });

    const importName = `Pride Lanyard via pride.ts @ ${new Date().toLocaleString("en-GB")}`;
    const importItem = await prisma.orderItemImport.create({
        data: {
            name: importName,
        },
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
                OrderItem: {
                    some: {
                        variantId: lanyard.Variant[0].id,
                    },
                },
            },
            relationLoadStrategy: "join",
            include: {
                OrderItem: true,
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
                academicYearReference: {
                    connect: {
                        year: lanyard.academicYear,
                    },
                },
                ImperialStudent: {
                    connect: {
                        id: user.id,
                    },
                },
                orderNo: Math.floor(Math.random() * 100000),
                OrderItem: {
                    create: {
                        variantId: lanyard.Variant[0].id,
                        quantity: 1,
                        collected: false,
                        importId: importItem.id,
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
