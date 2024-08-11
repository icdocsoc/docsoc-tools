// util.test.ts
import { formatDateDDMMYYYY } from "../lib/util";

describe("formatDateDDMMYYYY", () => {
    it("should format the date correctly for a given date", () => {
        const date = new Date("2023-10-05");
        const formattedDate = formatDateDDMMYYYY(date);
        expect(formattedDate).toBe("05/10/2023");
    });

    it("should format the date correctly for another date", () => {
        const date = new Date("2000-01-01");
        const formattedDate = formatDateDDMMYYYY(date);
        expect(formattedDate).toBe("01/01/2000");
    });

    it("should format the date correctly for a leap year date", () => {
        const date = new Date("2020-02-29");
        const formattedDate = formatDateDDMMYYYY(date);
        expect(formattedDate).toBe("29/02/2020");
    });

    it("should format the date correctly for a date with single digit day and month", () => {
        const date = new Date("2023-03-07");
        const formattedDate = formatDateDDMMYYYY(date);
        expect(formattedDate).toBe("07/03/2023");
    });
});
