
import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Eraser, RotateCcw, Check } from 'lucide-react';

interface DrawingCanvasProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'square';
    ctx.lineWidth = 10;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="bg-[#484848] mc-border p-4 flex flex-col gap-4 w-full max-w-lg">
      <div className="flex justify-between items-center bg-black/20 p-2">
        <div className="flex gap-2">
          <button onClick={() => setTool('pen')} className={`p-2 mc-border ${tool === 'pen' ? 'bg-[#3fff3f]' : 'bg-gray-600'}`}>
            <Pencil size={18} />
          </button>
          <button onClick={() => setTool('eraser')} className={`p-2 mc-border ${tool === 'eraser' ? 'bg-[#3fff3f]' : 'bg-gray-600'}`}>
            <Eraser size={18} />
          </button>
          <button onClick={clear} className="p-2 mc-border bg-gray-600">
            <RotateCcw size={18} />
          </button>
        </div>
        <div className="flex gap-1">
          {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00'].map(c => (
            <button 
              key={c} 
              onClick={() => {setColor(c); setTool('pen');}} 
              className={`w-6 h-6 border-2 border-black ${color === c && tool === 'pen' ? 'scale-125' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <canvas 
        ref={canvasRef}
        width={400}
        height={400}
        className="w-full aspect-square bg-white cursor-crosshair border-4 border-black mc-border touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      <div className="flex gap-2">
        <button onClick={onCancel} className="mc-button bg-[#ff3f3f] text-white flex-grow py-3 mc-font text-xs">CANCELAR</button>
        <button onClick={() => onSave(canvasRef.current?.toDataURL() || '')} className="mc-button bg-[#3fff3f] text-black flex-grow py-3 mc-font text-xs flex items-center justify-center gap-2">
          <Check size={18} /> PRONTO
        </button>
      </div>
    </div>
  );
};

export default DrawingCanvas;
