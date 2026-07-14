"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Flex, Strong, Text, TextArea } from "@radix-ui/themes";
import {
  getSketchPromptsForParticipant,
  SketchPrompt,
  TASK_COUNT,
} from "../../prompts";

const ORDER_KEY = "sketchPromptOrder";
const RESPONSES_KEY = "sketchResponses";
const CURRENT_STEP_KEY = "currentSketchStep";
const CURRENT_ROUTE_KEY = "currentSketchRoute";
const PARTICIPANT_NUMBER_KEY = "studyParticipantNumber";

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

function shufflePromptOrder(prompts: SketchPrompt[]) {
  const promptIds = prompts.map((prompt) => prompt.id);

  for (let index = promptIds.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = promptIds[index];
    promptIds[index] = promptIds[swapIndex];
    promptIds[swapIndex] = current;
  }

  return promptIds;
}

export default function SketchReasonsPage({
  params,
}: {
  params: { step: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sketchPrompts, setSketchPrompts] = useState<SketchPrompt[]>([]);
  const [orderedPromptIds, setOrderedPromptIds] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [intuitiveReason, setIntuitiveReason] = useState("");

  const stepNumber = Number(params.step);
  const isStepValid =
    Number.isInteger(stepNumber) &&
    stepNumber >= 1 &&
    stepNumber <= TASK_COUNT;

  const activePrompt = useMemo(() => {
    if (!isStepValid || orderedPromptIds.length !== TASK_COUNT) {
      return null;
    }

    const promptId = orderedPromptIds[stepNumber - 1];
    return sketchPrompts.find((prompt) => prompt.id === promptId) ?? null;
  }, [isStepValid, orderedPromptIds, sketchPrompts, stepNumber]);

  const upsertStoredResponse = (
    nextDescription: string,
    nextIntuitiveReason: string
  ) => {
    if (!activePrompt) {
      return;
    }

    const savedResponses = localStorage.getItem(RESPONSES_KEY);
    const parsedResponses = savedResponses
      ? (JSON.parse(savedResponses) as StoredSketchResponse[])
      : [];
    const existingResponse = parsedResponses.find(
      (response) => response.promptId === activePrompt.id
    );

    if (!existingResponse) {
      return;
    }

    const nextResponse: StoredSketchResponse = {
      ...existingResponse,
      description: nextDescription,
      intuitiveReason: nextIntuitiveReason,
    };

    const nextResponses = parsedResponses.filter(
      (response) => response.promptId !== activePrompt.id
    );
    nextResponses.push(nextResponse);
    nextResponses.sort((left, right) => left.promptOrder - right.promptOrder);
    localStorage.setItem(RESPONSES_KEY, JSON.stringify(nextResponses));
  };

  useEffect(() => {
    if (!isStepValid) {
      router.replace("/entry");
      return;
    }

    const participantNumber = Number(
      localStorage.getItem(PARTICIPANT_NUMBER_KEY) ?? "0"
    );

    if (!Number.isInteger(participantNumber) || participantNumber < 1) {
      router.replace("/prolificId");
      return;
    }

    const nextSketchPrompts =
      getSketchPromptsForParticipant(participantNumber);
    setSketchPrompts(nextSketchPrompts);

    localStorage.setItem(CURRENT_STEP_KEY, stepNumber.toString());
    localStorage.setItem(CURRENT_ROUTE_KEY, `/sketch/${stepNumber}/reasons`);

    const savedOrder = localStorage.getItem(ORDER_KEY);
    let nextOrder = savedOrder ? (JSON.parse(savedOrder) as string[]) : [];

    if (nextOrder.length !== TASK_COUNT) {
      nextOrder = shufflePromptOrder(nextSketchPrompts);
      localStorage.setItem(ORDER_KEY, JSON.stringify(nextOrder));
    }

    setOrderedPromptIds(nextOrder);

    const savedResponses = localStorage.getItem(RESPONSES_KEY);
    const parsedResponses = savedResponses
      ? (JSON.parse(savedResponses) as StoredSketchResponse[])
      : [];
    const currentPromptId = nextOrder[stepNumber - 1];
    const existingResponse = parsedResponses.find(
      (response) => response.promptId === currentPromptId
    );

    if (!existingResponse) {
      router.replace(`/sketch/${stepNumber}`);
      return;
    }

    setDescription(existingResponse.description ?? "");
    setIntuitiveReason(existingResponse.intuitiveReason ?? "");
    setIsLoading(false);
  }, [isStepValid, router, stepNumber]);

  const handleNext = async () => {
    if (!activePrompt) {
      return;
    }

    if (!description.trim()) {
      alert("Please describe your sketch before continuing.");
      return;
    }

    if (!intuitiveReason.trim()) {
      alert("Please explain why this drawing feels intuitive to you.");
      return;
    }

    setIsSubmitting(true);

    try {
      upsertStoredResponse(description.trim(), intuitiveReason.trim());

      if (stepNumber === TASK_COUNT) {
        localStorage.setItem(CURRENT_STEP_KEY, (stepNumber + 1).toString());
        localStorage.setItem(CURRENT_ROUTE_KEY, "/sketch/final-reason");
        router.push("/sketch/final-reason");
        return;
      }

      localStorage.setItem(CURRENT_STEP_KEY, (stepNumber + 1).toString());
      localStorage.setItem(CURRENT_ROUTE_KEY, `/sketch/${stepNumber + 1}`);
      router.push(`/sketch/${stepNumber + 1}`);
    } catch (error) {
      console.error("Error saving sketch response:", error);
      alert(
        "We could not save your response right now. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !activePrompt) {
    return (
      <Flex align="center" justify="center" style={{ height: "100vh" }}>
        <Text size="5">Loading follow-up questions...</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" ml="9" mr="9" maxWidth="900px" gap="5">
      <Text mt="9" size="4" weight="medium">
        Prompt {stepNumber} of {TASK_COUNT}
      </Text>

      <Text size="5" weight="medium">
        <Strong>Dataset: </Strong>
        {activePrompt.scenario}
      </Text>

      <Text size="5" weight="medium">
        Why does this drawing feel intuitive to you?
      </Text>
      <TextArea
        onPaste={(event) => event.preventDefault()}
        onCopy={(event) => event.preventDefault()}
        onCut={(event) => event.preventDefault()}
        onChange={(event) => {
          const nextIntuitiveReason = event.target.value;
          setIntuitiveReason(nextIntuitiveReason);
          upsertStoredResponse(description, nextIntuitiveReason);
        }}
        value={intuitiveReason}
        size="3"
        resize="vertical"
        placeholder="Please answer in your own words. Do not use AI tools or external websites; we're interested in your genuine perspective."
      />

      <Flex align="center" justify="center" mt="4" mb="8">
        <Button size="3" onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : stepNumber === TASK_COUNT
              ? "Continue" // avoid saying final question here because we have qualtrics questions after this
              : "Next"}
        </Button>
      </Flex>
    </Flex>
  );
}
