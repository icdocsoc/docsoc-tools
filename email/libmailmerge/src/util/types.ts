export type EmailString = `${string}@${string}`;
export type FromEmail = `"${string}" <${EmailString}>`;

export type CSVRecord = Record<string, unknown>;
