"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import AWS from "aws-sdk";
import { useRouter } from "next/navigation";
import { Box, Button, Flex, Strong, Text, TextArea } from "@radix-ui/themes";
import {
  EraserIcon,
  Pencil1Icon,
  ResetIcon,
} from "@radix-ui/react-icons";
import {
  ReactSketchCanvas,
  type ReactSketchCanvasRef,
} from "react-sketch-canvas";
import {
  getSketchPromptsForParticipant,
  SketchPrompt,
  TASK_COUNT,
} from "../prompts";

const ORDER_KEY = "sketchPromptOrder";
const RESPONSES_KEY = "sketchResponses";
const CURRENT_STEP_KEY = "currentSketchStep";
const CURRENT_ROUTE_KEY = "currentSketchRoute";
const PARTICIPANT_NUMBER_KEY = "studyParticipantNumber";

const styles = {
  border: "0.25rem solid #3E63DD",
  borderRadius: "0.75rem",
};

const DEFAULT_STROKE_COLOR = "#000000";

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

export default function SketchStepPage({
  params,
}: {
  params: { step: string };
}) {
  const router = useRouter();
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const loadedPromptIdRef = useRef<string | null>(null);
  const [description, setDescription] = useState("");
  const [eraseMode, setEraseMode] = useState(false);
  const [strokeColor, setStrokeColor] = useState(DEFAULT_STROKE_COLOR);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sketchPrompts, setSketchPrompts] = useState<SketchPrompt[]>([]);
  const [orderedPromptIds, setOrderedPromptIds] = useState<string[]>([]);
  const [savedPaths, setSavedPaths] = useState<SketchPath[]>([]);

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
    nextPaths: SketchPath[],
    nextImageUrl: string | null = null
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

    const nextResponse: StoredSketchResponse = {
      promptId: activePrompt.id,
      promptOrder: stepNumber,
      condition: activePrompt.condition,
      scenario: activePrompt.scenario,
      description: nextDescription,
      intuitiveReason: existingResponse?.intuitiveReason ?? "",
      paths: nextPaths,
      imageUrl: nextImageUrl ?? existingResponse?.imageUrl ?? null,
    };

    const nextResponses = parsedResponses.filter(
      (response) => response.promptId !== activePrompt.id
    );
    nextResponses.push(nextResponse);
    nextResponses.sort((left, right) => left.promptOrder - right.promptOrder);
    localStorage.setItem(RESPONSES_KEY, JSON.stringify(nextResponses));
  };

  useEffect(() => {
    AWS.config.update({
      accessKeyId: "AKIAQ3EGTCQWRCOPX5NR",
      secretAccessKey: "gNOuLbYUTlwx6k4hNLGNdJmXlbTOz1l0wxqQe74b",
      region: "eu-north-1",
    });
  }, []);

  useEffect(() => {
    if (!isStepValid) {
      router.replace("/entry");
      return;
    }

    const prolificId = localStorage.getItem("prolificId");

    if (!prolificId) {
      router.replace("/prolificId");
      return;
    }

    const participantNumber = Number(
      localStorage.getItem(PARTICIPANT_NUMBER_KEY) ?? "0"
    );

    if (!Number.isInteger(participantNumber) || participantNumber < 1) {
      router.replace("/prolificId");
      return;
    }

    const nextSketchPrompts = getSketchPromptsForParticipant(participantNumber);
    setSketchPrompts(nextSketchPrompts);

    localStorage.setItem(CURRENT_STEP_KEY, stepNumber.toString());
    localStorage.setItem(CURRENT_ROUTE_KEY, `/sketch/${stepNumber}`);

    const savedOrder = localStorage.getItem(ORDER_KEY);
    let nextOrder = savedOrder ? (JSON.parse(savedOrder) as string[]) : [];

    if (nextOrder.length !== TASK_COUNT) {
      nextOrder = shufflePromptOrder(nextSketchPrompts);
      localStorage.setItem(ORDER_KEY, JSON.stringify(nextOrder));
    }

    setOrderedPromptIds(nextOrder);

    const savedResponses = localStorage.getItem(RESPONSES_KEY);
    if (savedResponses) {
      const parsedResponses = JSON.parse(
        savedResponses
      ) as StoredSketchResponse[];
      const currentPromptId = nextOrder[stepNumber - 1];
      const existingResponse = parsedResponses.find(
        (response) => response.promptId === currentPromptId
      );

      if (existingResponse) {
        setDescription(existingResponse.description);
        setSavedPaths(existingResponse.paths);
      } else {
        setDescription("");
        setSavedPaths([]);
      }
    } else {
      setDescription("");
      setSavedPaths([]);
    }

    setIsLoading(false);
  }, [isStepValid, router, stepNumber]);

  useEffect(() => {
    if (isLoading || !activePrompt) {
      return;
    }

    if (loadedPromptIdRef.current === activePrompt.id) {
      return;
    }

    canvasRef.current?.resetCanvas();

    if (savedPaths.length > 0) {
      canvasRef.current?.loadPaths(savedPaths);
    }

    loadedPromptIdRef.current = activePrompt.id;
  }, [activePrompt, isLoading, savedPaths]);

  const handleClearCanvasClick = () => {
    canvasRef.current?.clearCanvas();
    setEraseMode(false);
  };

  const handleEraserClick = () => {
    setEraseMode(true);
    canvasRef.current?.eraseMode(true);
  };

  const handlePenClick = () => {
    setEraseMode(false);
    canvasRef.current?.eraseMode(false);
  };

  const handleCanvasChange = (updatedPaths: SketchPath[]) => {
    setSavedPaths(updatedPaths);
    upsertStoredResponse(description, updatedPaths);
  };

  const uploadImage = async (prolificId: string) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return null;
    }

    const dataUrl = await canvas.exportImage("png");

    if (!dataUrl) {
      return null;
    }

    const blob = await fetch(dataUrl).then((response) => response.blob());
    const promptSlug = activePrompt?.id ?? `prompt-${stepNumber}`;
    const condition = activePrompt?.condition ?? "X";
    const taskLabel = `task-${stepNumber}`;
    const fileName = `${prolificId}-${taskLabel}-${condition}-${promptSlug}-${Date.now()}.png`;
    const s3 = new AWS.S3();

    try {
      const uploadResult = await s3
        .upload({
          Bucket: "mental-conceptions-sketches",
          Key: fileName,
          Body: blob,
          ContentType: "image/png",
          ACL: "public-read",
        })
        .promise();

      return uploadResult.Location;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleNext = async () => {
    if (!activePrompt) {
      return;
    }

    if (!description.trim()) {
      alert("Please describe your sketch before continuing.");
      return;
    }

    const prolificId = localStorage.getItem("prolificId");
    if (!prolificId) {
      router.replace("/prolificId");
      return;
    }

    setIsSubmitting(true);

    try {
      const paths = ((await canvasRef.current?.exportPaths()) ?? []) as SketchPath[];

      if (paths.length === 0) {
        alert("Please draw a sketch before continuing.");
        return;
      }

      const imageUrl = await uploadImage(prolificId);
      upsertStoredResponse(description.trim(), paths, imageUrl);
      localStorage.setItem(CURRENT_ROUTE_KEY, `/sketch/${stepNumber}/reasons`);
      router.push(`/sketch/${stepNumber}/reasons`);
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
        <Text size="5">Loading sketch prompt...</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" ml="9" mr="9" maxWidth="1200px" gap="6">
      <Text mt="9" size="4" weight="medium">
        Prompt {stepNumber} of {TASK_COUNT}
      </Text>

      <Text size="5" weight="medium">
        <Strong>Dataset: </Strong>
        {activePrompt.scenario}
      </Text>

      <Flex
        direction={{ initial: "column", md: "row" }}
        gap="6"
        align="start"
      >
        <Flex direction="column" gap="3">
          <Text size="5" weight="medium">
            Draw a representation of this dataset that feels the most intuitive to you:
          </Text>
          <Text size="4">You can sketch in this space.</Text>

          <Box width="400px" height="400px">
            <ReactSketchCanvas
              ref={canvasRef}
              style={styles}
              strokeWidth={4}
              strokeColor={strokeColor}
              onChange={(updatedPaths) =>
                handleCanvasChange(updatedPaths as SketchPath[])
              }
            />
          </Box>

          <Flex direction="row" gap="4" align="center" wrap="wrap">
            <Button size="3" onClick={handleEraserClick}>
              <EraserIcon />
              Erase
            </Button>
            <Button size="3" onClick={handlePenClick}>
              <Pencil1Icon />
              Draw
            </Button>
            <Button size="3" disabled={eraseMode} onClick={handleClearCanvasClick}>
              <ResetIcon />
              Clear Canvas
            </Button>
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="3" weight="medium">
              Pick pen color:
            </Text>
            <Flex direction="row" gap="2" align="center" wrap="wrap">
              <input
                type="color"
                value={strokeColor}
                onChange={(event) => {
                  setStrokeColor(event.target.value);
                  handlePenClick();
                }}
                aria-label="Choose a custom pen color"
                style={{
                  width: "40px",
                  height: "32px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background: "transparent",
                  cursor: "pointer",
                }}
              />
            </Flex>
          </Flex>
        </Flex>

        <Flex direction="column" minWidth="320px" maxWidth="520px" gap="4" flexGrow="1">
          <Text size="5" weight="medium">
            Briefly describe what you drew: 
          </Text>
          <TextArea
            onPaste={(event) => event.preventDefault()}
            onCopy={(event) => event.preventDefault()}
            onCut={(event) => event.preventDefault()}
            onChange={(event) => {
              const nextDescription = event.target.value;
              setDescription(nextDescription);
              upsertStoredResponse(nextDescription, savedPaths);
            }}
            value={description}
            size="3"
            resize="vertical"
            placeholder="Please answer in your own words. Do not use AI tools or external websites; we're interested in your genuine perspective."
          />
        </Flex>
      </Flex>

      <Flex align="center" justify="center" mt="4" mb="8">
        <Button size="3" onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Next"}
        </Button>
      </Flex>
    </Flex>
  );
}
