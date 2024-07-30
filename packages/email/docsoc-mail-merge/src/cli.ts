import { parse } from "csv-parse";
import "dotenv/config";
import { promises as fs } from "fs";
import markdownit from "markdown-it";
import { mkdirp } from "mkdirp";
import nunjucks from "nunjucks";
// load .env
import { join } from "path";

import packageJSON from "../package.json";
import { ENGINES_MAP } from "./engines";
import { TemplatePreview } from "./engines/types";
import { stopIfCriticalFsError } from "./util/files";
import createLogger from "./util/logger";
import mapInteractive from "./util/mapInteractive";
import { CliOptions } from "./util/types";

const logger = createLogger("docsoc");

const opts: CliOptions = {
    csvFile: "./data/names.csv",
    templateOptions: {
        templatePath: "./templates/TEMPLATE.md.njk",
        rootHtmlTemplate: "./templates/wrappr.html.njk",
    },
    templateEngine: "nunjucks",
    output: "./output",
};

async function main(opts: CliOptions) {
    logger.info("DoCSoc Mail Merge");
    logger.info(`v${packageJSON.version}`);

    const runName = await getRunNameInteractively();

    // 1: Load the CSV
    logger.info("Loading CSV...");
    const csvRaw = await stopIfCriticalFsError(fs.readFile(join(__dirname, "../data/names.csv"), "utf-8"));
    logger.debug("Parsing & loading CSV...");
    const csvParsed = parse(csvRaw, { columns: true });
    const records = [];
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

    // 4: Map to template
    logger.info("Loading template...");
    const EngineClass: any = ENGINES_MAP[opts.templateEngine];
    if (!EngineClass) {
        logger.error(`Invalid template engine: ${opts.templateEngine}`);
        throw new Error(`Invalid template engine: ${opts.templateEngine}`);
    }
    const engine = new EngineClass();
    await engine.loadTemplate(opts.templateOptions["templatePath"]);

    // 5: Extract template fields
    logger.info("Extracting template fields...");
    const templateFields: Set<string> = engine.extractFields();
    logger.info(`Fields found: ${Array.from(templateFields).join(", ")}`);

    // 6: Map CSV fields to template interactively
    logger.info("Mapping CSV fields to template interactively");
    const fieldsMapCSVtoTemplate = await mapInteractive(templateFields, headers);

    // 7: Ask what to name files using
    const fileNamer: (record: any) => string = await getFileNameSchemeInteractively(fields, records);

    // 7: Render intermediate results
    logger.info("Rendering template previews/intermediates...");
    const previews: [TemplatePreview, any][] = await Promise.all(
        records.map((csvRecord) => {
            const preparedRecord = Object.fromEntries(
                Object.entries(csvRecord).map(([key, value]) => {
                    return [fieldsMapCSVtoTemplate.get(key) ?? key, value];
                }),
            );
            return [engine.renderPreview(preparedRecord), csvRecord];
        }),
    );
    // 7: Write to file
    logger.info("Writing previews files...");
    const previewsRoot = join(opts.output, "previews", runName);
    logger.warn(`Writing previews to ${previewsRoot}...`);
    logger.debug("Creating directories...");
    await mkdirp(previewsRoot);
    logger.debug("Writing files...");
    await Promise.all(
        previews.flatMap(async ([previews, record]) =>
            previews.map(async (preview) => {
                const fileName = fileNamer(record);
                await fs.writeFile(`./previews/${fileName}__${opts.templateEngine}__${preview}`, preview.content);
            }),
        ),
    );

    logger.info("Done! Review previews and then send.");
}

main(opts);
