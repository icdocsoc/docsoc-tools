export type EmailString = `${string}@${string}`;
export type FromEmail = `"${string}" <${EmailString}>`;

export type RawCSVRecord = Record<string, unknown>;
export type MappedCSVRecord = Record<string, unknown>;
