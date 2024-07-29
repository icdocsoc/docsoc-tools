import { promises as fs } from "fs";

import createLogger from "../../util/logger";
import mapInteractive from "../../util/mapInteractive";
import { TemplateEngine } from "../types";
import getTemplateFields from "./getFields";

const logger = createLogger("docsoc.engines.nunjucks");

interface NunjucksTemplateOptions {
    templatePath: string;
    rootHtmlTemplate: string;
    [key: string]: string;
}

function assertIsNunjucksTemplateOptions(
    options: Record<string, string | number | boolean>,
): asserts options is NunjucksTemplateOptions {
    if (!options["templatePath"] || typeof options["templatePath"] !== "string") {
        throw new Error("Invalid template option");
    }
    if (!options["rootHtmlTemplate"] || typeof options["rootHtmlTemplate"] !== "string") {
        throw new Error("Invalid rootHtmlTemplate option");
    }
}

const nunjucksEngine: TemplateEngine = async (templateOptions, data, headers): Promise<string> => {
    logger.info("Loading template...");
    assertIsNunjucksTemplateOptions(templateOptions);
    const { templatePath, rootHtmlTemplate } = templateOptions;
    const templateFile = await fs.readFile(templatePath, "utf-8");
    logger.info("Parsing template...");
    const fields = getTemplateFields(templateFile);
    logger.info("Fields found: " + fields);

    fields.add("email");

    await mapInteractive(fields, headers);

    return "";
};

export default nunjucksEngine;
