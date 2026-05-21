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
import { SKETCH_PROMPTS } from "../prompts";

const ORDER_KEY = "sketchPromptOrder";
const RESPONSES_KEY = "sketchResponses";
const FINAL_SURVEY_URL =
  "https://neu.co1.qualtrics.com/jfe/form/SV_cUV9fSjnq4BQ114";

const styles = {
  border: "0.25rem solid #3E63DD",
  borderRadius: "0.75rem",
};

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
  scenario: string;
  description: string;
  paths: SketchPath[];
  imageUrl: string | null;
};

type ParticipantSubmission = {
  prolificId: string;
  sketches: StoredSketchResponse[];
};

function shufflePromptOrder() {
  const promptIds = SKETCH_PROMPTS.map((prompt) => prompt.id);

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
  const [description, setDescription] = useState("");
  const [eraseMode, setEraseMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderedPromptIds, setOrderedPromptIds] = useState<string[]>([]);

  const stepNumber = Number(params.step);
  const isStepValid =
    Number.isInteger(stepNumber) &&
    stepNumber >= 1 &&
    stepNumber <= SKETCH_PROMPTS.length;

  const activePrompt = useMemo(() => {
    if (!isStepValid || orderedPromptIds.length !== SKETCH_PROMPTS.length) {
      return null;
    }

    const promptId = orderedPromptIds[stepNumber - 1];
    return SKETCH_PROMPTS.find((prompt) => prompt.id === promptId) ?? null;
  }, [isStepValid, orderedPromptIds, stepNumber]);

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

    const savedOrder = localStorage.getItem(ORDER_KEY);
    let nextOrder = savedOrder ? (JSON.parse(savedOrder) as string[]) : [];

    if (nextOrder.length !== SKETCH_PROMPTS.length) {
      nextOrder = shufflePromptOrder();
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
      }
    }

    setIsLoading(false);
  }, [isStepValid, router, stepNumber]);

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
    const fileName = `${prolificId}-${Date.now()}-${stepNumber}.png`;
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
      const imageUrl = await uploadImage(prolificId);
      const savedResponses = localStorage.getItem(RESPONSES_KEY);
      const parsedResponses = savedResponses
        ? (JSON.parse(savedResponses) as StoredSketchResponse[])
        : [];

      const nextResponse: StoredSketchResponse = {
        promptId: activePrompt.id,
        promptOrder: stepNumber,
        scenario: activePrompt.scenario,
        description: description.trim(),
        paths,
        imageUrl,
      };

      const nextResponses = parsedResponses.filter(
        (response) => response.promptId !== activePrompt.id
      );
      nextResponses.push(nextResponse);
      nextResponses.sort((left, right) => left.promptOrder - right.promptOrder);
      localStorage.setItem(RESPONSES_KEY, JSON.stringify(nextResponses));

      if (stepNumber === SKETCH_PROMPTS.length) {
        await submitParticipantSketches({
          prolificId,
          sketches: nextResponses,
        });
        window.location.assign(FINAL_SURVEY_URL);
        return;
      }

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
        <Text size="5">Loading sketch prompt...</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" ml="9" mr="9" maxWidth="1200px" gap="6">
      <Text mt="9" size="4" weight="medium">
        Prompt {stepNumber} of {SKETCH_PROMPTS.length}
      </Text>

      <Text size="5" weight="medium">
        <Strong>Scenario: </Strong>
        {activePrompt.scenario}
      </Text>

      <Flex
        direction={{ initial: "column", md: "row" }}
        gap="6"
        align="start"
      >
        <Flex direction="column" gap="3">
          <Text size="5" weight="medium">
            How would you represent the given information?
          </Text>
          <Text size="4">You can sketch in this space.</Text>

          <Box width="400px" height="400px">
            <ReactSketchCanvas
              ref={canvasRef}
              style={styles}
              strokeWidth={4}
              strokeColor="black"
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
        </Flex>

        <Flex direction="column" minWidth="320px" maxWidth="520px" gap="4" flexGrow="1">
          <Text size="5" weight="medium">
            Describe your sketch
          </Text>
          <TextArea
            onChange={(event) => setDescription(event.target.value)}
            value={description}
            size="3"
            resize="vertical"
            placeholder="Describe what you drew and why."
          />
        </Flex>
      </Flex>

      <Flex align="center" justify="center" mt="4" mb="8">
        <Button size="3" onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : stepNumber === SKETCH_PROMPTS.length
              ? "Continue to Survey"
              : "Next"}
        </Button>
      </Flex>
    </Flex>
  );
}
