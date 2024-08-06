import {
    JSONSidecarsBackend,
    sendEmails,
    getDefaultMailer,
    getDefaultDoCSocFromLine,
    ENGINES_MAP,
} from "@docsoc/mailmerge";
import { Args, Command, Flags } from "@oclif/core";

export default class Send extends Command {
    static override args = {
        directory: Args.string({
            description: "Directory of email previews to render & send",
            required: true,
        }),
    };

    static override description = "Send generated emails from a given directory";

    static override examples = ["<%= config.bin %> <%= command.id %>"];

    static override flags = {
        sleepBetween: Flags.integer({
            char: "s",
            description: "Time to sleep between sending emails to prevent hitting rate limits",
            default: 0,
        }),
        yes: Flags.boolean({
            char: "y",
            description: "Skip confirmation prompt",
            default: false,
        }),
    };

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(Send);

        const directory = args.directory;
        const storageBackend = new JSONSidecarsBackend(directory, {
            type: "fixed",
            /// @ts-expect-error: Required for fileNamer
            namer: (record) => record[DEFAULT_FIELD_NAMES.to],
        });
        // Rerender previews
        await sendEmails(
            storageBackend,
            getDefaultMailer(),
            getDefaultDoCSocFromLine(),
            ENGINES_MAP,
            flags.yes,
            flags.sleepBetween,
        );
    }
}
