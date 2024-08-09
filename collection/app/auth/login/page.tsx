import { providerMap, signIn } from "@/auth";
import { DoCSocBanner } from "@/components/DoCSocBanner";
import { Button, Center } from "@mantine/core";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { FaKey } from "react-icons/fa";

const namesMap = (name: string) => {
    switch (name) {
        case "Microsoft Entra ID":
            return "Imperial SSO";
        default:
            return name;
    }
};

const Login = () => {
    return (
        <>
            <Center>
                <DoCSocBanner style={{ maxWidth: "500px" }} />
            </Center>
            {Object.values(providerMap).map((provider) => (
                <form
                    style={{ display: "flex" }}
                    key={provider.id}
                    action={async () => {
                        "use server";
                        try {
                            await signIn(provider.id);
                        } catch (error) {
                            // Signin can fail for a number of reasons, such as the user
                            // not existing, or the user not having the correct role.
                            // In some cases, you may want to redirect to a custom error
                            if (error instanceof AuthError) {
                                return redirect(`/api/auth/errror?error=${error.type}`);
                            }

                            // Otherwise if a redirects happens NextJS can handle it
                            // so you can just re-thrown the error and let NextJS handle it.
                            // Docs:
                            // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
                            throw error;
                        }
                    }}
                >
                    <Button key={provider.id} leftSection={<FaKey />} type="submit" flex="1 0 0">
                        Login with {namesMap(provider.name)}
                    </Button>
                </form>
            ))}
        </>
    );
};

export default Login;
