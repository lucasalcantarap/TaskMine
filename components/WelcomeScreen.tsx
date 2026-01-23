
import React, { useState } from 'react';
import { LogIn, Server, RefreshCw, Wand2, AlertTriangle, Shield } from 'lucide-react';
import { sfx } from '../services/audio';
import { RepositoryFactory } from '../services/storage';

interface WelcomeScreenProps {
  onJoinFamily: (code: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onJoinFamily }) => {
  const [code, setCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSimpleSeed = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sem O/0/I/1 para evitar erro
    let result = 'MINE-';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
    sfx.play('click');
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length < 5) return;

    setIsChecking(true);
    setError(null);

    try {
      const repo = RepositoryFactory.createFamilyContext(cleanCode);
      const worldExists = await repo.root.exists();

      if (!worldExists) {
        setError("Mundo novo detectado! Você será o criador deste reino.");
        setTimeout(() => onJoinFamily(cleanCode), 1500);
      } else {
        sfx.play('success');
        onJoinFamily(cleanCode);
      }
    } catch (err) {
      setError("Falha na conexão com o Nether.");
      sfx.play('error');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex flex-col items-center justify-center p-4 mc-font">
      <div className="max-w-md w-full space-y-8 animate-in zoom-in duration-500">
        <div className="text-center">
           <h1 className="text-5xl text-gray-400 drop-shadow-[4px_4px_0_#000] uppercase font-black">MINE<span className="text-[#3fff3f]">TASK</span></h1>
           <p className="text-xs text-zinc-500 mt-2 uppercase tracking-widest">Organizador de Missões Épicas</p>
        </div>

        <div className="mc-panel-pixel p-8 space-y-6 bg-[#c6c6c6]">
            <div className="flex items-center gap-3 border-b-4 border-black/10 pb-4">
                <Shield size={24} className="text-[#3fafff]" />
                <h2 className="text-xl text-black font-black uppercase">Entrar no Reino</h2>
            </div>

            <form onSubmit={handleConnect} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-black/60 uppercase">Código do Mundo (SEED)</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="EX: MINE-K4J2"
                            className="flex-grow mc-slot p-4 text-2xl font-black text-black uppercase outline-none focus:bg-white transition-colors"
                        />
                        <button 
                            type="button"
                            onClick={generateSimpleSeed}
                            className="mc-btn-pixel bg-zinc-300 p-4"
                            title="Gerar Novo Código"
                        >
                            <Wand2 size={24} className="text-mc-gold" />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-blue-100 border-l-8 border-blue-500 p-4 animate-in slide-in-from-left">
                        <p className="text-xs font-bold text-blue-800 uppercase">{error}</p>
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={isChecking}
                    className="w-full mc-btn-pixel primary py-6 text-2xl font-black shadow-[0_8px_0_#2baf2b]"
                >
                    {isChecking ? 'SINCRONIZANDO...' : 'ENTRAR'}
                </button>
            </form>
        </div>
        
        <p className="text-[10px] text-center text-zinc-500 uppercase font-bold">
           Dica: Seus pais têm o código no painel deles!
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
