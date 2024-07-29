import inquirer from "inquirer";

import createLogger from "./logger";

/**
 * Using inquirer, map the csv headers to template fields
 * @param templateFields Set of fields the template wants
 * @param csvHeaders Headers from the CSV
 * @returns Map of csv headers to template fields
 */
const logger = createLogger("docsoc.util.mapInteractive");

const mapInteractive = async (templateFields: Set<string>, csvHeaders: string[]): Promise<Map<string, string>> => {
    const map = new Map<string, string>();

    logger.debug("Mapping CSV fields to template interactively");

    logger.info("When promotd, select the corresponding template field for each CSV header");

    const prompter = inquirer.prompt(
        // Provide the correct type for the prompt function
        /// @ts-expect-error: The type of the prompt function is incorrect
        csvHeaders.map((header) => ({
            type: "list",
            name: header,
            message: `Map CSV field \`${header}\` to template field:`,
            choices: Array.from(templateFields),
        })),
    );
    for (const [csvHeader, templateFieldChosen] of Object.entries(await prompter)) {
        map.set(csvHeader, templateFieldChosen);
    }

    return map;
};

export default mapInteractive;
