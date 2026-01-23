
import React, { useState } from 'react';
import { Play, Gamepad2, Hammer, Heart } from 'lucide-react';
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
            level: 1, experience: 0, streak: 0, inventory: {}, worldBlocks: [], 
            rank: 'Novato', sensoryMode: 'standard', showDayMap: true
        });
        await repo.settings.save({ 
            familyName: formData.world, 
            parentPin: formData.pin, 
            rules: { allowShop: true, allowBuilder: true, xpMultiplier: 1, damageMultiplier: 1, requireEvidence: true } 
        });
        
        sfx.play('levelup');
        onJoinFamily(newCode);
    } catch { 
        sfx.play('error'); 
        alert("Erro ao criar mundo. Tente novamente.");
    } 
    setLoading(false);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.joinCode.length < 5) return;
    sfx.play('click');
    onJoinFamily(formData.joinCode.toUpperCase());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-sky-300">
      
      {/* Background Decorativo Pixel */}
      <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(#8fd3fe 60%, transparent 60%),
            linear-gradient(#58bf58 60%, #4ca34c 100%)
          `
      }}>
        {/* Cloud placeholders could go here */}
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8 animate-in zoom-in duration-500">
        
        {/* LOGO TEMÁTICO */}
        <div className="flex flex-col items-center">
            <h1 className="font-display text-7xl text-white drop-shadow-[4px_4px_0_#000] stroke-black tracking-widest text-center">
                MINE<br/><span className="text-[#ffd700]">TASK</span>
            </h1>
            <div className="bg-[#222] text-white font-pixel text-xl px-4 py-1 mt-2 border-2 border-white shadow-lg">
                Adventure Edition
            </div>
        </div>

        {mode === 'MENU' && (
            <div className="w-full flex flex-col gap-4 px-8">
                <button onClick={() => setMode('CREATE')} className="btn-game btn-primary w-full py-4 text-xl shadow-xl hover:scale-105">
                    <Hammer size={24} />
                    <span>NOVO JOGO</span>
                </button>
                
                <button onClick={() => setMode('JOIN')} className="btn-game btn-secondary w-full py-4 text-xl shadow-xl hover:scale-105">
                    <Gamepad2 size={24} />
                    <span>CONTINUAR</span>
                </button>
            </div>
        )}

        {mode === 'CREATE' && (
            <div className="panel-stone w-full p-8 rounded-xl shadow-2xl border-4 border-gray-600 bg-[#333]">
                <div className="text-center mb-6">
                    <h2 className="font-display text-3xl text-yellow-400">Criar Mundo</h2>
                </div>
                
                <form onSubmit={handleCreate} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Nome do Mundo</label>
                        <input className="input-game" placeholder="Ex: Casa do Lucas" value={formData.world} onChange={e=>setFormData({...formData, world: e.target.value})} required/>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Nome do Herói</label>
                        <input className="input-game" placeholder="Ex: Steve" value={formData.child} onChange={e=>setFormData({...formData, child: e.target.value})} required/>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Senha do Mestre (PIN)</label>
                        <input className="input-game text-center tracking-[10px]" type="tel" maxLength={4} placeholder="0000" value={formData.pin} onChange={e=>setFormData({...formData, pin: e.target.value.replace(/\D/g,'')})} required/>
                    </div>
                    
                    <div className="flex gap-3 mt-4">
                        <button type="button" onClick={() => setMode('MENU')} className="btn-game btn-danger flex-1 text-sm">VOLTAR</button>
                        <button type="submit" disabled={loading} className="btn-game btn-primary flex-[2]">
                            {loading ? 'CRIANDO...' : 'JOGAR!'}
                        </button>
                    </div>
                </form>
            </div>
        )}

        {mode === 'JOIN' && (
            <div className="panel-stone w-full p-8 rounded-xl shadow-2xl bg-[#333]">
                 <div className="text-center mb-6">
                    <h2 className="font-display text-3xl text-cyan-400">Inserir Código</h2>
                 </div>
                 <form onSubmit={handleJoin} className="flex flex-col gap-4">
                    <input className="input-game text-center uppercase text-3xl h-20 text-yellow-300 border-cyan-500" placeholder="XXX-YYY-00" value={formData.joinCode} onChange={e=>setFormData({...formData, joinCode: e.target.value.toUpperCase()})} autoFocus/>
                    <div className="flex gap-3 mt-4">
                        <button type="button" onClick={() => setMode('MENU')} className="btn-game btn-danger flex-1 text-sm">VOLTAR</button>
                        <button type="submit" className="btn-game btn-gold flex-[2]">CONECTAR</button>
                    </div>
                 </form>
            </div>
        )}

      </div>
      
      <div className="absolute bottom-4">
          <p className="font-display text-lg text-[#3e2723] flex items-center justify-center gap-2 tracking-wider drop-shadow-sm">
             Feito com amor por <Heart size={16} className="text-red-500 fill-current animate-bounce" /> Lucas
          </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
