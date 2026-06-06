"use client";

import { Button, Flex, Strong, Text, Box } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { SKETCH_PROMPTS } from "../sketch/prompts";
import Image from 'next/image';

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

  const captions = [<>This drawing <Strong>isn’t recognizable</Strong>.</>, 
    <>This drawing is recognizable, but it <Strong>doesn’t allow someone to understand the data</Strong><br /> (i.e., how many units of apples and grapes were sold).</>];
  const imageNames = ["not_recognizable", "no_data"];

  return (
    <Flex direction="column" ml="9" maxWidth="1100px" gap="6">
      <Text mt="7" size="5" weight="medium">
        <Strong>Instructions: </Strong> In this study, you will be making
        drawings of your impressions about different datasets. Your goal is to
        draw a representation of the data you&apos;re prompted with in a way
        that feels the <Strong>most intuitive</Strong> to you.
        <br />
        <br />
        There are no right or wrong ways to draw the datasets, as long as the drawings
         are <Strong>recognizable</Strong>
        {" "}to someone else trying to identify what you drew. You should make
        sure someone else looking only at your drawing would be able to
        <Strong> understand what data you were prompted with</Strong>. But you don't need to
        worry about making the drawings pretty.
        <br />
        <br />
        Here are two examples of what we <Strong>DON’T</Strong> want you to draw:
        <br />
        <br />
        <Strong>Example dataset: </Strong>This dataset shows the sales of apples 
        and grapes in a supermarket. 200 units of apples and 150 units of grapes 
        were sold. 

         <Flex justify="center" gap="6" mt="4">
        {imageNames.map((image, index) => (
          <Flex key={index} direction="column" align="start" gap="2">
            <Box style={{ textAlign: 'left' }}>
              <Image
                src={`/images/${image}.png`}
                alt={`Example ${index + 1}`}
                width={200}
                height={200}
                style={{ borderRadius: '8px' }}
              />
            </Box>
            <Text size="4" style={{ textAlign: 'left' }}>{captions[index]}</Text>
          </Flex>
        ))}
      </Flex>

        <br />

        Click the &quot;Next&quot; button below when you&apos;re ready to start
        the study.
      </Text>

     

      <Button size="3" onClick={handleNext} style={{ width: "fit-content" }}>
        Next
      </Button>
    </Flex>
  );
}
