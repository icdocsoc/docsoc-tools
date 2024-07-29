export type EmailString = `${string}@${string}`;
export type FromEmail = `"${string}" <${EmailString}>`;


export type TemplateEngineOptions = Record<string, string | number | boolean>;
export interface CliOptions {
    csvFile: string;
    templateOptions: TemplateEngineOptions;
    templateEngine: "nunjucks";
}

