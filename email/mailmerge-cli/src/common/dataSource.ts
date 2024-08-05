import { RawRecord } from "@docsoc/libmailmerge";
import { createLogger } from "@docsoc/util";
import { parse } from "csv-parse";
import fs from "fs/promises";

/**
 * Generic way of loading data in to do a data merge on.
 *
 * All you need to do is implement the `loadRecords` method, that resolves
 * to a set of headers and records.
 *
 * Headers are a set of strings, and records are an array of objects where the keys are the headers and are strings
 *
 * For an example, see {@link CSVBackend}
 *
 */
export interface DataSource {
    loadRecords: () => Promise<{
        headers: Set<string>;
        records: RawRecord[];
    }>;
}

const logger = createLogger("csv");

export class CSVBackend implements DataSource {
    constructor(private csvFile: string) {}
    async loadRecords(): Promise<{ headers: Set<string>; records: RawRecord[] }> {
        // Load CSV
        logger.info("Loading CSV...");
        const csvRaw = await fs.readFile(this.csvFile, "utf-8");
        logger.debug("Parsing & loading CSV...");
        const csvParsed = parse(csvRaw, { columns: true });
        const records: RawRecord[] = [];
        for await (const record of csvParsed) {
            records.push(record);
        }
        logger.info(`Loaded ${records.length} records`);
        logger.debug("Extracting headers from first record's keys...");
        if (records.length === 0) {
            logger.error("No records found in CSV");
            throw new Error("No records found in CSV");
        }
        const headers = new Set<string>(Object.keys(records[0]));
        logger.info(`Headers: ${Object.keys(records[0]).join(", ")}`);
        return { headers, records };
    }
}
