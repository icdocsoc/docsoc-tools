import Mail from "nodemailer/lib/mailer";

import { EmailString } from "../util/types.js";
import Mailer from "./mailer.js";

/**
 * Default mailer that uses the env vars `DOCSOC_SMTP_SERVER`, `DOCSOC_SMTP_USERNAME`, `DOCSOC_SMTP_PASSWORD` to create a mailer.
 */
export const getDefaultMailer = () =>
    new Mailer(
        process.env["DOCSOC_SMTP_SERVER"] ?? "smtp-mail.outlook.com",
        process.env["DOCSOC_IMAP_SERVER"] ?? "outlook.office365.com",
        process.env["DOCSOC_SMTP_PORT"] && isFinite(parseInt(process.env["DOCSOC_SMTP_PORT"]))
            ? parseInt(process.env["DOCSOC_SMTP_PORT"])
            : 587,
        process.env["DOCSOC_IMAP_PORT"] && isFinite(parseInt(process.env["DOCSOC_IMAP_PORT"]))
            ? parseInt(process.env["DOCSOC_IMAP_PORT"])
            : 993,
        process.env["DOCSOC_OUTLOOK_USERNAME"] ?? "docsoc@ic.ac.uk",
        process.env["DOCSOC_OUTLOOK_PASSWORD"] ?? "password",
    );

export const getDefaultDoCSocFromLine = () =>
    Mailer.makeFromLineFromEmail(
        process.env["DOCSOC_SENDER_NAME"] ?? "DoCSoc",
        Mailer.validateEmail(process.env["DOCSOC_SENDER_EMAIL"])
            ? process.env["DOCSOC_SENDER_EMAIL"] ?? "docsoc@ic.ac.uk"
            : "docsoc@ic.ac.uk",
    );

/**
 * The default mailer function for DoCSoc mail merge: sends an email to a list of recipients using the appriopritate env vars to populate fields.
 *
 * Pass it an instance of a Mailer from {@link getDefaultMailer} to use the default mailer.
 */
export const defaultMailer = (
    to: EmailString[],
    subject: string,
    html: string,
    mailer: Mailer,
    attachments: Mail.Options["attachments"] = [],
    additionalInfo: { cc: EmailString[]; bcc: EmailString[] } = { cc: [], bcc: [] },
): Promise<void> =>
    mailer.sendMail(getDefaultDoCSocFromLine(), to, subject, html, attachments, additionalInfo);
