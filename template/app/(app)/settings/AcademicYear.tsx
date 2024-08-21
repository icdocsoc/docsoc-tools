import { getAcademicYear } from "@/lib/config";
import React from "react";

import { AcademicYearSelector } from "./AcademicYearSelector";

export const AcademicYear = async () => {
    const currentAcademicYear = await getAcademicYear();

    return <AcademicYearSelector currentYear={currentAcademicYear} />;
};
