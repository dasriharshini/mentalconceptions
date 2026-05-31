"use client";

import { Button, Flex, Link as RadixLink, Text } from "@radix-ui/themes";

const QUALTRICS_URL =
  "https://neu.co1.qualtrics.com/jfe/form/SV_2h7gh4g5S0TxYyi";

export default function QualtricsRedirectPage() {
  return (
    <Flex
      direction="column"
      ml="9"
      mr="9"
      mt="9"
      maxWidth="760px"
      gap="5"
    >
      <Text size="4">
        Thank you for completing the drawings! We would like to ask you a few
        more questions about reading data graphs before taking you back to
        Prolific to receive your reward. Click &quot;Next&quot; and you will be
        redirected to Qualtrics to answer these final questions.
      </Text>

      <Text size="4">
        If the redirect doesn&apos;t work, copy this link to your browser:{" "}
        <RadixLink href={QUALTRICS_URL}>{QUALTRICS_URL}</RadixLink>
      </Text>

      <Flex mt="2">
        <Button size="3" onClick={() => window.location.assign(QUALTRICS_URL)}>
          Next
        </Button>
      </Flex>
    </Flex>
  );
}
