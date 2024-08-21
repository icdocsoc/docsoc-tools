import { deleteProduct } from "@/lib/crud/products";
import { Button } from "@mantine/core";
import React, { useTransition } from "react";
import { FaTrash } from "react-icons/fa6";

export const DeleteProduct = ({ productId }: { productId: number }) => {
    const [isPending, startTransition] = useTransition();

    const onClickHandler = () => {
        startTransition(async () => {
            await deleteProduct(productId);
        });
    };

    return (
        <Button
            size="sm"
            color="red"
            leftSection={<FaTrash />}
            variant="outline"
            onClick={onClickHandler}
            loading={isPending}
        >
            Delete Product
        </Button>
    );
};
