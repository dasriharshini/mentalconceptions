import React from 'react'
import Link from 'next/link'
import {Button, Heading, Flex, Text} from '@radix-ui/themes'

function Home() {
  return (

    <div>
    <Flex direction="column" align="center" justify="center" style={{ height: '100vh' }}>
      <Heading mb="4" size="9">Mental Conceptions of Data Science</Heading>
      <Text mb="8" size ="8">By Professor Lace Padilla</Text>
      <Link href="/prolificId"><Button size="4">Begin Survey</Button></Link>
    </Flex>

  </div>
  
  )
}

export default Home

