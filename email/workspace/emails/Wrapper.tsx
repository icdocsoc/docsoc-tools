import {
    Button,
    Container,
    Head,
    Html,
    Img,
    Preview,
    Section,
    Body,
    Text,
    Row,
} from "@react-email/components";
import * as React from "react";

export interface Wrapper {
    subject: string;
    /** Appears in the email inbox list */
    preview: string;
}

export default function Email({ subject, preview }: Wrapper) {
    return (
        <Html lang="en" dir="ltr">
            <Head>
                <title>{subject}</title>
            </Head>
            <Preview>{preview}</Preview>
            <Body>
                <Container>
                    <Section>
                        <Row>
                            <Text>Logo here</Text>
                        </Row>
                    </Section>
                    <Container>
                        <Text>Content here</Text>
                    </Container>
                </Container>
            </Body>
        </Html>
    );
}
