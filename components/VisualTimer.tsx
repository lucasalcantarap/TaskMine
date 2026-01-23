
import React, { useState, useEffect } from 'react';
import { sfx } from '../services/audio';

interface VisualTimerProps {
  onComplete: () => void;
  onCancel: () => void;
}

const VisualTimer: React.FC<VisualTimerProps> = ({ onComplete, onCancel }) => {
  const [minutes, setMinutes] = useState(15); // Default 15 min
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(minutes * 60);

  useEffect(() => {
    let interval: number;
    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Fixed: 'explode' is not assignable to allowed sound types. Using 'pop' instead.
      sfx.play('pop');
      setIsRunning(false);
      onComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const toggleTimer = () => {
    sfx.play('click');
    if (!isRunning) {
      setTimeLeft(minutes * 60);
    }
    setIsRunning(!isRunning);
  };

  const progress = (timeLeft / (minutes * 60)) * 100;

  return (
    <div className="bg-[#484848] mc-border p-6 flex flex-col items-center gap-4 w-full max-w-sm relative overflow-hidden">
      <h3 className="mc-font text-white text-xs">TIMER DA TNT</h3>
      
      {/* TNT Visual */}
      <div className="w-32 h-32 bg-red-600 mc-border relative flex items-center justify-center mb-4 transition-transform animate-pulse" style={{ animationDuration: isRunning ? `${Math.max(0.2, timeLeft/60)}s` : '0s' }}>
        <div className="bg-white px-2 py-1 mc-font text-black text-xl">TNT</div>
        {/* Fuse */}
        <div className="absolute -top-6 right-1/2 w-2 h-6 bg-gray-400"></div>
        <div className="absolute -top-8 right-1/2 w-4 h-4 bg-orange-500 animate-bounce" style={{ opacity: isRunning ? 1 : 0 }}></div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-8 bg-black mc-border relative">
        <div 
            className="h-full bg-white transition-all duration-1000"
            style={{ width: `${progress}%` }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center mc-font text-xs text-gray-500 mix-blend-difference">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {!isRunning ? (
        <div className="flex gap-2 w-full">
            <div className="flex flex-col flex-grow">
                <label className="text-[8px] text-gray-300 mb-1">MINUTOS</label>
                <input 
                    type="number" 
                    value={minutes} 
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    className="bg-black/40 text-white mc-font p-2 mc-border w-full text-center"
                />
            </div>
            <button onClick={toggleTimer} className="mc-button bg-[#3fff3f] text-black px-6 flex items-center">INICIAR</button>
        </div>
      ) : (
        <button onClick={() => { setIsRunning(false); onCancel(); }} className="mc-button bg-red-600 text-white w-full py-2">CANCELAR</button>
      )}
    </div>
  );
};

export default VisualTimer;
