"use client";

import { addUser } from "@/lib/crud/committee";
import { Button, Modal, TextInput, Group, Box, Stack, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useState, useTransition } from "react";
import { FaPlus, FaTimesCircle } from "react-icons/fa";

type FormValues = {
    firstName: string;
    surname: string;
    email: string;
    shortcode: string;
    position: string;
};

const AddUser = () => {
    const [opened, setOpened] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [errorMsg, setErrorMsg] = useState("");

    const form = useForm<FormValues>({
        mode: "uncontrolled",
        initialValues: {
            firstName: "",
            surname: "",
            email: "",
            shortcode: "",
            position: "",
        },

        validate: {
            email: (value) =>
                /^[a-zA-Z]+\.[a-zA-Z0-9]+@imperial\.ac\.uk$/.test(value)
                    ? null
                    : "Invalid email format. Must be in the format <string>.<string><number>@imperial.ac.uk",
        },
    });

    const submitter = (values: FormValues) => {
        startTransition(async () => {
            try {
                await addUser({
                    firstname: values.firstName,
                    surname: values.surname,
                    email: values.email,
                    shortcode: values.shortcode,
                    position: values.position,
                });
                setOpened(false);
            } catch (e: any) {
                setErrorMsg(e?.message ?? e);
            }
        });
    };

    return (
        <>
            <Button leftSection={<FaPlus />} onClick={() => setOpened(true)} loading={isPending}>
                Add User
            </Button>

            <Modal opened={opened} onClose={() => setOpened(false)} title="Add User" size="lg">
                <Stack gap="lg">
                    {errorMsg && (
                        <Alert variant="light" color="red" title="Error" icon={<FaTimesCircle />}>
                            {errorMsg}
                        </Alert>
                    )}
                    <form onSubmit={form.onSubmit(submitter)}>
                        <Stack gap="sm">
                            <TextInput
                                label="First Name"
                                placeholder="First Name"
                                {...form.getInputProps("firstName")}
                                required
                            />
                            <TextInput
                                label="Surname"
                                placeholder="Surname"
                                {...form.getInputProps("surname")}
                                required
                            />
                            <TextInput
                                label="Email"
                                placeholder="Email"
                                description=" Email must be the full email, e.g. kishan.sambhi22@imperial.ac.uk"
                                {...form.getInputProps("email")}
                                required
                            />
                            <TextInput
                                label="Shortcode"
                                placeholder="Shortcode"
                                {...form.getInputProps("shortcode")}
                                required
                            />
                            <TextInput
                                label="Position"
                                placeholder="Position"
                                {...form.getInputProps("position")}
                                required
                            />
                            <Group justify="flex-end" align="flex-end">
                                <Button loading={isPending} type="submit">
                                    Submit
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                </Stack>
            </Modal>
        </>
    );
};

export default AddUser;
