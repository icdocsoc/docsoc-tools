/**
 * This scrpt allows you to import a list of people into the database under one specific items and variant.
 *
 * Auto imports into current academic year.
 */
import { AcademicYear } from "@docsoc/eactivities";
import { createLogger } from "@docsoc/util";
import { PrismaClient } from "@prisma/client";
// Load .env file
import dotenv from "dotenv";

const logger = createLogger("collection.import");

dotenv.config();

/**
 * ================================
 * DEFINE THE ITEM BELOW
 * ================================
 */

/** Used for the name of the {@link RootItem} */
const ROOT_ITEM_NAME = "Freshers Merch";

/** Used for the name of the {@link Variant} */
const VARIANT_NAME = "Freshers Merch 2024";

/** Used for the quantity of the {@link Variant} */
const VARIANT_QUANTITY = 1;

/**
 * ================================
 * DATA SOURCE
 * ================================
 *
 * Data source must be a JSON file
 */
/**
 * Data source must be a JSON file which is a list of records of this shape
 */
interface DataSource {
    /** MUST be correct as it is used as the unique ID in the DB to link orders to a studnt */
    shortcode: string;
    /** Ideally make this right, but if not just use the shortcode */
    cid: string;
    firstName: string;
    lastName: string;
    email: string;
}

/** Path to the data source */
const DATA_SOURCE_PATH = "./data/freshers-2024.json";

// Start the script

// 0: init db
const prisma = new PrismaClient();

// 0.1: Find the current academic year
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

async function main() {
    const currentAcademicYear = await getAcademicYear();

    if (!currentAcademicYear) {
        throw new Error("No academic year found to import into");
    }

    // 1: Upsert the item

    const item = await prisma.rootItem.upsert({
        where: { name: ROOT_ITEM_NAME },
        update: {},
        create: {
            name: ROOT_ITEM_NAME,
            academicYear: currentAcademicYear,
            Variant: {
                create: {
                    variantName: VARIANT_NAME,
                },
            },
        },
        include: {
            Variant: true,
        },
    });

    // Load file
    const data = (await import(DATA_SOURCE_PATH)).default as DataSource[];

    // Valid data
    if (!Array.isArray(data)) {
        throw new Error("Data source is not an array");
    }

    // Make an import for it
    const importName = `${ROOT_ITEM_NAME}, ${VARIANT_NAME} via import.ts @ ${new Date().toLocaleString(
        "en-GB",
    )}`;
    const importItem = await prisma.orderItemImport.create({
        data: {
            name: importName,
        },
    });

    // 2: Upsert the students
    let index = 0;
    for (const record of data) {
        const { shortcode, cid, firstName, lastName, email } = record;

        // If any null values, print warning and skip
        if (!shortcode || !cid || !firstName || !lastName || !email) {
            logger.warn(
                `Skipping ${shortcode} due to missing values. Record was ${JSON.stringify(record)}`,
            );
            continue;
        }

        logger.debug(`Processing ${shortcode} <${email}> (CID: ${cid})`);
        logger.debug(`Upserting ${shortcode}...`);
        const student = await prisma.imperialStudent.upsert({
            where: {
                shortcode,
            },
            update: {},
            create: {
                cid,
                shortcode,
                firstName,
                lastName,
                email,
            },
        });

        // Make order
        // If they already have a  merch order matching that item, skip
        const existingOrder = await prisma.order.findFirst({
            where: {
                studentId: student.id,
                OrderItem: {
                    some: {
                        variantId: item.Variant[0].id,
                    },
                },
            },
        });

        if (existingOrder) {
            logger.warn(`Skipping ${shortcode} as they already have a ${VARIANT_NAME} order`);
            continue;
        }

        // Create order
        await prisma.order.create({
            data: {
                academicYear: currentAcademicYear,
                orderDate: new Date(),
                studentId: student.id,
                orderNo: Math.floor(Math.random() * 100000) * 1000 + index,
                OrderItem: {
                    create: {
                        quantity: VARIANT_QUANTITY,
                        variantId: item.Variant[0].id,
                        importId: importItem.id,
                        collected: false,
                    },
                },
            },
        });

        logger.info(`Imported ${shortcode} <${email}> (CID: ${cid})`);

        index++;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
