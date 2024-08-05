import { Args, Command } from "@oclif/core";

import { uploadDrafts } from "../common/uploadDrafts.js";

export default class UploadDrafts extends Command {
    static override args = {
        directory: Args.string({
            description: "Directory of email previews to render & upload",
            required: true,
        }),
    };

    static override description =
        "Upload generated emails from a given directory to the Drafts folder";

    static override examples = ["<%= config.bin %> <%= command.id %>"];

    static override flags = {};

    public async run(): Promise<void> {
        const { args } = await this.parse(UploadDrafts);
        const directory = args.directory;

        await uploadDrafts(directory);
    }
}
