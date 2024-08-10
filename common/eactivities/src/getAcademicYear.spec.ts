import { getAcademicYear, getAcademicYears, isValidAcademicYear } from "./getAcademicYear";

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

    it("should return the correct academic years", () => {
        expect(getAcademicYears(new Date("2020-08-01"))).toStrictEqual(["20-21"]);

        expect(getAcademicYears(new Date("2021-08-01"))).toStrictEqual(["20-21", "21-22"]);

        expect(getAcademicYears(new Date("2022-07-31"))).toStrictEqual(["20-21", "21-22"]);

        expect(getAcademicYears(new Date("2022-08-01"))).toStrictEqual(["20-21", "21-22", "22-23"]);
        expect(getAcademicYears(new Date("2024-08-10"))).toStrictEqual([
            "20-21",
            "21-22",
            "22-23",
            "23-24",
            "24-25",
        ]);

        expect(getAcademicYears(new Date("2020-07-31"))).toStrictEqual([]);
        expect(getAcademicYears(new Date("2024-08-04"), new Date("2019-07-01"))).toStrictEqual([
            "18-19",
            "19-20",
            "20-21",
            "21-22",
            "22-23",
            "23-24",
            "24-25",
        ]);
        expect(getAcademicYears(new Date("1990-07-31"))).toStrictEqual([]);

        expect(getAcademicYears(new Date("2024-08-01"), new Date("2022-07-31"))).toStrictEqual([
            "21-22",
            "22-23",
            "23-24",
            "24-25",
        ]);

        expect(getAcademicYears(new Date("2024-06-30"), new Date("2023-09-01"))).toStrictEqual([
            "23-24",
        ]);
    });
});
