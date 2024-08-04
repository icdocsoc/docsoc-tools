import { createLogger } from "@docsoc/util";
import { Hook } from "@oclif/core";

import packageJSON from "../../../package.json";

const logger = createLogger("mailmerge");

const hook: Hook<"prerun"> = async function () {
    logger.info("DoCSoc Mailmerge");
    logger.info("(c) Kishan Sambhi 2024");
    logger.info(`v${packageJSON.version}`);
    logger.info("");
};

export default hook;
