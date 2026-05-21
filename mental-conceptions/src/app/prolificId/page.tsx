"use client";

import React, { useState } from 'react'
import Link from 'next/link'
import {Button, TextArea, Flex, Text} from '@radix-ui/themes'
import { useRouter } from "next/navigation";


function ProlificId() {
  const [prolificId,setProlificId] = useState("");
  const router = useRouter();
  const handleSubmit = async (e: { preventDefault: () => void; }) =>{
    e.preventDefault();
    if (!prolificId){
      alert("Prolific Id is required");
      return;
    }
  
    localStorage.setItem("prolificId", prolificId);
    localStorage.removeItem("assignedPage");
    localStorage.removeItem("description1");
    localStorage.removeItem("description2");
    localStorage.removeItem("paths");
    localStorage.removeItem("sketchPromptOrder");
    localStorage.removeItem("sketchResponses");
    router.push("/instructions");
  
  };
  return (
    <Flex direction="column" ml="9" maxWidth="500px" gap="4" >
    <Text mt="9" size ="5" weight="medium">Before we start, please fill in your Prolific Id below:</Text>
    <TextArea  onChange={(e)=> setProlificId(e.target.value) } 
    value= {prolificId}
    size="3" placeholder="Your Prolific Id" />
    <Link onClick = {handleSubmit} href="/instructions"><Button size="3">Next</Button></Link>
    </Flex>
  )
}

export default ProlificId
