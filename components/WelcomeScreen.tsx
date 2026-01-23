
import React, { useState } from 'react';
import { Play, Plus, Server } from 'lucide-react';
import { sfx } from '../services/audio';
import { RepositoryFactory } from '../services/storage';
import { WorldGenerator } from '../services/world-generator';

interface WelcomeScreenProps {
  onJoinFamily: (code: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onJoinFamily }) => {
  const [mode, setMode] = useState<'MENU' | 'CREATE' | 'JOIN'>('MENU');
  const [formData, setFormData] = useState({ world: '', child: '', pin: '', joinCode: '' });
  const [loading, setLoading] = useState(false);

  const updateForm = (k: string, v: string) => setFormData(prev => ({...prev, [k]: v}));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.world || !formData.child || formData.pin.length < 4) { sfx.play('error'); return; }
    
    setLoading(true);
    sfx.play('click');
    const newCode = WorldGenerator.generateSeed();
    try {
        const repo = RepositoryFactory.createFamilyContext(newCode);
        await repo.profile.save({
            name: formData.child, emeralds: 0, diamonds: 0, hp: 100, maxHp: 100,
            level: 1, experience: 0, streak: 0, inventory: {}, worldBlocks: [], rank: 'Aldeão', sensoryMode: 'standard', showDayMap: true
        });
        await repo.settings.save({ familyName: formData.world, parentPin: formData.pin, rules: { allowShop: true, allowBuilder: true, xpMultiplier: 1, damageMultiplier: 1, requireEvidence: true } });
        sfx.play('levelup');
        onJoinFamily(newCode);
    } catch { sfx.play('error'); } 
    setLoading(false);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.joinCode.length < 5) return;
    sfx.play('click');
    onJoinFamily(formData.joinCode.toUpperCase());
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 transition-all duration-1000 overflow-hidden">
      
      {/* Background Panorama Simulado */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 animate-pulse pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8">
        
        {/* LOGO MINECRAFT STYLE */}
        <div className="text-center">
            <h1 className="font-game text-6xl md:text-8xl text-white drop-shadow-[4px_4px_0_#000] tracking-widest transform -rotate-2" 
                style={{ fontFamily: "'VT323', monospace", textShadow: "4px 4px 0 #3f3f3f, 6px 6px 0 #000" }}>
                QUEST
            </h1>
            <h1 className="font-game text-6xl md:text-8xl text-[#50e4e8] drop-shadow-[4px_4px_0_#000] tracking-widest transform rotate-2 -mt-4"
                style={{ fontFamily: "'VT323', monospace", textShadow: "4px 4px 0 #2c9ba0, 6px 6px 0 #000" }}>
                CRAFT
            </h1>
            <p className="font-game text-[#ffff55] text-xl mt-2 animate-bounce mc-shadow-text">v4.0 RPG EDITION</p>
        </div>

        {mode === 'MENU' && (
            <div className="flex flex-col gap-4 w-full w-64">
                <button onClick={() => setMode('CREATE')} className="mc-button mc-btn-green w-full group">
                    <Plus size={24} className="mr-2"/> NOVO MUNDO
                </button>
                <button onClick={() => setMode('JOIN')} className="mc-button mc-btn-stone w-full group">
                    <Server size={24} className="mr-2"/> MULTIPLAYER
                </button>
            </div>
        )}

        {mode === 'CREATE' && (
            <div className="mc-panel w-full p-1 animate-pop">
                <div className="bg-[#212121] text-white p-2 text-center border-b-2 border-white/10 mb-4">
                    <h2 className="mc-title-game text-xl">Criar Novo Servidor</h2>
                </div>
                
                <form onSubmit={handleCreate} className="flex flex-col gap-4 p-2">
                    <div>
                        <label className="text-xs font-bold text-[#555] uppercase block mb-1">Nome do Reino</label>
                        <input className="mc-input w-full" placeholder="Ex: Reino Silva" value={formData.world} onChange={e=>updateForm('world', e.target.value)} required/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[#555] uppercase block mb-1">Nick do Herói</label>
                        <input className="mc-input w-full" placeholder="Steve" value={formData.child} onChange={e=>updateForm('child', e.target.value)} required/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[#555] uppercase block mb-1">PIN do Admin</label>
                        <input className="mc-input w-full text-center tracking-[0.5em]" type="tel" maxLength={4} placeholder="0000" value={formData.pin} onChange={e=>updateForm('pin', e.target.value.replace(/\D/g,''))} required/>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button type="button" onClick={() => setMode('MENU')} className="mc-button mc-btn-red flex-1 text-sm">VOLTAR</button>
                        <button type="submit" disabled={loading} className="mc-button mc-btn-green flex-[2]">CRIAR MUNDO</button>
                    </div>
                </form>
            </div>
        )}

        {mode === 'JOIN' && (
            <div className="mc-panel w-full p-1 animate-pop">
                 <div className="bg-[#212121] text-white p-2 text-center border-b-2 border-white/10 mb-4">
                    <h2 className="mc-title-game text-xl">Conexão Direta</h2>
                 </div>
                 <form onSubmit={handleJoin} className="flex flex-col gap-4 p-2">
                    <label className="text-xs font-bold text-[#555] uppercase block -mb-3">Endereço do Servidor</label>
                    <input className="mc-input w-full text-center uppercase tracking-wider text-[#3b82f6]" placeholder="XXX-YYY-99" value={formData.joinCode} onChange={e=>updateForm('joinCode', e.target.value.toUpperCase())} autoFocus/>
                    <div className="flex gap-2 mt-2">
                        <button type="button" onClick={() => setMode('MENU')} className="mc-button mc-btn-red flex-1 text-sm">CANCELAR</button>
                        <button type="submit" className="mc-button mc-btn-stone flex-[2]">ENTRAR</button>
                    </div>
                 </form>
            </div>
        )}
      </div>
      
      <div className="absolute bottom-2 text-[#555] font-game text-sm">
          Copyright Mojang AB (Brincadeira, é fan made!)
      </div>
    </div>
  );
};

export default WelcomeScreen;
