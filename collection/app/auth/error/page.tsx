"use client";

import youShallNotPass from "@/public/gif/you-shall-not-pass-lord-of-the-rings.gif";
import { Title, Text, Flex, Group, Stack, Anchor, Container, Code } from "@mantine/core";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { FaCircleXmark } from "react-icons/fa6";

enum Error {
    Configuration = "Configuration",
    AccessDenied = "AccessDenied",
    Verification = "Verification",
    Default = "Default",
}

const errorMap = {
    [Error.Configuration]: (
        <Text>
            There was a problem when trying to authenticate. <br />
            Please contact us if this error persists. <br />
        </Text>
    ),
    [Error.AccessDenied]: (
        <Group gap="xl" wrap="wrap">
            <Text>
                Only current DoCSoc Committee members can access this system. <br />
                If you believe that you should have access, please contact us at{" "}
                <Anchor href="mailto:docsoc@ic.ac.uk" target="_blank">
                    docsoc@ic.ac.uk
                </Anchor>
                .<br />
            </Text>
            <Image unoptimized src={youShallNotPass} alt="You shall not pass" height={100} />
        </Group>
    ),
    [Error.Verification]: (
        <Text>
            Link expired or already used. <br />
            Please request a new one.
        </Text>
    ),
    [Error.Default]: <>Generic Authentication Error. Sorry :(</>,
};

const titleMap = {
    [Error.Configuration]: "Server Configuration Error",
    [Error.AccessDenied]: "Access Denied",
    [Error.Verification]: "Verification Error",
    [Error.Default]: "Error",
};

export default function AuthErrorPage() {
    const search = useSearchParams();
    const error = search.get("error") as Error;

    return (
        <Stack gap="md">
            <Group c="red">
                <FaCircleXmark size={24} style={{ marginTop: "4px" }} />
                <Title order={2}>{titleMap[error] || "Error"}</Title>
            </Group>
            <Text>
                There was an error when trying to authenticate. Please contact us at{" "}
                <Anchor href="mailto:docsoc@ic.ac.uk" target="_blank">
                    docsoc@ic.ac.uk
                </Anchor>{" "}
                if this error persists.
            </Text>
            <Stack gap="0.125em">
                <Title order={5}>About this error:</Title>
                <>{errorMap[Error.AccessDenied] || "Unknown Server error"}</>
            </Stack>
        </Stack>
    );
}
