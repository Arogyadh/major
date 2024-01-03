"use client";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";

const Draw = () => {
  const canvas = useRef<ReactSketchCanvasRef>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [strokeColor, setStrokeColor] = useState("rgb(210,180,140)");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [eraseMode, setEraseMode] = useState(false);
  const [eraserWidth, setEraserWidth] = useState(5);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  //handle export image to backend
  const handleExportImage = async () => {
    try {
      const imageData = await canvas.current?.exportImage("png");
      const canvasPaths = await canvas.current?.exportPaths();

      if (!canvasPaths || !imageData) {
        throw new Error("Failed to export canvas paths or image data");
      }

      // Extract unique strokeColor values from canvasPaths
      const uniqueStrokeColors = [
        ...new Set(canvasPaths.map((path) => path.strokeColor)),
      ];

      console.log("Stroke Colors:", uniqueStrokeColors);

      // Prepare the data to be sent to the server
      const data = {
        image: {
          dataUrl: imageData,
        },
        strokeColors: uniqueStrokeColors,
      };

      console.log("Data to be sent to the server:", data);

      // Make a POST request to the backend API
      const response = await fetch("http://127.0.0.1:5000/process_image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to process image on the server");
      }

      // Handle the response from the server
      const result = await response.json();
      console.log("Server Resonse:", result);
      console.log("Processed Image:", result.processedImage);

      // Set the processed image in the state
      setProcessedImage(result.processedImage);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Trigger the button click programmatically only if the user has started making the drawing
      if (processedImage && buttonRef.current) {
        buttonRef.current.click();
      }
    }, 10000);

    return () => clearInterval(intervalId); // Clear the interval on component unmount
  }, [processedImage]); // Depend on processedImage

  //handle strokeColor
  const handleStrokeColorChange = (color: string) => {
    setStrokeColor(color);
  };
  //provide Color options to user
  const colorOptions = [
    { value: "rgb(210,180,140)", label: "Barren Land" },
    { value: "rgb(0, 191, 255)", label: "Clean Water Bodies" },
    { value: "rgb(220, 220, 220)", label: "Cloud" },
    { value: "rgb(135, 206, 235)", label: "Day Sky" },
    { value: "rgb(50, 205, 50)", label: "Grassland" },
    { value: "rgb(192, 192, 192)", label: "Moon" },
    { value: "rgb(25, 25, 112)", label: "Night Sky" },
    { value: "rgb(235, 235, 230)", label: "Rocky Mountain" },
    { value: "rgb(255, 0, 0)", label: "Volcano" },
  ];

  const strokeOptions = [
    { value: "5", label: "5" },
    { value: "10", label: "10" },
    { value: "15", label: "15" },
    { value: "20", label: "20" },
    { value: "25", label: "25" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
  ];
  //handle stroke width
  const handleStrokeWidthChange = (width: string) => {
    const numericWidth = Number(width);
    if (!isNaN(numericWidth)) {
      // Set the stroke width only if the parsed value is a valid number
      setStrokeWidth(numericWidth);
      setEraserWidth(numericWidth);
    }
  };

  const handleResetCanvas = () => {
    if (canvas.current) {
      canvas.current.resetCanvas();
    }
  };
  const handleUndo = () => {
    if (canvas.current) {
      canvas.current.undo();
    }
  };
  const handleRedo = () => {
    if (canvas.current) {
      canvas.current.redo();
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden font-semibold">
      <div className="flex flex-row w-full items-center  justify-start mx-[50px] gap-x-12 my-[10px]  text-[10px] ">
        <div className="flex flex-row items-center">
          <Image
            src="/color.png"
            alt="color picker"
            width={20}
            height={20}
            className="mr-2"
          />
          <label className="flex">Stroke Color:</label>
          <select
            className="p-1 ml-1 rounded-full cursor-pointer"
            value={strokeColor}
            onChange={(e) => handleStrokeColorChange(e.target.value)}
          >
            {colorOptions.map(({ value, label }) => (
              <option
                key={value}
                value={value}
                style={{ backgroundColor: value }}
                className="text-xl"
              >
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center">
          <Image
            src="/brush.png"
            alt="brush stroke"
            width={20}
            height={20}
            className="mr-2"
          />
          <label>Stroke Width:</label>
          <select
            className="p-1 ml-1 rounded-full cursor-pointer"
            value={strokeWidth}
            onChange={(e) => handleStrokeWidthChange(e.target.value)}
          >
            {strokeOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button
          className="flex items-center"
          onClick={() => setEraseMode((prevEraseMode) => !prevEraseMode)}
        >
          <Image
            src="/eraser.png"
            alt="eraser"
            width={20}
            height={20}
            className="mr-2"
          />
          {eraseMode && (
            <div className="border bg-green-500 w-2 h-2 rounded-full ml-1" />
          )}
        </button>

        <button className="flex" onClick={handleResetCanvas}>
          Reset Canvas
        </button>
        <button className="flex items-center" onClick={handleUndo}>
          <Image
            src="/undo.png"
            alt="undo"
            width={20}
            height={20}
            className="mr-2"
          />
        </button>
        <button className="flex items-center" onClick={handleRedo}>
          <Image
            src="/redo.png"
            alt="redo"
            width={20}
            height={20}
            className="mr-2"
          />
        </button>
        <button
          className="flex items-center"
          ref={buttonRef}
          onClick={handleExportImage}
        >
          <Image
            src="/send.png"
            alt="send image"
            width={20}
            height={20}
            className="mr-2"
          />
          Get Image
        </button>
      </div>
      <div className="flex flex-row w-full h-full">
        <div className="w-1/2 h-[95vh]">
          <ReactSketchCanvas
            ref={canvas}
            height="100%"
            width="100%"
            strokeColor={eraseMode ? "rgb(255,255,255)" : strokeColor} // Set transparent color for eraser
            strokeWidth={eraseMode ? eraserWidth : strokeWidth} // Use eraserWidth when in erase mode
          />
        </div>
        <div className="flex w-1/2 h-full">
          {/* Display processed image */}
          {processedImage && (
            <Image
              src={`http://127.0.0.1:5000/${processedImage}`}
              alt="Processed Image"
              width={500}
              height={500}
              className="object-cover w-full h-full"
            />
          )}

          {!processedImage && (
            <p className="font-semibold px-2 h-full w-full items-center flex  ">
              Please draw something on the canvas to get the image.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Draw;
