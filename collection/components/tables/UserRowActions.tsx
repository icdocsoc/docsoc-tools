import { deleteUser } from "@/lib/crud/committee";
import { Button, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CommitteeMember } from "@prisma/client";
import React from "react";
import { FaTrash } from "react-icons/fa";

import { ConfirmModal } from "../ConfirmModal";

export const UserRowActions = ({ user }: { user: CommitteeMember }) => {
    const [opened, { open, close }] = useDisclosure(false);
    return (
        <Group>
            <ConfirmModal
                onConfirm={async () => {
                    await deleteUser(user.id);
                }}
                confirmButtonText="Delete"
                opened={opened}
                close={close}
            >
                <Text>
                    Are you sure you want to delete user with email <strong>{user.email}</strong>?
                </Text>
            </ConfirmModal>
            <Button onClick={() => open()} color="red" variant="outline" leftSection={<FaTrash />}>
                Delete
            </Button>
        </Group>
    );
};
