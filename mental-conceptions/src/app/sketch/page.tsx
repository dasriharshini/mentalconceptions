"use client";

import React, { useState, useRef } from 'react';
import { Box, Flex, Text, TextArea, Button, Strong } from '@radix-ui/themes';
import Link from 'next/link';
import { ReactSketchCanvas, type ReactSketchCanvasRef } from 'react-sketch-canvas';
import { useRouter } from 'next/navigation';

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

  const handleImage = async (canvas: ReactSketchCanvasRef) => {
    console.log("entered handleImage")
    const dataUrl = await canvas.exportImage("png");
    setExportedImage(dataUrl);
    
    if (!dataUrl) {
      alert("No image to download");
      return;
    }

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'sketch.png';
    link.type = "image/png";
    link.click();
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
  await handleImage(canvasRef.current as ReactSketchCanvasRef);
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
          <Strong>Scenario: </Strong> Imagine you are interested in the number of World Heritage Sites in{' '}
          <Strong>Norway, Denmark, and Sweden </Strong>over two different years: 2004 and 2022. In 2004, Norway had 5
          sites, Denmark had 4, and Sweden had 13. By 2022, the numbers increased to 8 sites for Norway, 10 for Denmark,
          and 15 for Sweden. We will ask you to draw how you would anticipate this data should be visually communicated to
          you in a clear and concise manner.
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
