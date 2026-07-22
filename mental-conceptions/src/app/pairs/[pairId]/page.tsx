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
  getWithinSubjectPairPrompt,
  type WithinSubjectAssignment,
  type WithinSubjectPairId,
  type WithinSubjectPairPrompt,
  type WithinSubjectPairResponse,
  type WithinSubjectSketchPath,
  WITHIN_ASSIGNMENT_KEY,
  WITHIN_CURRENT_ROUTE_KEY,
  WITHIN_CURRENT_STEP_KEY,
  WITHIN_PAIR_RESPONSES_KEY,
  WITHIN_PARTICIPANT_NUMBER_KEY,
  WITHIN_STUDY_VERSION_KEY,
  WITHIN_STUDY_VERSION,
} from "../../libs/withinSubject";

const styles = {
  border: "0.25rem solid #3E63DD",
  borderRadius: "0.75rem",
};

const DEFAULT_STROKE_COLOR = "#000000";

type SideKey = "left" | "right";

const SIDE_LABELS: Record<SideKey, string> = {
  left: "Left dataset",
  right: "Right dataset",
};

const SIDE_TITLE_STYLE = { marginBottom: "0.25rem" };

type AssignmentPayload = WithinSubjectAssignment & {
  participantNumber: number;
};

function loadAssignment(): AssignmentPayload | null {
  const rawAssignment = localStorage.getItem(WITHIN_ASSIGNMENT_KEY);
  if (!rawAssignment) {
    return null;
  }

  try {
    return JSON.parse(rawAssignment) as AssignmentPayload;
  } catch {
    return null;
  }
}

function normalizePairId(pairId: string): WithinSubjectPairId | null {
  const validPairIds: WithinSubjectPairId[] = [
    "rating-ranking",
    "fruit-person",
    "stock-running",
  ];

  return validPairIds.includes(pairId as WithinSubjectPairId)
    ? (pairId as WithinSubjectPairId)
    : null;
}

