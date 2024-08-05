import {
    EmailString,
    ENGINES_MAP,
    getRecordPreviewPrefixForIndividual,
    getSidecarMetadata,
    loadPreviewsFromSidecar,
    loadSidecars,
    MappedRecord,
    SidecarData,
    TemplateEngineOptions,
    TemplatePreviews,
    writeMetadata,
    writeSidecarFile,
} from "@docsoc/libmailmerge";
import { createLogger, move } from "@docsoc/util";
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

export type MergeResultWithMetadata<Metadata = unknown> = MergeResult & {
    storageBackendMetadata: Metadata;
};
export interface StorageBackend<Metadata = unknown> {
    loadMergeResults(): AsyncGenerator<MergeResultWithMetadata<Metadata>>;
    storeUpdatedMergeResults(results: MergeResultWithMetadata<Metadata>[]): PromiseLike<void>;
    postSendAction?(resultSent: MergeResultWithMetadata<Metadata>): PromiseLike<void>;
    storeOriginalMergeResults(
        results: MergeResult[],
        rawData: { headers: Set<string>; records: MappedRecord[] },
    ): PromiseLike<void>;
}

const logger = createLogger("sidecar");
interface JSONSidecarsBackendMetadata {
    sideCar: SidecarData & {
        /** Path to the original sidecar file */
        $originalFilepath: string;
    };
}
export class JSONSidecarsBackend implements StorageBackend<JSONSidecarsBackendMetadata> {
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

    async *loadMergeResults(): AsyncGenerator<
        MergeResultWithMetadata<JSONSidecarsBackendMetadata>
    > {
        logger.info(`Loading previews from ${this.outputRoot}...`);
        // 1: Load all sidecars
        const sidecars = loadSidecars(this.outputRoot);
        // 2: Map sidecar files & rerender
        for await (const sidecar of sidecars) {
            const { name, engine: engineName, engineOptions, files, record } = sidecar;

            const EngineClass = ENGINES_MAP[engineName as keyof typeof ENGINES_MAP];
            if (!EngineClass) {
                logger.error(`Invalid template engine: ${engineName}`);
                logger.warn(`Skipping record ${name} as the engine is invalid!`);
                continue;
            }
            logger.debug("Remapping sidecar files metadata back to merge results...");
            logger.debug(JSON.stringify(files));
            const previews: TemplatePreviews = await loadPreviewsFromSidecar(
                files,
                this.outputRoot,
            );

            yield {
                record,
                previews,
                engineInfo: {
                    name: engineName as keyof typeof ENGINES_MAP,
                    options: engineOptions,
                },
                attachmentPaths: sidecar.attachments,
                email: sidecar.email,
                storageBackendMetadata: {
                    sideCar: sidecar,
                },
            };
        }
    }

    async storeUpdatedMergeResults(
        results: MergeResultWithMetadata<JSONSidecarsBackendMetadata>[],
    ): Promise<void> {
        for (const result of results) {
            const sidecar = result.storageBackendMetadata.sideCar;
            const { name } = sidecar;
            logger.info(`Writing rerendered previews for ${name}...`);
            await Promise.all(
                result.previews.map(async (preview, idx) => {
                    const file = sidecar.files[idx];
                    logger.debug(`Writing rerendered preview ${file.filename}...`);
                    await fs.writeFile(join(this.outputRoot, file.filename), preview.content),
                        logger.debug("Overwriting sidecar metadata with new metadata...");
                    sidecar.files[idx].engineData = {
                        ...preview,
                        content: undefined,
                    };
                }),
            );

            logger.info(`Updating sidecar metadata for ${name} at ${sidecar.$originalFilepath}...`);
            await writeSidecarFile(sidecar.$originalFilepath, sidecar);
        }
    }

    async postSendAction(
        resultSent: MergeResultWithMetadata<JSONSidecarsBackendMetadata>,
    ): Promise<void> {
        const sidecar = resultSent.storageBackendMetadata.sideCar;
        const sentRoot = join(this.outputRoot, "sent");
        logger.info(`Moving sent emails for ${sidecar.name} to ${sentRoot}...`);
        await mkdirp(sentRoot);
        await Promise.all(
            sidecar.files.map(async (file) => {
                await move(join(this.outputRoot, file.filename), sentRoot);
            }),
        );
    }

    async storeOriginalMergeResults(
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
