"use client";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import ContrastOutlinedIcon from "@mui/icons-material/ContrastOutlined";
import FilterBAndWIcon from "@mui/icons-material/FilterBAndW";
import LightModeIcon from "@mui/icons-material/LightMode";
import AcUnitTwoToneIcon from "@mui/icons-material/AcUnitTwoTone";
import RestartAltTwoToneIcon from "@mui/icons-material/RestartAltTwoTone";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import InvertColorsIcon from "@mui/icons-material/InvertColors";
import BlurOnIcon from "@mui/icons-material/BlurOn";
import HMobiledataIcon from "@mui/icons-material/HMobiledata";

const Draw = () => {
  const canvas = useRef<ReactSketchCanvasRef>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [strokeColor, setStrokeColor] = useState<any>("rgb(0,0,0)");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [eraseMode, setEraseMode] = useState(false);
  const [eraserWidth, setEraserWidth] = useState(5);
  const [edit, setEdit] = useState(false);
  const [superRS, setSuperRS] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Filters
  const [grayscaleValue, setGrayscaleValue] = useState(0);
  const [brightnessValue, setBrightnessValue] = useState(120);
  const [contrastValue, setContrastValue] = useState(120);
  const [saturationValue, setSaturationValue] = useState(100);
  const [hueRotateValue, setHueRotateValue] = useState(0);
  const [invertValue, setInvertValue] = useState(0);
  const [blurValue, setBlurValue] = useState(0);
  const [sepiaValue, setSepiaValue] = useState(0);

  const resetFilters = () => {
    setBrightnessValue(120);
    setContrastValue(120);
    setSaturationValue(120);
    setGrayscaleValue(0);
    setHueRotateValue(0);
    setInvertValue(0);
    setBlurValue(0);
    setSepiaValue(0);
  };

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
  const handleHueRotateChange = (event: any) => {
    setHueRotateValue(event.target.value);
  };
  const handleSepiaChange = (event: any) => {
    setSepiaValue(event.target.value);
  };
  const handleInvertChange = (event: any) => {
    setInvertValue(event.target.value);
  };
  const handleBlurChange = (event: any) => {
    setBlurValue(event.target.value);
  };

  //handle export image to backend

  async function handleExportImage() {
    const handlePromise = new Promise(async (resolve, reject) => {
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

      if (response.ok) {
        // Handle the response from the server
        const result = await response.json();
        console.log("Server Resonse:", result);
        console.log("Processed Image:", result.processedImage);

        // Set the processed image in the state
        setProcessedImage(result.processedImage);
        setSuperRS(false);
        console.log(result.processedImage);
        resolve(result);
      } else {
        reject();
      }
    });
    await toast.promise(handlePromise, {
      loading: "Generating...",
      success: "Generated Image.",
      error: <b>Could not generate.</b>,
    });
  }
  const handleSR = async () => {
    try {
      const handlePromise = new Promise(async (resolve, reject) => {
        // Make a POST request to trigger the super-resolution model
        const response = await fetch("http://127.0.0.1:5000/SR", {
          method: "POST",
        });

        if (response.ok) {
          // Handle the response from the server
          const result = await response.json();
          console.log("Server Resonse:", result);
          console.log("Processed Image:", result.processedImage);

          // Set the processed image in the state
          setProcessedImage(result.processedImage);
          setSuperRS(true);
          console.log(result.processedImage);
          resolve(result);
        } else {
          console.error("Error fetching image:", response.status);
          reject();
        }
      });

      await toast.promise(handlePromise, {
        loading: "Super-Resolution in progress...",
        success: "Super-Resolution completed.",
        error: <b>Error fetching image.</b>,
      });
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
    { value: "rgb(30,30,30)", label: "Barren Land" },
    { value: "rgb(0, 10,250)", label: "Clean Water Bodies" },
    { value: "rgb(130,0,130)", label: "Cloud" },
    { value: "rgb(30,60,170)", label: "Day Sky" },
    { value: "rgb(40,110,30)", label: "Grassland" },
    { value: "rgb(230,130,0)", label: "Moon" },
    { value: "rgb(110,20,30)", label: "Night Sky" },
    { value: "rgb(140,50,30)", label: "Rocky Mountain" },
    { value: "rgb(0,50,0))", label: "Green Mountain" },
    { value: "rgb(160,100,200)", label: "Snow Mountain" },
    { value: "rgb(250,30,30)", label: "Volcano" },
    { value: "rgb(70,180,40)", label: "Green Tree" },
    { value: "rgb(100,100,100)", label: "Dead Tree" },
    { value: "rgb(0,240,0)", label: "Green Forest" },
    { value: "rgb(170,80,50)", label: "Desert" },
    { value: "rgb(0,150,120)", label: "Snowland" },
    { value: "rgb(180,120,60)", label: "Muddy Water" },
    { value: "rgb(240,50,0)", label: "Lava" },
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
    <>
      <div className="flex flex-col h-full w-full overflow-hidden font-semibold bg-gray-300">
        <div className=" flex flex-row w-full items-center  justify-start mx-[50px] gap-x-12 my-[10px]  text-[10px] ">
          {!edit && (
            <>
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
              <button
                className="flex items-center"
                onClick={() => {
                  setEdit(!edit);
                  setStrokeColor((prevColor: string | null) =>
                    prevColor === null ? "rgb(210,180,140)" : null
                  );
                }}
              >
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
            </>
          )}
          {/* Edit mode on */}
          {edit && (
            <>
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <label className=" text-[10px] text-gray-700 mr-2">
                    <FilterBAndWIcon fontSize="small" /> Grayscale
                    {
                      <span className="text-[10px] text-gray-500 ml-1">
                        ({grayscaleValue})
                      </span>
                    }
                  </label>
                  <input
                    className=" max-w-[80px] "
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={grayscaleValue}
                    onChange={handleGrayscaleChange}
                  />
                </div>
                <div className="flex flex-col">
                  <label className=" text-[10px] text-gray-700 mr-2">
                    <LightModeIcon fontSize="small" />
                    Brightness
                    {
                      <span className="text-[10px] text-gray-500 ml-1">
                        ({brightnessValue})
                      </span>
                    }
                  </label>
                  <input
                    className=" max-w-[80px]"
                    type="range"
                    min="0"
                    max="200"
                    value={brightnessValue}
                    onChange={handleBrightnessChange}
                  />
                </div>
                <div className="flex flex-col">
                  <label className=" text-[10px] text-gray-700 mr-2">
                    <ContrastOutlinedIcon fontSize="small" />
                    Contrast
                    {
                      <span className="text-[10px] text-gray-500 ml-1">
                        ({contrastValue})
                      </span>
                    }
                  </label>
                  <input
                    className=" max-w-[80px]"
                    type="range"
                    min="0"
                    max="200"
                    value={contrastValue}
                    onChange={handleContrastChange}
                  />
                </div>
                <div className="flex flex-col">
                  <label className=" text-[10px] text-gray-700 mr-2">
                    <AcUnitTwoToneIcon fontSize="small" />
                    Saturation
                    {
                      <span className="text-[10px] text-gray-500 ml-1">
                        ({saturationValue})
                      </span>
                    }
                  </label>
                  <input
                    className=" max-w-[80px]"
                    type="range"
                    min="0"
                    max="200"
                    value={saturationValue}
                    onChange={handleSaturationChange}
                  />
                </div>
                <div className="flex flex-col">
                  <label className=" text-[10px] text-gray-700 mr-2">
                    <HMobiledataIcon fontSize="small" />
                    Hue
                    {
                      <span className="text-[10px] text-gray-500 ml-1">
                        ({hueRotateValue})
                      </span>
                    }
                  </label>
                  <input
                    className=" max-w-[80px]"
                    type="range"
                    min="0"
                    max="180"
                    value={hueRotateValue}
                    onChange={handleHueRotateChange}
                  />
                </div>
                <div className="flex flex-col">
                  <label className=" text-[10px] text-gray-700 mr-2">
                    <AcUnitTwoToneIcon fontSize="small" />
                    Sepia
                    {
                      <span className="text-[10px] text-gray-500 ml-1">
                        ({sepiaValue})
                      </span>
                    }
                  </label>
                  <input
                    className=" max-w-[80px]"
                    type="range"
                    min="0"
                    max="100"
                    value={sepiaValue}
                    onChange={handleSepiaChange}
                  />
                </div>
                <div className="flex flex-col">
                  <label className=" text-[10px] text-gray-700 mr-2">
                    <BlurOnIcon fontSize="small" />
                    Blur
                    {
                      <span className="text-[10px] text-gray-500 ml-1">
                        ({blurValue})
                      </span>
                    }
                  </label>
                  <input
                    className=" max-w-[80px]"
                    type="range"
                    min="0"
                    max="64"
                    value={blurValue}
                    onChange={handleBlurChange}
                  />
                </div>
                <div className="flex flex-col">
                  <label className=" text-[10px] text-gray-700 mr-2">
                    <InvertColorsIcon fontSize="small" />
                    Invert
                    {
                      <span className="text-[10px] text-gray-500 ml-1">
                        ({invertValue})
                      </span>
                    }
                  </label>
                  <input
                    className=" max-w-[80px]"
                    type="range"
                    min="0"
                    max="100"
                    step="100"
                    value={invertValue}
                    onChange={handleInvertChange}
                  />
                </div>
                <button
                  className="flex items-center"
                  onClick={() => {
                    setEdit(!edit);
                    setStrokeColor((prevColor: string | null) =>
                      prevColor === null ? "rgb(210,180,140)" : null
                    );
                  }}
                >
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
                <button type="button" onClick={resetFilters}>
                  <RestartAltTwoToneIcon
                    className="items-center"
                    fontSize="small"
                  />
                  Reset
                </button>
              </div>
            </>
          )}
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
            <div className="w-full h-full">
              {processedImage && (
                <Image
                  key={processedImage}
                  src={`http://127.0.0.1:5000/${processedImage}`}
                  alt={processedImage}
                  height={1024}
                  width={1024}
                  className="object-contain w-full h-full "
                  style={{
                    filter: `
                    grayscale(${grayscaleValue}) 
                    brightness(${brightnessValue}%) 
                    contrast(${contrastValue}%) 
                    saturate(${saturationValue}%)
                    hue-rotate(${hueRotateValue}deg)
                    invert(${invertValue}%)
                    blur(${blurValue}px)
                    sepia(${sepiaValue}%) `,
                  }}
                />
              )}
              {!processedImage && (
                <div className="font-semibold py-[40%] px-[15%]">
                  Please draw something on the canvas to get the image.
                </div>
              )}
            </div>

            <div className="grid grid-cols-3">
              <div className="flex flex-col gap-1"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Draw;
