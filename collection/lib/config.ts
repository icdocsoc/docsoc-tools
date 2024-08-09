/**
 * Handlers for the Config table in the database
 * @module
 */
import { getAcademicYear as computeAcademicYear, isValidAcademicYear } from "@docsoc/eactivities";
import { Prisma } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";

import prisma from "./db";
import { StatusReturn } from "./types";

async function getConfigValueFor(key: string) {
    const config = await prisma.config.findFirst({
        where: {
            key,
        },
    });
    return config?.value;
}

async function setConfigValueFor(
    key: string,
    value: Prisma.NullTypes.JsonNull | Prisma.InputJsonValue,
    update = true,
) {
    await prisma.config.upsert({
        where: {
            key,
        },
        create: {
            key,
            value,
        },
        update: {
            value: update ? value : undefined,
        },
    });
}

const ACADEMIC_YEAR_KEY = "academicYear";

export async function getAcademicYear() {
    return await getConfigValueFor(ACADEMIC_YEAR_KEY);
}

export async function setAcademicYear(academicYear: string): Promise<StatusReturn> {
    if (!isValidAcademicYear(academicYear)) {
        return {
            status: "error",
            error: "Invalid academic year",
        };
    }

    await setConfigValueFor(ACADEMIC_YEAR_KEY, academicYear);

    return {
        status: "success",
    };
}

export async function initConfig() {
    // 1: Set academic year
    console.log("Initialising academic year if not set...");
    const academicYear = await computeAcademicYear(new Date());
    await setConfigValueFor(ACADEMIC_YEAR_KEY, academicYear, false);
}
