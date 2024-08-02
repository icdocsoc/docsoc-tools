import {
    TemplatePreviews,
    CSVRecord,
    TemplateEngineOptions,
    TemplateEngine,
    NunjucksMarkdownEngine,
    TEMPLATE_ENGINES,
} from "@docsoc/libmailmerge";
import { getRecordPreviewPrefixForIndividual, writeMetadata } from "@docsoc/libmailmerge";
import { createLogger, stopIfCriticalFsError } from "@docsoc/util";
import { parse } from "csv-parse";
import "dotenv/config";
import { promises as fs } from "fs";
import { mkdirp } from "mkdirp";
// load .env
import { join } from "path";

import packageJSON from "../../../package.json";
import { getFileNameSchemeInteractively, getRunNameInteractively, mapCSVFieldsInteractive } from "../../interactivity";

const logger = createLogger("docsoc");

export interface CliOptions {
    csvFile: string;
    engineInfo: {
        name: TEMPLATE_ENGINES;
        options: TemplateEngineOptions;
        engine: TemplateEngine;
    };
    output: string;
}

const opts: CliOptions = {
    csvFile: "./data/names.csv",
    engineInfo: {
        options: {
            templatePath: "./templates/TEMPLATE.md.njk",
            rootHtmlTemplate: "./templates/wrapper.html.njk",
        },
        name: "nunjucks",
        engine: new NunjucksMarkdownEngine({
            templatePath: "./templates/TEMPLATE.md.njk",
            rootHtmlTemplate: "./templates/wrapper.html.njk",
        }),
    },
    output: "./output",
};

// TODO: Put somewhere nice
const ADDITIONAL_FIELDS = ["email", "subject"];

async function main(opts: CliOptions) {
    logger.info("DoCSoc Mail Merge");
    logger.info(`v${packageJSON.version}`);

    const runName = await getRunNameInteractively();

    // 1: Load the CSV
    logger.info("Loading CSV...");
    const csvRaw = await stopIfCriticalFsError(fs.readFile(join(__dirname, "../data/names.csv"), "utf-8"));
    logger.debug("Parsing & loading CSV...");
    const csvParsed = parse(csvRaw, { columns: true });
    const records: CSVRecord[] = [];
    for await (const record of csvParsed) {
        records.push(record);
    }
    logger.info(`Loaded ${records.length} records`);

    // 3: Grab CSV fields
    if (records.length === 0) {
        logger.error("No records found in CSV");
        throw new Error("No records found in CSV");
    }
    const headers = Object.keys(records[0]);
    logger.info(`Fields: ${headers.join(", ")}`);

    // 4: Load template via template engine
    logger.info("Loading template...");
    const engine = opts.engineInfo.engine;
    await engine.loadTemplate();

    // 5: Extract template fields
    logger.info("Extracting template fields...");
    const templateFields = engine.extractFields();
    logger.info(`Fields found: ${Array.from(templateFields).join(", ")}`);

    // 6: Map CSV fields to template interactively
    logger.info("Mapping CSV fields to template interactively");
    const fieldsMapCSVtoTemplate = await mapCSVFieldsInteractive(
        new Set([...Array.from(templateFields), ...ADDITIONAL_FIELDS]),
        headers,
    );

    // 7: Ask what to name files using
    const fileNamer = await getFileNameSchemeInteractively(headers, records);

    // 8: Render intermediate results
    logger.info("Rendering template previews/intermediates...");
    // NOTE: CSVRecord here is the record with the CSV headers mapped to the template fields, rather than with the raw template fields
    const previews: [TemplatePreviews, CSVRecord][] = await Promise.all(
        records.map(async (csvRecord) => {
            const preparedRecord = Object.fromEntries(
                Object.entries(csvRecord).map(([key, value]) => {
                    return [fieldsMapCSVtoTemplate.get(key) ?? key, value];
                }),
            );
            return [await engine.renderPreview(preparedRecord), preparedRecord];
        }),
    );

    // 9: Write to file
    logger.info("Writing preview files...");
    const previewsRoot = join(opts.output, "previews", runName);
    logger.warn(`Writing previews to ${previewsRoot}...`);
    logger.debug("Creating directories...");
    await mkdirp(previewsRoot);
    logger.debug("Writing files...");
    await Promise.all(
        previews.flatMap(async ([previews, record]) => {
            const operations = previews.map(async (preview) => {
                const fileName = getRecordPreviewPrefixForIndividual(record, fileNamer, opts.engineInfo.name, preview);
                logger.debug(`Writing ${fileName}__${opts.engineInfo.name}__${preview.name}`);
                await stopIfCriticalFsError(fs.writeFile(join(previewsRoot, fileName), preview.content));
            });

            // Add metadata write operation
            operations.push(
                writeMetadata(record, opts.engineInfo.name, opts.engineInfo.options, previews, fileNamer, previewsRoot),
            );

            return operations;
        }),
    );

    logger.info("Done! Review previews and then send.");
}

main(opts);
