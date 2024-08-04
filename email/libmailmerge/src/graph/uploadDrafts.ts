import { DeviceCodeCredential } from "@azure/identity";
import { createLogger } from "@docsoc/util";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js";
import { convert } from "html-to-text";

import { EmailString } from "../util/types.js";

const logger = createLogger("imap");

export interface ImapConfig {
    host: string;
    port: number;
    username: string;
}

export class EmailUploader {
    private client?: Client;

    public async authenticate(desiredEmail: string, tenantId?: string, clientId?: string) {
        logger.info("Getting OAuth token using Microsoft libraries...");

        if (!tenantId) {
            throw new Error("Tenant ID not provided");
        }
        if (!clientId) {
            throw new Error("Client ID not provided");
        }

        const credential = new DeviceCodeCredential({
            tenantId: tenantId,
            clientId: clientId,
            userPromptCallback: (info) => {
                console.log(info.message);
            },
        });

        // @microsoft/microsoft-graph-client/authProviders/azureTokenCredentials
        const authProvider = new TokenCredentialAuthenticationProvider(credential, {
            scopes: ["Mail.ReadWrite"],
        });

        this.client = Client.initWithMiddleware({ authProvider: authProvider });

        try {
            const user = await this.client.api("/me").get();
            if (user.mail === desiredEmail || user.userPrincipalName === desiredEmail) {
                logger.info(`Authenticated user email matches the provided email ${desiredEmail}.`);
            } else {
                logger.error(
                    `Authenticated user email does not match the provided email ${desiredEmail}.`,
                );
                throw new Error(
                    `Authenticated user email does not match the provided email ${desiredEmail}.`,
                );
            }
        } catch (error) {
            logger.error("Error fetching user profile:", error);
            throw error;
        }
    }

    public async uploadEmail(
        to: string[],
        subject: string,
        html: string,
        attachmentPaths: string[] = [],
        additionalInfo: { cc: EmailString[]; bcc: EmailString[] } = { cc: [], bcc: [] },
        text: string = convert(html),
    ) {
        if (!this.client) {
            throw new Error("Client not authenticated");
        }
        try {
            const draftMessage = {
                subject,
                body: {
                    contentType: "HTML",
                    content: html,
                },
                toRecipients: to.map((email) => ({
                    emailAddress: {
                        address: email,
                    },
                })),
                ccRecipients: additionalInfo.cc.map((email) => ({
                    emailAddress: {
                        address: email,
                    },
                })),
                bccRecipients: additionalInfo.bcc.map((email) => ({
                    emailAddress: {
                        address: email,
                    },
                })),
            };

            const response = await this.client.api("/me/messages").post(draftMessage);
            logger.debug("Draft email created with ID: ", response.id);
        } catch (error) {
            console.error("Error uploading draft email: ", error);
        }
    }
}
