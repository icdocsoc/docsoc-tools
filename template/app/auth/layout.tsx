import { Card, Center, Stack } from "@mantine/core";

import styles from "./page.module.scss";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Center className="fillSpace">
            <Card withBorder shadow="md" padding="lg" className={styles.loginPortal} p="xl">
                {children}
            </Card>
        </Center>
    );
};

export default AuthLayout;
