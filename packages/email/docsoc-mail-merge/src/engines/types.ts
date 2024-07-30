import { TemplateEngineOptions } from "../util/types";

export type TemplateEngine = (
    templateOptions: TemplateEngineOptions,
    csvData: Record<string, string>[],
    csvHeaders: string[],
) => Promise<string>;

export type TemplatePreview = {
    name: string;
    content: string;
    metadata: Record<string, unknown>;
}[];
