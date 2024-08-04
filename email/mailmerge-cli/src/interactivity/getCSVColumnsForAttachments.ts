import inquirer from "inquirer";

export const getCSVColumnsForAttachments = async (csvFields: string[]): Promise<string[]> => {
    // Prompt user to select fields
    /// @ts-expect-error: Bad inquirer types
    const answers = await inquirer.prompt([
        {
            type: "checkbox",
            name: "selectedFields",
            message: "Select fields that contain the path of attachments:",
            choices: csvFields.map((field) => ({
                name: field,
                value: field,
                checked: field.startsWith("attachment"),
            })),
        },
    ]);

    return answers.selectedFields;
};
