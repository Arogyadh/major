"use client";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";

const Draw = () => {
  const canvas = useRef<ReactSketchCanvasRef>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [strokeColor, setStrokeColor] = useState("rgb(210,180,140)");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [eraseMode, setEraseMode] = useState(false);
  const [eraserWidth, setEraserWidth] = useState(5);

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
      console.log("Result:", result);
      console.log("Processed Image:", result.processedImage);

      // Set the processed image in the state
      setProcessedImage(result.processedImage);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //handle strokeColor
  const handleStrokeColorChange = (color: string) => {
    setStrokeColor(color);
  };
  //provide Color options to user
  const colorOptions = [
    { value: "rgb(210,180,140)", label: "Barren Land" },
    { value: "rgb(0, 191, 255)", label: "Clean Water Bodies" },
    { value: "rgb(240, 255, 255)", label: "Cloud" },
    { value: "rgb(135, 206, 235)", label: "Day Sky" },
    { value: "rgb(50, 205, 50)", label: "Grassland" },
    { value: "rgb(192, 192, 192)", label: "Moon" },
    { value: "rgb(25, 25, 112)", label: "Night Sky" },
    { value: "rgb(139, 119, 101)", label: "Rocky Mountain" },
    { value: "rgb(255, 0, 0)", label: "Volcano" },
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
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex flex-row w-full items-center  justify-start mx-[50px] gap-x-10 my-[10px]  text-[10px] ">
        <div className=" flex">
          <label>Stroke Color:</label>
          <select
            value={strokeColor}
            onChange={(e) => handleStrokeColorChange(e.target.value)}
          >
            {colorOptions.map(({ value, label }) => (
              <option
                key={value}
                value={value}
                style={{ backgroundColor: value }}
              >
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex">
          <label>Stroke Width:</label>
          <input
            className="w-[20px]"
            value={strokeWidth}
            onChange={(e) => handleStrokeWidthChange(e.target.value)}
          ></input>
        </div>

        <button
          className="flex"
          onClick={() => setEraseMode((prevEraseMode) => !prevEraseMode)}
        >
          Toggle Eraser
        </button>
        <button className="flex" onClick={handleResetCanvas}>
          Reset Canvas
        </button>
        <button className="flex" onClick={handleUndo}>
          Undo
        </button>
        <button className="flex" onClick={handleRedo}>
          Redo
        </button>
        <button className="flex" onClick={handleExportImage}>
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
        <div className="flex w-1/2">
          {processedImage && (
            <Image
              src={`http://127.0.0.1:5000/path_to_plot.png`}
              alt="Processed Image"
              width={500}
              height={500}
              className="object-cover w-full h-full"
            />
          )}
          {/* Display processed image */}
          {!processedImage && (
            <p>Please draw something on the canvas to get the image.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Draw;
