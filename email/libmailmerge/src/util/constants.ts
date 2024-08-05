export const DOCSOC_DEFAULT_FROM_LINE = `"DoCSoc" <docsoc@ic.ac.uk>`;

/** Expected names of requried email fields in records to data merge on */
export const DEFAULT_FIELD_NAMES = {
    to: "email",
    subject: "subject",
    cc: "cc",
    bcc: "bcc",
} as const;
