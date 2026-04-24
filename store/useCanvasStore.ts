import { create } from 'zustand';
import { CanvasState, Shape, ToolType } from '../types';

export const useCanvasStore = create<CanvasState>((set, get) => ({
  shapes: [],
  history: [[]],
  historyStep: 0,
  selectedTool: 'select',
  selectedShapeIds: null,
  strokeColor: '#ffffff', // White for dark theme
  strokeWidth: 2,

  setTool: (tool: ToolType) => set({ selectedTool: tool, selectedShapeIds: null }),
  
  setStrokeColor: (color: string) => set({ strokeColor: color }),
  
  setStrokeWidth: (width: number) => set({ strokeWidth: width }),

  addShape: (shape: Shape) => {
    set((state) => {
      const newShapes = [...state.shapes, shape];
      return {
        shapes: newShapes,
      };
    });
  },

  updateShape: (id: string, attrs: Partial<Shape>) => {
    set((state) => ({
      shapes: state.shapes.map((shape) =>
        shape.id === id ? { ...shape, ...attrs } as Shape : shape
      ),
    }));
  },

  selectShape: (id: string[] | null) => set({ selectedShapeIds: id }),

  deleteSelectedShape: () => {
    const { selectedShapeIds, shapes } = get();
    if (!selectedShapeIds) return;
    
    const newShapes = shapes.filter((s) => !selectedShapeIds.includes(s.id));
    set({ shapes: newShapes, selectedShapeIds: null });
    get().saveHistory();
  },

  saveHistory: () => {
    set((state) => {
      const newHistory = state.history.slice(0, state.historyStep + 1);
      newHistory.push(state.shapes);
      return {
        history: newHistory,
        historyStep: newHistory.length - 1,
      };
    });
  },

  undo: () => {
    const { historyStep, history } = get();
    if (historyStep === 0) return;
    
    const newStep = historyStep - 1;
    set({
      shapes: history[newStep],
      historyStep: newStep,
      selectedShapeIds: null
    });
  },

  redo: () => {
    const { historyStep, history } = get();
    if (historyStep === history.length - 1) return;

    const newStep = historyStep + 1;
    set({
      shapes: history[newStep],
      historyStep: newStep,
      selectedShapeIds: null
    });
  },
}));