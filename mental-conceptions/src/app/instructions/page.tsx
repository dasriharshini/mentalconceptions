"use client";

import { Button, Flex, Strong, Text } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { SKETCH_PROMPTS } from "../sketch/prompts";

const ORDER_KEY = "sketchPromptOrder";
const CURRENT_STEP_KEY = "currentSketchStep";
const CURRENT_ROUTE_KEY = "currentSketchRoute";

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

export default function Instructions() {
  const router = useRouter();

  const handleNext = () => {
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
    router.push(nextRoute);
  };

  return (
    <Flex direction="column" ml="9" maxWidth="900px" gap="6">
      <Text mt="9" size="5" weight="medium">
        <Strong>Instructions: </Strong> In this study, you will be making
        drawings of your impressions about different datasets. Your goal is to
        draw a representation of the data you&apos;re prompted with in a way
        that feels the <Strong>most intuitive</Strong> to you.
        <br />
        <br />
        You should also aim to make these drawings <Strong>recognizable</Strong>
        {" "}to someone else trying to identify what you drew. You should make
        sure someone else looking only at your drawing would be able to
        understand what data you were prompted with. But you do not need to
        worry about making the drawings pretty.
        <br />
        <br />
        Click the &quot;Next&quot; button below when you&apos;re ready to start
        the study.
      </Text>

      <Button size="3" mt="4" onClick={handleNext} style={{ width: "fit-content" }}>
        Next
      </Button>
    </Flex>
  );
}
