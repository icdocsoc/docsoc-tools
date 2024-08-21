import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import MicrosoftEntraIDProfile from "next-auth/providers/microsoft-entra-id";

import { getCommitteeMember } from "./lib/crud/committee";

const providers: Provider[] = [
    MicrosoftEntraIDProfile({
        clientId: process.env.MS_ENTRA_CLIENT_ID,
        clientSecret: process.env.MS_ENTRA_CLIENT_SECRET,
        tenantId: process.env.MS_ENTRA_TENANT_ID,
        authorization: {
            params: {
                scope: "offline_access openid profile email User.Read",
            },
        },
        name: "Imperial SSO",
    }),
];

export const providerMap = providers.map((provider) => {
    if (typeof provider === "function") {
        const providerData = provider();
        return { id: providerData.id, name: providerData.name };
    } else {
        return { id: provider.id, name: provider.name };
    }
});

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers,
    callbacks: {
        async signIn({ profile }) {
            console.log(profile);
            const { email } = profile as any;
            // Docsoc can always login

            if (typeof email !== "string") {
                return false;
            }

            if (email === process.env.ROOT_USER_EMAIL) {
                return true;
            }

            const user = await getCommitteeMember(email);

            if (!user) {
                return false;
            } else {
                return true;
            }
        },
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
});
