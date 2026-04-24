import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Path, Transformer } from 'react-konva';
import Konva from 'konva';
import { getStroke } from 'perfect-freehand';
import { useCanvasStore } from '../store/useCanvasStore';
import { Shape } from '../types';



// User Input (mouse / touch)
//         ↓
// Event handlers (mouse down / move / up)
//         ↓
// Canvas Store (Zustand-like)
//         ↓
// Shapes Array (source of truth)
//         ↓
// React-Konva renders shapes
//         ↓
// Transformer handles selection + resize


interface CanvasBoardProps {
  stageRef: React.RefObject<Konva.Stage>;
}

// Hand-drawn SVG paths
// Assuming base size of 100x100 for scaling
const SHAPE_PATHS = {
  database: "M50 5 C75 5 95 15 95 25 C95 35 75 45 50 45 C25 45 5 35 5 25 C5 15 25 5 50 5 M5 25 L5 75 C5 85 25 95 50 95 C75 95 95 85 95 75 L95 25 M5 50 C5 60 25 70 50 70 C75 70 95 60 95 50",
  cloud: "M25 60 A20 20 0 0 1 25 25 A25 25 0 0 1 65 20 A20 20 0 0 1 85 40 A15 15 0 0 1 85 70 L25 70 Z",
  server: "M10 10 L90 10 L90 90 L10 90 Z M20 30 L80 30 M20 50 L80 50 M20 70 L80 70 M70 20 L75 20 M70 40 L75 40 M70 60 L75 60",
  keyboard: "M50 5 C75 5 95 15 95 25 C95 35 75 45 50 45 C25 45 5 35 5 25 C5 15 25 5 50 5 M5 25 L5 75 C5 85 25 95 50 95 C75 95 95 85 95 75 L95 25 M5 50 C5 60 25 70 50 70 C75 70 95 60 95 50",
};

// Helper to convert perfect-freehand points to SVG Path
function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return "";
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y1 + y0) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );
  d.push("Z");
  return d.join(" ");
}

