import React from 'react'
import { Button, Flex, Text, Strong, Box } from '@radix-ui/themes'
import Link from 'next/link'
import Image from 'next/image'

function Instructions() {
  const captions = ["no bonus", "1 cent increase", "5 cent increase"];
  const imageNames = ["scenario1", "scenario2", "scenario3"];

  return (
    <Flex direction="column" ml="9" maxWidth="900px" gap="6">
      <Text mt="9" size="5" weight="medium">
        <Strong>Task: </Strong> In this study, you will be making drawings of your impressions about different kinds of data.
        Your goal is to make these drawings <Strong>recognizable</Strong> to someone else trying to identify what you were trying
        to draw. But you do not need to be concerned about making them pretty. On some trials, you will be prompted by a word.
        On these trials, your specific goal is to make a drawing that would help someone else looking only at your drawing understand what data you were prompted with.
      </Text>

      <Flex justify="center" gap="6" mt="4">
        {imageNames.map((image, index) => (
          <Flex key={index} direction="column" align="center" gap="2">
            <Box style={{ textAlign: 'center' }}>
              <Image
                src={`/images/${image}.png`}
                alt={`Example ${index + 1}`}
                width={200}
                height={200}
                style={{ borderRadius: '8px' }}
              />
            </Box>
            <Text size="3" style={{ textAlign: 'center' }}>{captions[index]}</Text>
          </Flex>
        ))}
      </Flex>

      <Link href="/entry">
        <Button size="3" mt="4">Next</Button>
      </Link>
    </Flex>
  )
}

export default Instructions
