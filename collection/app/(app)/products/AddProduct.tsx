"use client";

import { addProducts } from "@/lib/crud/products";
import { StatusReturn } from "@/lib/types";
import {
    ActionIcon,
    Alert,
    Button,
    Group,
    InputLabel,
    Modal,
    NativeSelect,
    Stack,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import React, { useState, useTransition } from "react";
import { FaPlus, FaTrash } from "react-icons/fa6";

interface AddProductProps {
    academicYears: string[];
    currentYear: string;
}

type AddProductFormProps = AddProductProps & {
    close: () => void;
};

interface AddProductForm {
    products: string[];
    academicYear: string;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ academicYears, currentYear, close }) => {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<StatusReturn>({
        status: "pending",
    });
    const form = useForm<AddProductForm>({
        mode: "controlled",
        initialValues: {
            products: [""],
            academicYear: currentYear,
        },
    });

    const submit = ({ academicYear, products }: { academicYear: string; products: string[] }) => {
        startTransition(async () => {
            const res = await addProducts(academicYear, products);

            if (res.status === "error") {
                setStatus(res);
            } else {
                close();
            }
        });
    };

    return (
        <form onSubmit={form.onSubmit(submit)}>
            <Stack>
                {
                    // Display error if there is one
                    status.status === "error" && (
                        <Alert color="red" title="Error">
                            {status.error}
                        </Alert>
                    )
                }
                <NativeSelect
                    label="Academic year"
                    name="academicYear"
                    key={form.key("academicYear")}
                    description="Add products to this academic year"
                    data={academicYears}
                    required
                    {...form.getInputProps("academicYear")}
                />
                <Group gap="sm">
                    <InputLabel>Products</InputLabel>
                    <ActionIcon onClick={() => form.insertListItem("products", "")}>
                        <FaPlus />
                    </ActionIcon>
                </Group>
                {form.getValues().products.map((product, i) => (
                    <Group key={form.key(`products.${i}`)}>
                        <TextInput
                            placeholder="E.g. Hoodie"
                            required
                            {...form.getInputProps(`products.${i}`)}
                            flex={"1 0 0"}
                        />
                        <ActionIcon color="red" onClick={() => form.removeListItem("products", i)}>
                            <FaTrash />
                        </ActionIcon>
                    </Group>
                ))}
                <Group justify="right" mt="sm">
                    <Button type="submit" color="green" loading={isPending}>
                        Add Products
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};

export const AddProduct: React.FC<AddProductProps> = (props) => {
    const [opened, { open, close }] = useDisclosure(false);
    return (
        <>
            <Modal opened={opened} onClose={close} title="Add Products" size="xl">
                <AddProductForm {...props} close={close} />
            </Modal>
            <Button leftSection={<FaPlus />} onClick={open}>
                Add Products
            </Button>
        </>
    );
};
