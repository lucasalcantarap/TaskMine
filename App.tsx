
import React, { useState, useEffect } from 'react';
import { useGameController } from './hooks/useGameController';
import WelcomeScreen from './components/WelcomeScreen';
import ChildDashboard from './components/ChildDashboard';
import ParentPanel from './components/ParentPanel';
import { Hammer, ShieldCheck, LogOut, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-biome-morning flex flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="text-white font-hero text-4xl animate-bounce-slow drop-shadow-md">Carregando Mundo...</div>
      <div className="w-64 h-4 bg-white/30 rounded-full overflow-hidden backdrop-blur">
          <div className="h-full bg-white animate-[width_2s_ease-in-out]" style={{width: '100%'}}></div>
      </div>
    </div>
  );

  const handleLogout = () => {
    if(confirm("Deseja sair do servidor?")) {
        localStorage.removeItem('minetask_family_id');
        window.location.reload();
    }
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* HEADER DO JOGO */}
      {view !== 'child' && (
          <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-[100] border-b border-gray-100">
            <div className="flex items-center gap-4">
                {view !== 'selection' && (
                    <button onClick={() => setView('selection')} className="btn-cartoon btn-white w-12 h-12 p-0 rounded-xl">
                        <ArrowLeft size={24}/>
                    </button>
                )}
                <div>
                    <h1 className="font-hero text-gray-700 text-2xl leading-none">
                        {data.settings?.familyName || familyId}
                    </h1>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
            </div>
            <button onClick={handleLogout} className="btn-cartoon btn-red w-12 h-12 p-0 rounded-xl">
                <LogOut size={20}/>
            </button>
          </header>
      )}

      <main className="flex-grow w-full max-w-5xl mx-auto h-full">
        {view === 'selection' && (
          <div className="p-6 flex flex-col items-center justify-center min-h-[80vh] gap-6 bg-biome-morning animate-in fade-in">
             <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl w-full max-w-md text-center border-4 border-white/50">
                 <h2 className="font-hero text-4xl text-sky-500 mb-2">Escolha o Modo</h2>
                 <p className="text-gray-400 font-bold mb-8">Quem está jogando hoje?</p>
                 
                 <div className="flex flex-col gap-4">
                     <button onClick={() => setView('child')} className="btn-cartoon btn-green w-full h-24 text-left flex items-center px-6 group">
                        <div className="bg-white/20 p-3 rounded-2xl mr-4 group-hover:scale-110 transition-transform">
                            <Hammer size={32} />
                        </div>
                        <div>
                            <span className="block text-xl">Aventuras</span>
                            <span className="block text-xs opacity-80 font-body">Para Crianças</span>
                        </div>
                     </button>

                     <button onClick={() => setShowPin(true)} className="btn-cartoon btn-blue w-full h-24 text-left flex items-center px-6 group">
                        <div className="bg-white/20 p-3 rounded-2xl mr-4 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <span className="block text-xl">Controle Mestre</span>
                            <span className="block text-xs opacity-80 font-body">Para Pais</span>
                        </div>
                     </button>
                 </div>
             </div>
          </div>
        )}

        {view === 'child' && profile && (
          <ChildDashboard 
            tasks={data.tasks} profile={profile} rewards={data.rewards}
            onUpdateProfile={actions.updateProfile} onCompleteTask={actions.completeTask}
            onBuyReward={actions.buyReward} onUpdateTask={actions.updateTasks}
          />
        )}

        {view === 'parent' && profile && (
          <ParentPanel 
            tasks={data.tasks} rewards={data.rewards} activities={data.activities}
            profile={profile} settings={data.settings}
            onAddTask={actions.addTask} onDeleteTask={actions.deleteTask}
            onApproveTask={actions.approveTask} onRejectTask={actions.rejectTask}
            onUpdateProfile={actions.updateProfile} onAdjustCurrency={actions.adjustCurrency}
            onAddReward={actions.addReward} onDeleteReward={actions.deleteReward}
            onUpdateSettings={actions.updateSettings}
          />
        )}
      </main>

      {showPin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-white rounded-[32px] p-8 max-w-xs w-full text-center shadow-2xl animate-pop">
              <div className="flex justify-end mb-2">
                <button onClick={() => setShowPin(false)} className="bg-gray-100 w-8 h-8 rounded-full text-gray-500 font-bold hover:bg-red-100 hover:text-red-500">✕</button>
              </div>
              <h2 className="font-hero text-2xl text-gray-700 mb-6">Acesso Restrito</h2>
              
              <div className="flex justify-center gap-3 mb-8">
                 {[0,1,2,3].map(i => (
                    <div key={i} className={`w-4 h-4 rounded-full transition-all ${pinInput.length > i ? 'bg-blue-500 scale-110' : 'bg-gray-200'}`} />
                 ))}
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                 {[1,2,3,4,5,6,7,8,9].map(v => (
                   <button key={v} onClick={() => { handlePinSubmit(v.toString()); sfx.play('click'); }} className="btn-cartoon btn-white h-16 text-xl text-gray-700">{v}</button>
                 ))}
                 <button onClick={() => setPinInput('')} className="btn-cartoon btn-red h-16 flex items-center justify-center">C</button>
                 <button onClick={() => handlePinSubmit('0')} className="btn-cartoon btn-white h-16 text-gray-700">0</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
