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
  const canvasRef1 = useRef<ReactSketchCanvasRef>(null);
  const canvasRef2 = useRef<ReactSketchCanvasRef>(null);
  const [description1, setDescription1] = useState('');
  const [description2, setDescription2] = useState('');
  const [canvas1, setCanvas1] = useState<CanvasPath[]>([]);
  const [canvas2, setCanvas2] = useState<CanvasPath[]>([]);
  const [dataURI, setDataURI] = useState('');
  const [exportedImage, setExportedImage] = useState('png');
  const router = useRouter();
  const [eraseMode, setEraseMode] = useState(false);
  


  const handleClearCanvasClick = (canvas: ReactSketchCanvasRef) => {
    canvas.clearCanvas();  
    setEraseMode(false);
  };

  const handleEraserClick = (canvas: ReactSketchCanvasRef) => {
    setEraseMode(true);
    canvas.eraseMode(true); // Enable eraser
  };

  const handlePenClick = (canvas: ReactSketchCanvasRef) => {
    setEraseMode(false);
    canvas.eraseMode(false); // Enable pen
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
  
  const handleCanvasOnChange = (canvasId: string) => {
    const canvasRefToUse = canvasId === 'canvas1' ? canvasRef1 : canvasRef2; // Assume separate refs for both canvases
  
    canvasRefToUse.current
    ?.exportPaths()
    .then((result: any[]) => {
      if (result.length > 0) {
        localStorage.setItem(`${canvasId}-paths`, JSON.stringify(result));
        canvasId === 'canvas1' ? setCanvas1(result) : setCanvas2(result);
      } else {
        console.warn("No paths to export for", canvasId);
      }
    })
    .catch(console.error);
  };
    
  const handleNextButtonClick = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
  
    e.preventDefault();
    const prolificId = localStorage.getItem("prolificId");
    const paths= localStorage.getItem("paths");
  
    // Validate descriptions
    if (!description1 || !description2) {
      alert('Both descriptions are required');
      return;
    }
  
    // Save descriptions in localStorage
    localStorage.setItem('description1', description1);
    localStorage.setItem('description2', description2);
  
    // Handle canvas images
    await handleImage(canvasRef1.current as ReactSketchCanvasRef, prolificId || "");
    await handleImage(canvasRef2.current as ReactSketchCanvasRef, prolificId || "");
    const data = { prolificId, description1,description2, paths: paths ? JSON.parse(paths) : []   };

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
        router.push("/sketch4");
      } else {
        throw new Error("Failed to submit the form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  



  
  return (
    <>
      <Flex direction="column" ml="9" maxWidth="1000px" gap="4" justify="center">
        <Text mb="6" size="5" weight="medium">
          <Strong>Scenario: </Strong> This dataset shows coffee prices for the brand Robusta each month in 2019, measured in dollars per pound. Prices were highest in January at about $0.85 and then declined steadily. Small increases appeared in April and August, but the overall trend across the year was a clear drop in price.

        </Text>
      </Flex>

      <Flex direction="row" ml="9">
        <Flex direction="column" gap="2" mr="9">
          <Text mt="4" size="5" weight="medium">
            How would you represent the given information?{' '}
          </Text>
          <Text size="5" weight="medium">You can sketch in this space.</Text>
          
          <Box width="400px" height="400px">
            <ReactSketchCanvas ref={canvasRef1} onChange={() => handleCanvasOnChange('canvas1')} style={styles} strokeWidth={4} strokeColor="black" />
          </Box>
          <br/>
          <Flex direction="row" gap="5" align="center">
          <Button size="3" onClick={() => handleEraserClick(canvasRef1.current!)}>
            <EraserIcon/>
            Erase
          </Button>
          <Button size="3" onClick={() => handlePenClick(canvasRef1.current!)}>
          <Pencil1Icon/>
          Draw
          </Button>
          <Button
          size="3"
          disabled={eraseMode}
          onClick={() => handleClearCanvasClick(canvasRef1.current!)}>
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
            onChange={(e) => setDescription1(e.target.value)}
            value={description1}
            size="3"
            resize="both"
            placeholder="As soon as I..."
          />
        </Flex>
      </Flex>

      <br/>
      {/* Canvas 2 */}

      <Flex direction="column" ml="9" maxWidth="1000px" gap="4" justify="center">
        <Text mb="6" size="5" weight="medium">
          <Strong>Scenario: </Strong> This dataset shows the stations, total track length, and annual ridership for metro systems in three cities. Tokyo has 330 stations, 250 km of track, and the highest ridership at 3.5 billion. Paris operates 300 stations, 310 km, with 2.1 billion riders. N.Y.C., though larger with 470 stations and 460 km of track, has lower ridership (1.0 billion).


        </Text>
      </Flex>

      <Flex direction="row" ml="9">
        <Flex direction="column" gap="2" mr="9">
          <Text mt="4" size="5" weight="medium">
            How would you represent the given information?{' '}
          </Text>
          <Text size="5" weight="medium">You can sketch in this space.</Text>
          
          <Box width="400px" height="400px">
            <ReactSketchCanvas ref={canvasRef2} onChange={() => handleCanvasOnChange('canvas2')} style={styles} strokeWidth={4} strokeColor="black" />
          </Box>
          <br/>
          <Flex direction="row" gap="5" align="center">
          <Button size="3" onClick={() => handleEraserClick(canvasRef2.current!)}>
            <EraserIcon/>
            Erase
          </Button>
          <Button size="3" onClick={() => handlePenClick(canvasRef2.current!)}>
          <Pencil1Icon/>
          Draw
          </Button>
          <Button
          size="3"
          disabled={eraseMode}
          onClick={() => handleClearCanvasClick(canvasRef2.current!)}>
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
            onChange={(e) => setDescription2(e.target.value)}
            value={description2}
            size="3"
            resize="both"
            placeholder="As soon as I..."
          />
        </Flex>
      </Flex>

      
      <Flex align="center" justify="center" mt="6">
        <Link href="/sketch4">
          <Button size="3" onClick={handleNextButtonClick}>
            Next
          </Button>
        </Link>
   
      </Flex>

  
    </>
  );
 
  }

export default Sketch;
