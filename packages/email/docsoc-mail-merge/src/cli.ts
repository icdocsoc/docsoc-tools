import { parse } from "csv-parse";
import "dotenv/config";
import { promises as fs } from "fs";
import markdownit from "markdown-it";
import nunjucks from "nunjucks";
// load .env
import { join } from "path";

import packageJSON from "../package.json";
import createLogger from "./util/logger";
import { CliOptions } from "./util/types";
import { stopIfCriticalFsError } from "./util/files";

const logger = createLogger("docsoc");

const opts: CliOptions = {
    csvFile: "./data/names.csv",
};

async function main(opts: CliOptions) {
    logger.info("DoCSoc Mail Merge");
    logger.info(`v${packageJSON.version}`);

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

    // 3: Grab fields
    if (records.length === 0) {
        logger.error("No records found in CSV");
        throw new Error("No records found in CSV");
    }
    const fields = Object.keys(records[0]);
    logger.info(`Fields: ${fields.join(", ")}`);
}

main(opts);
