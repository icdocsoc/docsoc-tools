/**
 * Data types for eActivities API responses.
 * @module
 */
export interface CSP {
    /** @example 170 */
    Code: string;
    /** @example "RCC Ferret Fanciers (TEST CLUB)" */
    Name: string;
    /** @example "Ferrets" */
    WebName: string;
    /** @example RFF */
    Acronym: string;
}

export interface CommitteeMember {
    /** @example Joe */
    FirstName: string;
    /** @example Bloggs */
    Surname: string;
    /** @example 00000000 */
    CID: string;
    /** @example joe.bloggs50@imperial.ac.uk */
    Email: string;
    /** @example jbloggs50 */
    Login: string;
    /** @example Chief Ferret Fancier”, */
    PostName: string;
    /** @example 02075948060 */
    PhoneNo: string;
    /** @example 2014-08-01 00:00:00 */
    StartDate: string;
    /** @example 2015-07-31 23:59:59 */
    EndDate: string;
}

export interface RegularMember {
    /** @example Joe */
    FirstName: string;
    /** @example Bloggs */
    Surname: string;
    /** @example 00000000 */
    CID: string;
    /** @example joe.bloggs50@imperial.ac.uk */
    Email: string;
    /** @example jbloggs50 */
    Login: string;
    /** @example 1000 */
    OrderNo: string;
    /** @example Full */
    MemberType: string;
}

/// Shop Admin from page 5 of the API manual

export interface VAT {
    /** @example S1 */
    Code: string;
    /** @example S1 – Sales Standard Rated */
    Name: string;
    /** @example 20 */
    Rate: number;
}

export interface Activity {
    /** @example 00 */
    Code: string;
    /** @example General (0) */
    Name: string;
}

export interface Account {
    /** @example 580 */
    Code: string;
    /** @example Ticket Income (580) */
    Name: string;
    /** @example Income */
    Type: string;
}

export interface ProductLine {
    /** @example 4567 */
    ID: number;
    /** @example Ferret Annual Dinner Ticket */
    Name: string;
    /** @example null */
    Quantity: number | null;
    /** @example true */
    Unlimited: boolean;
    /** @example 30 */
    Price: number;
    /** @example false */
    Collectable: boolean;
    /** @example true */
    DefaultOption: boolean;
    Account: Account;
    Activity: Activity;
    VAT: VAT;
}

export interface Product {
    /** @example 1234 */
    ID: number;
    /** @example Ferret Fanciers Annual Dinner 2015 */
    Name: string;
    /** @example Ticket for our Annual Dinner 2015 */
    Description: string;
    /** @example World - Products available to everyone including non-Imperial students and staff */
    Type: string;
    /** @example 2015-06-01 00:00:00 */
    SellingDateStart: string;
    /** @example 2015-06-30 00:00:00 */
    SellingDateEnd: string;
    /** @example https://www.imperialcollegeunion.org/shop/club-society-project-products/ferrets-products/1234/ferret-annual-dinner-2015 */
    URL: string;
    /** @example true */
    Active: boolean;
    ProductLines: ProductLine[];
}

export interface Customer {
    /** @example Joe */
    FirstName: string;
    /** @example Bloggs */
    Surname: string;
    /** @example 00000000 */
    CID: string;
    /** @example joe.bloggs50@imperial.ac.uk */
    Email: string;
    /** @example jbloggs50 */
    Login: string;
}

export interface Sale {
    /** @example 1000 */
    OrderNumber: string;
    /** @example 2015-06-20 19:00:00 */
    SaleDateTime: string;
    /** @example 1234 */
    ProductID: number;
    /** @example 4567 */
    ProductLineID: number;
    /** @example 30 */
    Price: number;
    /** @example 1 */
    Quantity: number;
    /** @example 0 */
    QuantityCollected: number;
    Customer: Customer;
    VAT: VAT;
}
