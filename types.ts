export type ToolType = 'select' | 'rect' | 'circle' | 'line' | 'pencil' | 'text' | 'database' | 'server' | 'cloud' | 'keyboard';

export type BaseShape = {
  id: string;
  x: number;
  y: number;
  rotation?: number;
  stroke: string;
  strokeWidth: number;
  fill?: string;
};

export type RectangleShape = BaseShape & {
  type: 'rect';
  width: number;
  height: number;
};

export type CircleShape = BaseShape & {
  type: 'circle';
  radius: number;
};

export type LineShape = BaseShape & {
  type: 'line';
  points: number[]; // [x1, y1, x2, y2]
};

export type PencilShape = BaseShape & {
  type: 'pencil';
  points: number[][]; // [[x1, y1], [x2, y2], ...]
};

export type TextShape = BaseShape & {
  type: 'text';
  text: string;
  fontSize: number;
};

export type DatabaseShape = BaseShape & {
  type: 'database';
  width: number;
  height: number;
};

export type ServerShape = BaseShape & {
  type: 'server';
  width: number;
  height: number;
};

export type CloudShape = BaseShape & {
  type: 'cloud';
  width: number;
  height: number;
};

export type KeyboardShape = BaseShape & {
  type: 'keyboard';
  width: number;
  height: number;
};

export type Shape = 
  | RectangleShape 
  | CircleShape 
  | LineShape 
  | PencilShape 
  | TextShape
  | DatabaseShape
  | ServerShape
  | CloudShape
  | KeyboardShape;

export interface CanvasState {
  shapes: Shape[];
  history: Shape[][];
  historyStep: number;
  selectedTool: ToolType;
  selectedShapeIds: string[] | null;
  strokeColor: string;
  strokeWidth: number;
  
  // Actions
  setTool: (tool: ToolType) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  addShape: (shape: Shape) => void;
  updateShape: (id: string, attrs: Partial<Shape>) => void;
  selectShape: (id: string[] | null) => void;
  deleteSelectedShape: () => void;
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
}