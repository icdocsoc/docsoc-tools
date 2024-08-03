// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TemplateEngine } from "@docsoc/libmailmerge";
import { createLogger } from "@docsoc/util";
import inquirer from "inquirer";

/**
 * Using inquirer, map the csv headers to template fields
 * @param templateFields Set of fields the template wants
 * @param csvHeaders Headers from the CSV
 * @returns Map of csv headers to template fields
 */
const logger = createLogger("docsoc.util.mapInteractive");

/**
 * Interactive mapping of CSV fields to template fields.
 *
 * Prints a prompt for each CSV header, asking the user to select the corresponding template field.
 * Finishes with a warning if not all template fields were mapped.
 *
 * NOTE: It is recommend to use this function in a CLI environment, as it uses inquirer for interactive prompts.
 * NOTE: Provide this function with any special fields you need e.g. email, name, etc.
 * @param templateFields Set of fields the template wants, extracted using {@link TemplateEngine.extractFields}
 * @param csvHeaders Headers from the CSV
 * @returns Map of csv headers to template fields
 */
export const mapCSVFieldsInteractive = async (
    templateFields: Set<string>,
    csvHeaders: string[],
): Promise<Map<string, string>> => {
    const map = new Map<string, string>();
    const mappedFields = new Set<string>();
    logger.debug("Mapping CSV fields to template interactively");

    const NONE_OPTION = "None";

    logger.info("When prompted, select the corresponding template field for each CSV header");

    const prompter = inquirer.prompt(
        // Provide the correct type for the prompt function
        /// @ts-expect-error: The type of the prompt function is incorrect
        csvHeaders.map((header) => ({
            type: "list",
            name: header,
            message: `Map CSV field \`${header}\` to template field:`,
            choices: Array.from(templateFields).concat([NONE_OPTION]),
            // Set default to index in templateField that matches the csvHeader
            default: templateFields.has(header)
                ? header
                : header.startsWith("attachment")
                ? "None"
                : undefined,
        })),
    );
    for (const [csvHeader, templateFieldChosen] of Object.entries(await prompter).filter(
        ([, field]) => field !== NONE_OPTION,
    )) {
        map.set(csvHeader, templateFieldChosen);
        mappedFields.add(templateFieldChosen);
    }

    // Warn if not all fields were mapped
    const unmappedFields = new Set([...templateFields].filter((field) => !mappedFields.has(field)));
    if (unmappedFields.size > 0) {
        logger.warn(
            `The following fields were not mapped: ${Array.from(unmappedFields).join(", ")}`,
        );
    }

    return map;
};
