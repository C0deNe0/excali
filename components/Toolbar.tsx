import React from 'react';
import { 
  MousePointer2, 
  Square, 
  Circle, 
  Minus, 
  Pencil, 
  Type, 
  Undo2, 
  Redo2, 
  Trash2, 
  Download,
  Share2,
  LogOut,
  Database,
  Server,
  Cloud,
  Keyboard
} from 'lucide-react';
import { useCanvasStore } from '../store/useCanvasStore';
import { useAuthStore } from '../store/useAuthStore';
import { ToolType } from '../types';

interface ToolbarProps {
  onExport: () => void;
  onLogout: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onExport, onLogout }) => {
  const { 
    selectedTool, 
    setTool, 
    undo, 
    redo, 
    deleteSelectedShape,
    selectedShapeIds
  } = useCanvasStore();

  const { isAuthenticated, user } = useAuthStore();

  const tools: { id: ToolType; icon: React.ReactNode; label: string }[] = [
    { id: 'select', icon: <MousePointer2 size={20} />, label: 'Select' },
    { id: 'rect', icon: <Square size={20} />, label: 'Rectangle' },
    { id: 'circle', icon: <Circle size={20} />, label: 'Circle' },
    { id: 'line', icon: <Minus size={20} />, label: 'Line' },
    { id: 'pencil', icon: <Pencil size={20} />, label: 'Draw' },
    { id: 'text', icon: <Type size={20} />, label: 'Text' },
  ];

  const systemTools: { id: ToolType; icon: React.ReactNode; label: string }[] = [
    { id: 'database', icon: <Database size={20} />, label: 'Database' },
    { id: 'keyboard', icon: <Keyboard size={20} />, label: 'Keyboard' },
    { id: 'server', icon: <Server size={20} />, label: 'Server' },
    { id: 'cloud', icon: <Cloud size={20} />, label: 'Cloud' },
  ];

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/share/${Math.random().toString(36).substr(2, 9)}`;
    alert(`File Shared successfully!\n\nUser: ${user?.username}\nLink: ${shareUrl}\n\n(This is a simulation)`);
  };

  const buttonClass = (isActive: boolean) => `
    p-2.5 rounded-xl transition-all duration-200 group relative border-2 
    ${isActive 
      ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] transform -translate-y-1' 
      : 'bg-[#1E1E2F] text-gray-400 border-white/10 hover:border-white/30 hover:text-white hover:-translate-y-0.5'
    }
  `;

  const actionButtonClass = `
    p-2.5 rounded-xl bg-[#1E1E2F] text-gray-400 border-2 border-white/10 
    hover:border-white/30 hover:text-white hover:-translate-y-0.5 transition-all duration-200
  `;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center gap-4 w-full px-4 pointer-events-none">
      
      {/* Main Toolbar */}
      <div className="pointer-events-auto bg-[#121212] shadow-2xl border-2 border-white/10 rounded-2xl p-2 flex flex-wrap justify-center items-center gap-2 max-w-full">
        
        {/* Basic Tools */}
        <div className="flex gap-1.5">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setTool(tool.id)}
              className={buttonClass(selectedTool === tool.id)}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        <div className="w-0.5 h-8 bg-white/10 mx-1"></div>

        {/* System Tools */}
        <div className="flex gap-1.5">
          {systemTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setTool(tool.id)}
              className={buttonClass(selectedTool === tool.id)}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        <div className="w-0.5 h-8 bg-white/10 mx-1"></div>

        {/* Actions */}
        <div className="flex gap-1.5">
          <button onClick={undo} className={actionButtonClass} title="Undo">
            <Undo2 size={20} />
          </button>
          <button onClick={redo} className={actionButtonClass} title="Redo">
            <Redo2 size={20} />
          </button>
          <button
            onClick={deleteSelectedShape}
            disabled={!selectedShapeIds || selectedShapeIds.length === 0}
            className={`${actionButtonClass} ${
              !selectedShapeIds || selectedShapeIds.length === 0 ? 'opacity-50 cursor-not-allowed hover:translate-y-0' : 'hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
            }`}
            title="Delete"
          >
            <Trash2 size={20} />
          </button>
          <button
             onClick={onExport}
             className={`${actionButtonClass} hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30`}
             title="Export"
          >
             <Download size={20} />
          </button>
          
          {isAuthenticated && (
             <button
                onClick={handleShare}
                className={`${actionButtonClass} hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/30`}
                title="Share"
             >
                <Share2 size={20} />
             </button>
          )}
        </div>
      </div>

      {/* User Badge */}
      {isAuthenticated && (
        <div className="pointer-events-auto absolute top-2 right-4 md:static md:mt-0 flex items-center justify-end w-full md:w-auto">
           <div className="bg-[#121212] shadow-xl border-2 border-white/10 rounded-full py-1.5 px-2 flex items-center gap-2 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white uppercase border-2 border-[#121212]">
                  {user?.username.slice(0, 2)}
              </div>
              <span className="text-gray-400 text-sm hidden md:block px-2">{user?.username}</span>
              <button 
                onClick={onLogout}
                className="text-gray-400 hover:text-red-400 transition-colors p-1.5 hover:bg-white/5 rounded-full"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;