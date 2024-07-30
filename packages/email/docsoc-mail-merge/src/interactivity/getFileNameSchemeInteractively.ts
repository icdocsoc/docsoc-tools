import inquirer from 'inquirer';

export async function getFileNameSchemeInteractively(headers: string[], records: Record<string, any>[]): Promise<(record: Record<string, any>) => string> {
    if (records.length === 0) {
        throw new Error("No records available to provide examples.");
    }

    const firstRecord = records[0];

    const choices = headers.map(header => ({
        name: `${header} (e.g. ${firstRecord[header]})`,
        value: header
    }));

    /// @ts-expect-error: Inquirer type
    const answers = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selectedFields',
            message: 'Select fields to use in the filename:',
            choices: choices
        }
    ]);

    const selectedFields: string[] = answers.selectedFields;

    return (record: Record<string, any>) => {
        return selectedFields.map(field => record[field]).join('-');
    };
}
