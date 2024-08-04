import { NunjucksMarkdownEngine, NunjucksMarkdownTemplateOptions } from "@docsoc/libmailmerge";
import { Args, Command, Flags } from "@oclif/core";
import { join } from "path";

import generatePreviews, { CliOptions as GeneratePreviewsOptions } from "../../common/generate.js";
import { DEFAULT_DIRS } from "../../util/constant.js";

export default class GenerateNunjucks extends Command {
    static override args = {
        csvFile: Args.string({
            description: "Path to the CSV file to use as the data source for the mailmerge",
            required: true,
        }),
        template: Args.string({
            description: "Path to the Nunjucks Markdown template file to use to generate emails",
            required: true,
            default: join(DEFAULT_DIRS.TEMPLATES, "template.md.njk"),
        }),
    };

    static override description = "Start a mailmerge from a CSV & Nunjucks template";

    static override examples = ["<%= config.bin %> <%= command.id %>"];

    static override flags = {
        // // flag with no value (-f, --force)
        // force: Flags.boolean({ char: "f" }),
        // // flag with a value (-n, --name=VALUE)
        // name: Flags.string({ char: "n", description: "name to print" }),
        output: Flags.string({
            char: "o",
            description: "Path to the directory to output the generated email previews to",
            default: DEFAULT_DIRS.PREVIEWS,
        }),
        htmlTemplate: Flags.string({
            description: "Path to the HTML template to use to generate the final email",
            default: join(DEFAULT_DIRS.TEMPLATES, "wrapper.html.njk"),
        }),
        attachment: Flags.string({
            multiple: true,
            char: "a",
            description:
                "Attachments to add to the email, relative to mailmerge workspace root. Can specify multiple.",
            default: [],
        }),
        cc: Flags.boolean({
            char: "c",
            description: "Enable CC mapping from CSV - column values must be a space separate list",
        }),
        bcc: Flags.boolean({
            char: "b",
            description:
                "Enable BCC mapping from CSV - column values must be a space separate list",
        }),
        name: Flags.string({
            char: "n",
            description: "Name of the run, created as a subdirectory in the output directory",
        }),
    };

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(GenerateNunjucks);
        const engineOptions: NunjucksMarkdownTemplateOptions = {
            templatePath: args.template,
            rootHtmlTemplate: flags.htmlTemplate,
        };
        const options: GeneratePreviewsOptions = {
            csvFile: args.csvFile,
            engineInfo: {
                options: engineOptions,
                name: "nunjucks",
                engine: new NunjucksMarkdownEngine(engineOptions),
            },
            output: flags.output,
            attachments: flags.attachment,
            features: {
                enableBCC: flags.bcc,
                enableCC: flags.cc,
            },
            name: flags.name,
        };
        await generatePreviews(options);
    }
}
