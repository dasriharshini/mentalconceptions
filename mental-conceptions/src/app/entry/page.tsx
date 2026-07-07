"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSketchPrompts } from '../sketch/prompts';

const ORDER_KEY = "sketchPromptOrder";
const CURRENT_STEP_KEY = "currentSketchStep";
const CURRENT_ROUTE_KEY = "currentSketchRoute";

let useDatasetB = true; // set to true to use Dataset B, false to use Dataset A
const SKETCH_PROMPTS = getSketchPrompts(useDatasetB);

function createRandomizedOrder() {
  const promptIds = SKETCH_PROMPTS.map((prompt) => prompt.id);

  for (let index = promptIds.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = promptIds[index];
    promptIds[index] = promptIds[swapIndex];
    promptIds[swapIndex] = current;
  }

  return promptIds;
}

function Entry() {
  const router = useRouter();

  useEffect(() => {
    const prolificId = localStorage.getItem("prolificId");

    if (!prolificId) {
      router.replace("/prolificId");
      return;
    }

    const savedOrder = localStorage.getItem(ORDER_KEY);
    const parsedOrder = savedOrder ? (JSON.parse(savedOrder) as string[]) : [];
    const nextOrder =
      parsedOrder.length === SKETCH_PROMPTS.length
        ? parsedOrder
        : createRandomizedOrder();
    const savedStep = Number(localStorage.getItem(CURRENT_STEP_KEY) ?? "1");
    const nextStep =
      Number.isInteger(savedStep) &&
      savedStep >= 1 &&
      savedStep <= SKETCH_PROMPTS.length
        ? savedStep
        : 1;
    const savedRoute = localStorage.getItem(CURRENT_ROUTE_KEY);
    const nextRoute =
      savedRoute &&
      /^\/sketch\/\d+(\/reasons)?$/.test(savedRoute)
        ? savedRoute
        : `/sketch/${nextStep}`;

    localStorage.setItem(ORDER_KEY, JSON.stringify(nextOrder));
    router.replace(nextRoute);
  }, [router]);

  return <div>Loading... Please wait while we assign your prompts.</div>;
}

export default Entry;
