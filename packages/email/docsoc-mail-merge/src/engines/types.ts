import { TemplateEngineOptions } from "../util/types";

export type TemplateEngine = (
    templateOptions: TemplateEngineOptions,
    csvData: Record<string, string>[],
    csvHeaders: string[],
) => Promise<string>;
