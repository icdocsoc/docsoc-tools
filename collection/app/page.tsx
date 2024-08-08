import { Button } from "@mantine/core";

import styles from "./page.module.scss";

export default function Index() {
    return (
        <div className={styles.page}>
            <Button>Hello, world!</Button>
        </div>
    );
}
