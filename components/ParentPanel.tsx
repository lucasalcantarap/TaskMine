
import React, { useState } from 'react';
import { Task, TaskStatus, Reward, WorldActivity, TimeOfDay, UserProfile, SystemSettings } from '../types';
import { 
  Eye, Trash2, Check, Settings, Plus, X, Zap, Heart, 
  Activity, ShoppingBag, Search, AlertTriangle, Camera, Star, Layers, Shield
} from 'lucide-react';
import { sfx } from '../services/audio';
import { GameEngine } from '../services/game-logic';

interface ParentPanelProps {
  tasks: Task[];
  rewards: Reward[];
  activities: WorldActivity[];
  profile: UserProfile;
  settings?: SystemSettings | null;
  onAddTask: (t: any) => void;
  onDeleteTask: (id: string) => void;
  onApproveTask: (id: string, feedback: string) => void;
  onRejectTask: (id: string) => void;
  onUpdateProfile: (p: any) => void;
  onAdjustCurrency: (amount: number, type: 'XP' | 'EMERALD' | 'DIAMOND' | 'HP') => void;
  onAddReward: (r: any) => void;
  onDeleteReward: (id: string) => void;
  onUpdateSettings?: (pin: string, name: string, rules: any) => void;
}

const TASK_COMBOS = [
  { id: 'MORNING_ROUTINE', name: 'Kit Matinal', tasks: ['Arrumar Cama', 'Escovar Dentes', 'Café da Manhã'], time: TimeOfDay.MORNING, icon: '☀️' },
  { id: 'HOMEWORK', name: 'Kit Estudos', tasks: ['Dever de Casa', 'Leitura XP', 'Organizar Bau'], time: TimeOfDay.AFTERNOON, icon: '📚' },
  { id: 'NIGHT_ROUTINE', name: 'Kit Noturno', tasks: ['Banho', 'Escovar Dentes', 'Pijamas'], time: TimeOfDay.NIGHT, icon: '🌙' },
  { id: 'CLEANING', name: 'Kit Limpeza', tasks: ['Guardar Loot', 'Roupa Suja'], time: TimeOfDay.AFTERNOON, icon: '🧹' }
];

