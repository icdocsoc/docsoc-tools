import { Args, Command } from "@oclif/core";

import { sendEmails } from "../common/send";

export default class Send extends Command {
    static override args = {
        directory: Args.string({ description: "Directory of email previews to render & send", required: true }),
    };

    static override description = "Send generated emails from a given directory";

    static override examples = ["<%= config.bin %> <%= command.id %>"];

    static override flags = {};

    public async run(): Promise<void> {
        const { args } = await this.parse(Send);

        const directory = args.directory;

        // Rerender previews
        await sendEmails(directory);
    }
}
