"use client";

import React, { useState, useRef,useEffect } from 'react';
import { Box, Flex, Text, TextArea, Button, Strong } from '@radix-ui/themes';
import { EraserIcon, Pencil1Icon, ResetIcon } from '@radix-ui/react-icons'
import Link from 'next/link';
import { ReactSketchCanvas, type ReactSketchCanvasRef } from 'react-sketch-canvas';
import { useRouter } from 'next/navigation';
import AWS from 'aws-sdk';


const styles = {
  border: '0.25rem solid #3E63DD',
  borderRadius: '0.75rem',
};


function Sketch() {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [description, setDescription] = useState('');
  const [canvas, setCanvas] = useState<CanvasPath[]>([]);
  const [dataURI, setDataURI] = useState('');
  const [exportedImage, setExportedImage] = useState('png');
  const router = useRouter();
  const [eraseMode, setEraseMode] = useState(false);
  


  const handleClearCanvasClick = () => {
    canvasRef.current?.clearCanvas();  
    setEraseMode(false);
  };

  const handleEraserClick = () => {
    setEraseMode(true);
    canvasRef.current?.eraseMode(true); // Enable eraser
  };

  const handlePenClick = () => {
    setEraseMode(false);
    canvasRef.current?.eraseMode(false); // Enable pen
  };

  const prolificId = typeof window !== 'undefined' ? localStorage.getItem('prolificId') : '';
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      AWS.config.update({
        accessKeyId: "AKIAQ3EGTCQWRCOPX5NR",
        secretAccessKey: "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",
        region: "eu-north-1"
      });
    }
  }, []);
  const s3 = new AWS.S3();
  console.log('AWS Access Key ID:', s3.config);



  const handleImage = async (canvas: ReactSketchCanvasRef,prolificId:string) => {
    console.log("entered handleImage")
    const dataUrl = await canvas.exportImage("png");
    setExportedImage(dataUrl);
    
    if (!dataUrl) {
      alert("No image to download");
      return;
    }

    const blob = await fetch(dataUrl).then(res => res.blob());
    const fileName = `${prolificId}-${Date.now()}.png`;

    const params = {
      Bucket: 'mental-conceptions-sketches',
      Key: fileName,
      Body: blob,
      ContentType: 'image/png',
      ACL: 'public-read'
    };

    s3.upload(params, (err: any, data: any) => {
      if (err) {
        console.error('Error uploading image:', err);
        alert('Error uploading image');
      } else {
        console.log('Image uploaded successfully:', data.Location);
        setDataURI(data.Location);
      }
    });
  };
  
  const handleCanvasOnChange = (e: any) => {
    
    const exportedCanvasPromise = canvasRef?.current?.exportPaths();
    exportedCanvasPromise?.then((result: any[]) => {
        localStorage.setItem('paths', JSON.stringify(result))
        setCanvas(result)
    }).catch((error: any) => {
        console.error(error);
    });
    

}

const handleNextButtonClick = async (e: any) => {
  await handleImage(canvasRef.current as ReactSketchCanvasRef,prolificId || "");
  handleSubmit(e);
};

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!description) {
      alert('Description is required');
      return;
    }

    localStorage.setItem('description', description);
    router.push('/participantDetails');

   
    
    
  };

  return (
    <>
      <Flex direction="column" ml="9" maxWidth="1000px" gap="4" justify="center">
        <Text mb="6" size="5" weight="medium">
          <Strong>Scenario: </Strong> Imagine you are interested in the average quality scores of different wine types—Red, White, and Rosé—over three different years: 2010, 2020, and 2022. In 2010, the average quality scores were 5 for Red, 4 for White, and 3 for Rosé. By 2020, the scores decreased to 4 for Red, 3 for White, and 2 for Rosé. Finally, by 2022, the scores continued to decline, with 3 for Red, 2 for White, and 1 for Rosé.

We will ask you to illustrate how you would anticipate this data to be visually communicated to you in a way that is clear, concise, and easy to interpret.
        </Text>
      </Flex>

      <Flex direction="row" ml="9">
        <Flex direction="column" gap="2" mr="9">
          <Text mt="4" size="5" weight="medium">
            How would you represent the given information?{' '}
          </Text>
          <Text size="5" weight="medium">You can sketch in this space.</Text>
          
          <Box width="400px" height="400px">
            <ReactSketchCanvas ref={canvasRef} onChange={handleCanvasOnChange} style={styles} strokeWidth={4} strokeColor="black" />
          </Box>
          <br/>
          <Flex direction="row" gap="5" align="center">
          <Button size="3" onClick={handleEraserClick}>
            <EraserIcon/>
            Erase
          </Button>
          <Button size="3" onClick={handlePenClick}>
          <Pencil1Icon/>
          Draw
          </Button>
          <Button
          size="3"
          disabled={eraseMode}
          onClick={handleClearCanvasClick}>
            <ResetIcon/>
          Clear Canvas
        </Button>
          </Flex>
          
       </Flex>
        <Flex direction="column" ml="4" minWidth="500px" gap="4">
          <Text mt="4" mb="6" size="5" weight="medium">
            Describe your sketch
          </Text>
          <TextArea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            size="3"
            resize="both"
            placeholder="As soon as I..."
          />
        </Flex>
      </Flex>
      <Flex align="center" justify="center" mt="6">
        <Link href="/participantDetails">
          <Button size="3" onClick={handleNextButtonClick}>
            Next
          </Button>
        </Link>
   
      </Flex>
  
    </>
  );
 
}

export default Sketch;
