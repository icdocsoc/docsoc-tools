/**
 * Handle "sidecar" data - these are JSON files that sit next to rendered template previews,
 * containing metadata about the preview, so that we can re-render them later.
 *
 * @packageDocumentation
 */
import { TemplatePreview } from "../engines/types";
import { CSVRecord } from "../util/types";

const PARTS_SEPARATOR = "__";

export const getRecordPreviewPrefix = (record: CSVRecord, fileNamer: (record: CSVRecord) => string) =>
    `${fileNamer(record)}`;

/** Generate predicable prefixes for preview names */
export const getRecordPreviewPrefixForIndividual = (
    record: CSVRecord,
    fileNamer: (record: CSVRecord) => string,
    templateEngine: string,
    preview: TemplatePreview,
) => [getRecordPreviewPrefix(record, fileNamer), templateEngine, preview.name].join(PARTS_SEPARATOR);

export const getRecordPreviewPrefixForMetadata = (record: CSVRecord, fileNamer: (record: CSVRecord) => string) =>
    `${getRecordPreviewPrefix(record, fileNamer)}-metadata.json`;

// export const writeSidecardData = async () => {
