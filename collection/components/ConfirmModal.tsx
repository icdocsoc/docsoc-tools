import { Modal, Stack, Group, Title, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useTransition } from "react";
import { FaExclamationTriangle } from "react-icons/fa";

interface ConfirmModalProps {
    onConfirm: () => PromiseLike<unknown>;
    children: React.ReactNode;
    confirmButtonText?: string;
    opened: boolean;
    close: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    onConfirm,
    children,
    confirmButtonText,
    opened,
    close,
}) => {
    const [isPending, startTransition] = useTransition();
    return (
        <Modal opened={opened} onClose={close} withCloseButton={false}>
            <Stack p="md">
                <Group c="yellow">
                    <FaExclamationTriangle size={24} />
                    <Title order={3}>Warning</Title>
                </Group>
                {children}

                <Group align="flex-end" justify="flex-end">
                    <Button onClick={close} variant="light">
                        Cancel
                    </Button>
                    <Button
                        loading={isPending}
                        onClick={async () => {
                            startTransition(async () => {
                                await onConfirm();
                                close();
                            });
                            close();
                        }}
                        color="red"
                    >
                        {confirmButtonText || "Confirm"}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};
