import React from 'react'
import {Button, Flex, Text, Strong} from '@radix-ui/themes'
import Link from 'next/link'

function instructions() {
  return (
    <Flex direction="column" ml="9" maxWidth="900px" gap="4" >
    <Text mt="9" size ="5" weight="medium">
    <Strong>Task: </Strong> In this study, you will be making drawings of your impressions about different kinds of data. 
    Your goal is to make these drawings <Strong>recognizable </Strong> to someone else trying to identify what you were trying 
    to draw. But you do not need to be concerned about making them pretty. On some trials you will be prompted by a word. On these 
    trials, your specific goal is to make a drawing that would help someone else looking only at your drawing understand what data you were prompted with.
    </Text><Text mb="6" size ="5" weight="medium">
    <Strong>Scenario: </Strong> Imagine you are interested in the number of World Heritage Sites in <Strong>Norway, Denmark, and Sweden </Strong>over two 
    different years: 2004 and 2022. In 2004, Norway had 5 sites, Denmark had 4, and Sweden had 13. By 2022, the numbers increased to 8 
    sites for Norway, 10 for Denmark, and 15 for Sweden. We will ask you to draw how you would anticipate this data should be visually 
    communicated to you in a clear and concise manner. 
    </Text>
    <Link href="/sketch"><Button size="3">Next</Button></Link>
    </Flex>
  )
}

export default instructions