import {
    EmailString,
    ENGINES_MAP,
    getRecordPreviewPrefixForIndividual,
    getSidecarMetadata,
    MappedRecord,
    TemplateEngineOptions,
    TemplatePreviews,
    writeMetadata,
} from "@docsoc/libmailmerge";
import { createLogger } from "@docsoc/util";
import fs from "fs/promises";
import { mkdirp } from "mkdirp";
import { join } from "path";

export interface MergeResult {
    record: MappedRecord;
    previews: TemplatePreviews;
    engineInfo: {
        /** Engine used */
        name: keyof typeof ENGINES_MAP;
        /** Options given to the engine */
        options: TemplateEngineOptions;
    };
    attachmentPaths: string[];
    /** Metadata for emailing */
    email: {
        to: EmailString[];
        cc: EmailString[];
        bcc: EmailString[];
        subject: string;
    };
}

export interface StorageBackend {
    loadPreviews(): PromiseLike<[TemplatePreviews, MappedRecord][]>;
    storeMergeResult(
        results: MergeResult[],
        rawData: { headers: Set<string>; records: MappedRecord[] },
    ): PromiseLike<void>;
}

const logger = createLogger("sidecar");
export class JSONSidecarsBackend implements StorageBackend {
    constructor(
        private outputRoot: string,
        private fileNamer:
            | {
                  /** You already know the shape of a record, so can provide the namer upfront */
                  type: "fixed";
                  namer: (record: MappedRecord) => string;
              }
            | {
                  /** You need to know the shape of a record, so need to provide the namer later (e.g. by prompting the user) */
                  type: "dynamic";
                  namer: (
                      headers: Set<string>,
                      records: MappedRecord[],
                  ) => PromiseLike<(record: MappedRecord) => string>;
              },
    ) {}

    loadPreviews(): PromiseLike<[TemplatePreviews, MappedRecord][]> {
        throw new Error("Method not implemented.");
    }

    async storeMergeResult(
        results: MergeResult[],
        { headers, records }: { headers: Set<string>; records: MappedRecord[] },
    ): Promise<void> {
        logger.warn(`Writing previews to ${this.outputRoot}...`);
        let fileNamer: (record: MappedRecord) => string;
        if (this.fileNamer.type === "fixed") {
            fileNamer = this.fileNamer.namer;
        } else {
            fileNamer = await this.fileNamer.namer(headers, records);
        }
        logger.debug("Creating directories...");
        await mkdirp(this.outputRoot);
        logger.debug("Writing files...");
        await Promise.all(
            results.flatMap(
                async ({ previews, record, engineInfo, attachmentPaths: attachmentPath }) => {
                    const operations = previews.map(async (preview) => {
                        const fileName = getRecordPreviewPrefixForIndividual(
                            record,
                            fileNamer,
                            engineInfo.name,
                            preview,
                        );
                        logger.debug(`Writing ${fileName}...`);
                        await fs.writeFile(join(this.outputRoot, fileName), preview.content);
                    });

                    // Add metadata write operation
                    operations.push(
                        writeMetadata(
                            record,
                            getSidecarMetadata(
                                fileNamer,
                                record,
                                engineInfo.name,
                                engineInfo.options,
                                attachmentPath,
                                previews,
                            ),
                            fileNamer,
                            this.outputRoot,
                        ),
                    );

                    return operations;
                },
            ),
        );

        logger.info(`Done! Review previews at ${this.outputRoot} and then send.`);
    }
}
