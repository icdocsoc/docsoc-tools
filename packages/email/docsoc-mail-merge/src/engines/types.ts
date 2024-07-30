import { TemplateEngineOptions } from "../util/types";

// export type TemplateEngine = (
//     templateOptions: TemplateEngineOptions,
//     csvData: Record<string, string>[],
//     csvHeaders: string[],
// ) => Promise<string>;

export abstract class TemplateEngine {
    abstract loadTemplate(): Promise<void>;
    abstract extractFields(): Set<string>;
    abstract renderPreview(record: unknown): Promise<TemplatePreview>;
}

export interface TemplateEngineConstructor {
    new (templateOptions: TemplateEngineOptions): TemplateEngine;
}

export type TemplatePreview = {
    name: string;
    content: string;
    metadata: Record<string, unknown>;
}[];
