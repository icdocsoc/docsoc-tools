"use server";

import prisma from "../db";

export async function getAcademicYearsInDB() {
    return (await prisma.academicYear.findMany()).map((year) => year.year);
}
