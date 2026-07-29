"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  WITHIN_ASSIGNMENT_KEY,
  WITHIN_CURRENT_ROUTE_KEY,
  WITHIN_CURRENT_STEP_KEY,
  WITHIN_PARTICIPANT_NUMBER_KEY,
  type WithinSubjectPairId,
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

export default function Entry() {
  const router = useRouter();

  useEffect(() => {
    const participantNumber = Number(
      localStorage.getItem(WITHIN_PARTICIPANT_NUMBER_KEY) ?? "0"
    );

    if (!Number.isInteger(participantNumber) || participantNumber < 1) {
      router.replace("/prolificId");
      return;
    }

    const assignment = loadAssignment();

    if (!assignment || assignment.pairOrder.length === 0) {
      router.replace("/instructions");
      return;
    }

    const savedRoute = localStorage.getItem(WITHIN_CURRENT_ROUTE_KEY);
    const savedStep = localStorage.getItem(WITHIN_CURRENT_STEP_KEY);
    const firstPairRoute = `/pairs/${assignment.pairOrder[0]}`;

    if (savedRoute && /^(\/pairs\/[a-z-]+(\/reasons)?|\/final-reason)$/.test(savedRoute)) {
      router.replace(savedRoute);
      return;
    }

    if (savedStep) {
      const pairId = savedStep as WithinSubjectPairId;
      const pairRoute = assignment.pairOrder.includes(pairId)
        ? `/pairs/${pairId}`
        : firstPairRoute;
      router.replace(pairRoute);
      return;
    }

    router.replace(firstPairRoute);
  }, [router]);

  return <div>Loading... Please wait while we assign your prompts.</div>;
}
