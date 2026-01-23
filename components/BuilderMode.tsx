
import React, { useState } from 'react';
import { UserProfile, PlacedBlock, Reward } from '../types';
import { sfx } from '../services/audio';
import { Eraser, Hammer, X, Palette, Lock } from 'lucide-react';

interface BuilderModeProps {
  profile: UserProfile;
  rewards: Reward[];
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onClose: () => void;
}

const GRID_SIZE = 16; // Increased for better art

const BuilderMode: React.FC<BuilderModeProps> = ({ profile, rewards, onUpdateProfile, onClose }) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const ownedBlocks = rewards.filter(r => r.type === 'block');

  const handlePlaceBlock = (x: number, y: number) => {
    if (!selectedBlockId && selectedBlockId !== 'erase') return;

    const existingBlockIndex = profile.worldBlocks.findIndex(b => b.x === x && b.y === y);
    let newWorld = [...(profile.worldBlocks || [])];
    let newInventory = { ...(profile.inventory || {}) };

    // Mode: ERASE
    if (selectedBlockId === 'erase') {
        if (existingBlockIndex >= 0) {
            const blockToRemove = newWorld[existingBlockIndex];
            // Removing a block returns it to inventory
            newWorld.splice(existingBlockIndex, 1);
            newInventory[blockToRemove.id] = (newInventory[blockToRemove.id] || 0) + 1;
            sfx.play('pop');
        }
    } 
    // Mode: PAINT
    else {
        const blockReward = rewards.find(r => r.id === selectedBlockId);
        // Validations
        if (!blockReward) return;
        if ((newInventory[selectedBlockId!] || 0) <= 0) {
            sfx.play('error');
            return;
        }

        // Remove existing block if any (and refund it)
        if (existingBlockIndex >= 0) {
            const oldBlock = newWorld[existingBlockIndex];
            newInventory[oldBlock.id] = (newInventory[oldBlock.id] || 0) + 1;
            newWorld.splice(existingBlockIndex, 1);
        }

        // Add new block
        newWorld.push({ 
          x, y, 
          color: blockReward.blockColor || '#8b8b8b', 
          id: selectedBlockId!,
          name: blockReward.title
        });
        
        // Consume from inventory
        newInventory[selectedBlockId!]--;
        sfx.play('pop');
    }

    onUpdateProfile({ worldBlocks: newWorld, inventory: newInventory });
  };

  return (
    <div className="fixed inset-0 bg-[#050505] z-[200] flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-4 bg-[#121212] border-b-2 border-[#d4af37] flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
           <div className="bg-[#d4af37] p-2 rounded text-black shadow"><Palette size={20}/></div>
           <div>
               <h2 className="font-display text-[#d4af37] text-lg">Grimório de Arte</h2>
               <p className="text-xs text-zinc-500 font-serif">Use suas relíquias para criar.</p>
           </div>
        </div>
        <button onClick={onClose} className="bg-red-900/20 text-red-500 p-2 border border-red-900 hover:bg-red-900/40 transition-colors"><X size={24}/></button>
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

                return (
                    <div 
                        key={i}
                        onClick={() => handlePlaceBlock(x, y)}
                        className={`w-full h-full cursor-crosshair hover:opacity-80 transition-opacity ${!block ? 'bg-[#111] hover:bg-[#222]' : ''}`}
                        style={{ backgroundColor: block?.color || 'transparent' }}
                    ></div>
                );
             })}
           </div>
        </div>

        {/* INVENTORY SIDEBAR */}
        <div className="lg:w-80 bg-[#121212] p-4 border-l-2 border-[#d4af37] flex flex-col gap-4 shadow-xl">
            <p className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest px-2 border-b border-[#333] pb-2">Seu Inventário de Materiais</p>
            
            <button 
                onClick={() => setSelectedBlockId('erase')}
                className={`w-full p-4 border flex items-center gap-3 font-display text-sm transition-all ${selectedBlockId === 'erase' ? 'bg-red-900 text-white border-red-500' : 'bg-[#1a1a1a] text-zinc-500 border-[#333]'}`}
            >
                <Eraser size={20}/> <span>REMOVER / RECUPERAR</span>
            </button>

            <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 flex-grow">
               {ownedBlocks.map(item => {
                   const count = profile.inventory?.[item.id] || 0;
                   const isSelected = selectedBlockId === item.id;
                   const hasItems = count > 0;

                   return (
                     <button
                        key={item.id}
                        onClick={() => { 
                            if(hasItems) {
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
                        {!hasItems && <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10"><Lock size={16} className="text-zinc-500"/></div>}
                        
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
