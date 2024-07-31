/**
 * Handle "sidecar" data - these are JSON files that sit next to rendered template previews,
 * containing metadata about the preview, so that we can re-render them later.
 *
 * @packageDocumentation
 */
import fs from "fs/promises";
import { join } from "path";

import { TEMPLATE_ENGINES } from "../engines";
import { TemplatePreview, TemplatePreviews } from "../engines/types";
import { stopIfCriticalFsError } from "../util/files";
import createLogger from "../util/logger";
import { CliOptions, CSVRecord } from "../util/types";
import { SidecardData } from "./types";

const PARTS_SEPARATOR = "__";
const logger = createLogger("docsoc.sidecar");

/**
 * Generate the first part of a filename for a record's previews - this part
 * identifies the record itself via the fileNamer function.
 * @param record The record to generate a prefix for
 * @param fileNamer A function that generates a filename for a record
 * @returns
 */
export const getRecordPreviewPrefix = (record: CSVRecord, fileNamer: (record: CSVRecord) => string) =>
    `${fileNamer(record)}`;

/**
 * Generate predicable prefixes for preview names (including record specific part
 *
 * @example
 * const record = { id: "1", name: "Test Record" };
 * const fileNamer = (record: CSVRecord) => `file_${record["id"]}`;
 * getRecordPreviewPrefixForIndividual(record, fileNamer, "nunjucks", { name: "preview1.txt", content: "content1", metadata: { key: "value" } })
 * // => "file_1__nunjucks__preview1.txt"
 */
export const getRecordPreviewPrefixForIndividual = (
    record: CSVRecord,
    fileNamer: (record: CSVRecord) => string,
    templateEngine: string,
    preview: TemplatePreview,
) => [getRecordPreviewPrefix(record, fileNamer), templateEngine, preview.name].join(PARTS_SEPARATOR);

/**
 * Generate the filename for the metadata file for a record
 * @param record The record to generate a metadata filename for
 * @param fileNamer A function that generates a filename for a record
 * @example
 * const record = { id: "1", name: "Test Record" };
 * const fileNamer = (record: CSVRecord) => `file_${record["id"]}`;
 * getRecordPreviewPrefixForMetadata(record, fileNamer)
 * // => "file_1-metadata.json"
 */
export const getRecordPreviewPrefixForMetadata = (record: CSVRecord, fileNamer: (record: CSVRecord) => string) =>
    `${getRecordPreviewPrefix(record, fileNamer)}-metadata.json`;

/**
 * Write the metadata for a record & its associated previews to a JSON file.
 * @param record The record to write metadata for
 * @param templateEngine The engine used to render the previews
 * @param templateOptions The options given to the engine
 * @param previews The previews rendered for the record
 * @param fileNamer A function that generates a filename for a record
 * @param previewsRoot The root directory to write the metadata to
 * @returns
 */
export async function writeMetadata(
    record: CSVRecord,
    templateEngine: TEMPLATE_ENGINES,
    templateOptions: CliOptions["templateOptions"],
    previews: TemplatePreviews,
    fileNamer: (record: CSVRecord) => string,
    previewsRoot: string,
): Promise<void> {
    const sidecar: SidecardData = {
        record: record,
        engine: templateEngine,
        engineOptions: templateOptions,
        files: previews.map((preview) => ({
            filename: getRecordPreviewPrefixForIndividual(record, fileNamer, templateEngine, preview),
            engineData: {
                ...preview,
                content: undefined,
            },
        })),
    };

    const metadataFile = getRecordPreviewPrefixForMetadata(record, fileNamer);
    logger.debug(`Writing metadata for ${fileNamer(record)} to ${metadataFile}`);
    await stopIfCriticalFsError(fs.writeFile(join(previewsRoot, metadataFile), JSON.stringify(sidecar, null, 4)));
    return Promise.resolve();
}
