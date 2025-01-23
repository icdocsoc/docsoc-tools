import { render } from "@react-email/render";
import { join } from "path";
import React from "react";

import { MappedRecord } from "../../util/types.js";
import { TemplateEngine, TemplateEngineOptions, TemplatePreviews } from "../types.js";

export enum PropTypes {
    String = "string",
    Number = "number",
    Boolean = "boolean",
    Array = "array",
    /** An arbitrary object */
    Object = "object",
}

/**
 * A loaded react email template must provide these as exports.
 *
 * @example
 * export const parameters = () => ({ name: PropTypes.String });
 *
 * const MyTemplate = (props: { name: string }) => <div>Hello, {props.name}!</div>;
 * export default MyTemplateEngine;
 */
export interface ReactEmailEngineExports<
    T extends Record<string, unknown> = Record<string, unknown>,
> {
    /**
     * Return the prop types for the template engine -> record mapping string keys to types
     */
    parameters: () => Record<string, PropTypes>;
    /**
     * Return the template engine itself - essentially a function that takes a T and return a React component./
     */
    default: React.FC<T>;
}

export interface ReactEmailEngineOptions {
    /**
     * Path to the React Email template to use.
     * This should be a compiled .js file that follows the {@link ReactEmailEngineExports} interface.
     */
    templatePath: string;
    [key: string]: string;
}

export interface ReactEmailSidecarMetadata {
    type: "react";
    templatePath: string;
    [key: string]: unknown;
}

function assertIsReactEmailTemplateOptions(
    options: Record<string, unknown>,
): asserts options is ReactEmailEngineOptions {
    if (!options["templatePath"] || typeof options["templatePath"] !== "string") {
        throw new Error("Invalid template option");
    }
}

/**
 * Allow us to use React Email Templates, loads from the FS.
 *
 * The email engine here returns one preview, which contains the HTML to send.
 *
 * On rerender, it will re-render the React component and return the new HTML.
 */
export default class ReactEmailEngine extends TemplateEngine {
    private loadedTemplate?: ReactEmailEngineExports;
    private templateOptions: ReactEmailEngineOptions;

    constructor(templateOptions: TemplateEngineOptions) {
        super();
        assertIsReactEmailTemplateOptions(templateOptions);
        this.templateOptions = templateOptions;
    }

    public override async loadTemplate(): Promise<void> {
        this.loadedTemplate = await import(join(process.cwd(), this.templateOptions.templatePath));

        if (!this.loadedTemplate) {
            throw new Error("No template imported!");
        }

        if (!this.loadedTemplate.parameters) {
            throw new Error(
                "Template does not export parameters as a key - please see documentation for the ReactEmailEngineExports interface",
            );
        }

        if (!this.loadedTemplate.default) {
            throw new Error(
                "Template does not export a default component - please see documentation for the ReactEmailEngineExports interface",
            );
        }
    }
    public override extractFields(): Set<string> {
        if (!this.loadedTemplate) {
            throw new Error("Template not loaded or not loaded properly!");
        }
        return new Set(Object.keys(this.loadedTemplate.parameters()));
    }
    public override async renderPreview(record: MappedRecord): Promise<TemplatePreviews> {
        if (!this.loadedTemplate) {
            throw new Error("Template not loaded or not loaded properly!");
        }
        const Component = this.loadedTemplate.default;
        const metadata: ReactEmailSidecarMetadata = {
            type: "react",
            templatePath: this.templateOptions.templatePath,
        };
        return [
            {
                name: "Rendered-Email.html",
                content: await render(React.createElement(Component, record), { pretty: true }),
                metadata,
            },
        ];
    }
    /**
     * Re-rendering in react really m
     */
    public override async rerenderPreviews(
        loadedPreviews: TemplatePreviews,
        associatedRecord: MappedRecord,
    ): Promise<TemplatePreviews> {
        // 1: do we have at least one preview?
        if (loadedPreviews.length === 0) {
            throw new Error("No previews to re-render");
        }
        // 2: do we have the metadata?
        const metadata = loadedPreviews[0].metadata as ReactEmailSidecarMetadata;

        if (!metadata) {
            throw new Error("No metadata found in sidecar data");
        }

        // 3: do we have the template?
        if (!this.loadedTemplate) {
            throw new Error("Template not loaded or not loaded properly!");
        }

        // 4: do we have the component?
        const Component = this.loadedTemplate.default;

        // 5: re-render the component
        return [
            {
                name: "Rendered-Email",
                content: await render(React.createElement(Component, associatedRecord), {
                    pretty: true,
                }),
                metadata,
            },
        ];
    }

    /** Return the first preview */
    public override async getHTMLToSend(loadedPreviews: TemplatePreviews): Promise<string> {
        return loadedPreviews[0].content;
    }
}