export default function WithinSubjectPairPage({
  params,
}: {
  params: { pairId: string };
}) {
  const router = useRouter();
  const leftCanvasRef = useRef<ReactSketchCanvasRef>(null);
  const rightCanvasRef = useRef<ReactSketchCanvasRef>(null);
  const loadedPairIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignment, setAssignment] = useState<AssignmentPayload | null>(null);
  const [descriptionBySide, setDescriptionBySide] = useState({
    left: "",
    right: "",
  });
  const [savedPathsBySide, setSavedPathsBySide] = useState({
    left: [] as WithinSubjectSketchPath[],
    right: [] as WithinSubjectSketchPath[],
  });
  const [strokeColorBySide, setStrokeColorBySide] = useState({
    left: DEFAULT_STROKE_COLOR,
    right: DEFAULT_STROKE_COLOR,
  });

  const pairId = normalizePairId(params.pairId);

  const pairOrderIndex = useMemo(() => {
    if (!assignment || !pairId) {
      return -1;
    }

    return assignment.pairOrder.indexOf(pairId);
  }, [assignment, pairId]);

  const activePairPrompt = useMemo(() => {
    if (!assignment || !pairId || pairOrderIndex < 0) {
      return null;
    }

    const layout = assignment.layoutByPair[pairId];
    if (!layout) {
      return null;
    }

    return getWithinSubjectPairPrompt(pairId, layout);
  }, [assignment, pairId, pairOrderIndex]);

  const upsertStoredResponse = (
    nextDescriptions: { left: string; right: string },
    nextPathsBySide: {
      left: WithinSubjectSketchPath[];
      right: WithinSubjectSketchPath[];
    },
    nextImageUrls: { left: string | null; right: string | null } = {
      left: null,
      right: null,
    }
  ) => {
    if (!activePairPrompt || !assignment || pairOrderIndex < 0) {
      return;
    }

    const savedResponses = localStorage.getItem(WITHIN_PAIR_RESPONSES_KEY);
    const parsedResponses = savedResponses
      ? (JSON.parse(savedResponses) as WithinSubjectPairResponse[])
      : [];
    const existingResponse = parsedResponses.find(
      (response) => response.pairId === activePairPrompt.pairId
    );

    const nextResponse: WithinSubjectPairResponse = {
      pairId: activePairPrompt.pairId,
      pairOrder: pairOrderIndex + 1,
      leftPromptId: activePairPrompt.left.id,
      rightPromptId: activePairPrompt.right.id,
      leftCondition: activePairPrompt.left.condition,
      rightCondition: activePairPrompt.right.condition,
      left: {
        promptId: activePairPrompt.left.id,
        condition: activePairPrompt.left.condition,
        scenario: activePairPrompt.left.scenario,
        description: nextDescriptions.left,
        intuitiveReason: existingResponse?.left.intuitiveReason ?? "",
        paths: nextPathsBySide.left,
        imageUrl: nextImageUrls.left ?? existingResponse?.left.imageUrl ?? null,
      },
      right: {
        promptId: activePairPrompt.right.id,
        condition: activePairPrompt.right.condition,
        scenario: activePairPrompt.right.scenario,
        description: nextDescriptions.right,
        intuitiveReason: existingResponse?.right.intuitiveReason ?? "",
        paths: nextPathsBySide.right,
        imageUrl: nextImageUrls.right ?? existingResponse?.right.imageUrl ?? null,
      },
    };

    const nextResponses = parsedResponses.filter(
      (response) => response.pairId !== activePairPrompt.pairId
    );
    nextResponses.push(nextResponse);
    nextResponses.sort((left, right) => left.pairOrder - right.pairOrder);
    localStorage.setItem(WITHIN_PAIR_RESPONSES_KEY, JSON.stringify(nextResponses));
  };

  const uploadImage = async (
    side: SideKey,
    prolificId: string,
    promptId: string,
    condition: string
  ) => {
    const canvas =
      side === "left" ? leftCanvasRef.current : rightCanvasRef.current;

    if (!canvas) {
      return null;
    }

    const dataUrl = await canvas.exportImage("png");
    if (!dataUrl) {
      return null;
    }

    const blob = await fetch(dataUrl).then((response) => response.blob());
    const pairSlug = activePairPrompt?.pairId ?? `pair-${params.pairId}`;
    const fileName = `${prolificId}-${pairSlug}-${side}-${condition}-${promptId}-${Date.now()}.png`;
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

  const handleCanvasChange = (
    side: SideKey,
    updatedPaths: WithinSubjectSketchPath[]
  ) => {
    setSavedPathsBySide((current) => ({
      ...current,
      [side]: updatedPaths,
    }));

    upsertStoredResponse(
      descriptionBySide,
      {
        ...savedPathsBySide,
        [side]: updatedPaths,
      },
      { left: null, right: null }
    );
  };

  useEffect(() => {
    AWS.config.update({
      accessKeyId: "AKIAQ3EGTCQWRCOPX5NR",
      secretAccessKey: "gNOuLbYUTlwx6k4hNLGNdJmXlbTOz1l0wxqQe74b",
      region: "eu-north-1",
    });
  }, []);

  useEffect(() => {
    if (!pairId) {
      router.replace("/entry");
      return;
    }

    const prolificId = localStorage.getItem("prolificId");
    if (!prolificId) {
      router.replace("/prolificId");
      return;
    }

    const participantNumber = Number(
      localStorage.getItem(WITHIN_PARTICIPANT_NUMBER_KEY) ?? "0"
    );

    if (!Number.isInteger(participantNumber) || participantNumber < 1) {
      router.replace("/prolificId");
      return;
    }

    const savedAssignment = loadAssignment();
    if (!savedAssignment) {
      router.replace("/prolificId");
      return;
    }

    if (savedAssignment.studyVersion !== WITHIN_STUDY_VERSION) {
      router.replace("/prolificId");
      return;
    }

    setAssignment(savedAssignment);
    localStorage.setItem(WITHIN_CURRENT_STEP_KEY, pairId);
    localStorage.setItem(WITHIN_CURRENT_ROUTE_KEY, `/pairs/${pairId}`);
    localStorage.setItem(WITHIN_STUDY_VERSION_KEY, savedAssignment.studyVersion);

    const currentPairId = savedAssignment.pairOrder[0];
    if (!savedAssignment.pairOrder.includes(pairId)) {
      router.replace(`/pairs/${currentPairId}`);
      return;
    }

    const savedResponses = localStorage.getItem(WITHIN_PAIR_RESPONSES_KEY);
    const parsedResponses = savedResponses
      ? (JSON.parse(savedResponses) as WithinSubjectPairResponse[])
      : [];
    const existingResponse = parsedResponses.find(
      (response) => response.pairId === pairId
    );

    if (existingResponse) {
      setDescriptionBySide({
        left: existingResponse.left.description ?? "",
        right: existingResponse.right.description ?? "",
      });
      setSavedPathsBySide({
        left: existingResponse.left.paths ?? [],
        right: existingResponse.right.paths ?? [],
      });
    } else {
      setDescriptionBySide({ left: "", right: "" });
      setSavedPathsBySide({
        left: [],
        right: [],
      });
    }

    setIsLoading(false);
  }, [pairId, router]);

  useEffect(() => {
    if (isLoading || !activePairPrompt) {
      return;
    }

    if (loadedPairIdRef.current === activePairPrompt.pairId) {
      return;
    }

    leftCanvasRef.current?.resetCanvas();
    rightCanvasRef.current?.resetCanvas();

    if (savedPathsBySide.left.length > 0) {
      leftCanvasRef.current?.loadPaths(savedPathsBySide.left);
    }

    if (savedPathsBySide.right.length > 0) {
      rightCanvasRef.current?.loadPaths(savedPathsBySide.right);
    }

    loadedPairIdRef.current = activePairPrompt.pairId;
  }, [activePairPrompt, isLoading, savedPathsBySide]);

  const handleSideClear = (side: SideKey) => {
    const canvas =
      side === "left" ? leftCanvasRef.current : rightCanvasRef.current;
    canvas?.clearCanvas();
  };

  const handleSideEraser = (side: SideKey) => {
    const canvas =
      side === "left" ? leftCanvasRef.current : rightCanvasRef.current;
    canvas?.eraseMode(true);
  };

  const handleSidePen = (side: SideKey) => {
    const canvas =
      side === "left" ? leftCanvasRef.current : rightCanvasRef.current;
    canvas?.eraseMode(false);
  };

  const handleNext = async () => {
    if (!activePairPrompt || !assignment) {
      return;
    }

    if (!descriptionBySide.left.trim() || !descriptionBySide.right.trim()) {
      alert("Please describe both sketches before continuing.");
      return;
    }

    const prolificId = localStorage.getItem("prolificId");
    if (!prolificId) {
      router.replace("/prolificId");
      return;
    }

    setIsSubmitting(true);

    try {
      const leftPaths = ((await leftCanvasRef.current?.exportPaths()) ??
        []) as WithinSubjectSketchPath[];
      const rightPaths = ((await rightCanvasRef.current?.exportPaths()) ??
        []) as WithinSubjectSketchPath[];

      if (leftPaths.length === 0 || rightPaths.length === 0) {
        alert("Please draw on both canvases before continuing.");
        return;
      }

      const leftImageUrl = await uploadImage(
        "left",
        prolificId,
        activePairPrompt.left.id,
        activePairPrompt.left.condition
      );
      const rightImageUrl = await uploadImage(
        "right",
        prolificId,
        activePairPrompt.right.id,
        activePairPrompt.right.condition
      );

      upsertStoredResponse(
        {
          left: descriptionBySide.left.trim(),
          right: descriptionBySide.right.trim(),
        },
        {
          left: leftPaths,
          right: rightPaths,
        },
        {
          left: leftImageUrl,
          right: rightImageUrl,
        }
      );

      localStorage.setItem(
        WITHIN_CURRENT_STEP_KEY,
        `${pairOrderIndex + 1}:draw`
      );
      localStorage.setItem(
        WITHIN_CURRENT_ROUTE_KEY,
        `/pairs/${activePairPrompt.pairId}/reasons`
      );
      router.push(`/pairs/${activePairPrompt.pairId}/reasons`);
    } catch (error) {
      console.error("Error saving pair response:", error);
      alert(
        "We could not save your response right now. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !activePairPrompt) {
    return (
      <Flex align="center" justify="center" style={{ height: "100vh" }}>
        <Text size="5">Loading pair prompt...</Text>
      </Flex>
    );
  }

  const renderSideCard = (side: SideKey) => {
    const prompt = activePairPrompt[side];
    const canvasRef = side === "left" ? leftCanvasRef : rightCanvasRef;
    const sideLabel = SIDE_LABELS[side];

    return (
      <Flex direction="column" gap="3" flexGrow="1">
        <Text size="5" weight="medium" style={SIDE_TITLE_STYLE}>
          {sideLabel}
        </Text>

        <Text size="4" weight="medium">
          <Strong>Dataset: </Strong>
          {prompt.scenario}
        </Text>

        <Text size="5" weight="medium">
          Draw a representation of this dataset that feels the most intuitive
          to you:
        </Text>

        <Box width="100%" height="360px">
          <ReactSketchCanvas
            ref={canvasRef}
            style={styles}
            strokeWidth={4}
            strokeColor={strokeColorBySide[side]}
            onChange={(updatedPaths) =>
              handleCanvasChange(side, updatedPaths as WithinSubjectSketchPath[])
            }
          />
        </Box>

        <Flex direction="row" gap="3" align="center" wrap="wrap">
          <Button size="2" onClick={() => handleSideEraser(side)}>
            <EraserIcon />
            Erase
          </Button>
          <Button size="2" onClick={() => handleSidePen(side)}>
            <Pencil1Icon />
            Draw
          </Button>
          <Button size="2" onClick={() => handleSideClear(side)}>
            <ResetIcon />
            Clear
          </Button>
        </Flex>

        <Flex direction="column" gap="2">
          <Text size="3" weight="medium">
            Pick pen color:
          </Text>
          <input
            type="color"
            value={strokeColorBySide[side]}
            onChange={(event) => {
              setStrokeColorBySide((current) => ({
                ...current,
                [side]: event.target.value,
              }));
              handleSidePen(side);
            }}
            aria-label={`Choose a custom pen color for the ${sideLabel.toLowerCase()}`}
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

        <Text size="5" weight="medium">
          Briefly describe what you drew:
        </Text>
        <TextArea
          onPaste={(event) => event.preventDefault()}
          onCopy={(event) => event.preventDefault()}
          onCut={(event) => event.preventDefault()}
          onChange={(event) => {
            const nextDescription = event.target.value;
            setDescriptionBySide((current) => ({
              ...current,
              [side]: nextDescription,
            }));
            upsertStoredResponse(
              {
                ...descriptionBySide,
                [side]: nextDescription,
              },
              savedPathsBySide
            );
          }}
          value={descriptionBySide[side]}
          size="3"
          resize="vertical"
          placeholder="Please answer in your own words. Do not use AI tools or external websites; we're interested in your genuine perspective."
        />
      </Flex>
    );
  };

  return (
    <Flex direction="column" ml="9" mr="9" maxWidth="1280px" gap="6">
      <Text mt="9" size="4" weight="medium">
        Pair {pairOrderIndex + 1} of {assignment.pairOrder.length}
      </Text>

      <Text size="5" weight="medium">
        <Strong>Pair: </Strong>
        {activePairPrompt.pairId.replace("-", " vs ")}
      </Text>

      <Flex direction={{ initial: "column", lg: "row" }} gap="6" align="start">
        {renderSideCard("left")}
        {renderSideCard("right")}
      </Flex>

      <Flex align="center" justify="center" mt="4" mb="8">
        <Button size="3" onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Next"}
        </Button>
      </Flex>
    </Flex>
  );
}
