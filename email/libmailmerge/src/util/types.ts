import { TemplateEngineOptions } from "../engines/types";

export type EmailString = `${string}@${string}`;
export type FromEmail = `"${string}" <${EmailString}>`;

export interface CliOptions {
    csvFile: string;
    templateOptions: TemplateEngineOptions;
    templateEngine: "nunjucks";
    output: string;
}
export type CSVRecord = Record<string, unknown>;
