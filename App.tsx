
import React, { useState, useEffect } from 'react';
import { useGameController } from './hooks/useGameController';
import WelcomeScreen from './components/WelcomeScreen';
import ChildDashboard from './components/ChildDashboard';
import ParentPanel from './components/ParentPanel';
import { Hammer, ShieldCheck, Lock, Server, Heart, LogOut } from 'lucide-react';
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
    <div className="min-h-screen bg-[#8fd3fe] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-white border-t-[#58bf58] rounded-full animate-spin"></div>
      <p className="font-pixel text-[#3e2723] animate-pulse text-2xl">Carregando Mundo...</p>
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

  const profile = data.profile;
  const hp = profile ? profile.hp : 100;
  const isHeroDead = hp <= 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#8fd3fe] selection:bg-green-300">
      
      {/* Navbar Voxel */}
      <header className="bg-[#333] border-b-4 border-[#111] p-3 flex justify-between items-center sticky top-0 z-[100] shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-[#58bf58] p-2 rounded border-2 border-[#4ca34c] shadow-md">
            <Server size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl text-white tracking-wider leading-none drop-shadow-md">{data.settings?.familyName || familyId}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-3 h-3 rounded border border-black ${isOnline ? 'bg-green-400' : 'bg-red-500'}`}></span>
              <span className="text-[10px] font-bold uppercase text-gray-300 font-pixel">{isOnline ? 'CONECTADO' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            {view !== 'selection' && (
                <button onClick={() => setView('selection')} className="btn-game btn-secondary py-1 px-3 text-sm border-2">MENU</button>
            )}
            <button onClick={handleLogout} className="btn-game btn-danger py-1 px-3 text-sm border-2">
                <LogOut size={16}/>
            </button>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-6 pb-20 max-w-7xl mx-auto w-full">
        {view === 'selection' && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
             <button onClick={() => setView('child')} className="panel-game bg-[#58bf58] p-10 flex flex-col items-center gap-6 hover:translate-y-1 transition-transform group overflow-hidden border-green-800">
                <div className="relative bg-white/20 p-6 rounded-full border-4 border-white shadow-lg backdrop-blur-sm">
                    <Hammer size={56} className="text-white drop-shadow-md" />
                    {isHeroDead && <span className="absolute -top-2 -right-2 text-4xl animate-bounce">💀</span>}
                </div>
                <div className="text-center relative z-10 text-white">
                    <span className="font-display text-4xl block mb-2 drop-shadow-md">ENTRAR NO JOGO</span>
                    <span className="text-green-100 text-lg font-bold font-pixel">Área do Jogador</span>
                </div>
             </button>

             <button onClick={() => setShowPin(true)} className="panel-game bg-[#7d7d7d] p-10 flex flex-col items-center gap-6 hover:translate-y-1 transition-transform group overflow-hidden border-gray-600">
                <div className="relative bg-black/20 p-6 rounded-full border-4 border-gray-400 shadow-lg backdrop-blur-sm">
                    <ShieldCheck size={56} className="text-gray-300 drop-shadow-md" />
                </div>
                <div className="text-center relative z-10 text-white">
                    <span className="font-display text-4xl block mb-2 drop-shadow-md">MESTRE DO JOGO</span>
                    <span className="text-gray-300 text-lg font-bold font-pixel">Área dos Pais</span>
                </div>
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

      <footer className="p-4 text-center border-t-4 border-[#4ca34c] bg-[#58bf58]">
         <p className="text-lg font-display text-white flex items-center justify-center gap-2 tracking-wider drop-shadow-sm">
            Feito com amor por <Heart size={20} className="text-red-500 fill-current animate-bounce" /> Lucas
         </p>
      </footer>

      {showPin && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="panel-game p-8 max-w-sm w-full text-center bg-[#333] border-gray-600">
              <div className="mx-auto bg-gray-700 w-16 h-16 rounded flex items-center justify-center mb-6 text-gray-300 border-2 border-gray-500 shadow-inner">
                  <Lock size={32} />
              </div>
              <h2 className="font-display text-3xl text-white mb-6">Acesso Restrito</h2>
              
              <div className="flex justify-center gap-4 mb-8">
                 {[0,1,2,3].map(i => (<div key={i} className={`w-4 h-4 rounded-sm transition-all duration-300 ${pinInput.length > i ? 'bg-green-500 scale-125 shadow-[0_0_10px_#58bf58]' : 'bg-gray-600 border border-gray-500'}`} />))}
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
                    className={`h-16 rounded border-b-4 font-display text-2xl transition-all active:border-b-0 active:translate-y-1 ${typeof v === 'number' ? 'bg-gray-200 border-gray-400 text-gray-800' : 'bg-red-500 border-red-800 text-white'}`}
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
