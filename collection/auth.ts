import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import MicrosoftEntraIDProfile from "next-auth/providers/microsoft-entra-id";

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
        signIn({ profile }) {
            return profile?.email?.includes("docsoc") ?? false;
        },
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
});
