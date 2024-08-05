import {
    TemplatePreviews,
    MappedRecord,
    TemplateEngineOptions,
    TemplateEngine,
    TEMPLATE_ENGINES,
    validateRecord,
    DEFAULT_FIELD_NAMES,
    createEmailData,
} from "@docsoc/libmailmerge";
import { createLogger } from "@docsoc/util";
import "dotenv/config";

import { DataSource } from "./dataSource.js";
import { MergeResult, StorageBackend } from "./storageBackend.js";

const logger = createLogger("docsoc");

export interface CliOptions {
    engineInfo: {
        name: TEMPLATE_ENGINES;
        options: TemplateEngineOptions;
        engine: TemplateEngine;
    };
    output: string;
    /**
     * Overrides mappings attachments from the records - will result
     * in {@link CliOptions.mappings.keysForAttachments} being ignored.
     *
     * As a result, every email will have the same attachments.
     */
    attachments?: string[];
    features: {
        // Enable CC & BCC mapping from records - column values must be a space separate list
        enableCC?: boolean;
        enableBCC?: boolean;
    };
    /** DataSource backend to get records to data merge on from */
    dataSource: DataSource;
    /** Storage backend for storing mail merge result */
    storageBackend: StorageBackend;
    /** Mappings the data merge system needs to go from data to mail merge, or functions to get these mappings */
    mappings: {
        /** Maps of data source headers to template headers */
        headersToTemplateMap:
            | Map<string, string>
            | ((
                  templateFields: Set<string>,
                  headers: Set<string>,
              ) => PromiseLike<Map<string, string>>);
        /** Use these keys in data source entires for attachment paths. */
        keysForAttachments: string[] | ((headers: Set<string>) => PromiseLike<string[]>);
    };
}

// TODO: Put somewhere nice
const ADDITIONAL_FIELDS: Array<string> = [DEFAULT_FIELD_NAMES.to, DEFAULT_FIELD_NAMES.subject];

export default async function generatePreviews(opts: CliOptions) {
    // 1: Load data
    logger.info("Loading data...");
    const { headers, records } = await opts.dataSource.loadRecords();

    // 4: Load template via template engine
    logger.info("Loading template...");
    const engine = opts.engineInfo.engine;
    await engine.loadTemplate();

    // 5: Extract template fields
    logger.info("Extracting template fields...");
    const templateFields = engine.extractFields();
    logger.info(`Fields found: ${Array.from(templateFields).join(", ")}`);

    // 6: Map fields to template
    logger.info("Mapping fields to template");
    if (opts.features.enableCC) {
        logger.debug("Enabling CC mapping from records");
        ADDITIONAL_FIELDS.push(DEFAULT_FIELD_NAMES.cc);
    }
    if (opts.features.enableBCC) {
        logger.debug("Enabling BCC mapping from records");
        ADDITIONAL_FIELDS.push(DEFAULT_FIELD_NAMES.bcc);
    }

    const fieldsToMap = new Set([...templateFields, ...ADDITIONAL_FIELDS]);

    const fieldsMaptoTemplate =
        opts.mappings.headersToTemplateMap instanceof Map
            ? opts.mappings.headersToTemplateMap
            : await opts.mappings.headersToTemplateMap(fieldsToMap, headers);

    // 6.5: handle attachments
    logger.debug("Handling attachments...");
    let getAttachmentsFromRecord: (record: MappedRecord) => string[];
    if (typeof opts.attachments === "undefined" || opts.attachments.length <= 0) {
        logger.info("Using attachments from records");
        const attachmentHeaders = Array.isArray(opts.mappings.keysForAttachments)
            ? opts.mappings.keysForAttachments
            : await opts.mappings.keysForAttachments(headers);
        getAttachmentsFromRecord = (record) =>
            attachmentHeaders.map((head) => record[head] as string);
    } else {
        logger.info("Using attachments from CLI options.");
        getAttachmentsFromRecord = () => opts.attachments ?? [];
    }

    // 8: Render intermediate results
    logger.info("Rendering template previews/intermediates...");
    // NOTE: MappedRecord here is the record with its fields mapped to the template fields, rather than with the raw template fields
    const previews: [TemplatePreviews, MappedRecord][] = await Promise.all(
        records
            .map((record) =>
                // Only include fields that are mapped
                Object.fromEntries(
                    Object.entries(record)
                        .filter(
                            ([key]) => fieldsMaptoTemplate.has(key) || key.startsWith("attachment"),
                        )
                        .map(([key, value]) => {
                            return [fieldsMaptoTemplate.get(key) ?? key, value];
                        }),
                ),
            )
            .filter((preparedRecord) => {
                const validState = validateRecord(preparedRecord);
                if (!validState.valid) {
                    logger.warn(
                        `Skipping metadata for ${JSON.stringify(
                            preparedRecord,
                        )} due to invalid record: ${validState.reason}`,
                    );
                    return false;
                }
                return true;
            })
            .map(async (preparedRecord) => [
                await engine.renderPreview(preparedRecord),
                preparedRecord,
            ]),
    );

    // 9: Write to file
    logger.info("Writing results...");
    const results: MergeResult[] = previews.map(([previews, record]) => ({
        record,
        previews,
        engineInfo: {
            name: opts.engineInfo.name,
            options: opts.engineInfo.options,
        },
        attachmentPaths: getAttachmentsFromRecord(record),
        email: createEmailData(record),
    }));

    await opts.storageBackend.storeOriginalMergeResults(results, { headers, records });

    logger.info(`Done! Review the previews and then send.`);
}
