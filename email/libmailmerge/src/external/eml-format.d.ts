/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EMLData {
    headers?: { [key: string]: string | string[] };
    subject?: string;
    from?: string | EmailAddress;
    to?: string | EmailAddress | { name: string; email: string }[];
    cc?: string | EmailAddress | { name: string; email: string }[];
    bcc?: string | EmailAddress | { name: string; email: string }[];
    text?: string;
    html?: string;
    attachments?: Attachment[];
}

export interface EmailAddress {
    name?: string;
    address: string;
}

export interface Attachment {
    contentType?: string;
    inline?: boolean;
    filename?: string;
    name?: string;
    cid?: string;
    data: string | Buffer;
}

export function unpack(
    eml: string | EMLData,
    directory: string,
    options?: any,
    callback?: (error: Error | null, result?: any) => void,
): void;

export function read(
    eml: string | EMLData,
    options?: any,
    callback?: (error: Error | null, result?: any) => void,
): void;

export function build(data: EMLData, options?: any): Promise<string>;
