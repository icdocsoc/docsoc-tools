"use server";

import { EActivitiesAPI } from "@docsoc/eactivities";

import { getAcademicYear } from "./config";

const getEactivities = async () =>
    new EActivitiesAPI(
        process.env.EACTIVITIES_API_KEY ?? "",
        parseInt(process.env.EACTIVITIES_CENTRE_NUMBER ?? "605", 10),
        await getAcademicYear(),
    );

export default getEactivities;
