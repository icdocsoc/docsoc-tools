import { getAcademicYear, isValidAcademicYear } from "./getAcademicYear";

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

    describe("isValidAcademicYear", () => {
        test("returns true for valid academic year", () => {
            expect(isValidAcademicYear("21-22")).toBe(true);
            expect(isValidAcademicYear("01-02")).toBe(true);
        });

        test("returns false for invalid format", () => {
            expect(isValidAcademicYear("2122")).toBe(false);
            expect(isValidAcademicYear("21/22")).toBe(false);
            expect(isValidAcademicYear("21-22-23")).toBe(false);
        });

        test("returns false for non-numeric values", () => {
            expect(isValidAcademicYear("ab-cd")).toBe(false);
            expect(isValidAcademicYear("21-xx")).toBe(false);
        });

        test("returns false for numbers out of range", () => {
            expect(isValidAcademicYear("100-101")).toBe(false);
            expect(isValidAcademicYear("-1-0")).toBe(false);
        });

        test("returns false for non-consecutive years", () => {
            expect(isValidAcademicYear("21-23")).toBe(false);
            expect(isValidAcademicYear("22-21")).toBe(false);
            expect(isValidAcademicYear("22-2")).toBe(false);
        });
    });
});