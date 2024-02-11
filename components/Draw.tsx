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
  const [edit, setEdit] = useState(false);
  const [superRS, setSuperRS] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Filters
  const [grayscaleValue, setGrayscaleValue] = useState(0);
  const [brightnessValue, setBrightnessValue] = useState(100);
  const [contrastValue, setContrastValue] = useState(100);
  const [saturationValue, setSaturationValue] = useState(100);

  const handleBrightnessChange = (event: any) => {
    setBrightnessValue(event.target.value);
  };

  const handleContrastChange = (event: any) => {
    setContrastValue(event.target.value);
  };
  const handleGrayscaleChange = (event: any) => {
    setGrayscaleValue(event.target.value);
  };
  const handleSaturationChange = (event: any) => {
    const value = parseFloat(event.target.value);
    setSaturationValue(value);
  };

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
      // console.log("Server Resonse:", result);
      // console.log("Processed Image:", result.processedImage);

      // Set the processed image in the state
      setProcessedImage(result.processedImage);
      setSuperRS(false);
      console.log(result.processedImage);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleSR = async () => {
    try {
      // Make a POST request to trigger the super-resolution model
      const response = await fetch("http://127.0.0.1:5000/SR", {
        method: "POST",
      });

      if (response.ok) {
        // If the request is successful, get the processed image path from the response
        const data = await response.json();
        const image = data?.processedImage;
        console.log(image);

        // Set the processed image path in your component state or variable
        setProcessedImage(image);
        setSuperRS(true);
      } else {
        console.error("Error fetching image:", response.status);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY < 0) {
        setStrokeWidth((prevWidth) => prevWidth + 10);
        setEraserWidth((prevWidth) => prevWidth + 10);
      } else {
        setStrokeWidth((prevWidth) => Math.max(prevWidth - 10, 1));
        setEraserWidth((prevWidth) => Math.max(prevWidth - 10, 1));
      }
    };

    window.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     // Trigger the button click programmatically only if the user has started making the drawing
  //     if (processedImage && buttonRef.current) {
  //       buttonRef.current.click();
  //     }
  //   }, 100000);

  //   return () => clearInterval(intervalId); // Clear the interval on component unmount
  // }, [processedImage]); // Depend on processedImage

  //handle strokeColor
  const handleStrokeColorChange = (color: string) => {
    setStrokeColor(color);
  };
  //provide Color options to user
  const colorOptions = [
    { value: "rgb(140,180,210)", label: "Barren Land" },
    { value: "rgb(0, 191, 255)", label: "Clean Water Bodies" },
    { value: "rgb(220, 220, 220)", label: "Cloud" },
    { value: "rgb(235, 206,135 )", label: "Day Sky" },
    { value: "rgb(50, 205, 50)", label: "Grassland" },
    { value: "rgb(192, 192, 192)", label: "Moon" },
    { value: "rgb(112, 25, 25)", label: "Night Sky" },
    { value: "rgb(235, 235, 230)", label: "Rocky Mountain" },
    { value: "rgb(0,128,0)", label: "Green Mountain" },
    { value: "rgb(230,235,235)", label: "Snow Mountain" },
    { value: "rgb(0, 0, 255)", label: "Volcano" },
    { value: "rgb(34,139,34)", label: "Green Tree" },
    { value: "rgb(128,128,128)", label: "Dead Tree" },
    { value: "rgb(0,100,0)", label: "Green Forest" },
    { value: "rgb(96,164,244)", label: "Desert" },
    { value: "rgb(250,240,220)", label: "Snowland" },
    { value: "rgb(19,69,139)", label: "Muddy Water" },
    { value: "rgb(0,69,255)", label: "Lava" },
  ];

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
    <div className="flex flex-col h-full w-full overflow-hidden font-semibold bg-gray-300">
      <div className=" flex flex-row w-full items-center  justify-start mx-[50px] gap-x-12 my-[10px]  text-[10px] ">
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
          <input
            type="button"
            value={strokeWidth}
            disabled
            className="font-bold ml-2 text-lg"
          />
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
        <button className="flex items-center" onClick={() => setEdit(!edit)}>
          <Image
            src="/send.png"
            alt="send image"
            width={20}
            height={20}
            className="mr-2"
          />
          Edit
          {edit && (
            <div className="border bg-green-500 w-2 h-2 rounded-full ml-1" />
          )}
        </button>
        <button
          type="button"
          onClick={handleSR}
          className={`p-2 border rounded-lg ${
            superRS ? "border-green-500" : "border-red-500"
          }`}
        >
          SR
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

        <div className=" w-1/2 h-[95vh] border border-gray-500">
          {!edit && (
            <>
              {/* Display processed image */}
              <div className="w-full h-full">
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
                  <div className="font-semibold py-[40%] px-[15%]">
                    Please draw something on the canvas to get the image.
                  </div>
                )}
              </div>
            </>
          )}
          {edit && (
            <>
              <div className="w-full h-[70%]">
                <Image
                  src={`http://127.0.0.1:5000/${processedImage}`}
                  alt="img"
                  height={500}
                  width={500}
                  className="object-cover w-full h-full "
                  style={{
                    filter: `grayscale(${grayscaleValue}) brightness(${brightnessValue}%) contrast(${contrastValue}%) saturate(${saturationValue}%) `,
                  }}
                />
              </div>
              {/* Edit Section */}

              <div className="grid grid-cols-3">
                <div className="flex flex-col gap-1">
                  <div>
                    <label className=" text-sm text-gray-700 mr-2">
                      GrayScale
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={grayscaleValue}
                      onChange={handleGrayscaleChange}
                    />
                  </div>
                  <div>
                    <label className=" text-sm text-gray-700 mr-2">
                      Brightness
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={brightnessValue}
                      onChange={handleBrightnessChange}
                    />
                  </div>
                  <div>
                    <label className=" text-sm text-gray-700 mr-2">
                      Contrast
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={contrastValue}
                      onChange={handleContrastChange}
                    />
                  </div>
                  <div>
                    <label className=" text-sm text-gray-700 mr-2">
                      Saturation
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturationValue}
                      onChange={handleSaturationChange}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Draw;
