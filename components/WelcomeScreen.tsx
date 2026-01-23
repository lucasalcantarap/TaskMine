
import React, { useState } from 'react';
import { Play, Plus, ArrowRight, Save, Shield } from 'lucide-react';
import { sfx } from '../services/audio';
import { RepositoryFactory } from '../services/storage';
import { WorldGenerator } from '../services/world-generator';

interface WelcomeScreenProps {
  onJoinFamily: (code: string) => void;
}

type ScreenMode = 'MENU' | 'CREATE' | 'JOIN';

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onJoinFamily }) => {
  const [mode, setMode] = useState<ScreenMode>('MENU');
  
  // Create Form State
  const [newWorldName, setNewWorldName] = useState('');
  const [childName, setChildName] = useState('');
  const [parentPin, setParentPin] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Join Form State
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateWorld = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorldName || !childName || parentPin.length < 4) {
        sfx.play('error');
        return;
    }

    setIsCreating(true);
    sfx.play('click');
    
    // 1. Gerar Código Único
    const newCode = WorldGenerator.generateSeed();
    
    try {
        // 2. Inicializar Estrutura no Firebase
        const repo = RepositoryFactory.createFamilyContext(newCode);
        
        // Salvar Perfil Inicial da Criança
        await repo.profile.save({
            name: childName,
            emeralds: 0,
            diamonds: 0,
            hp: 100,
            maxHp: 100,
            level: 1,
            experience: 0,
            streak: 0,
            inventory: {},
            worldBlocks: [],
            rank: 'Novato',
            sensoryMode: 'standard',
            showDayMap: true
        });

        // Salvar Configurações Iniciais dos Pais
        await repo.settings.save({
            familyName: newWorldName,
            parentPin: parentPin,
            rules: {
                allowShop: true,
                allowBuilder: true,
                xpMultiplier: 1,
                damageMultiplier: 1,
                requireEvidence: true
            }
        });

        sfx.play('levelup');
        // 3. Entrar
        onJoinFamily(newCode);

    } catch (error) {
        console.error(error);
        sfx.play('error');
    } finally {
        setIsCreating(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCode.trim().toUpperCase();
    if (cleanCode.length < 5) return;

    setIsJoining(true);
    sfx.play('click');

    const repo = RepositoryFactory.createFamilyContext(cleanCode);
    const exists = await repo.root.exists(); // Verifica se existe algo na raiz
    // Nota: Firebase realtime db retorna null se path nao existe. 
    // Nossa implementação de exists verifica snapshot.exists()
    
    if (exists) {
        sfx.play('success');
        onJoinFamily(cleanCode);
    } else {
        // Se não existe, podemos dar erro ou criar padrão (legacy behavior)
        // Vamos manter legacy behavior mas avisar
        sfx.play('pop');
        onJoinFamily(cleanCode);
    }
    setIsJoining(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-dirt">
      
      {/* Background Animado */}
      <div className="absolute inset-0 z-0 bg-panaroma opacity-40"></div>
      
      {/* Container Principal */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 animate-float">
            <h1 className="font-game text-5xl text-white drop-shadow-[4px_4px_0_#000] text-center leading-tight text-stroke">
                MINE<br/><span className="text-[#55ff55]">TASK</span>
            </h1>
            <span className="bg-yellow-400 text-black font-game text-[8px] px-2 py-1 -rotate-6 mt-2 border-2 border-white shadow-lg">
                EDITION: FAMILY
            </span>
        </div>

        {/* --- MODO MENU --- */}
        {mode === 'MENU' && (
            <div className="flex flex-col gap-4 w-full px-8">
                <button 
                    onClick={() => { sfx.play('click'); setMode('CREATE'); }}
                    className="mc-btn primary py-4 text-xl shadow-xl hover:scale-105 transition-transform"
                >
                    <Plus className="mr-2" size={24}/> NOVO JOGO
                </button>
                <button 
                    onClick={() => { sfx.play('click'); setMode('JOIN'); }}
                    className="mc-btn py-4 text-xl shadow-xl hover:scale-105 transition-transform"
                >
                    <Play className="mr-2" size={24}/> CONTINUAR
                </button>
                <div className="text-center mt-8 text-gray-400 font-pixel text-sm">
                    © 2024 Lucas Arts Studios
                </div>
            </div>
        )}

        {/* --- MODO CRIAR (SETUP) --- */}
        {mode === 'CREATE' && (
            <div className="mc-panel w-full p-1 shadow-2xl">
                <div className="bg-[#3b3b3b] p-2 border-b-2 border-[#1a1a1a] mb-2">
                    <h2 className="font-game text-xs text-center text-white">CRIAR NOVO MUNDO</h2>
                </div>
                <form onSubmit={handleCreateWorld} className="p-4 flex flex-col gap-4">
                    
                    <div>
                        <label className="font-pixel text-[#333] text-lg font-bold">Nome da Família/Mundo</label>
                        <input 
                            required
                            placeholder="Ex: Reino dos Santos"
                            value={newWorldName}
                            onChange={e => setNewWorldName(e.target.value)}
                            className="mc-input w-full text-xl"
                        />
                    </div>

                    <div>
                        <label className="font-pixel text-[#333] text-lg font-bold">Nome do Herói (Filho)</label>
                        <input 
                            required
                            placeholder="Ex: Enzo ou Valentina"
                            value={childName}
                            onChange={e => setChildName(e.target.value)}
                            className="mc-input w-full text-xl"
                        />
                    </div>

                    <div>
                        <label className="font-pixel text-[#333] text-lg font-bold flex items-center gap-2">
                            PIN dos Pais <Shield size={14}/>
                        </label>
                        <input 
                            required
                            type="tel"
                            maxLength={4}
                            placeholder="****"
                            value={parentPin}
                            onChange={e => setParentPin(e.target.value.replace(/\D/g,''))}
                            className="mc-input w-full text-xl tracking-widest text-center"
                        />
                        <span className="text-[10px] text-gray-600 font-pixel">Usado para aprovar tarefas.</span>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button type="button" onClick={() => setMode('MENU')} className="mc-btn danger flex-1 py-3">VOLTAR</button>
                        <button type="submit" disabled={isCreating} className="mc-btn primary flex-[2] py-3 text-lg">
                            {isCreating ? 'CRIANDO...' : 'CRIAR MUNDO'}
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* --- MODO ENTRAR --- */}
        {mode === 'JOIN' && (
            <div className="mc-panel w-full p-1 shadow-2xl">
                 <div className="bg-[#3b3b3b] p-2 border-b-2 border-[#1a1a1a] mb-2">
                    <h2 className="font-game text-xs text-center text-white">CONEXÃO DIRETA</h2>
                </div>
                <form onSubmit={handleJoin} className="p-6 flex flex-col gap-6">
                    <div>
                        <label className="font-pixel text-[#333] text-lg font-bold block text-center mb-2">CÓDIGO DO SERVIDOR</label>
                        <input 
                            autoFocus
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            className="mc-input w-full text-2xl text-center uppercase tracking-widest p-4 border-4"
                            placeholder="AAA-BBB-00"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button type="button" onClick={() => setMode('MENU')} className="mc-btn danger flex-1 py-3">VOLTAR</button>
                        <button type="submit" disabled={isJoining} className="mc-btn primary flex-[2] py-3 text-lg">
                            {isJoining ? 'BUSCANDO...' : 'ENTRAR'} <ArrowRight size={18} className="ml-2"/>
                        </button>
                    </div>
                </form>
            </div>
        )}

      </div>
    </div>
  );
};

export default WelcomeScreen;
