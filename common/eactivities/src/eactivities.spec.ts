import axios from "axios";

import { EActivitiesAPI } from "./eactivities";
import { AcademicYear } from "./getAcademicYear";
import { CSP, CommitteeMember, RegularMember } from "./types";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("EActivitiesAPI", () => {
    const apiKey = "test-api-key";
    const centreNumber = 123;
    const academicYear: AcademicYear = "21-22";
    let api: EActivitiesAPI;

    beforeEach(() => {
        api = new EActivitiesAPI(apiKey, centreNumber, academicYear);
    });

    const testRequest = async <T>(
        method: keyof EActivitiesAPI,
        endpoint: string,
        expectedMethod: string,
        response: T,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...args: any[]
    ) => {
        /// @ts-expect-error: Mocking the response
        mockedAxios.mockResolvedValueOnce({ data: response });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (api[method] as any)(...args);

        expect(mockedAxios).toHaveBeenCalledWith({
            url: `https://eactivities.union.ic.ac.uk/API/CSP${endpoint}`,
            method: expectedMethod,
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": apiKey,
            },
            data: undefined,
        });
        expect(result.data).toEqual(response);
    };

    it("should initialize correctly", () => {
        expect(api).toBeInstanceOf(EActivitiesAPI);
        expect(api["apiKey"]).toBe(apiKey);
        expect(api["centreNumber"]).toBe(centreNumber);
        expect(api["academicYear"]).toBe(academicYear);
    });

    it("should get CSPs", async () => {
        /// @ts-expect-error: Mocking the response
        const response: CSP[] = [{ name: "Test CSP", code: "123" }];
        await testRequest("getCSPs", "", "GET", response);
    });

    it("should get CSP details", async () => {
        /// @ts-expect-error: Mocking the response
        const response: CSP = { name: "Test CSP", code: "123" };
        await testRequest("getCSPDetails", `/${centreNumber}/`, "GET", response);
    });

    it("should get committee members", async () => {
        /// @ts-expect-error: Mocking the response
        const response: CommitteeMember[] = [{ name: "John Doe", position: "President" }];
        await testRequest(
            "getCommitteeMembers",
            `/${centreNumber}/reports/committee?year=${academicYear}`,
            "GET",
            response,
        );
    });

    it("should get members", async () => {
        /// @ts-expect-error: Mocking the response
        const response: RegularMember[] = [{ name: "Jane Doe", membershipType: "Full" }];
        await testRequest(
            "getMembers",
            `/${centreNumber}/reports/members?year=${academicYear}`,
            "GET",
            response,
        );
    });

    // =================
    // Shop admin tests
    // =================

    it("should get all products", async () => {
        /// @ts-expect-error: Mocking the response
        const response: Product[] = [
            {
                ID: 1234,
                Name: "Test Product",
                Description: "Test Description",
                Type: "Test Type",
                SellingDateStart: "2022-01-01",
                SellingDateEnd: "2022-12-31",
                URL: "http://example.com",
                Active: true,
                ProductLines: [],
            },
        ];
        await testRequest("getProducts", `/${centreNumber}/products`, "GET", response);
    });

    it("should get products by academic year", async () => {
        /// @ts-expect-error: Mocking the response
        const response: Product[] = [
            {
                ID: 1234,
                Name: "Test Product",
                Description: "Test Description",
                Type: "Test Type",
                SellingDateStart: "2022-01-01",
                SellingDateEnd: "2022-12-31",
                URL: "http://example.com",
                Active: true,
                ProductLines: [],
            },
        ];
        await testRequest(
            "getProductsByAcademicYear",
            `/${centreNumber}/reports/products?year=${academicYear}`,
            "GET",
            response,
        );
    });

    it("should get product by ID", async () => {
        /// @ts-expect-error: Mocking the response
        const response: Product = {
            ID: 1234,
            Name: "Test Product",
            Description: "Test Description",
            Type: "Test Type",
            SellingDateStart: "2022-01-01",
            SellingDateEnd: "2022-12-31",
            URL: "http://example.com",
            Active: true,
            ProductLines: [],
        };
        await testRequest(
            "getProductById",
            `/${centreNumber}/products/1234`,
            "GET",
            response,
            "123",
            1234,
        );
    });

    it("should get product sales", async () => {
        /// @ts-expect-error: Mocking the response
        const response: Sale[] = [
            {
                OrderNumber: "1000",
                SaleDateTime: "2022-01-01 12:00:00",
                ProductID: 1234,
                ProductLineID: 4567,
                Price: 30,
                Quantity: 1,
                QuantityCollected: 0,
                Customer: {
                    FirstName: "John",
                    Surname: "Doe",
                    CID: "00000000",
                    Email: "john.doe@example.com",
                    Login: "jdoe",
                },
                VAT: { Code: "S1", Name: "S1 – Sales Standard Rated", Rate: 20 },
            },
        ];
        await testRequest(
            "getProductSales",
            `/${centreNumber}/products/1234/sales`,
            "GET",
            response,
            "123",
            1234,
        );
    });
});
