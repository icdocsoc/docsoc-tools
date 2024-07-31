import { TemplateEngineOptions } from "../types";

/**
 * Nunjucks template options
 */
export interface NunjucksMarkdownTemplateOptions {
    /** Path to the Markdown template to use to produce __editable__ previews of emails */
    templatePath: string;
    /** Path to the root HTML template to use to produce __final__ emails - this is what the final rendered markdown from {@link NunjucksMarkdownTemplateOptions.templatePath} will be embedded into */
    rootHtmlTemplate: string;
    [key: string]: string;
}

export interface NunjucksSidecarMetadata {
    type: "markdown" | "html";
    [key: string]: unknown;
}

/**
 * Asserts that the given options are valid Nunjucks template options & throws an error if they are not
 */
export function assertIsNunjucksTemplateOptions(
    options: TemplateEngineOptions,
): asserts options is NunjucksMarkdownTemplateOptions {
    if (!options["templatePath"] || typeof options["templatePath"] !== "string") {
        throw new Error("Invalid template option");
    }
    if (!options["rootHtmlTemplate"] || typeof options["rootHtmlTemplate"] !== "string") {
        throw new Error("Invalid rootHtmlTemplate option");
    }
}
