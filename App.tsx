import React, { useRef, useEffect, useState } from 'react';
import Konva from 'konva';
import CanvasBoard from './components/CanvasBoard';
import Toolbar from './components/Toolbar';
import ColorPicker from './components/ColorPicker';
import LandingPage from './components/LandingPage';
import { useCanvasStore } from './store/useCanvasStore';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const stageRef = useRef<Konva.Stage>(null);
  const { deleteSelectedShape, undo, redo } = useCanvasStore();
  const { logout } = useAuthStore();
  
  // View State: 'landing' | 'canvas'
  const [currentView, setCurrentView] = useState<'landing' | 'canvas'>('landing');

  const handleEnterApp = () => {
    setCurrentView('canvas');
  };

  const handleLogout = () => {
    logout();
    setCurrentView('landing');
  };

  const handleExport = () => {
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL({
        pixelRatio: 2, // High quality
        mimeType: 'image/png',
      });
      
      const img = new Image();
      img.src = uri;
      img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if(ctx) {
              // Draw dark background
              ctx.fillStyle = '#121212';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              const jpgUri = canvas.toDataURL('image/png');
              
              const link = document.createElement('a');
              link.download = `excalidraw-clone-${Date.now()}.png`;
              link.href = jpgUri;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
          }
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (currentView !== 'canvas') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName === 'TEXTAREA') return;
        deleteSelectedShape();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (document.activeElement?.tagName === 'TEXTAREA') return;
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        if (document.activeElement?.tagName === 'TEXTAREA') return;
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedShape, undo, redo, currentView]);

  if (currentView === 'landing') {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  return (
    <div className="w-screen h-screen bg-[#121212] overflow-hidden relative font-['Patrick_Hand']">
      
      {/* Background Dot Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #4f4f4f 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />

      <Toolbar onExport={handleExport} onLogout={handleLogout} />
      <ColorPicker />
      <div className="absolute top-0 left-0 w-full h-full z-0">
         <CanvasBoard stageRef={stageRef} />
      </div>
      
      {/* Help Text */}
      <div className="fixed bottom-4 right-4 text-gray-500 text-xs select-none pointer-events-none opacity-50 bg-[#121212]/50 p-2 rounded-lg backdrop-blur-sm border border-white/5">
         <p>Double click text to edit • Del to delete</p>
      </div>
    </div>
  );
}

export default App;