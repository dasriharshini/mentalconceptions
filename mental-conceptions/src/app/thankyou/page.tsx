import React from 'react'
import '@radix-ui/themes/styles.css';
import {Heading, Flex, Text} from '@radix-ui/themes'

function thankyouPage() {
  return (
    <Flex direction="column" align="center" justify="center" style={{ height: '100vh' }}>
    <Heading mb="4" size="9">Thank you for participating!</Heading>
    <Text mb="8" size ="7">Here is your participation code: 3E9EA4E1. Please copy this code into Prolific to receive full credit. 
    </Text>
  </Flex>
  )
}

export default thankyouPage