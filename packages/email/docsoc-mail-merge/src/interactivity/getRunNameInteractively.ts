import inquirer from "inquirer";
import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator";

export default async function getRunNameInteractively() {
    // Generate a default name
    const defaultName = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: ".",
        length: 3,
    });

    // Prompt the user for the run name
    /// @ts-expect-error: The type of the prompt function is incorrect
    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "runName",
            message: "Enter the name of the run:",
            default: defaultName,
        },
    ]);

    return answers.runName;
}
