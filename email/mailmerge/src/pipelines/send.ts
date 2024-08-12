import { createLogger } from "@docsoc/util";
import chalk from "chalk";
// Load dotenv
import "dotenv/config";
import readlineSync from "readline-sync";

import { ENGINES_MAP } from "../engines/index.js";
import { TemplateEngineConstructor } from "../engines/types.js";
import Mailer from "../mailer/mailer.js";
import { EmailString, FromEmail } from "../util/types.js";
import { StorageBackend, MergeResultWithMetadata } from "./storage/types";

interface SendEmailsOptions {
    /** Time to sleep between sending emails to prevent hitting rate limits */
    sleepBetween?: number;
    /** Only send this many emails (i.e. the first X emails) */
    onlySend?: number;
}

const DEFAULT_SLEEP_BETWEEN = 0;

/**
 * Generic way to send emails, given a storage backend to get mail merge results from to send and a mailer to send them with.
 *
 * NOTE: This function will prompt the user before sending emails, unless `disablePrompt` is set to true. SO make sure it is set to true if you want to do a fully headless send.
 * @param storageBackend Storage backend to get mail merge results from
 * @param mailer Mailer to send emails with
 * @param fromAddress From address to send emails from (note the format - RFC5322. E.g. `"DoCSoc" <docsoc@ic.ac.uk>`)
 * @param enginesMap Map of engine names to engine constructors, as we need to ask the engine what the HTML is to send from the result
 * @param disablePrompt If true, will not prompt the user before sending emails. Defaults to false (will prompt)
 * @param logger Logger to use for logging
 * @param options
 */
export async function sendEmails(
    storageBackend: StorageBackend,
    mailer: Mailer,
    fromAddress: FromEmail,
    enginesMap: Record<string, TemplateEngineConstructor> = ENGINES_MAP,
    disablePrompt = false,
    options: SendEmailsOptions = {
        sleepBetween: DEFAULT_SLEEP_BETWEEN,
    },
    logger = createLogger("docsoc"),
) {
    logger.info(`Sending mail merge results...`);

    if (options?.onlySend === 0) {
        logger.warn(`onlySend is set to 0, so no emails will be sent.`);
        return;
    }

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
You are about to send ${pendingEmails.length} emails.
This action is IRREVERSIBLE.
                
If the system crashes, restarting will NOT necessarily send already-sent emails again.

Check that:
1. The template was correct
1. You are satisfied with ALL previews, including the HTML previews
3. You have tested the system beforehand
4. All indications this is a test have been removed

You are about to send ${pendingEmails.length} emails. The esitmated time for this is ${
            ((3 + (options.sleepBetween ?? DEFAULT_SLEEP_BETWEEN)) * pendingEmails.length) / 60 / 60
        } hours.

    If you are happy to proceed, please type "Yes, send emails" below.`),
    );
    if (!disablePrompt) {
        const input = readlineSync.question("");
        if (input !== "Yes, send emails") {
            throw new Error("User did not confirm sending emails!");
        }
    }

    // Send the emails
    logger.info("Sending emails...");
    const total = pendingEmails.length;
    let sent = 0;
    for (const { to, subject, html, attachments, cc, bcc, originalResult } of pendingEmails) {
        logger.info(`(${++sent} / ${total}) Sending email to ${to} with subject ${subject}...`);
        await mailer.sendMail(
            fromAddress,
            to,
            subject,
            html,
            attachments.map((file) => ({
                path: file,
            })),
            {
                cc,
                bcc,
            },
        );

        if (storageBackend.postSendAction) {
            logger.debug("Calling post-send hook...");
            await storageBackend.postSendAction(originalResult);
        }

        logger.info("Email sent!");

        // Stop if we're only sending a certain number of emails
        if (options.onlySend && sent >= options.onlySend) {
            logger.info(`Only sending ${options.onlySend} emails - stopping.`);
            break;
        }

        if (!options.sleepBetween) {
            options.sleepBetween = DEFAULT_SLEEP_BETWEEN;
        }

        if (options.sleepBetween > 0) {
            logger.info(`Sleeping for ${options.sleepBetween}s before the next email...`);
            await new Promise((resolve) =>
                setTimeout(resolve, (options.sleepBetween ?? DEFAULT_SLEEP_BETWEEN) * 1000),
            );
        }
    }
}
