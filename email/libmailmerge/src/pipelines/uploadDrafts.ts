import { createLogger } from "@docsoc/util";
import chalk from "chalk";
// Load dotenv
import "dotenv/config";
import readlineSync from "readline-sync";

import { TemplateEngineConstructor, ENGINES_MAP } from "../engines/index.js";
import { EmailUploader } from "../graph/index.js";
import { EmailString } from "../util/index.js";
import { StorageBackend, MergeResultWithMetadata } from "./storage";

const logger = createLogger("docsoc");

/**
 * Upload mail merge results to drafts of an inbox using the Microsoft graph API
 *
 * NOTE: This function will prompt the user before sending emails, unless `disablePrompt` is set to true. SO make sure it is set to true if you want to do a fully headless send.
 *
 * NOTE: THis will initiate an interactive OAuth2 flow to authenticate with Microsoft Graph. This will open a browser to be opened.
 * @param storageBackend Storage backend to get mail merge results from
 * @param enginesMap Map of engine names to engine constructors, as we need to ask the engine what the HTML is to send from the result
 * @param entraTenantId The tenant ID for the Microsoft Graph API to authenticate with (taken from process.env.MS_ENTRA_TENANT_ID)
 * @param entraClientId The client ID for the Microsoft Graph API to authenticate with (taken from process.env.MS_ENTRA_CLIENT_ID)
 * @param disablePrompt If true, will not prompt the user before uploading emails. Defaults to false (will prompt)
 * @param expectedEmail The email address to expect the emails to be sent to. If the email address does not match, the email will not be sent.
 */
export async function uploadDrafts(
    storageBackend: StorageBackend,
    enginesMap: Record<string, TemplateEngineConstructor> = ENGINES_MAP,
    disablePrompt = false,
    entraTenantId = process.env["MS_ENTRA_TENANT_ID"],
    entraClientId = process.env["MS_ENTRA_CLIENT_ID"],
    expectedEmail = "docsoc@ic.ac.uk",
) {
    logger.info(`Uploading previews to drafts...`);
    // 1: Load data
    logger.info("Loading merge results...");
    const results = storageBackend.loadMergeResults();

    // For each sidecar, send the previews
    const pendingEmails: {
        to: EmailString[];
        subject: string;
        html: string;
        attachments: string[];
        cc: EmailString[];
        bcc: EmailString[];
        originalResult: MergeResultWithMetadata;
    }[] = [];
    for await (const result of results) {
        const { engineInfo, previews, email, attachmentPaths } = result;

        const EngineClass = enginesMap[engineInfo.name];
        if (!EngineClass) {
            logger.error(`Invalid template engine: ${engineInfo.name}`);
            logger.warn(`Skipping record addressed to ${email.to} as the engine is invalid!`);
            continue;
        }

        // Load in the engine
        const engine = new EngineClass(engineInfo.options);
        logger.debug(`Loading engine ${engineInfo.name}...`);
        await engine.loadTemplate();

        // Get data to send
        const html = await engine.getHTMLToSend(previews, result.record);

        // Add to pending emails
        pendingEmails.push({
            to: email.to,
            subject: email.subject,
            html,
            attachments: attachmentPaths,
            cc: email.cc,
            bcc: email.bcc,
            originalResult: result,
        });
    }

    // Print the warning
    console.log(
        chalk.yellow(`⚠️   --- WARNING --- ⚠️
    You are about to upload ${pendingEmails.length} emails.
    This action is IRREVERSIBLE.

    If the system crashes, you will need to manually upload the emails.
    Re-running this after a partial upload will end up uploading duplicate emails.
    Unlike with send, emails will not be moved to a different folder after upload.

    Check that:
    1. The template was correct
    1. You are satisfied with ALL previews, including the HTML previews
    3. You have tested the system beforehand
    4. All indications this is a test have been removed

    You are about to upload ${pendingEmails.length} emails. The esitmated time for this is ${
            (20 * pendingEmails.length) / 60 / 60
        } hours.

    If you are happy to proceed, please type "Yes, upload emails" below.`),
    );

    if (!disablePrompt) {
        const input = readlineSync.question("");
        if (input !== "Yes, upload emails") {
            process.exit(0);
        }
    }

    // Send the emails
    logger.info("Uploading emails...");
    const total = pendingEmails.length;
    let sent = 0;
    const uploader = new EmailUploader();
    await uploader.authenticate(expectedEmail, entraTenantId, entraClientId);
    for (const { to, subject, html, attachments, cc, bcc } of pendingEmails) {
        logger.info(
            `(${++sent} / ${total}) Uploading email to ${to} with subject ${subject} to Drafts...`,
        );

        const options = {
            enableOutlookParagraphSpacingHack: true,
        };

        await uploader.uploadEmail(
            to,
            subject,
            html,
            attachments,
            {
                cc,
                bcc,
            },
            options,
        );
    }
}
