import { createLogger } from "@docsoc/util";
import { validate } from "email-validator";
import fs from "fs/promises";
import { convert } from "html-to-text";
import { ImapFlow } from "imapflow";
import mime from "mime-types";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { basename } from "path";

import emlFormat, { EMLData } from "../external/eml-format";
import { EmailString, FromEmail } from "../util/types";

const logger = createLogger("mailer");

/**
 * Core abstraction for sending emails: make a instance of this class, and call `sendMail` to send an email.
 *
 * @param host SMTP server host, e.g. 'smtp-mail.outlook.com'
 * @param port SMTP server port, e.g. 587 (assumed to use TLS)
 * @param username SMTP server username (usually your microsoft 365 email)
 * @param password SMTP server password (usually your microsoft 365 password)
 */
export default class Mailer {
    constructor(
        private smtpHost: string,
        private imapHost: string,
        private smtpPort: number,
        private imapPort: number,
        private username: string,
        private password: string,
    ) {}

    private transporter = nodemailer.createTransport({
        host: this.smtpHost,
        port: this.smtpPort,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
            user: this.username,
            pass: this.password,
        },
    });

    private imapClient = new ImapFlow({
        host: this.imapHost,
        port: this.imapPort,
        secure: true,
        auth: {
            user: this.username,
            pass: this.password,
        },
        tls: { ciphers: "SSLv3" },
    });
    private imapConnected = false;

    async sendMail(
        from: FromEmail,
        to: string[],
        subject: string,
        html: string,
        attachments: Mail.Options["attachments"] = [],
        additionalInfo: { cc: EmailString[]; bcc: EmailString[] } = { cc: [], bcc: [] },
        text: string = convert(html),
    ): Promise<void> {
        const info = await this.transporter.sendMail({
            from, // sender address
            to, // list of receivers
            subject, // Subject line
            text: text, // plain text body
            html: html, // html body
            attachments,
            cc: additionalInfo.cc,
            bcc: additionalInfo.bcc,
        });

        logger.debug(
            `Sent email to ${to.join(", ")}, from ${from}, subject: ${subject}, message id: ${
                info.messageId
            }`,
        );
    }

    async uploadEmailToDraft(
        from: FromEmail,
        to: string[],
        subject: string,
        html: string,
        attachmentPaths: string[] = [],
        additionalInfo: { cc: EmailString[]; bcc: EmailString[] } = { cc: [], bcc: [] },
        text: string = convert(html),
    ): Promise<void> {
        if (!this.imapConnected) {
            await this.imapClient.connect();
            this.imapConnected = true;
        }

        const lock = await this.imapClient.getMailboxLock("Drafts");
        try {
            const eml: EMLData = {
                from,
                to: to.map((to) => ({
                    email: to,
                    name: "",
                })),
                cc: additionalInfo.cc.map((cc) => ({
                    email: cc,
                    name: "",
                })),
                bcc: additionalInfo.bcc.map((bcc) => ({
                    email: bcc,
                    name: "",
                })),
                subject,
                text,
                html,
                attachments: await Promise.all(
                    attachmentPaths.map(async (attachment) => ({
                        name: basename(attachment),
                        contentType: mime.lookup(attachment) || "application/octet-stream",
                        data: (await fs.readFile(attachment)).toString("utf-8"),
                    })),
                ),
            };

            const emlData = await emlFormat.build(eml);

            await this.imapClient.append("Drafts", emlData);
        } finally {
            lock.release();
        }
    }

    /** Helper function to check an email is a valid email address (and also tells the TS compiler we have a valid EmailString)  */
    static validateEmail(email?: string): email is EmailString {
        if (!email) return false;
        return validate(email);
    }

    /**
     * Create a FromEmail string from a name and email address (i.e. `"Name" <email@server.com>`)
     */
    static makeFromLineFromEmail(name: string, email: EmailString): FromEmail {
        return `"${name}" <${email}>`;
    }
}
