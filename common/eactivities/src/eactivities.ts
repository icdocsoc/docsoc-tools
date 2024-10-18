import axios, { AxiosResponse } from "axios";

import { AcademicYear } from "./getAcademicYear";
import { CommitteeMember, CSP, Product, RegularMember, Sale } from "./types";

/**
 * A class for interacting with the Imperial College Union's eActivities API, written by hand in the absence of an OpenAPI spec.
 *
 * See the API docs (available from the eActivities API Keys page) for more information.
 *
 *
 * ### Authentication Errors:
 * - Repeated failed attempts will lead to requesting IP being banned for an hour.
 * - If you are banned, you will receive a 403 Forbidden response.
 * - Excessive requests to the API will result in a short 5 minute ban.
 */
export class EActivitiesAPI {
    /**
     * The base URL for the eActivities API.
     */
    private readonly baseUrl: string = "https://eactivities.union.ic.ac.uk/API";

    /**
     * Create an instance of the eActivities API.
     * @param apiKey API Key from eActivities
     * @param centreNumber Centre number
     * @param academicYear Academic year to make requests for - in the format "YY-YY".
     *  Use {@link isValidAcademicYear} to check if a string is a valid academic year.
     */
    constructor(
        private readonly apiKey: string,
        private readonly centreNumber: number,
        private readonly academicYear: AcademicYear,
    ) {}

    /**
     * Make a request to the eActivities API.
     * @param endpoint Endpoint to make a request to
     * @param method HTTP method to use
     * @param body Optional body to send
     * @template T Type of the response data
     */
    private async request<T>(
        endpoint: string,
        method: string,
        body?: unknown,
    ): Promise<AxiosResponse<T>> {
        return axios<T>({
            url: `${this.baseUrl}/${endpoint}`,
            method,
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": this.apiKey,
            },
            data: body,
        });
    }

    /**
     * Make a request to a route that requires a centre number.
     * @template T Type of the response data
     */
    private async requestWithCentre<T>(
        endpoint: string,
        centreNumber = this.centreNumber,
        method = "GET",
        body?: unknown,
    ): Promise<AxiosResponse<T>> {
        return this.request<T>(`CSP/${centreNumber}/${endpoint}`, method, body);
    }

    /**
     * Gets the list of Clubs, Societies or Projects that you can view information for.
     *
     * GET /CSP
     */
    async getCSPs() {
        return this.request<CSP[]>("CSP", "GET");
    }

    /**
     * Gets the basic details, such as Name, Website Name and Code, for the specified CSP.
     *
     * GET /CSP/{centre}
     */
    async getCSPDetails(cspCode = this.centreNumber) {
        return this.requestWithCentre<CSP>("", cspCode, "GET");
    }

    /**
     * Obtains the list of committee members for the specified CSP.
     *
     * GET /CSP/{centre}/reports/committee?year={year}
     * @param cspCode Code of the CSP to get committee members for
     * @param academicYear Academic year to get committee members for
     */
    async getCommitteeMembers(cspCode = this.centreNumber, academicYear = this.academicYear) {
        return this.requestWithCentre<CommitteeMember[]>(
            `reports/committee?year=${academicYear}`,
            cspCode,
        );
    }

    /**
     * Obtains the list of members for the specified CSP.
     *
     * NOTE: This may not be all members for DepSocs; only those that brought their membership online.
     *
     * Download the CSV from the eActivities website for a full list.
     *
     * GET /CSP/{centre}/reports/members?year={year}
     */
    async getMembers(cspCode = this.centreNumber, academicYear = this.academicYear) {
        return this.requestWithCentre<RegularMember[]>(
            `reports/members?year=${academicYear}`,
            cspCode,
        );
    }

    // =================
    // Shop admin
    // =================

    /**
     * Get the list of all products ever made available in the shop for the specified CSP.
     *
     * GET /CSP/{centre}/products
     */

    async getProducts(cspCode = this.centreNumber) {
        return this.requestWithCentre<Product[]>("products", cspCode);
    }

    /**
     * Get the list of all products in a given academic year for the specified CSP.
     *
     * GET /CSP/{centre}/reports/products?year={year}
     */
    async getProductsByAcademicYear(cspCode = this.centreNumber, academicYear = this.academicYear) {
        return this.requestWithCentre<Product[]>("reports/products?year=" + academicYear, cspCode);
    }

    /**
     * Get information about a specific product by ID
     *
     * NOTE: ID is not the same as the number in brackets displayed after the product name on the eActivities website.
     *
     * GET /CSP/{centre}/products/{id}
     */
    async getProductById(cspCode = this.centreNumber, productId: number) {
        return this.requestWithCentre<Product>(`products/${productId}`, cspCode);
    }

    /**
     * List sales for a product
     *
     * NOTE: ID is not the same as the number in brackets displayed after the product name on the eActivities website.
     *
     * GET /CSP/{centre}/products/{id}/sales
     */
    async getProductSales(cspCode = this.centreNumber, productId: number) {
        return this.requestWithCentre<Sale[]>(`products/${productId}/sales`, cspCode);
    }
}
