"use server";

import { AcademicYear } from "@docsoc/eactivities";
import { revalidatePath } from "next/cache";

import { getAcademicYear } from "../config";
import prisma from "../db";

/**
 * CRUD Actions for users who are committee members
 */
import getEactivities from "../eactivites";

export async function loadCommitteeForCurrYear() {
    const eactivites = await getEactivities();
    const committee = await eactivites.getCommitteeMembers();

    if (committee.status !== 200) {
        throw new Error("Failed to load committee members");
    }

    // Insert
    for (const user of await committee.data) {
        await prisma.committeeMember.upsert({
            where: {
                academicYear_cid: {
                    cid: user.CID,
                    academicYear: await getAcademicYear(),
                },
            },
            create: {
                firstname: user.FirstName,
                surname: user.Surname,
                cid: user.CID,
                email: user.Email,
                shortcode: user.Login,
                position: user.PostName,
                phone: user.PhoneNo,
                startDate: new Date(user.StartDate),
                endDate: new Date(user.EndDate),
                academicYear: await getAcademicYear(),
            },
            update: {
                firstname: user.FirstName,
                surname: user.Surname,
                email: user.Email,
                shortcode: user.Login,
                position: user.PostName,
                phone: user.PhoneNo,
                startDate: new Date(user.StartDate),
                endDate: new Date(user.EndDate),
                academicYear: await getAcademicYear(),
            },
        });
    }

    // Revalidate
    revalidatePath("/settings");
}

export async function getCommitteeMembers(academicYear: AcademicYear) {
    return prisma.committeeMember.findMany({
        where: {
            academicYear,
        },
    });
}

/**
 * Get a single committee member by email
 * Note that email must be full email, e.g. kishan.sambhi22@imperial.ac.uk
 */
export async function getCommitteeMember(email: string, academicYear?: AcademicYear) {
    if (!academicYear) {
        academicYear = await getAcademicYear();
    }

    return prisma.committeeMember.findFirst({
        where: {
            email,
            academicYear,
        },
    });
}
