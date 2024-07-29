export type EmailString = `${string}@${string}`;
export type FromEmail = `"${string}" <${EmailString}>`;

export interface CliOptions {
    csvFile: string;
}