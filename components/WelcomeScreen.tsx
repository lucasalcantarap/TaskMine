
import React, { useState } from 'react';
import { Play, Gamepad2, ShieldCheck, Hammer } from 'lucide-react';
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

  // Quick setup com seed gerada
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.world || !formData.child || formData.pin.length < 4) { sfx.play('error'); return; }
    
    setLoading(true);
    sfx.play('click');
    
    // Gera um código divertido ex: SUPER-CREEPER-99
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#81D4FA]">
      
      {/* Background Decorativo */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-yellow-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8 animate-pop">
        
        {/* LOGO TEMÁTICO */}
        <div className="flex flex-col items-center rotate-[-2deg]">
            <h1 className="text-title text-7xl text-white drop-shadow-[4px_4px_0_#000] leading-none tracking-wider text-stroke-3">
                MINE<span className="text-[#AEEA00]">TASK</span>
            </h1>
            <div className="bg-[#FF6D00] text-white text-title px-4 py-1 rounded-full border-2 border-black rotate-[4deg] -mt-2 shadow-lg">
                Adventure Edition
            </div>
        </div>

        {mode === 'MENU' && (
            <div className="w-full flex flex-col gap-4">
                <button onClick={() => setMode('CREATE')} className="toon-btn btn-success w-full group">
                    <div className="bg-white/30 p-2 rounded-lg border-2 border-black/10 group-hover:rotate-12 transition-transform">
                        <Hammer size={24}/>
                    </div>
                    <span>Criar Novo Mundo</span>
                </button>
                
                <button onClick={() => setMode('JOIN')} className="toon-btn btn-info w-full group">
                    <div className="bg-white/30 p-2 rounded-lg border-2 border-black/10 group-hover:-rotate-12 transition-transform">
                        <Gamepad2 size={24}/>
                    </div>
                    <span>Entrar no Servidor</span>
                </button>
            </div>
        )}

        {mode === 'CREATE' && (
            <div className="toon-card w-full p-6">
                <div className="text-center mb-6">
                    <h2 className="text-title text-3xl text-[#FF6D00]">Setup da Aventura</h2>
                    <p className="text-sm font-bold opacity-60">Prepare-se para começar!</p>
                </div>
                
                <form onSubmit={handleCreate} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-bold uppercase ml-2 mb-1 block">Nome do Reino</label>
                        <input className="toon-input" placeholder="Ex: Casa do Lucas" value={formData.world} onChange={e=>setFormData({...formData, world: e.target.value})} required/>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase ml-2 mb-1 block">Herói (Criança)</label>
                        <input className="toon-input" placeholder="Steve / Alex" value={formData.child} onChange={e=>setFormData({...formData, child: e.target.value})} required/>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase ml-2 mb-1 block">Senha Mestre (PIN)</label>
                        <input className="toon-input text-center tracking-[10px]" type="tel" maxLength={4} placeholder="0000" value={formData.pin} onChange={e=>setFormData({...formData, pin: e.target.value.replace(/\D/g,'')})} required/>
                    </div>
                    
                    <div className="flex gap-3 mt-2">
                        <button type="button" onClick={() => setMode('MENU')} className="toon-btn bg-gray-200 flex-1 text-sm">Voltar</button>
                        <button type="submit" disabled={loading} className="toon-btn btn-primary flex-[2]">
                            {loading ? 'Gerando...' : 'INICIAR!'}
                        </button>
                    </div>
                </form>
            </div>
        )}

        {mode === 'JOIN' && (
            <div className="toon-card w-full p-6">
                 <div className="text-center mb-6">
                    <h2 className="text-title text-3xl text-[#00B0FF]">Conectar</h2>
                    <p className="text-sm font-bold opacity-60">Insira o código da família</p>
                 </div>
                 <form onSubmit={handleJoin} className="flex flex-col gap-4">
                    <input className="toon-input text-center uppercase text-2xl h-20 text-[#00B0FF]" placeholder="XXX-YYY-00" value={formData.joinCode} onChange={e=>setFormData({...formData, joinCode: e.target.value.toUpperCase()})} autoFocus/>
                    <div className="flex gap-3 mt-2">
                        <button type="button" onClick={() => setMode('MENU')} className="toon-btn bg-gray-200 flex-1 text-sm">Voltar</button>
                        <button type="submit" className="toon-btn btn-success flex-[2]">CONECTAR</button>
                    </div>
                 </form>
            </div>
        )}

      </div>
      
      <div className="absolute bottom-4 text-xs font-bold text-black/40 text-center">
          Feito com ❤️ para Super-Heróis Reais
      </div>
    </div>
  );
};

export default WelcomeScreen;
