import { promises as fs } from "fs";
import nunjucks from "nunjucks";

import { renderMarkdownToHtml } from "../../markdown/toHtml";
import { CSVRecord } from "../../util/types";
import { TemplateEngineOptions } from "../types";
import { TemplateEngine } from "../types";
import getTemplateFields from "./getFields";
import { assertIsNunjucksTemplateOptions, NunjucksMarkdownTemplateOptions } from "./types";

/**
 * A Nunjucks Markdown template engine
 *
 * Given two templates:
 * 1. A Markdown template that contains Nunjucks variables
 * 2. An HTML template that will be used to wrap the rendered Markdown
 *
 * We produce two previews:
 * 1. A Markdown preview, where the Nunjucks variables are expanded in the Markdown template
 * 2. An HTML preview, where the Markdown preview is rendered to HTML and embedded in the HTML template.
 *
 * The HTML preview __must__ contain a `{{ content }}` variable that will be replaced with the rendered Markdown
 *
 * The HTML preview is what will be sent as the final email, however we provide
 * the Markdown preview for editing purposes - you can edit it, trigger a re-render,
 * and see the changes in the HTML preview that will be sent
 */
export default class NunjucksMarkdownEngine extends TemplateEngine {
    private loadedTemplate?: string;
    private templateOptions: NunjucksMarkdownTemplateOptions;

    constructor(templateOptions: TemplateEngineOptions) {
        super();
        assertIsNunjucksTemplateOptions(templateOptions);
        this.templateOptions = templateOptions;
    }

    async loadTemplate() {
        this.loadedTemplate = await fs.readFile(this.templateOptions.templatePath, "utf-8");
    }

    extractFields() {
        if (!this.loadedTemplate) {
            throw new Error("Template not loaded");
        }

        return getTemplateFields(this.loadedTemplate);
    }

    async renderPreview(record: CSVRecord) {
        if (!this.loadedTemplate) {
            throw new Error("Template not loaded");
        }

        const templateCompiled = nunjucks.compile(
            this.loadedTemplate,
            nunjucks.configure({
                throwOnUndefined: true,
            }),
        );
        const htmlWrapper = await fs.readFile(this.templateOptions.rootHtmlTemplate, "utf-8");
        const htmlWrapperCompiled = nunjucks.compile(htmlWrapper, nunjucks.configure({ autoescape: false }));

        // Render the Markdown template with the record, so that we have something to preview
        const expanded = templateCompiled.render({
            name: record["name"],
        });
        // Render the MD to HTML
        const html = renderMarkdownToHtml(expanded);

        // Wrap the rendered markdown html in the wrapper
        const wrapped = htmlWrapperCompiled.render({ content: html });

        // Return both
        return [
            {
                name: "Preview-Markdown.md",
                content: expanded, // you can edit this and re-render
                metadata: {
                    type: "markdown",
                },
            },
            {
                name: "Preview-HTML.html",
                content: wrapped, // this is what will be sent - do not edit it, re-rendering will overwrite it
                metadata: {
                    type: "html",
                },
            },
        ];
    }
}
