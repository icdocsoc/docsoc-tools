/** Format used by eActivities APIs for academic years */
export type AcademicYear = `${number}-${number}`;

/** New academic year starts august 1st */
export const CHANGE_OVER_MONTH = 8;

export function isValidAcademicYear(academicYear: string): academicYear is AcademicYear {
    const numbers = academicYear.split("-");
    if (numbers.length !== 2) {
        return false;
    }

    const [start, end] = numbers.map((n) => parseInt(n, 10));
    if (isNaN(start) || isNaN(end)) {
        return false;
    }

    // Must be a 2 digit year
    if (start > 99 || end > 99) {
        return false;
    }

    if (start < 0 || end < 0) {
        return false;
    }

    return start + 1 === end;
}
/** Bold to assume this library survives more than 1 year */
const CURRENT_MILLENIUM = 2000;

/**
 * Given a date, return the academic year that it falls within in the format expected by the eActivities API.
 *
 * @param currentDate Current date
 */
export function getAcademicYear(currentDate: Date): AcademicYear {
    // Extract the year
    const year = currentDate.getFullYear();
    const currentYearShort = year - CURRENT_MILLENIUM;
    // If the current month is August or later, we are in the new academic year
    if (currentDate.getMonth() >= CHANGE_OVER_MONTH - 1) {
        return `${currentYearShort}-${currentYearShort + 1}`;
    }
    // Otherwise, we are in the previous academic year
    return `${currentYearShort - 1}-${currentYearShort}`;
}

/**
 * Generates a list of academic years between a start date and an end date.
 *
 * An academic year runs from 1st August of one year to 31st July of the next year.
 * The function returns academic years in the format `shortyear-shortyear` (e.g., '20-21', '23-24') - see {@link AcademicYear}.
 *
 * **Allowed Date Range:**
 * - Earliest allowed start date: 1st August 2020
 * - Latest allowed end date: 31st July 2099
 *
 * @param endDate - The end date up to which academic years should be generated. Must be within the allowed range.
 * @param startDate - The start date from which to begin generating academic years. Defaults to 1st August 2020 (so academic year '20-21').
 * @returns An array of academic years between the start and end dates, inclusive.
 *
 * @throws Will throw an error if the provided dates are outside the allowed range.
 * @throws Will return an empty array if the start date is after the end date.
 *
 * @example
 * ```typescript
 * getAcademicYears(new Date("2024-08-01"), new Date("2022-07-31"));
 * // Returns: ['21-22', '22-23', '23-24', '24-25']
 *
 * getAcademicYears(new Date("2024-06-30"), new Date("2023-09-01"));
 * // Returns: ['23-24']
 * ```
 */
export function getAcademicYears(
    endDate: Date,
    startDate: Date = new Date("2020-08-01"),
): AcademicYear[] {
    const earliestDate = new Date("2010-08-01");
    const latestDate = new Date("2099-07-31");

    // Ensure dates are within the allowed range
    if (startDate < earliestDate || endDate > latestDate) {
        throw new Error(
            "Dates must be within the range from 1st August 2020 to 31st July 2099, and the start date must be before the end date.",
        );
    }

    if (startDate > endDate) {
        return [];
    }

    const academicYears: AcademicYear[] = [];

    let startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();

    // Adjust startYear if the startDate is before 1st August of the same year
    if (startMonth < 7) {
        // Month is zero-indexed, so July is 6
        startYear--;
    }

    let endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();

    // Adjust endYear if the endDate is before 1st August of the same year
    if (endMonth < 7) {
        // Month is zero-indexed, so July is 6
        endYear--;
    }

    // Generate academic years
    for (let year = startYear; year <= endYear; year++) {
        const nextYear = year + 1;
        const academicYear: AcademicYear = `${year % 100}-${nextYear % 100}` as AcademicYear;
        academicYears.push(academicYear);
    }

    return academicYears;
}
