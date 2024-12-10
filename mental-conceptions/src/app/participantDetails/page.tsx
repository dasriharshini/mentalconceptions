"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import {Button, TextArea, Flex, Text,RadioGroup} from '@radix-ui/themes';
import { useRouter } from "next/navigation";


function ParticipantDetails() {
  const [gender,setGender] = useState("");
  const [drawingMethod,setDrawingMethod] = useState("");
  const [skills,setSkills] = useState("");
  const [feedback,setFeedback] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const prolificId = localStorage.getItem("prolificId");
    const description1 = localStorage.getItem("description1");
    const description2 = localStorage.getItem("description2");
    const paths= localStorage.getItem("paths");

    if (!prolificId || !description1 || !description2 || !gender || !drawingMethod || !skills || !feedback) {
      alert("Please fill in all the fields");
      return;
    }

    const data = { prolificId, description1,description2, gender, drawingMethod, skills, feedback, paths: paths ? JSON.parse(paths) : []   };

    try {
      const res = await fetch("/api/participant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        localStorage.removeItem("prolificId");
        localStorage.removeItem("description1");
        localStorage.removeItem("description2");
        localStorage.removeItem("paths");
        router.push("/thankyou");
      } else {
        throw new Error("Failed to submit the form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  
 
  
  
  
  return (
    <>
    <Flex direction="column" ml="9" maxWidth="500px" gap="4" >
    <Text mt="9" weight="medium">What gender best describes you?</Text>
    <RadioGroup.Root value={gender} onValueChange={setGender} size="3"  name="gender">
    <RadioGroup.Item value="Male" >Male</RadioGroup.Item>
     <RadioGroup.Item value="Female" >Female</RadioGroup.Item>
     <RadioGroup.Item value="Non Binary">Non Binary / third gender</RadioGroup.Item>
     <RadioGroup.Item value="Prefer Not to Say" >Prefer Not to Say</RadioGroup.Item>
    </RadioGroup.Root>

    <Text mt="4" size ="5" weight="medium">Which of the following did you use to make drawing?</Text>
    <RadioGroup.Root value={drawingMethod} onValueChange={setDrawingMethod} size="3" name="drawingMethod">
    <RadioGroup.Item value="Mouse" >Mouse</RadioGroup.Item>
     <RadioGroup.Item value="Trackpad" >Trackpad</RadioGroup.Item>
     <RadioGroup.Item value="Touch" >Touch Screen</RadioGroup.Item>
     <RadioGroup.Item value="Stylus">Stylus</RadioGroup.Item>
     <RadioGroup.Item value="Other">Other</RadioGroup.Item>
    </RadioGroup.Root>

    <Text mt="4" size ="5" weight="medium">How skilled do you consider yourself at drawing?</Text>
    <RadioGroup.Root value={skills} onValueChange={setSkills} size="3" name="skillLevel">
    <RadioGroup.Item value="1">1</RadioGroup.Item>
     <RadioGroup.Item value="2" >2</RadioGroup.Item>
     <RadioGroup.Item value="3" >3</RadioGroup.Item>
     <RadioGroup.Item value="4" >4</RadioGroup.Item>
     <RadioGroup.Item value="5">5</RadioGroup.Item>
    </RadioGroup.Root>

    <Text mt="4" size ="5" weight="medium">This is a pilot version. Please give us your feedback, it is highly appreciated</Text>
    <TextArea onChange={(e)=> setFeedback(e.target.value) } 
    value= {feedback} size="3" placeholder="Your Feedback" />

    <Link onClick = {handleSubmit} href="/thankyou"><Button size="3">Submit</Button></Link>
    </Flex>
    

    </>
  )
}

export default ParticipantDetails