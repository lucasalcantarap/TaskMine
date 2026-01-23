
import React, { useState, useEffect } from 'react';
import { useGameController } from './hooks/useGameController';
import WelcomeScreen from './components/WelcomeScreen';
import ChildDashboard from './components/ChildDashboard';
import ParentPanel from './components/ParentPanel';
import { Hammer, ShieldCheck, Lock, Server, Heart } from 'lucide-react';
import { sfx } from './services/audio';

const App: React.FC = () => {
  const [familyId, setFamilyId] = useState<string | null>(localStorage.getItem('minetask_family_id'));
  const { isReady, data, actions } = useGameController(familyId);
  const [view, setView] = useState<'selection' | 'child' | 'parent'>('selection');
  const [showPin, setShowPin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!familyId) {
    return <WelcomeScreen onJoinFamily={(code) => {
      localStorage.setItem('minetask_family_id', code);
      setFamilyId(code);
    }} />;
  }

  if (!isReady) return (
    <div className="min-h-screen bg-[#0c0c0d] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mc-font text-emerald-500 animate-pulse uppercase tracking-widest">Sincronizando Reino...</p>
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem('minetask_family_id');
    window.location.reload();
  };

  const handlePinSubmit = (val: string) => {
    const nextPin = pinInput + val;
    if (nextPin === data.settings?.parentPin) {
      setView('parent'); setShowPin(false); setPinInput(''); sfx.play('success');
    } else if (nextPin.length >= 4) {
      setPinInput(''); sfx.play('error');
    } else {
      setPinInput(nextPin);
    }
  };

  // Safe accessors para evitar erros de build TS18048
  const profile = data.profile;
  const hp = profile ? profile.hp : 100;
  const isHeroDead = hp <= 0;
  const isLowSensory = profile ? profile.sensoryMode === 'low_sensory' : false;

  return (
    <div className={`min-h-screen flex flex-col bg-[#0c0c0d] ${isLowSensory ? 'sensory-low' : ''}`}>
      <header className="bg-zinc-900/90 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-[100]">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/30">
            <Server size={18} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="font-black text-[10px] tracking-widest text-white uppercase">{data.settings?.familyName || familyId}</h1>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`}></span>
              <span className="text-[8px] font-black uppercase text-zinc-500">{isOnline ? 'Servidor Ativo' : 'Offline'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setView('selection')} className="mc-btn-pixel text-[10px] px-4">MODO</button>
            <button onClick={handleLogout} className="mc-btn-pixel danger text-[10px] px-4">SAIR</button>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8 pb-16">
        {view === 'selection' && (
          <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
             <button onClick={() => setView('child')} className="mc-panel-pixel p-12 flex flex-col items-center gap-8 hover:-translate-y-2 transition-all bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 group">
                <div className="relative">
                    <Hammer size={64} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                    {isHeroDead && <span className="absolute -top-4 -right-4 text-4xl">💀</span>}
                </div>
                <span className="mc-font text-2xl uppercase font-black text-white">Entrar como Herói</span>
             </button>
             <button onClick={() => setShowPin(true)} className="mc-panel-pixel p-12 flex flex-col items-center gap-8 hover:-translate-y-2 transition-all bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20 group">
                <ShieldCheck size={64} className="text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="mc-font text-2xl uppercase font-black text-white">Mestre (Pais)</span>
             </button>
          </div>
        )}

        {view === 'child' && profile && (
          <ChildDashboard 
            tasks={data.tasks} 
            profile={profile} 
            rewards={data.rewards}
            onUpdateProfile={actions.updateProfile}
            onCompleteTask={actions.completeTask}
            onBuyReward={actions.buyReward}
            onUpdateTask={actions.updateTasks}
          />
        )}

        {view === 'parent' && profile && (
          <ParentPanel 
            tasks={data.tasks} 
            rewards={data.rewards} 
            activities={data.activities}
            profile={profile}
            settings={data.settings}
            onAddTask={actions.addTask}
            onDeleteTask={actions.deleteTask}
            onApproveTask={actions.approveTask}
            onRejectTask={actions.rejectTask}
            onUpdateProfile={actions.updateProfile}
            onAdjustCurrency={actions.adjustCurrency}
            onAddReward={actions.addReward}
            onDeleteReward={actions.deleteReward}
            onUpdateSettings={actions.updateSettings}
          />
        )}
      </main>

      <footer className="p-4 bg-black/40 text-center border-t border-white/5">
         <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest flex items-center justify-center gap-1">
            MineTask v4.1 • Feito com <Heart size={8} className="text-red-500 fill-current" /> por Lucas
         </p>
      </footer>

      {showPin && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-6 backdrop-blur-sm">
           <div className="mc-panel-pixel p-10 max-w-sm w-full text-center bg-[#c6c6c6]">
              <Lock className="text-blue-600 mx-auto mb-6" size={32} />
              <h2 className="mc-font text-xl text-black mb-8 font-black">PIN DE ACESSO</h2>
              <div className="flex justify-center gap-4 mb-8">
                 {[0,1,2,3].map(i => (<div key={i} className={`w-4 h-4 rounded-full border-2 border-black/20 ${pinInput.length > i ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-400'}`} />))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                 {[1,2,3,4,5,6,7,8,9,'C',0,'X'].map(v => (
                   <button 
                    key={v} 
                    onClick={() => {
                        if (v === 'X') setShowPin(false);
                        else if (v === 'C') setPinInput('');
                        else handlePinSubmit(v.toString());
                        sfx.play('click');
                    }} 
                    className="h-14 mc-btn-pixel bg-zinc-100 text-black text-2xl font-black"
                   >{v}</button>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
