"use client";

import { useEffect } from "react";
import { Button, Flex, Strong, Text } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import {
  WITHIN_ASSIGNMENT_KEY,
  WITHIN_CURRENT_ROUTE_KEY,
  WITHIN_CURRENT_STEP_KEY,
  WITHIN_PARTICIPANT_NUMBER_KEY,
  type WithinSubjectAssignment,
} from "../libs/withinSubject";

function loadAssignment(): WithinSubjectAssignment | null {
  const rawAssignment = localStorage.getItem(WITHIN_ASSIGNMENT_KEY);

  if (!rawAssignment) {
    return null;
  }

  try {
    return JSON.parse(rawAssignment) as WithinSubjectAssignment;
  } catch {
    return null;
  }
}

export default function Instructions() {
  const router = useRouter();

  useEffect(() => {
    const participantNumber = Number(
      localStorage.getItem(WITHIN_PARTICIPANT_NUMBER_KEY) ?? "0"
    );

    if (!Number.isInteger(participantNumber) || participantNumber < 1) {
      router.replace("/prolificId");
      return;
    }

    if (!loadAssignment()) {
      router.replace("/prolificId");
      return;
    }
  }, [router]);

  const handleNext = () => {
    const assignment = loadAssignment();

    if (!assignment) {
      router.replace("/prolificId");
      return;
    }

    const firstPairId = assignment.pairOrder[0];
    localStorage.setItem(WITHIN_CURRENT_STEP_KEY, firstPairId);
    localStorage.setItem(WITHIN_CURRENT_ROUTE_KEY, `/pairs/${firstPairId}`);
    router.push(`/pairs/${firstPairId}`);
  };

  return (
    <Flex direction="column" ml="9" maxWidth="1000px" gap="6">
      <Text mt="7" size="5" weight="medium">
        <Strong>Instructions: </Strong> In this study, you will be making
        drawings of your impressions about paired versions of the same dataset.
        Your goal is to draw a representation of each version in a way that
        <Strong> feels the most intuitive to you</Strong>.
        <br />
        <br />
        For each pair, you will see two versions of the dataset and sketch both
        of them on separate canvases. There are no right or wrong ways to draw
        the datasets, as long as someone else would be able to <Strong>
          recognize
        </Strong>{" "}
        your drawings and <Strong>understand what dataset you were prompted
        with</Strong>. You don&apos;t need to worry about making the drawings
        pretty.
        <br />
        <br />
        Because we are interested in your unique personal perspective,{" "}
        <Strong>please do not use AI tools in any part of this study.</Strong>{" "}
        AI-generated answers cannot capture your individual voice, and they
        unfortunately make the data unusable for our research goals. Thank you
        for sharing your genuine thoughts with us!
      </Text>

      <Text size="5" weight="medium">
        Click the &quot;Next&quot; button below when you&apos;re ready to start
        the study.
      </Text>

      <Button size="3" onClick={handleNext} style={{ width: "fit-content" }}>
        Next
      </Button>
    </Flex>
  );
}
