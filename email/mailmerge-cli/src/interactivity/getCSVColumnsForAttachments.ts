import inquirer from "inquirer";

export const getCSVColumnsForAttachments = async (csvFields: string[]): Promise<string[]> => {
    // Auto-select fields starting with "attachment"
    const defaultSelected = csvFields.filter((field) => field.startsWith("attachment"));
    console.log(defaultSelected);
    // Prompt user to select fields
    /// @ts-expect-error: Bad inquirer types
    const answers = await inquirer.prompt([
        {
            type: "checkbox",
            name: "selectedFields",
            message: "Select fields that contain the path of attachment:",
            choices: csvFields.map((field) => ({
                name: field,
                value: field,
                checked: field.startsWith("attachment"),
            })),
        },
    ]);

    return answers.selectedFields;
};
