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
        <Strong>Instructions: </Strong> In this study, you will be making drawings of 
        your impressions about different datasets. Your goal is to draw a representation 
        of the data you’re prompted with in a way that feels the <Strong>most intuitive</Strong> to you. 
        <br /><br />
        You should also aim to make these drawings <Strong>recognizable</Strong> to someone else trying to identify what you drew. 
        You should make sure someone else looking only at your drawing would be able to understand what data you were 
        prompted with. But you do not need to worry about making the drawings pretty. 
        <br /><br />
        Click the "Next" button below when you're ready to start the study. 
      </Text>

{/*       <Flex justify="center" gap="6" mt="4">
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
      </Flex> */}

      <Link href="/entry">
        <Button size="3" mt="4">Next</Button>
      </Link>
    </Flex>
  )
}

export default Instructions