const ParentPanel: React.FC<ParentPanelProps> = ({ 
  tasks, rewards, activities, profile, settings, 
  onAddTask, onDeleteTask, onApproveTask, onRejectTask, 
  onAdjustCurrency, onAddReward, onDeleteReward, onUpdateSettings
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'MISSIONS' | 'SHOP' | 'SETTINGS'>('DASHBOARD');
  
  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [inspectingTask, setInspectingTask] = useState<Task | null>(null);
  const [taskMode, setTaskMode] = useState<'SINGLE' | 'COMBO'>('SINGLE');

  // Forms
  const [newTask, setNewTask] = useState({ title: '', time: TimeOfDay.MORNING as TimeOfDay });
  const [newReward, setNewReward] = useState({ title: '', cost: 10, icon: '🎁', currency: 'emerald' as 'emerald' | 'diamond' });
  const [settingsForm, setSettingsForm] = useState({ name: settings?.familyName || '', pin: settings?.parentPin || '' });

  const avatarData = GameEngine.getAvatarForLevel(profile.level);
  const pendingTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);

  const DEFAULT_REWARD = { points: 50, emeralds: 10, diamonds: 0 };

  const handleCreateTask = () => {
    if (!newTask.title) return;
    onAddTask({
        title: newTask.title, description: '', timeOfDay: newTask.time,
        ...DEFAULT_REWARD, steps: [], status: TaskStatus.PENDING
    });
    setNewTask({ ...newTask, title: '' });
    setShowTaskModal(false);
    sfx.play('pop');
  };

  const handleCreateCombo = (comboIndex: number) => {
    const combo = TASK_COMBOS[comboIndex];
    combo.tasks.forEach(title => {
        onAddTask({
            title: title, description: 'Parte do combo: ' + combo.name, timeOfDay: combo.time,
            ...DEFAULT_REWARD, steps: [], status: TaskStatus.PENDING
        });
    });
    setShowTaskModal(false);
    sfx.play('levelup');
  };

  const handleCreateReward = () => {
    if (!newReward.title) return;
    onAddReward({
        title: newReward.title, cost: Number(newReward.cost), icon: newReward.icon,
        currency: newReward.currency, type: 'real_life', description: 'Recompensa customizada'
    });
    setNewReward({ title: '', cost: 10, icon: '🎁', currency: 'emerald' });
    setShowRewardModal(false);
    sfx.play('pop');
  };

  return (
    <div className="min-h-screen bg-[#121212] pb-24 text-white font-body">
         
         {/* Top Bar Admin */}
         <div className="bg-[#212121] px-4 py-3 border-b-4 border-black sticky top-0 z-40 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#7e7e7e] border-2 border-white flex items-center justify-center">
                    <Shield size={24} className="text-white"/>
                </div>
                <div>
                    <h2 className="font-game text-xl leading-none text-[#50e4e8] mc-shadow-text">MESTRE DA GUILDA</h2>
                    <span className="text-[10px] font-bold text-[#aaa] uppercase tracking-widest">Server Admin</span>
                </div>
            </div>
         </div>

         {/* Navigation Tabs (Creative Mode Style) */}
         <div className="w-full px-2 mt-4">
            <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2">
                {[
                    { id: 'DASHBOARD', icon: Activity, label: 'STATUS' },
                    { id: 'MISSIONS', icon: Zap, label: 'QUESTS' },
                    { id: 'SHOP', icon: ShoppingBag, label: 'LOJA' },
                    { id: 'SETTINGS', icon: Settings, label: 'CONFIG' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            flex-1 min-w-[80px] py-2 flex flex-col items-center justify-center gap-1 font-game text-lg border-t-2 border-l-2 border-r-2 relative
                            ${activeTab === tab.id ? 'bg-[#c6c6c6] text-[#212121] border-white z-10' : 'bg-[#555] text-[#aaa] border-[#333] hover:bg-[#666]'}
                        `}
                    >
                        <tab.icon size={20}/>
                        {tab.label}
                        {tab.id === 'DASHBOARD' && pendingTasks.length > 0 && (
                            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 border border-white animate-pulse"/>
                        )}
                    </button>
                ))}
            </div>
            {/* Main Panel Background */}
            <div className="bg-[#c6c6c6] border-4 border-black p-4 min-h-[70vh] text-[#212121]">
            
                {/* === DASHBOARD TAB === */}
                {activeTab === 'DASHBOARD' && (
                    <div className="grid gap-4 animate-in fade-in">
                        
                        {/* Status Card */}
                        <div className="bg-[#8b8b8b] border-2 border-black p-4 flex gap-4 shadow-inner">
                            <div className="w-16 h-16 bg-[#212121] border-2 border-white shrink-0">
                                <img src={avatarData.image} alt={avatarData.name} className="w-full h-full object-cover"/>
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-game text-xl text-white drop-shadow-md">{profile.name} <span className="text-yellow-300">Lvl {profile.level}</span></h3>
                                
                                {/* HP Controls */}
                                <div className="flex items-center gap-2 mt-2">
                                    <Heart size={16} className="text-red-600 fill-red-600"/>
                                    <div className="flex-grow h-3 bg-black border border-white/50 relative">
                                        <div className="h-full bg-red-600" style={{width: `${(profile.hp/profile.maxHp)*100}%`}}/>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => onAdjustCurrency(-10, 'HP')} className="w-6 h-6 bg-red-800 text-white border border-black font-game text-lg leading-none">-</button>
                                        <button onClick={() => onAdjustCurrency(10, 'HP')} className="w-6 h-6 bg-green-700 text-white border border-black font-game text-lg leading-none">+</button>
                                    </div>
                                </div>

                                {/* XP Controls */}
                                <div className="flex items-center gap-2 mt-2">
                                    <Star size={16} className="text-green-600 fill-green-600"/>
                                    <div className="flex-grow h-3 bg-black border border-white/50 relative">
                                        <div className="h-full bg-green-600" style={{width: '50%'}}/>
                                    </div>
                                    <button onClick={() => onAdjustCurrency(50, 'XP')} className="w-6 h-6 bg-yellow-600 text-white border border-black font-game text-xs flex items-center justify-center">XP</button>
                                </div>
                            </div>
                        </div>

                        {/* Pending Reviews */}
                        <div className="bg-[#8b8b8b] border-2 border-black p-4 min-h-[100px]">
                            <h3 className="font-game text-lg text-white mb-2 flex items-center gap-2">
                               <AlertTriangle size={20} className="text-yellow-300"/>
                               PROVAS DE VALOR ({pendingTasks.length})
                            </h3>
                            
                            {pendingTasks.length === 0 ? (
                                <p className="text-[#555] font-game text-center italic">NENHUMA EVIDÊNCIA PENDENTE.</p>
                            ) : (
                                <div className="space-y-2">
                                    {pendingTasks.map(t => (
                                        <div key={t.id} className="bg-[#c6c6c6] border border-black p-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {t.evidenceUrl ? (
                                                    <div className="w-8 h-8 border border-black bg-black cursor-pointer" onClick={() => setInspectingTask(t)}>
                                                        <img src={t.evidenceUrl} className="w-full h-full object-cover"/>
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 border border-black bg-black flex items-center justify-center text-white"><Eye size={16}/></div>
                                                )}
                                                <span className="font-game text-lg truncate w-32">{t.title}</span>
                                            </div>
                                            <button onClick={() => setInspectingTask(t)} className="mc-button mc-btn-green text-xs py-1 px-3">
                                                AVALIAR
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* === MISSIONS TAB === */}
                {activeTab === 'MISSIONS' && (
                    <div className="animate-in fade-in">
                        <button onClick={() => setShowTaskModal(true)} className="mc-button mc-btn-diamond w-full mb-4">
                            <Plus size={20}/> CRIAR NOVA QUEST
                        </button>

                        <div className="space-y-2">
                            {tasks.map(t => (
                                <div key={t.id} className="bg-[#8b8b8b] border-2 border-black p-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 flex items-center justify-center border border-black text-xl bg-[#555]`}>
                                            {t.timeOfDay === 'Manhã' ? '☀️' : t.timeOfDay === 'Tarde' ? '⚔️' : '🌙'}
                                        </div>
                                        <div>
                                            <h4 className="font-game text-xl leading-none text-white">{t.title}</h4>
                                            <span className="text-xs font-bold text-[#333] uppercase">{t.timeOfDay} • {t.points} XP</span>
                                        </div>
                                    </div>
                                    <button onClick={() => { if(confirm('Destruir Quest?')) onDeleteTask(t.id); }} className="text-[#555] hover:text-red-600">
                                        <Trash2 size={20}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* === SHOP TAB === */}
                {activeTab === 'SHOP' && (
                    <div className="animate-in fade-in">
                        <button onClick={() => setShowRewardModal(true)} className="mc-button mc-btn-green w-full mb-4">
                            <Plus size={20}/> ADICIONAR LOOT
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                            {rewards.map(r => (
                                <div key={r.id} className="bg-[#8b8b8b] border-2 border-black p-2 flex flex-col items-center relative">
                                    <button onClick={() => onDeleteReward(r.id)} className="absolute top-1 right-1 text-[#333] hover:text-red-600"><Trash2 size={16}/></button>
                                    <div className="text-3xl mb-1 drop-shadow-md">{r.icon}</div>
                                    <h4 className="font-game text-lg text-white leading-none text-center truncate w-full">{r.title}</h4>
                                    <div className={`mt-1 px-1 text-xs font-bold text-white border border-black/50 ${r.currency === 'diamond' ? 'bg-[#50e4e8] text-[#004d40]' : 'bg-[#5f9e30]'}`}>
                                        {r.cost} {r.currency === 'diamond' ? 'DIA' : 'GEM'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
         </div>

         {/* === MODAL CREATE TASK === */}
         {showTaskModal && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                <div className="mc-panel w-full max-w-sm">
                    <div className="bg-[#212121] text-white p-2 text-center border-b-2 border-white/10">
                        <h3 className="font-game text-xl">EDITOR DE QUESTS</h3>
                    </div>
                    
                    <div className="p-4 bg-[#c6c6c6] space-y-4">
                         <div className="flex gap-2">
                             <button onClick={() => setTaskMode('SINGLE')} className={`flex-1 mc-button text-sm ${taskMode === 'SINGLE' ? 'mc-btn-green' : 'mc-btn-stone'}`}>ÚNICA</button>
                             <button onClick={() => setTaskMode('COMBO')} className={`flex-1 mc-button text-sm ${taskMode === 'COMBO' ? 'mc-btn-diamond' : 'mc-btn-stone'}`}>COMBO</button>
                         </div>

                         {taskMode === 'SINGLE' ? (
                            <>
                                <input className="mc-input w-full text-black bg-white" placeholder="Nome da Quest" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} autoFocus />
                                <div className="grid grid-cols-3 gap-1">
                                    {['Manhã', 'Tarde', 'Noite'].map((t) => (
                                        <button key={t} onClick={() => setNewTask({...newTask, time: t as TimeOfDay})} className={`py-2 text-xs font-bold border-2 border-black ${newTask.time === t ? 'bg-[#50e4e8] text-black' : 'bg-[#7e7e7e] text-white'}`}>{t}</button>
                                    ))}
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => setShowTaskModal(false)} className="mc-button mc-btn-red flex-1">X</button>
                                    <button onClick={handleCreateTask} className="mc-button mc-btn-green flex-[2]">CRIAR</button>
                                </div>
                            </>
                         ) : (
                             <div className="space-y-2">
                                {TASK_COMBOS.map((combo, idx) => (
                                    <button key={combo.id} onClick={() => handleCreateCombo(idx)} className="w-full bg-[#8b8b8b] border-2 border-black p-2 flex items-center gap-2 hover:bg-[#a0a0a0]">
                                        <span className="text-2xl">{combo.icon}</span>
                                        <div className="text-left">
                                            <h4 className="font-game text-white text-lg">{combo.name}</h4>
                                            <p className="text-[10px] text-[#333] font-bold uppercase">{combo.tasks.length} QUESTS</p>
                                        </div>
                                    </button>
                                ))}
                                <button onClick={() => setShowTaskModal(false)} className="mc-button mc-btn-red w-full mt-2">CANCELAR</button>
                             </div>
                         )}
                    </div>
                </div>
            </div>
         )}

         {/* === MODAL INSPECT EVIDENCE === */}
         {inspectingTask && (
             <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col p-4">
                <div className="flex justify-between items-center text-white mb-4">
                    <h3 className="font-game text-2xl truncate">{inspectingTask.title}</h3>
                    <button onClick={() => setInspectingTask(null)} className="mc-button mc-btn-red py-1 px-3">X</button>
                </div>
                
                <div className="flex-grow flex items-center justify-center border-4 border-[#555] bg-[#111] relative">
                    {inspectingTask.evidenceUrl ? (
                        <img src={inspectingTask.evidenceUrl} className="max-w-full max-h-full object-contain pixelated"/>
                    ) : (
                        <p className="text-[#555] font-game">SEM IMAGEM</p>
                    )}
                </div>

                <div className="mt-4 flex gap-4">
                    <button onClick={() => { onRejectTask(inspectingTask.id); setInspectingTask(null); }} className="flex-1 mc-button mc-btn-red">
                        RECUSAR
                    </button>
                    <button onClick={() => { onApproveTask(inspectingTask.id, "GG!"); setInspectingTask(null); }} className="flex-[2] mc-button mc-btn-green">
                        ACEITAR
                    </button>
                </div>
             </div>
         )}

    </div>
  );
};

export default ParentPanel;
