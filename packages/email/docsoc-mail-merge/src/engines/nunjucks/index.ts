import { promises as fs } from "fs";
import nunjucks from "nunjucks";

import { renderMarkdownTemplate, renderMarkdownToHtml } from "../../markdown/template";
import { TemplateEngine } from "../types";
import getTemplateFields from "./getFields";
import { assertIsNunjucksTemplateOptions, NunjucksTemplateOptions } from "./types";
import { TemplateEngineOptions } from "../../util/types";

export default class NunjucksEngine extends TemplateEngine {
    private loadedTemplate?: string;
    private templateOptions: NunjucksTemplateOptions

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

    async renderPreview(record: Record<string, any>) {
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

        const expanded = renderMarkdownTemplate(templateCompiled, {
            name: record["name"],
        });
        const html = renderMarkdownToHtml(expanded);

        // wrap the html in the wrapper
        const wrapped = htmlWrapperCompiled.render({ content: html });

        return [
            {
                name: "Preview-Markdown.md",
                content: expanded,
                metadata: {},
            },
            {
                name: "Preview-HTML.html",
                content: wrapped,
                metadata: {},
            },
        ];
    }
}
