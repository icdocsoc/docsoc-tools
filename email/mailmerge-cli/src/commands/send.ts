import {
    JSONSidecarsBackend,
    sendEmails,
    getDefaultMailer,
    getDefaultDoCSocFromLine,
} from "@docsoc/libmailmerge";
import { Args, Command } from "@oclif/core";

export default class Send extends Command {
    static override args = {
        directory: Args.string({
            description: "Directory of email previews to render & send",
            required: true,
        }),
    };

    static override description = "Send generated emails from a given directory";

    static override examples = ["<%= config.bin %> <%= command.id %>"];

    static override flags = {};

    public async run(): Promise<void> {
        const { args } = await this.parse(Send);

        const directory = args.directory;
        const storageBackend = new JSONSidecarsBackend(directory, {
            type: "fixed",
            /// @ts-expect-error: Required for fileNamer
            namer: (record) => record[DEFAULT_FIELD_NAMES.to],
        });
        // Rerender previews
        await sendEmails(storageBackend, getDefaultMailer(), getDefaultDoCSocFromLine());
    }
}
