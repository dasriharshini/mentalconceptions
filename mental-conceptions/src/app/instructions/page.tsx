"use client";

import { Button, Flex, Strong, Text, Box } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { getSketchPrompts } from "../sketch/prompts";
import Image from 'next/image';

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

  const captions = [<>This drawing <Strong>isn’t recognizable</Strong>.</>,
  <>This drawing is recognizable, but it <Strong>doesn’t allow someone to understand the data</Strong> (i.e., how many units of apples and grapes were sold).</>];
  const imageNames = ["not_recognizable", "no_data"];

  return (
    <Flex direction="column" ml="9" maxWidth="1000px" gap="6">
      <Text mt="7" size="5" weight="medium">
        <Strong>Instructions: </Strong> In this study, you will be making
        drawings of your impressions about different datasets. Your goal is to
        draw a representation of the data you&apos;re prompted with in a way
        that <Strong>feels the most intuitive to you</Strong>.
        <br />
        <br />
        There are no right or wrong ways to draw the datasets, as long as someone else would 
        be able to <Strong>recognize</Strong> your drawings and <Strong>understand what dataset 
        you were prompted with. </Strong>You don’t need to worry about making the drawings pretty. 

        <br />
        <br />
        Because we are interested in your unique personal perspective, <Strong>please 
          do not use AI tools in any part of this study. </Strong>
        AI-generated answers cannot capture your individual voice, and they unfortunately 
        make the data unusable for our research goals. Thank you for sharing your genuine thoughts with us! 

      </Text>

     
      <Text size="5" weight="medium">
        Click the &quot;Next&quot; button below when you&apos;re ready to start
        the study.
      </Text>



      <Button size="3" onClick={handleNext} style={{ width: "fit-content" }}>
        Next
      </Button>
    </Flex>
  );
}
