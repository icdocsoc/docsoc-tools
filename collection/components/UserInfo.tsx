import { Alert, Box, Group, List, Loader, Paper, Stack, Title } from "@mantine/core";
import { useEffect, useState, useTransition } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";

export const UserInfo = ({ shortcode }: { shortcode: string }) => {
    const [user, setUserData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        cid: "",
    });
    const [isLoading, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            try {
                if (!shortcode) {
                    return;
                }
                const res = await fetch(`/api/user/${shortcode}`);
                const data = await res.json();
                setUserData(
                    data?.user ?? {
                        firstName: "",
                        lastName: "",
                        email: "",
                        cid: "",
                    },
                );
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        });
    }, [shortcode, startTransition]);

    if (!shortcode) {
        return (
            <Alert icon={<FaInfoCircle />} title="Info">
                Enter a shortcode to see purchases
            </Alert>
        );
    }

    return (
        <Paper withBorder w="fit-content" p="lg">
            <Group gap="xl">
                <Box>
                    <FaUser size={96} />
                </Box>
                <Stack>
                    <Title order={4}>User Info</Title>
                    {isLoading ? (
                        <Loader />
                    ) : (
                        <List listStyleType="none">
                            <List.Item>
                                <strong>Name:</strong> {user?.firstName} {user?.lastName}
                            </List.Item>
                            <List.Item>
                                <strong>Email:</strong> {user?.email}
                            </List.Item>
                            <List.Item>
                                <strong>CID:</strong> {user?.cid}
                            </List.Item>
                        </List>
                    )}
                </Stack>
            </Group>
        </Paper>
    );
};
