import inquirer from "inquirer";

import { CSVRecord } from "../util/types";

/**
 * Interactively get a function that generates a filename from a record, by asking a user which fields to use and separating the chosen fields with a hyphen.
 * @param headers CSV headers
 * @param records Records to provide examples
 * @returns
 */
export async function getFileNameSchemeInteractively(
    headers: string[],
    records: CSVRecord[],
): Promise<(record: CSVRecord) => string> {
    if (records.length === 0) {
        throw new Error("No records available to provide examples.");
    }

    const firstRecord = records[0];

    const choices = headers.map((header) => ({
        name: `${header} (e.g. ${firstRecord[header]})`,
        value: header,
    }));

    /// @ts-expect-error: Inquirer type
    const answers = await inquirer.prompt([
        {
            type: "checkbox",
            name: "selectedFields",
            message: "Select fields to use in the filename:",
            choices: choices,
        },
    ]);

    const selectedFields: string[] = answers.selectedFields;

    return (record: CSVRecord) => {
        return selectedFields.map((field) => record[field]).join("-");
    };
}