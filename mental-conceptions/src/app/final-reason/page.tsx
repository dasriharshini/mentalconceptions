"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Flex, Strong, Text, TextArea } from "@radix-ui/themes";
import {
  WITHIN_ASSIGNMENT_KEY,
  WITHIN_CURRENT_ROUTE_KEY,
  WITHIN_CURRENT_STEP_KEY,
  WITHIN_FINAL_REASON_KEY,
  WITHIN_PAIR_RESPONSES_KEY,
  WITHIN_PARTICIPANT_NUMBER_KEY,
  WITHIN_STUDY_VERSION_KEY,
  WITHIN_STUDY_VERSION,
  type WithinSubjectAssignment,
  type WithinSubjectPairResponse,
} from "../libs/withinSubject";

const QUALTRICS_URL =
  "https://neu.co1.qualtrics.com/jfe/form/SV_2h7gh4g5S0TxYyi";

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

export default function FinalReasonPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalAdditionalReason, setFinalAdditionalReason] = useState("");

  useEffect(() => {
    const prolificId = localStorage.getItem("prolificId");
    const participantNumber = Number(
      localStorage.getItem(WITHIN_PARTICIPANT_NUMBER_KEY) ?? "0"
    );
    const assignment = loadAssignment();
    const savedResponses = localStorage.getItem(WITHIN_PAIR_RESPONSES_KEY);
    const parsedResponses = savedResponses
      ? (JSON.parse(savedResponses) as WithinSubjectPairResponse[])
      : [];

    if (!prolificId) {
      router.replace("/prolificId");
      return;
    }

    if (!assignment || assignment.studyVersion !== WITHIN_STUDY_VERSION) {
      router.replace("/prolificId");
      return;
    }

    if (!Number.isInteger(participantNumber) || participantNumber < 1) {
      router.replace("/prolificId");
      return;
    }

    if (parsedResponses.length !== assignment.pairOrder.length) {
      router.replace("/entry");
      return;
    }

    localStorage.setItem(WITHIN_CURRENT_STEP_KEY, "final-reason");
    localStorage.setItem(WITHIN_CURRENT_ROUTE_KEY, "/final-reason");
    localStorage.setItem(WITHIN_STUDY_VERSION_KEY, assignment.studyVersion);
    setFinalAdditionalReason(
      localStorage.getItem(WITHIN_FINAL_REASON_KEY) ?? ""
    );
    setIsLoading(false);
  }, [router]);

  const submitParticipant = async () => {
    const prolificId = localStorage.getItem("prolificId");
    const participantNumber = Number(
      localStorage.getItem(WITHIN_PARTICIPANT_NUMBER_KEY) ?? "0"
    );
    const assignment = loadAssignment();
    const savedResponses = localStorage.getItem(WITHIN_PAIR_RESPONSES_KEY);
    const pairResponses = savedResponses
      ? (JSON.parse(savedResponses) as WithinSubjectPairResponse[])
      : [];

    if (
      !prolificId ||
      !assignment ||
      !Number.isInteger(participantNumber) ||
      participantNumber < 1 ||
      pairResponses.length === 0
    ) {
      throw new Error("Missing within-subject study state");
    }

    const response = await fetch("/api/participant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prolificId,
        studyVersion: WITHIN_STUDY_VERSION,
        participantNumber,
        pairOrder: assignment.pairOrder,
        layoutByPair: assignment.layoutByPair,
        pairResponses,
        finalAdditionalReason: finalAdditionalReason.trim(),
        studyStatus: "completed",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save final submission");
    }
  };

  const handleNext = async () => {
    if (!finalAdditionalReason.trim()) {
      alert("Please answer the final question, or write NA.");
      return;
    }

    setIsSubmitting(true);

    try {
      localStorage.setItem(WITHIN_FINAL_REASON_KEY, finalAdditionalReason.trim());
      await submitParticipant();
      localStorage.removeItem(WITHIN_CURRENT_STEP_KEY);
      localStorage.removeItem(WITHIN_CURRENT_ROUTE_KEY);
      localStorage.removeItem(WITHIN_FINAL_REASON_KEY);
      router.push("/qualtricsRedirect");
    } catch (error) {
      console.error("Error saving final within-subject response:", error);
      alert(
        "We could not save your response right now. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Flex align="center" justify="center" style={{ height: "100vh" }}>
        <Text size="5">Loading final question...</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" ml="9" mr="9" maxWidth="900px" gap="5">
      <Text mt="9" size="4" weight="medium">
        Final question
      </Text>

      <Text size="5" weight="medium">
        <Strong>Dataset reflections: </Strong>
        Apart from what felt intuitive, were there any other reasons behind how
        you drew any of the datasets? If so, explain here. If not, write NA.
      </Text>

      <TextArea
        onPaste={(event) => event.preventDefault()}
        onCopy={(event) => event.preventDefault()}
        onCut={(event) => event.preventDefault()}
        onChange={(event) => {
          const nextValue = event.target.value;
          setFinalAdditionalReason(nextValue);
          localStorage.setItem(WITHIN_FINAL_REASON_KEY, nextValue);
        }}
        value={finalAdditionalReason}
        size="3"
        resize="vertical"
        placeholder="Please answer in your own words. Do not use AI tools or external websites; we're interested in your genuine perspective."
      />

      <Flex align="center" justify="center" mt="4" mb="8">
        <Button size="3" onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Next"}
        </Button>
      </Flex>
    </Flex>
  );
}
