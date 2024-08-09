import { getAcademicYear } from "./getAcademicYear";

describe("getAcademicYear", () => {
    it("should return the academic year if set before August", async () => {
        const academicYearExpected = "20-21";
        const aDate = new Date("2021-01-01");

        const result = getAcademicYear(aDate);
        expect(result).toBe(academicYearExpected);
    });

    it("should return the academic year correctly before August", async () => {
        const academicYearExpected = "23-24";
        const aDate = new Date("2024-07-31");

        const result = getAcademicYear(aDate);
        expect(result).toBe(academicYearExpected);
    });

    it("should return the academic year correct after August", async () => {
        const academicYearExpected = "24-25";
        const aDate = new Date("2024-08-01");

        const result = getAcademicYear(aDate);
        expect(result).toBe(academicYearExpected);
    });
});
