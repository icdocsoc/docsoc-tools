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
