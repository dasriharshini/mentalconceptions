"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Flex, Strong, Text, TextArea } from "@radix-ui/themes";
import {
  getWithinSubjectPairPrompt,
  type WithinSubjectAssignment,
  type WithinSubjectPairId,
  type WithinSubjectPairPrompt,
  type WithinSubjectPairResponse,
  WITHIN_ASSIGNMENT_KEY,
  WITHIN_CURRENT_ROUTE_KEY,
  WITHIN_CURRENT_STEP_KEY,
  WITHIN_PAIR_RESPONSES_KEY,
  WITHIN_PARTICIPANT_NUMBER_KEY,
  WITHIN_STUDY_VERSION_KEY,
  WITHIN_STUDY_VERSION,
} from "../../../libs/withinSubject";

const normalPairIds: WithinSubjectPairId[] = [
  "rating-ranking",
  "fruit-person",
  "stock-running",
];

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
  return normalPairIds.includes(pairId as WithinSubjectPairId)
    ? (pairId as WithinSubjectPairId)
    : null;
}

export default function WithinSubjectPairReasonsPage({
  params,
}: {
  params: { pairId: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignment, setAssignment] = useState<AssignmentPayload | null>(null);
  const [pairPrompt, setPairPrompt] = useState<WithinSubjectPairPrompt | null>(
    null
  );
  const [reasonBySide, setReasonBySide] = useState({
    left: "",
    right: "",
  });

  const pairId = normalizePairId(params.pairId);

  const pairOrderIndex = useMemo(() => {
    if (!assignment || !pairId) {
      return -1;
    }

    return assignment.pairOrder.indexOf(pairId);
  }, [assignment, pairId]);

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
    localStorage.setItem(WITHIN_CURRENT_STEP_KEY, `${pairId}:reasons`);
    localStorage.setItem(WITHIN_CURRENT_ROUTE_KEY, `/pairs/${pairId}/reasons`);
    localStorage.setItem(WITHIN_STUDY_VERSION_KEY, savedAssignment.studyVersion);

    if (!savedAssignment.pairOrder.includes(pairId)) {
      router.replace(`/pairs/${savedAssignment.pairOrder[0]}`);
      return;
    }

    const layout = savedAssignment.layoutByPair[pairId];
    if (!layout) {
      router.replace(`/pairs/${savedAssignment.pairOrder[0]}`);
      return;
    }

    const nextPairPrompt = getWithinSubjectPairPrompt(pairId, layout);
    setPairPrompt(nextPairPrompt);

    const savedResponses = localStorage.getItem(WITHIN_PAIR_RESPONSES_KEY);
    const parsedResponses = savedResponses
      ? (JSON.parse(savedResponses) as WithinSubjectPairResponse[])
      : [];
    const existingResponse = parsedResponses.find(
      (response) => response.pairId === pairId
    );

    if (!existingResponse) {
      router.replace(`/pairs/${pairId}`);
      return;
    }

    setReasonBySide({
      left: existingResponse.left.intuitiveReason ?? "",
      right: existingResponse.right.intuitiveReason ?? "",
    });
    setIsLoading(false);
  }, [pairId, router]);

  const upsertStoredResponse = (nextReasons: { left: string; right: string }) => {
    if (!pairPrompt || !assignment || pairOrderIndex < 0) {
      return;
    }

    const savedResponses = localStorage.getItem(WITHIN_PAIR_RESPONSES_KEY);
    const parsedResponses = savedResponses
      ? (JSON.parse(savedResponses) as WithinSubjectPairResponse[])
      : [];
    const existingResponse = parsedResponses.find(
      (response) => response.pairId === pairPrompt.pairId
    );

    if (!existingResponse) {
      return;
    }

    const nextResponse: WithinSubjectPairResponse = {
      ...existingResponse,
      pairOrder: pairOrderIndex + 1,
      left: {
        ...existingResponse.left,
        intuitiveReason: nextReasons.left,
      },
      right: {
        ...existingResponse.right,
        intuitiveReason: nextReasons.right,
      },
    };

    const nextResponses = parsedResponses.filter(
      (response) => response.pairId !== pairPrompt.pairId
    );
    nextResponses.push(nextResponse);
    nextResponses.sort((left, right) => left.pairOrder - right.pairOrder);
    localStorage.setItem(WITHIN_PAIR_RESPONSES_KEY, JSON.stringify(nextResponses));
  };

  const handleNext = () => {
    if (!pairPrompt) {
      return;
    }

    if (!reasonBySide.left.trim() || !reasonBySide.right.trim()) {
      alert("Please answer both questions before continuing.");
      return;
    }

    setIsSubmitting(true);

    try {
      upsertStoredResponse({
        left: reasonBySide.left.trim(),
        right: reasonBySide.right.trim(),
      });

      if (pairOrderIndex === assignment!.pairOrder.length - 1) {
        localStorage.setItem(WITHIN_CURRENT_STEP_KEY, "final-reason");
        localStorage.setItem(WITHIN_CURRENT_ROUTE_KEY, "/final-reason");
        router.push("/final-reason");
        return;
      }

      const nextPairId = assignment!.pairOrder[pairOrderIndex + 1];
      localStorage.setItem(WITHIN_CURRENT_STEP_KEY, nextPairId);
      localStorage.setItem(WITHIN_CURRENT_ROUTE_KEY, `/pairs/${nextPairId}`);
      router.push(`/pairs/${nextPairId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !pairPrompt) {
    return (
      <Flex align="center" justify="center" style={{ height: "100vh" }}>
        <Text size="5">Loading pair follow-up questions...</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" ml="9" mr="9" maxWidth="900px" gap="5">
      <Text mt="9" size="4" weight="medium">
        Pair {pairOrderIndex + 1} of {assignment!.pairOrder.length}
      </Text>

      <Text size="5" weight="medium">
        <Strong>Pair: </Strong>
        {pairPrompt.pairId.replace("-", " vs ")}
      </Text>

      <Text size="5" weight="medium">
        Why does the left drawing feel intuitive to you?
      </Text>
      <TextArea
        onPaste={(event) => event.preventDefault()}
        onCopy={(event) => event.preventDefault()}
        onCut={(event) => event.preventDefault()}
        onChange={(event) => {
          const nextValue = event.target.value;
          setReasonBySide((current) => ({ ...current, left: nextValue }));
          upsertStoredResponse({ ...reasonBySide, left: nextValue });
        }}
        value={reasonBySide.left}
        size="3"
        resize="vertical"
        placeholder="Please answer in your own words."
      />

      <Text size="5" weight="medium">
        Why does the right drawing feel intuitive to you?
      </Text>
      <TextArea
        onPaste={(event) => event.preventDefault()}
        onCopy={(event) => event.preventDefault()}
        onCut={(event) => event.preventDefault()}
        onChange={(event) => {
          const nextValue = event.target.value;
          setReasonBySide((current) => ({ ...current, right: nextValue }));
          upsertStoredResponse({ ...reasonBySide, right: nextValue });
        }}
        value={reasonBySide.right}
        size="3"
        resize="vertical"
        placeholder="Please answer in your own words."
      />

      <Flex align="center" justify="center" mt="4" mb="8">
        <Button size="3" onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Next"}
        </Button>
      </Flex>
    </Flex>
  );
}
