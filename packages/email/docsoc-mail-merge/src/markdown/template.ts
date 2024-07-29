/**
 * Markdown template renderer
 */

import { Template } from "nunjucks";
import markdownit from "markdown-it";

const md = markdownit({
    html: true,
    linkify: true,
    typographer: false,
    breaks: true,
});

/**
 * Render a markdown template to markdown with the fields filled
 */
export const renderMarkdownTemplate = (template: Template, params: Record<string, any>): string => {
    return template.render(params);
};

/**
 * Render a markdown string to HTML, applying any custom transformations we want
 */
export const renderMarkdownToHtml = (markdown: string): string => md.render(markdown);
