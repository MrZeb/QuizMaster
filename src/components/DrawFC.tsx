
import React, {createRef, useEffect, useState} from 'react';

import CanvasDraw from "react-canvas-draw";
import { Card, Slider } from '@mui/material';
import db from "../data/StorageManager";

import DeleteIcon from '@mui/icons-material/Delete';

interface DrawCanvasProps {
  enableDraw: boolean,
  drawing: any,
}

export const DrawCanvas = (props: DrawCanvasProps) => {
    const saveableCanvas = createRef<CanvasDraw>()
    const loadableCanvas = createRef<CanvasDraw>()

    const { enableDraw, drawing } = props;
    const [currentDrawingData, setCurrentDrawingData] = useState('')
    const [brushColor, setBrushColor] = useState('#444')
    const [brushSize, setBrushSize] = useState(4)

    if (!enableDraw) {
      loadableCanvas.current?.loadSaveData(
        drawing
      );
    }

  useEffect(() => {
      if (!currentDrawingData) {
        return;
      }
      console.log("Set Active Drawing");
      db.collection("drawings")
        .doc("ActiveDrawing")
        .set({
            drawingData: currentDrawingData,
            createdAt: new Date().toISOString()
        })
        .then(() => {
          console.log("Document successfully written!");
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
  }, [currentDrawingData])

  const onDrawChange = () => {
    setCurrentDrawingData(saveableCanvas.current ? saveableCanvas.current.getSaveData() : '');
  }

  const availableColors = [
    '#444',
    '#FF6663',
    '#9EE09E',
    '#9EC1CF',
    '#FDFD97',
    '#CC99C9',
    '#DEA5A4',
    '#FFF'
  ];

  const onColorClicked = (color: string) => {
    console.log("OnClick " + color);
    setBrushColor(color);
  }

  const onClickErase = () => {
    saveableCanvas.current?.clear();
  }

  const onBrushSizeChanged = (event: Event, size: number | number[], activeThumb: number) => {
    console.log("brush size " + size )
    if (size !== brushSize) {
      setBrushSize(size as number);
    }
  }

  const marks = [
    {
      value: 2,
      label: '●',
    },
    {
      value: 4,
      label: '●+',
    },
    {
      value: 6,
      label: '●++',
    },
  ];

    return enableDraw ? (
      <>
        <Card elevation={8}>
          <CanvasDraw
              ref={saveableCanvas}
              hideGrid
              onChange={onDrawChange}
              lazyRadius={0}
              brushRadius={brushSize}
              brushColor={brushColor}
              catenaryColor={brushColor}
              canvasWidth={600}
              canvasHeight={600}
          />
          <div style={{display: "flex", flexDirection: "row", height: 60, backgroundColor: '#FFF', borderTop: '1px solid gray'}}>
              {availableColors.map((color) => {
                  return <div style={colorItem(color)} onClick={() => onColorClicked(color)}/>
              })}
              <div style={{flex: '1 1 auto'}}/>
              <Slider
                sx={{
                  '& input[type="range"]': {
                    WebkitAppearance: 'slider-vertical',
                  },
                  height: '50%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  marginTop: 0,
                  marginBottom: 0,
                  color: '#444'
                }}
                size="small"
                aria-label="Size"
                defaultValue={4}
                orientation="vertical"
                step={2}
                marks={marks}
                min={2}
                max={6}
                onChange={onBrushSizeChanged}
              />
              <DeleteIcon sx={{ color: '#FF0000' }} onClick={onClickErase} style={{cursor: 'pointer', height: '100%', marginRight: 4}} fontSize="large"/>
          </div>
        </Card>
      </>
    ) : ( 
    <>
      <Card elevation={8}>
        <CanvasDraw 
            disabled
            hideGrid
            canvasWidth={600}
            canvasHeight={600}
            ref={loadableCanvas}
            immediateLoading
            saveData={drawing}
        />
      </Card>
    </>)
}

const colorItem = (color: string) => {
  return {
    margin: 0,
    padding: 0,
    backgroundColor: color,
    width: 60,
    height: '100%',
    cursor: 'pointer',
    borderRight: '0.1px solid #888',
  }
}