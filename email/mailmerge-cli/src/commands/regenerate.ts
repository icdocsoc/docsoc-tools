import { Args, Command } from "@oclif/core";

import { rerenderPreviews } from "../common/rerender.js";

export default class Regenerate extends Command {
    static override args = {
        directory: Args.string({
            description: "Directory of previews to regenerate",
            required: true,
        }),
    };

    static override description =
        "Regenerate previews for a given directory, using the sidecard JSON file next to preview & the rerender method of the associated engine";

    static override examples = ["<%= config.bin %> <%= command.id %>"];

    static override flags = {};

    public async run(): Promise<void> {
        const { args } = await this.parse(Regenerate);

        const directory = args.directory;

        // Rerender previews
        await rerenderPreviews(directory);
    }
}
