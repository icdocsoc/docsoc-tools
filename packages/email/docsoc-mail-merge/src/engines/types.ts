/**
 * Types shared by all template engines.
 * @packageDocumentation
 */
import { CSVRecord } from "../util/types";

/**
 * Generic "any" type for template engine options: essentially a dictionary.
 * You should check (via type assertions) & cast this to your own options type
 */
export type TemplateEngineOptions = Record<string | number, unknown>;

/**
 * Expected constructor for a template engine.
 *
 * You should validate `templateOptions` matches your _own_ custom type for the
 * options in the constructor - this should at a minimum include the path to the template file.
 */
export interface TemplateEngineConstructor {
    /**
     * @param templateOptions - The options for the template engine. Validate & cast this to your own type.
     */
    new (templateOptions: TemplateEngineOptions): TemplateEngine;
}

/**
 * Represents a abstract template engine that can be used to render templates for emails.
 *
 * A template engine should be able to:
 * 1. Load a template
 * 2. Extract fields from the template, which will be used to map CSV columns to fields in the template
 * 3. Render a preview of the template with a given record (where the record's fields correspond to the fields extracted in step 2))
 *
 * A new template engine should extend this class and implement the abstract methods.
 *
 * It's constructor should match the one in {@link TemplateEngineConstructor}
 *
 * For an example of a template engine, see {@link NunjucksMarkdownEngine}
 */
export abstract class TemplateEngine {
    /**
     * Load the template for this engine, ideally provided in your own way to the constructor's `templateOptions` property
     * @see TemplateEngineConstructor
     */
    abstract loadTemplate(): Promise<void>;
    /**
     * Extract the fields from the template loaded in {@link TemplateEngine.loadTemplate},
     * returning a set of fields we will map CSV columns to _for you_.
     */
    abstract extractFields(): Set<string>;
    /**
     * Render a preview of the template with the given record.
     * @param record - The record to render the template with, where the keys correspond to the fields extracted in {@link TemplateEngine.extractFields}
     * @returns A promise that resolves to an array of {@link TemplatePreview} objects - check the type for more information
     */
    abstract renderPreview(record: CSVRecord): Promise<TemplatePreview>;
}

/**
 * Represents a preview of a template, with a name, content, and metadata.
 * Each TemplatePreview object will be written to its own file (engines should not handle this themselves), with the `name` property affixed to a filenme generated from the corresponding record.
 * Additionally we write a JSON file containing the metadata info next to the files, for reading back in to generate re-renders.
 */
export type TemplatePreview = {
    /** Name of the preview, for you to recognise on re-render/load-back-in. As this will be the last part of the filename, you should include a file extension */
    name: string;
    /** The content of the preview, to be written to a file */
    content: string;
    /** Metadata about the preview, to be written to a JSON file, that will be given back to you on re-render/load-back-in */
    metadata: Record<string, unknown>;
}[];
