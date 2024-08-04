import { EmailUploader, ENGINES_MAP } from "@docsoc/libmailmerge";
import { loadPreviewsFromSidecar, loadSidecars, EmailString } from "@docsoc/libmailmerge";
import { createLogger } from "@docsoc/util";
// Load dotenv
import "dotenv/config";
import { join } from "path";

const logger = createLogger("docsoc");

export async function uploadDrafts(directory: string) {
    logger.info(`Uploading previews at ${directory} to drafts...`);

    // 1: Load sidecars
    const sidecars = loadSidecars(directory);

    // For each sidecar, send the previews
    const pendingEmails: {
        to: EmailString[];
        subject: string;
        html: string;
        attachments: string[];
        /** These files will be moved to the sent folder on the file system so they are not resent (include sidecar data) */
        filesToMove: string[];
        cc: EmailString[];
        bcc: EmailString[];
    }[] = [];
    for await (const sidecar of sidecars) {
        const { name, engine: engineName, engineOptions, files } = sidecar;

        const EngineClass = ENGINES_MAP[engineName as keyof typeof ENGINES_MAP];
        if (!EngineClass) {
            logger.error(`Invalid template engine: ${engineName}`);
            logger.warn(`Skipping record ${name} as the engine is invalid!`);
            continue;
        }

        // Load in the engine
        const engine = new EngineClass(engineOptions);
        logger.debug(`Loading engine ${engineName} for ${name}...`);
        await engine.loadTemplate();

        // Get data to send
        const loadedPreviews = await loadPreviewsFromSidecar(files, directory);
        const html = await engine.getHTMLToSend(loadedPreviews, sidecar.record);

        // Add to pending emails
        pendingEmails.push({
            to: sidecar.email.to,
            subject: sidecar.email.subject,
            html,
            attachments: sidecar.attachments,
            filesToMove: files
                .map((file) => join(directory, file.filename))
                .concat([sidecar.$originalFilepath]),
            cc: sidecar.email.cc,
            bcc: sidecar.email.bcc,
        });
    }

    // Print the warning
    // TODO: Move sent emails elsewhere
    //     console.log(
    //         chalk.yellow(`⚠️   --- WARNING --- ⚠️
    // You are about to upload ${pendingEmails.length} emails.
    // This action is IRREVERSIBLE.

    // If the system crashes, you will need to manually upload the emails.
    // Re-running this after a partial upload will end up uploading duplicate emails.
    // Unlike with send, emails will not be moved to a different folder after upload.

    // Check that:
    // 1. The template was correct
    // 1. You are satisfied with ALL previews, including the HTML previews
    // 3. You have tested the system beforehand
    // 4. All indications this is a test have been removed

    // You are about to upload ${pendingEmails.length} emails. The esitmated time for this is ${
    //             (20 * pendingEmails.length) / 60 / 60
    //         } hours.

    // If you are happy to proceed, please type "Yes, upload emails" below.`),
    //     );

    //     const input = readlineSync.question("");
    //     if (input !== "Yes, upload emails") {
    //         process.exit(0);
    //     }

    // Send the emails
    logger.info("Uploading emails...");
    const total = pendingEmails.length;
    let sent = 0;
    const uploader = new EmailUploader();
    await uploader.authenticate(
        "docsoc@ic.ac.uk",
        process.env["MS_ENTRA_TENANT_ID"],
        process.env["MS_ENTRA_CLIENT_ID"],
    );
    for (const { to, subject, html, attachments, filesToMove, cc, bcc } of pendingEmails) {
        logger.info(
            `(${++sent} / ${total}) Uploading email to ${to} with subject ${subject} to Drafts...`,
        );

        await uploader.uploadEmail(to, subject, html, attachments, {
            cc,
            bcc,
        });
    }
}
