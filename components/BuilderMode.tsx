
import React, { useState } from 'react';
import { UserProfile, PlacedBlock, Reward } from '../types';
import { sfx } from '../services/audio';
import { Eraser, Hammer, X, Palette, Lock, Trash2, Droplet, MousePointer2 } from 'lucide-react';

interface BuilderModeProps {
  profile: UserProfile;
  rewards: Reward[];
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onClose: () => void;
}

const GRID_SIZE = 16; // Increased for better art

const BuilderMode: React.FC<BuilderModeProps> = ({ profile, rewards, onUpdateProfile, onClose }) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [tool, setTool] = useState<'PAINT' | 'BUCKET' | 'ERASE'>('PAINT');

  const ownedBlocks = rewards.filter(r => r.type === 'block');

  const handlePlaceBlock = (x: number, y: number) => {
    if (!selectedBlockId && tool !== 'ERASE') return;

    let newWorld = [...(profile.worldBlocks || [])];
    let newInventory = { ...(profile.inventory || {}) };

    if (tool === 'BUCKET' && selectedBlockId) {
      // Flood fill logic
      const blockReward = rewards.find(r => r.id === selectedBlockId);
      if (!blockReward || (newInventory[selectedBlockId] || 0) <= 0) {
        sfx.play('error');
        return;
      }

      const targetBlock = newWorld.find(b => b.x === x && b.y === y);
      const targetColor = targetBlock?.color || 'transparent';
      if (targetColor === blockReward.blockColor) return;

      const stack = [[x, y]];
      const visited = new Set<string>();
      let blocksChanged = 0;

      while (stack.length > 0 && (newInventory[selectedBlockId] || 0) > 0) {
        const [cx, cy] = stack.pop()!;
        const key = `${cx},${cy}`;
        if (cx < 0 || cx >= GRID_SIZE || cy < 0 || cy >= GRID_SIZE || visited.has(key)) continue;

        const currentBlock = newWorld.find(b => b.x === cx && b.y === cy);
        const currentColor = currentBlock?.color || 'transparent';

        if (currentColor === targetColor) {
          visited.add(key);
          // Replace or Add
          const idx = newWorld.findIndex(b => b.x === cx && b.y === cy);
          if (idx >= 0) {
            const oldBlock = newWorld[idx];
            newInventory[oldBlock.id] = (newInventory[oldBlock.id] || 0) + 1;
            newWorld.splice(idx, 1);
          }

          newWorld.push({ x: cx, y: cy, color: blockReward.blockColor!, id: selectedBlockId, name: blockReward.title });
          newInventory[selectedBlockId]--;
          blocksChanged++;

          stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }
      }
      if (blocksChanged > 0) sfx.play('pop');
    } else {
      const existingBlockIndex = newWorld.findIndex(b => b.x === x && b.y === y);
      // ERASE
      if (tool === 'ERASE') {
        if (existingBlockIndex >= 0) {
          const blockToRemove = newWorld[existingBlockIndex];
          newWorld.splice(existingBlockIndex, 1);
          newInventory[blockToRemove.id] = (newInventory[blockToRemove.id] || 0) + 1;
          sfx.play('pop');
        }
      }
      // PAINT
      else if (selectedBlockId) {
        const blockReward = rewards.find(r => r.id === selectedBlockId);
        if (!blockReward || (newInventory[selectedBlockId] || 0) <= 0) {
          sfx.play('error');
          return;
        }

        if (existingBlockIndex >= 0) {
          const oldBlock = newWorld[existingBlockIndex];
          newInventory[oldBlock.id] = (newInventory[oldBlock.id] || 0) + 1;
          newWorld.splice(existingBlockIndex, 1);
        }

        newWorld.push({ x, y, color: blockReward.blockColor!, id: selectedBlockId, name: blockReward.title });
        newInventory[selectedBlockId]--;
        sfx.play('pop');
      }
    }

    onUpdateProfile({ worldBlocks: newWorld, inventory: newInventory });
  };

  const handleReset = () => {
    if (window.confirm("Deseja destruir tudo e recuperar os materiais?")) {
      let newInventory = { ...(profile.inventory || {}) };
      profile.worldBlocks.forEach(b => {
        newInventory[b.id] = (newInventory[b.id] || 0) + 1;
      });
      onUpdateProfile({ worldBlocks: [], inventory: newInventory });
      sfx.play('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050505] z-[200] flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-4 bg-[#121212] border-b-2 border-[#d4af37] flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-[#d4af37] p-2 rounded text-black shadow"><Palette size={20} /></div>
          <div>
            <h2 className="font-display text-[#d4af37] text-lg">Grimório de Arte</h2>
            <p className="text-xs text-zinc-500 font-serif">Use suas relíquias para criar.</p>
          </div>
        </div>
        <button onClick={onClose} className="bg-red-900/20 text-red-500 p-2 border border-red-900 hover:bg-red-900/40 transition-colors"><X size={24} /></button>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row p-6 gap-6 overflow-hidden">
        {/* VIEWPORT CANVAS */}
        <div className="flex-grow flex items-center justify-center bg-[#1a1a1a] border-[4px] double border-[#444] relative overflow-auto p-4 shadow-inner">
          {/* Frame Ornament */}
          <div className="absolute inset-0 pointer-events-none border border-[#d4af37] opacity-20 m-2"></div>

          <div
            className="grid gap-px bg-[#000] p-1 shadow-2xl border border-[#222]"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              width: 'min(85vw, 600px)',
              aspectRatio: '1/1'
            }}
          >
            {[...Array(GRID_SIZE * GRID_SIZE)].map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const block = profile.worldBlocks?.find(b => b.x === x && b.y === y);
              const blockReward = selectedBlockId ? rewards.find(r => r.id === selectedBlockId) : null;

              return (
                <div
                  key={i}
                  onClick={() => handlePlaceBlock(x, y)}
                  className={`w-full h-full cursor-crosshair transition-all relative group/cell ${!block ? 'bg-[#111]' : ''}`}
                  style={{ backgroundColor: block?.color || 'transparent' }}
                >
                  {/* Hover Preview */}
                  {!block && tool === 'PAINT' && selectedBlockId && (
                    <div className="absolute inset-0 opacity-0 group-hover/cell:opacity-40 pointer-events-none" style={{ backgroundColor: blockReward?.blockColor }}></div>
                  )}
                  {block && tool === 'ERASE' && (
                    <div className="absolute inset-0 opacity-0 group-hover/cell:opacity-40 bg-red-500 pointer-events-none flex items-center justify-center"><X size={8} className="text-white" /></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* INVENTORY SIDEBAR */}
        <div className="lg:w-80 bg-[#121212] p-4 border-l-2 border-[#d4af37] flex flex-col gap-4 shadow-xl">
          <p className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest px-2 border-b border-[#333] pb-2">Seu Inventário de Materiais</p>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setTool('PAINT')} className={`p-3 border flex flex-col items-center gap-1 transition-all ${tool === 'PAINT' ? 'bg-[#d4af37] text-black border-yellow-200' : 'bg-[#1a1a1a] text-zinc-500 border-[#333]'}`}>
                <MousePointer2 size={18} /> <span className="text-[8px] font-bold">LÁPIS</span>
              </button>
              <button onClick={() => setTool('BUCKET')} className={`p-3 border flex flex-col items-center gap-1 transition-all ${tool === 'BUCKET' ? 'bg-[#d4af37] text-black border-yellow-200' : 'bg-[#1a1a1a] text-zinc-500 border-[#333]'}`}>
                <Droplet size={18} /> <span className="text-[8px] font-bold">BALDE</span>
              </button>
              <button onClick={() => setTool('ERASE')} className={`p-3 border flex flex-col items-center gap-1 transition-all ${tool === 'ERASE' ? 'bg-red-900 text-white border-red-500' : 'bg-[#1a1a1a] text-zinc-500 border-[#333]'}`}>
                <Eraser size={18} /> <span className="text-[8px] font-bold">BORRACHA</span>
              </button>
            </div>

            <button onClick={handleReset} className="w-full p-2 bg-red-900/10 text-red-500 border border-red-900/30 text-[9px] font-bold flex items-center justify-center gap-2 hover:bg-red-900/20 transition-all">
              <Trash2 size={14} /> DESTRUIR TUDO
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 flex-grow">
            {ownedBlocks.map(item => {
              const count = profile.inventory?.[item.id] || 0;
              const isSelected = selectedBlockId === item.id;
              const hasItems = count > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (hasItems) {
                      sfx.play('click');
                      setSelectedBlockId(item.id);
                    }
                  }}
                  className={`
                            relative p-3 flex flex-col items-center gap-2 border-2 transition-all group
                            ${isSelected ? 'border-[#d4af37] bg-[#1a1a1a]' : 'border-[#333] bg-[#080808]'}
                            ${!hasItems ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#666]'}
                        `}
                >
                  {!hasItems && <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10"><Lock size={16} className="text-zinc-500" /></div>}

                  <div className="w-10 h-10 shadow-lg border border-black/50" style={{ backgroundColor: item.blockColor }}></div>
                  <div className="text-center w-full">
                    <p className="text-[9px] font-bold text-[#ccc] uppercase truncate w-full">{item.title}</p>
                    <p className={`text-[10px] font-bold ${hasItems ? 'text-green-500' : 'text-red-900'}`}>x{count}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto bg-[#0a0a0a] p-4 border border-[#333] text-[9px] text-zinc-500 font-serif leading-relaxed italic text-center">
            "Compre mais materiais com o Mercador para expandir sua obra-prima."
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderMode;
