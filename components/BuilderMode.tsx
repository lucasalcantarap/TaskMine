
import React, { useState } from 'react';
import { UserProfile, PlacedBlock, Reward } from '../types';
import { sfx } from '../services/audio';
import { Eraser, Hammer, X, MousePointer2 } from 'lucide-react';

interface BuilderModeProps {
  profile: UserProfile;
  rewards: Reward[];
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onClose: () => void;
}

const GRID_SIZE = 12;

const BuilderMode: React.FC<BuilderModeProps> = ({ profile, rewards, onUpdateProfile, onClose }) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const ownedBlocks = rewards.filter(r => r.type === 'block' && (profile.inventory?.[r.id] || 0) > 0);

  const handlePlaceBlock = (x: number, y: number) => {
    if (!selectedBlockId && selectedBlockId !== 'erase') return;

    const existingBlockIndex = profile.worldBlocks.findIndex(b => b.x === x && b.y === y);
    let newWorld = [...(profile.worldBlocks || [])];
    let newInventory = { ...(profile.inventory || {}) };

    if (selectedBlockId === 'erase') {
        if (existingBlockIndex >= 0) {
            const blockToRemove = newWorld[existingBlockIndex];
            newWorld.splice(existingBlockIndex, 1);
            newInventory[blockToRemove.id] = (newInventory[blockToRemove.id] || 0) + 1;
            sfx.play('pop');
        }
    } else {
        const blockReward = rewards.find(r => r.id === selectedBlockId);
        if (!blockReward || (newInventory[selectedBlockId!] || 0) <= 0) return;

        if (existingBlockIndex >= 0) {
            const oldBlock = newWorld[existingBlockIndex];
            newInventory[oldBlock.id] = (newInventory[oldBlock.id] || 0) + 1;
            newWorld.splice(existingBlockIndex, 1);
        }

        newWorld.push({ 
          x, y, 
          color: blockReward.blockColor || '#8b8b8b', 
          id: selectedBlockId!,
          name: blockReward.title
        });
        newInventory[selectedBlockId!]--;
        sfx.play('pop');
    }

    onUpdateProfile({ worldBlocks: newWorld, inventory: newInventory });
  };

  return (
    <div className="fixed inset-0 bg-[#0c0c0d] z-[200] flex flex-col animate-in fade-in duration-300">
      <div className="p-4 bg-zinc-900 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="bg-mc-green/10 p-2 rounded-lg border border-mc-green/30"><Hammer size={20} className="text-mc-green"/></div>
           <h2 className="mc-title-game text-sm">Laboratório de Construção</h2>
        </div>
        <button onClick={onClose} className="bg-mc-red/20 text-mc-red p-2 rounded-xl hover:bg-mc-red/30 transition-colors"><X size={24}/></button>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row p-6 gap-6 overflow-hidden">
        {/* VIEWPORT DO MUNDO */}
        <div className="flex-grow flex items-center justify-center bg-zinc-800/20 rounded-[2.5rem] border border-white/5 relative overflow-auto p-4 backdrop-blur-sm">
           <div 
             className="grid gap-1 bg-black/40 p-2 rounded-2xl shadow-2xl" 
             style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, width: 'min(85vw, 600px)', aspectRatio: '1/1' }}
           >
             {[...Array(GRID_SIZE * GRID_SIZE)].map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const block = profile.worldBlocks?.find(b => b.x === x && b.y === y);

                return (
                    <div 
                        key={i}
                        onClick={() => handlePlaceBlock(x, y)}
                        className={`w-full h-full border border-white/5 cursor-crosshair hover:bg-white/10 transition-all rounded-sm ${block ? 'shadow-inner' : ''}`}
                        style={{ backgroundColor: block?.color || 'transparent' }}
                    ></div>
                );
             })}
           </div>
        </div>

        {/* BARRA LATERAL DE INVENTÁRIO */}
        <div className="lg:w-80 bg-zinc-900/60 p-6 rounded-[2rem] border border-white/5 flex flex-col gap-4">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2">Blocos Disponíveis</p>
            
            <button 
                onClick={() => setSelectedBlockId('erase')}
                className={`w-full p-4 rounded-2xl mc-btn-action flex items-center gap-3 ${selectedBlockId === 'erase' ? 'bg-mc-red text-white' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`}
            >
                <Eraser size={20}/> <span>REMOVER BLOCO</span>
            </button>

            <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2">
               {ownedBlocks.length === 0 ? (
                 <div className="col-span-2 text-center py-10 opacity-30 text-[9px] mc-title-game leading-relaxed">
                    SEU BAÚ ESTÁ VAZIO.<br/>COMPRE BLOCOS NA LOJA.
                 </div>
               ) : ownedBlocks.map(item => (
                 <button
                    key={item.id}
                    onClick={() => { sfx.play('click'); setSelectedBlockId(item.id); }}
                    className={`p-3 rounded-2xl mc-glass flex flex-col items-center gap-2 border-2 transition-all group ${selectedBlockId === item.id ? 'border-mc-green' : 'border-transparent'}`}
                 >
                    <div className="w-10 h-10 rounded shadow-lg border border-black/50 group-hover:scale-110 transition-transform" style={{ backgroundColor: item.blockColor }}></div>
                    <div className="text-center">
                       <p className="text-[8px] font-black text-zinc-300 uppercase truncate w-24">{item.title}</p>
                       <p className="text-[10px] font-black text-mc-green">x{profile.inventory?.[item.id]}</p>
                    </div>
                 </button>
               ))}
            </div>
            
            <div className="mt-auto bg-black/40 p-4 rounded-2xl border border-white/5 text-[8px] text-zinc-500 mc-title-game leading-relaxed">
               DICA: CADA BLOCO COLOCADO É CONSUMIDO DO SEU INVENTÁRIO. REMOVER O BLOCO DEVOLVE ELE PARA VOCÊ!
            </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderMode;
