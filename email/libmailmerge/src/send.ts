import chalk from "chalk";
// Load dotenv
import "dotenv/config";
import readlineSync from "readline-sync";

import packageJSON from "../package.json";
import { ENGINES_MAP } from "./engines";
import { defaultMailer, getDefaultMailer } from "./mailer/defaultMailer";
import loadPreviewsFromSidecar from "./previews/loadPreviews";
import { loadSidecars } from "./previews/sidecarData";
import createLogger from "./util/logger";
import { EmailString } from "./util/types";

const logger = createLogger("docsoc");

async function main(directory: string) {
    logger.info("DoCSoc Mail Merge - send");
    logger.info(`v${packageJSON.version}`);

    logger.info(`Sending previews at ${directory}...`);

    // 1: Load sidecars
    const sidecars = loadSidecars(directory);

    // For each sidecar, send the previews
    const pendingEmails: { to: EmailString; subject: string; html: string }[] = [];
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
        });
    }

    // Print the warning
    // TODO: Move sent emails elsewhere
    console.log(
        chalk.yellow(`⚠️   --- WARNING --- ⚠️
You are about to send ${pendingEmails.length} emails.
This action is IRREVERSIBLE.

If the system crashes, you will need to manually send the emails.
Re-running this after a partial run will end up sending duplicate emails.

Check that:
1. The template was correct
1. You are satisfied with ALL previews, including the HTML previews
3. You have tested the system beforehand
4. All indications this is a test have been removed

You are about to send ${pendingEmails.length} emails. The esitmated time for this is ${
            (20 * pendingEmails.length) / 60 / 60
        } hours.

If you are happy to proceed, please type "Yes, send emails" below.`),
    );

    const input = readlineSync.question("");
    if (input !== "Yes, send emails") {
        process.exit(0);
    }

    // Send the emails
    logger.info("Sending emails...");
    const mailer = getDefaultMailer();
    const total = pendingEmails.length;
    let sent = 0;
    for (const { to, subject, html } of pendingEmails) {
        logger.info(`(${++sent} / ${total}) Sending email to ${to} with subject ${subject}...`);
        await defaultMailer([to], subject, html, mailer);
    }
}

if (process.argv.length < 3) {
    logger.error("Please provide the directory to get previews from");
    process.exit(1);
}

main(process.argv[2]);
