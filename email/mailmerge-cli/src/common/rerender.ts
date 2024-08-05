import { ENGINES_MAP, TemplateEngineConstructor } from "@docsoc/libmailmerge";
import { createLogger } from "@docsoc/util";

import { MergeResultWithMetadata, StorageBackend } from "./storageBackend";

const logger = createLogger("docsoc");

/**
 * Generic way tp rerender previews (so that modification to them may be made)
 * @param storageBackend Backend to load and re-save merge results
 * @param enginesMap Map of engine names to engine constructors, so that we can rerender previews using the original engine.
 */
export async function rerenderPreviews(
    storageBackend: StorageBackend,
    enginesMap: Record<string, TemplateEngineConstructor> = ENGINES_MAP,
) {
    logger.info(`Rerendering previews...`);

    logger.info("Loading merge results...");
    const mergeResults = storageBackend.loadMergeResults();
    const rerenderedPreviews: MergeResultWithMetadata<unknown>[] = [];

    for await (const result of mergeResults) {
        const { record, previews, engineInfo, email } = result;
        logger.info(
            `Rerendering email addressed to ${JSON.stringify(email.to)} using engine ${
                engineInfo.name
            }...`,
        );
        const EngineClass = enginesMap[engineInfo.name];
        if (!EngineClass) {
            logger.error(`Invalid template engine: ${engineInfo.name}`);
            logger.warn(
                `Skipping record addressed to ${JSON.stringify(
                    email.to,
                )} as the engine is invalid!`,
            );
            continue;
        }

        // Load in the engine
        const engine = new EngineClass(engineInfo.options);
        logger.debug(
            `Loading engine ${engineInfo.name} for email addressed to addressed to ${JSON.stringify(
                email.to,
            )}...`,
        );
        await engine.loadTemplate();
        const renderedPreviews = await engine.rerenderPreviews(previews, record);
        rerenderedPreviews.push({
            ...result,
            previews: renderedPreviews,
        });
    }

    logger.info("Writing rerendered previews...");
    await storageBackend.storeUpdatedMergeResults(rerenderedPreviews);
}