const CanvasBoard: React.FC<CanvasBoardProps> = ({ stageRef }) => {
  const {
    shapes,
    selectedTool,
    selectedShapeIds,
    strokeColor,
    strokeWidth,
    addShape,
    updateShape,
    selectShape,
    saveHistory,
    deleteSelectedShape
  } = useCanvasStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShapeId, setCurrentShapeId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update cursor based on tool
  useEffect(() => {
    if (stageRef.current) {
      const container = stageRef.current.container();
      if (selectedTool === 'select') {
        container.style.cursor = 'default';
      } else if (selectedTool === 'text') {
        container.style.cursor = 'text';
      } else {
        container.style.cursor = 'crosshair';
      }
    }
  }, [selectedTool]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (editingId && textareaRef.current) {
      setTimeout(() => {
        if(textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
      }, 200);
    }
  }, [editingId]);

  // Handle Transformer logic
  useEffect(() => {
    if (selectedShapeIds && selectedShapeIds.length > 0 && transformerRef.current && stageRef.current) {
      const node = stageRef.current.findOne('#' + selectedShapeIds[0]);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedShapeIds, shapes]);

  const generateId = () => `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (editingId) {
      setEditingId(null);
      return;
    }

    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const clickedOnEmpty = e.target === stage;

    if (selectedTool === 'select') {
      if (clickedOnEmpty) {
        selectShape(null);
        if (transformerRef.current) transformerRef.current.nodes([]);
      }
      return;
    }

    setIsDrawing(true);
    const id = generateId();
    setCurrentShapeId(id);
    selectShape(null);

    const baseProps = {
      id,
      x: pos.x,
      y: pos.y,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
    };

    let newShape: Shape | null = null;

    if (selectedTool === 'rect') {
      newShape = { ...baseProps, type: 'rect', width: 0, height: 0 };
    } else if (selectedTool === 'circle') {
      newShape = { ...baseProps, type: 'circle', radius: 0 };
    } else if (selectedTool === 'line') {
      newShape = { ...baseProps, type: 'line', points: [0, 0] };
    } else if (selectedTool === 'pencil') {
      newShape = { ...baseProps, type: 'pencil', points: [[0, 0]] };
    } else if (selectedTool === 'text') {
       newShape = { 
           ...baseProps, 
           type: 'text', 
           text: '', 
           fontSize: 24,
           fill: strokeColor 
       };
       setEditingId(id);
    } else if (['database', 'server', 'cloud'].includes(selectedTool)) {
       newShape = {
         ...baseProps,
         type: selectedTool as 'database' | 'server' | 'cloud',
         width: 0,
         height: 0
       };
    }

    if (newShape) {
      addShape(newShape);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !currentShapeId || selectedTool === 'select') return;
    
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const shape = shapes.find((s) => s.id === currentShapeId);
    if (!shape) return;

    const dx = pos.x - shape.x;
    const dy = pos.y - shape.y;

    if (shape.type === 'rect' || shape.type === 'database' || shape.type === 'server' || shape.type === 'cloud') {
      updateShape(currentShapeId, {
        width: dx,
        height: dy,
      });
    } else if (shape.type === 'circle') {
      const radius = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      updateShape(currentShapeId, { radius });
    } else if (shape.type === 'line') {
      updateShape(currentShapeId, {
        points: [0, 0, dx, dy],
      });
    } else if (shape.type === 'pencil') {
      const newPoints = [...shape.points, [dx, dy]];
      updateShape(currentShapeId, { points: newPoints });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setCurrentShapeId(null);
      if (selectedTool !== 'text') {
        saveHistory();
      }
    }
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const id = e.target.id();
    updateShape(id, {
      x: e.target.x(),
      y: e.target.y(),
    });
    saveHistory();
  };

  const handleTransformEnd = () => {
      if (!selectedShapeIds || selectedShapeIds.length === 0) return;
      const targetId = selectedShapeIds[0];
      const node = stageRef.current?.findOne('#' + targetId);
      if(node) {
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          
          node.scaleX(1);
          node.scaleY(1);

          const shape = shapes.find(s => s.id === targetId);
          if (!shape) return;

          const baseUpdate = {
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
          };

          if(shape.type === 'rect' || shape.type === 'database' || shape.type === 'server' || shape.type === 'cloud') {
              updateShape(targetId, {
                  ...baseUpdate,
                  width: node.width() * scaleX,
                  height: node.height() * scaleY
              });
          } else if (shape.type === 'circle') {
               updateShape(targetId, {
                  ...baseUpdate,
                  radius: node.width() * scaleX / 2
               });
          } else if (shape.type === 'text') {
               updateShape(targetId, {
                   ...baseUpdate,
                   fontSize: shape.fontSize * scaleY
               });
          } else {
             updateShape(targetId, baseUpdate);
          }
          saveHistory();
      }
  }

  const renderTextEditor = () => {
      const shape = shapes.find(s => s.id === editingId);
      if (!shape || shape.type !== 'text') return null;
      
      const style: React.CSSProperties = {
          position: 'absolute',
          top: shape.y,
          left: shape.x,
          width: 'auto',
          minWidth: '100px',
          height: 'auto',
          fontSize: `${shape.fontSize}px`,
          lineHeight: 1,
          fontFamily: 'Patrick Hand, cursive',
          color: shape.stroke,
          background: 'transparent',
          border: '1px dashed rgba(255,255,255,0.5)',
          outline: 'none',
          padding: 0,
          margin: 0,
          resize: 'none',
          overflow: 'hidden',
          whiteSpace: 'pre',
          zIndex: 100,
      };

      return (
          <textarea
              ref={textareaRef}
              value={shape.text}
              style={style}
              onChange={(e) => updateShape(shape.id, { text: e.target.value })}
              onBlur={() => {
                  setEditingId(null);
                  if (shape.text.trim() === '') {
                      selectShape([shape.id]); 
                  } else {
                      saveHistory();
                  }
              }}
              onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                      setEditingId(null);
                  }
                  e.stopPropagation();
              }}
          />
      );
  };

  return (
    <div className="relative w-full h-full bg-[#121212]">
        <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={stageRef}
        >
        <Layer>
            {shapes.map((shape) => {
            if (shape.id === editingId) return null;

            const commonProps = {
                key: shape.id,
                id: shape.id,
                x: shape.x,
                y: shape.y,
                rotation: shape.rotation || 0,
                stroke: shape.stroke,
                strokeWidth: shape.strokeWidth,
                draggable: selectedTool === 'select',
                hitStrokeWidth: 20, // Increase hit area for easier selection
                
                onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => {
                    if (selectedTool === 'select') {
                         const container = e.target.getStage()?.container();
                         if (container) container.style.cursor = 'move';
                    }
                },
                onMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => {
                    if (selectedTool === 'select') {
                         const container = e.target.getStage()?.container();
                         if (container) container.style.cursor = 'default';
                    }
                },
                onDragStart: (e: Konva.KonvaEventObject<DragEvent>) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'grabbing';
                },
                onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'move';
                    handleDragEnd(e);
                },
                onClick: () => {
                    if(selectedTool === 'select') selectShape([shape.id]);
                },
                onTap: () => {
                    if(selectedTool === 'select') selectShape([shape.id]);
                },
            };

            if (shape.type === 'rect') {
                return <Rect {...commonProps} width={shape.width} height={shape.height} cornerRadius={2} />;
            }
            if (shape.type === 'circle') {
                return <Circle {...commonProps} radius={shape.radius} />;
            }
            if (shape.type === 'line') {
                return <Line {...commonProps} points={shape.points} lineCap="round" lineJoin="round" />;
            }
            if (shape.type === 'pencil') {
                const stroke = getStroke(shape.points, {
                    size: shape.strokeWidth * 1.5,
                    thinning: 0.5,
                    smoothing: 0.5,
                    streamline: 0.5,
                    easing: (t) => t,
                    start: { taper: 0, easing: (t) => t, cap: true },
                    end: { taper: 0, easing: (t) => t, cap: true }
                });
                return (
                <Path
                    {...commonProps}
                    x={shape.x}
                    y={shape.y}
                    data={getSvgPathFromStroke(stroke)}
                    fill={shape.stroke}
                    stroke={null}
                />
                );
            }
            if (shape.type === 'text') {
                return (
                <Text
                    {...commonProps}
                    text={shape.text || " "}
                    fontSize={shape.fontSize}
                    fontFamily="Patrick Hand, cursive"
                    fill={shape.stroke} 
                    stroke={null}
                    onDblClick={() => {
                        if(selectedTool === 'select') setEditingId(shape.id);
                    }}
                />
                );
            }
            if (shape.type === 'database' || shape.type === 'server' || shape.type === 'cloud' || shape.type === 'keyboard') {
                const pathData = SHAPE_PATHS[shape.type];
                // Scale calculations: assuming base SVG is 100x100
                return (
                    <Path
                        {...commonProps}
                        data={pathData}
                        width={shape.width} // Stores width but path needs scale
                        height={shape.height}
                        scaleX={shape.width / 100}
                        scaleY={shape.height / 100}
                        lineJoin="round"
                        lineCap="round"
                    />
                );
            }

            return null;
            })}

            {selectedShapeIds && selectedShapeIds.length > 0 && selectedTool === 'select' && !editingId && (
            <Transformer
                ref={transformerRef}
                onTransformEnd={handleTransformEnd}
                borderStroke="#a5b4fc"
                anchorStroke="#a5b4fc"
                anchorFill="#121212"
                anchorSize={8}
                borderDash={[5, 5]}
            />
            )}
        </Layer>
        </Stage>
        {renderTextEditor()}
    </div>
  );
};

export default CanvasBoard;