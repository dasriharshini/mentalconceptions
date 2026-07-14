"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Flex, Strong, Text, TextArea } from "@radix-ui/themes";

const RESPONSES_KEY = "sketchResponses";
const CURRENT_STEP_KEY = "currentSketchStep";
const CURRENT_ROUTE_KEY = "currentSketchRoute";
const PARTICIPANT_NUMBER_KEY = "studyParticipantNumber";
const FINAL_REASON_KEY = "finalAdditionalReason";

type SketchPath = {
  paths: { x: number; y: number }[];
  strokeWidth: number;
  strokeColor: string;
  drawMode: boolean;
  startTimestamp: number;
  endTimestamp: number;
};

type StoredSketchResponse = {
  promptId: string;
  promptOrder: number;
  condition: string;
  scenario: string;
  description: string;
  intuitiveReason: string;
  paths: SketchPath[];
  imageUrl: string | null;
};

type ParticipantSubmission = {
  prolificId: string;
  studyVersion: string;
  participantNumber: number;
  conditionSequence: string[];
  finalAdditionalReason: string;
  sketches: StoredSketchResponse[];
};

export default function FinalReasonPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalAdditionalReason, setFinalAdditionalReason] = useState("");

  useEffect(() => {
    const prolificId = localStorage.getItem("prolificId");
    const participantNumber = Number(
      localStorage.getItem(PARTICIPANT_NUMBER_KEY) ?? "0"
    );
    const savedResponses = localStorage.getItem(RESPONSES_KEY);
    const parsedResponses = savedResponses
      ? (JSON.parse(savedResponses) as StoredSketchResponse[])
      : [];

    if (!prolificId) {
      router.replace("/prolificId");
      return;
    }

    if (!Number.isInteger(participantNumber) || participantNumber < 1) {
      router.replace("/prolificId");
      return;
    }

    if (parsedResponses.length === 0) {
      router.replace("/entry");
      return;
    }

    localStorage.setItem(CURRENT_STEP_KEY, "13");
    localStorage.setItem(CURRENT_ROUTE_KEY, "/sketch/final-reason");
    setFinalAdditionalReason(
      localStorage.getItem(FINAL_REASON_KEY) ?? ""
    );
    setIsLoading(false);
  }, [router]);

  const submitParticipantSketches = async (payload: ParticipantSubmission) => {
    const response = await fetch("/api/participant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to save sketches");
    }
  };

  const handleNext = async () => {
    const trimmedReason = finalAdditionalReason.trim();

    if (!trimmedReason) {
      alert("Please answer this question, or write NA.");
      return;
    }

    const prolificId = localStorage.getItem("prolificId");
    const studyVersion = localStorage.getItem("studyVersion") ?? "balanced-condition-v1";
    const participantNumber = Number(
      localStorage.getItem(PARTICIPANT_NUMBER_KEY) ?? "0"
    );
    const savedResponses = localStorage.getItem(RESPONSES_KEY);
    const sketches = savedResponses
      ? (JSON.parse(savedResponses) as StoredSketchResponse[])
      : [];

    if (!prolificId || !Number.isInteger(participantNumber) || participantNumber < 1 || sketches.length === 0) {
      router.replace("/entry");
      return;
    }

    setIsSubmitting(true);

    try {
      localStorage.setItem(FINAL_REASON_KEY, trimmedReason);

      await submitParticipantSketches({
        prolificId,
        studyVersion,
        participantNumber,
        conditionSequence: sketches.map((sketch) => sketch.condition),
        finalAdditionalReason: trimmedReason,
        sketches,
      });

      localStorage.removeItem(CURRENT_STEP_KEY);
      localStorage.removeItem(CURRENT_ROUTE_KEY);
      localStorage.removeItem(FINAL_REASON_KEY);
      router.push("/qualtricsRedirect");
    } catch (error) {
      console.error("Error saving final study response:", error);
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
        <Text size="5">Loading question...</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" ml="9" mr="9" maxWidth="900px" gap="5">
      <Text mt="9" size="4" weight="medium">
        Post-Drawing Question
      </Text>

      <Text size="5" weight="medium">
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
          localStorage.setItem(FINAL_REASON_KEY, nextValue);
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
