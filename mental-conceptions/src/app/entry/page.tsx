"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SKETCH_PROMPTS } from '../sketch/prompts';

const ORDER_KEY = "sketchPromptOrder";
const CURRENT_STEP_KEY = "currentSketchStep";

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

    localStorage.setItem(ORDER_KEY, JSON.stringify(nextOrder));
    router.replace(`/sketch/${nextStep}`);
  }, [router]);

  return <div>Loading... Please wait while we assign your prompts.</div>;
}

export default Entry;
