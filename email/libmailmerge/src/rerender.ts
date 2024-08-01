import fs from "fs/promises";
import { join } from "path";

import packageJSON from "../package.json";
import { ENGINES_MAP } from "./engines";
import { TemplatePreviews } from "./engines/types";
import loadPreviewsFromSidecar from "./previews/loadPreviews";
import { loadSidecars, writeSidecarFile } from "./previews/sidecarData";
import { createLogger, stopIfCriticalFsError } from "@docsoc/util";

const logger = createLogger("docsoc");

async function main(directory: string) {
    logger.info("DoCSoc Mail Merge - rerender");
    logger.info(`v${packageJSON.version}`);

    logger.info(`Rerendering previews at ${directory}...`);

    // 1: Load all sidecars
    const sidecars = loadSidecars(directory);
    // 2: Map sidecar files & rerender
    for await (const sidecar of sidecars) {
        const { name, engine: engineName, engineOptions, files, record } = sidecar;

        const EngineClass = ENGINES_MAP[engineName as keyof typeof ENGINES_MAP];
        if (!EngineClass) {
            logger.error(`Invalid template engine: ${engineName}`);
            logger.warn(`Skipping record ${name} as the engine is invalid!`);
            continue;
        }

        // Load in the engine
        const engine = new EngineClass(engineOptions);
        logger.debug(`Loading engine ${engineName} for ${name}...`);
        await engine.loadTemplate();

        logger.debug("Remapping sidecar files metadata back to TemplatePreviews...");
        logger.debug(JSON.stringify(files));
        const previews: TemplatePreviews = await loadPreviewsFromSidecar(files, directory);

        // Rerender previews
        logger.info(`Rerendering ${name} using engine ${engineName}...`);
        const renderedPreviews = await engine.rerenderPreviews(previews, record);

        logger.info(`Writing rerendered previews for ${name}...`);
        await Promise.all(
            renderedPreviews.map(async (preview, idx) => {
                const file = files[idx];
                logger.debug(`Writing rerendered preview ${file.filename}...`);
                await stopIfCriticalFsError(fs.writeFile(join(directory, file.filename), preview.content));
                logger.debug("Overwriting sidecar metadata with new metadata...");
                sidecar.files[idx].engineData = { ...preview, content: undefined };
            }),
        );

        logger.info(`Updating sidecar metadata for ${name} at ${sidecar.$originalfilename}...`);
        await writeSidecarFile(directory, sidecar.$originalfilename, sidecar);

        logger.info(`Finished rerendering ${name}`);
    }
}

if (process.argv.length < 3) {
    logger.error("Please provide the directory to rerender previews in");
    process.exit(1);
}

main(process.argv[2]);
