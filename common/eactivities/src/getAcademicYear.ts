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
export function getAcademicYear(currentDate: Date) {
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
