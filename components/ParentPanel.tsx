
import React, { useState } from 'react';
import { Task, TaskStatus, Reward, WorldActivity, TimeOfDay, UserProfile, SystemSettings } from '../types';
import { Eye, Check, Settings, Plus, Trash2, Heart, Shield, Activity, Gift, Scroll, Skull, Zap, X, Coins, Sword, BookOpen, AlertCircle } from 'lucide-react';
import { sfx } from '../services/audio';

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

// Completed ParentPanel component to provide functional UI and fix missing default export
const ParentPanel: React.FC<ParentPanelProps> = ({ 
  tasks, rewards, activities, profile, settings, 
  onAddTask, onDeleteTask, onApproveTask, onRejectTask, 
  onAdjustCurrency, onAddReward, onDeleteReward 
}) => {
  const [activeTab, setActiveTab] = useState<'REVIEW' | 'QUESTS' | 'LOG' | 'ADMIN' | 'GUIDE'>('REVIEW');
  const [inspectingTask, setInspectingTask] = useState<Task | null>(null);

  // Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState<TimeOfDay>(TimeOfDay.MORNING);
  const [comboMode, setComboMode] = useState(false);

  // Admin Custom Value State
  const [adminValue, setAdminValue] = useState<number>(10);
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardCost, setRewardCost] = useState(50);

  const pendingTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);

  const handleAddTask = () => {
      if (!newTaskTitle) return;
      onAddTask({
          title: newTaskTitle, description: '', timeOfDay: newTaskTime,
          points: 50, emeralds: 10, diamonds: 0, steps: [], status: TaskStatus.PENDING
      });
      setNewTaskTitle('');
      sfx.play('pop');
  };

  const handleCreateCombo = () => {
      const comboTasks = ["Escovar Presas", "Arrumar Caixão", "Limpar Capa"];
      comboTasks.forEach(t => {
        onAddTask({
          title: t, description: 'Combo Matinal', timeOfDay: TimeOfDay.MORNING,
          points: 30, emeralds: 5, diamonds: 0, steps: [], status: TaskStatus.PENDING
        });
      });
      sfx.play('levelup');
      setComboMode(false);
  };

  const handleAddReward = () => {
      if (!rewardTitle) return;
      onAddReward({
          title: rewardTitle, cost: rewardCost, currency: 'emerald', icon: '🏆', type: 'real_life'
      });
      setRewardTitle('');
      sfx.play('pop');
  };

  return (
    <div className="w-full text-gray-100">
        {/* DASHBOARD HEADER */}
        <div className="panel-stone p-6 mb-8 border-b-8 border-gray-700">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-900 rounded border-2 border-purple-400 shadow-lg">
                        <Shield size={32} className="text-purple-300" />
                    </div>
                    <div>
                        <h1 className="font-display text-3xl text-purple-300 tracking-wide drop-shadow-md">Controle do Mestre</h1>
                        <p className="text-sm text-gray-400 font-pixel">Mundo: <span className="text-white font-bold">{settings?.familyName}</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-900 px-4 py-2 border-4 border-gray-600 rounded">
                    <Heart size={20} className="text-red-500 fill-current"/> 
                    <span className="font-pixel text-white text-2xl">{profile.hp} HP</span>
                </div>
            </div>
        </div>

        {/* NAVIGATION - Folder Style */}
        <div className="flex gap-1 pl-4 items-end overflow-x-auto">
            {[
                { id: 'REVIEW', label: 'JULGAR', icon: <Check size={18}/>, badge: pendingTasks.length, color: 'bg-green-700' },
                { id: 'QUESTS', label: 'MISSÕES', icon: <Scroll size={18}/>, color: 'bg-blue-700' },
                { id: 'GUIDE', label: 'MANUAL', icon: <BookOpen size={18}/>, color: 'bg-yellow-700' },
                { id: 'LOG', label: 'REGISTROS', icon: <Activity size={18}/>, color: 'bg-gray-600' },
                { id: 'ADMIN', label: 'PERIGO', icon: <Skull size={18}/>, color: 'bg-red-900' }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                        px-6 py-3 rounded-t-lg border-t-4 border-l-4 border-r-4 border-black/20 font-display text-lg flex items-center gap-2 transition-all whitespace-nowrap
                        ${activeTab === tab.id ? `${tab.color} text-white translate-y-1` : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}
                    `}
                >
                    {tab.icon} {tab.label}
                    {tab.badge ? <span className="bg-red-500 text-white text-xs font-bold px-2 rounded-full animate-bounce">{tab.badge}</span> : null}
                </button>
            ))}
        </div>

        {/* CONTENT AREA */}
        <div className={`
            panel-game min-h-[500px] p-6 relative border-t-0 rounded-tl-none
            ${activeTab === 'ADMIN' ? 'bg-[#2a0a0a] border-red-900' : 
              activeTab === 'GUIDE' ? 'bg-[#3e2723] border-[#5d4037]' : 'bg-[#333] border-gray-600'}
        `}>
            
            {/* --- REVIEW TAB --- */}
            {activeTab === 'REVIEW' && (
                <div className="space-y-6">
                    {pendingTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500 opacity-70">
                            <Check size={80} className="mb-4 text-green-500"/>
                            <h3 className="text-3xl font-display text-white">Tudo Tranquilo</h3>
                            <p className="font-pixel">Nenhum herói requisitou aprovação.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pendingTasks.map(task => (
                                <div key={task.id} className="bg-gray-800 border-4 border-yellow-500 rounded-lg overflow-hidden shadow-xl">
                                    <div className="p-3 bg-yellow-600 flex justify-between items-center">
                                        <h3 className="font-display text-white text-xl">{task.title}</h3>
                                        <span className="text-xs font-bold bg-black/30 text-white px-2 py-1 rounded">AGUARDANDO</span>
                                    </div>
                                    
                                    <div className="p-4 bg-black/50 flex items-center justify-center min-h-[250px]">
                                        {task.evidenceUrl ? (
                                            <img 
                                                src={task.evidenceUrl} 
                                                className="max-h-60 max-w-full border-4 border-white cursor-pointer hover:scale-105 transition-transform" 
                                                alt="Prova"
                                                onClick={() => setInspectingTask(task)}
                                            />
                                        ) : (
                                            <span className="text-gray-500 italic font-bold">Sem Foto</span>
                                        )}
                                    </div>

                                    <div className="p-4 flex gap-2 bg-gray-900">
                                        <button onClick={() => onRejectTask(task.id)} className="btn-game btn-danger flex-1">RECUSAR</button>
                                        <button onClick={() => onApproveTask(task.id, 'Awesome!')} className="btn-game btn-primary flex-1">APROVAR</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- QUESTS TAB --- */}
            {activeTab === 'QUESTS' && (
                <div className="space-y-6">
                    <div className="bg-black/30 p-4 rounded border-2 border-gray-500">
                        <h3 className="font-display text-xl mb-4 text-blue-300">Nova Missão</h3>
                        <div className="flex flex-wrap gap-4">
                            <input 
                                className="input-game flex-1 min-w-[200px]" 
                                placeholder="Título da Missão" 
                                value={newTaskTitle} 
                                onChange={e => setNewTaskTitle(e.target.value)} 
                            />
                            <select 
                                className="input-game w-40" 
                                value={newTaskTime} 
                                onChange={e => setNewTaskTime(e.target.value as TimeOfDay)}
                            >
                                <option value={TimeOfDay.MORNING}>Manhã</option>
                                <option value={TimeOfDay.AFTERNOON}>Tarde</option>
                                <option value={TimeOfDay.NIGHT}>Noite</option>
                            </select>
                            <button onClick={handleAddTask} className="btn-game btn-primary">ADICIONAR</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tasks.map(task => (
                            <div key={task.id} className="bg-gray-800 p-3 rounded flex justify-between items-center border border-gray-700">
                                <div>
                                    <p className="font-bold">{task.title}</p>
                                    <p className="text-xs text-gray-500">{task.timeOfDay}</p>
                                </div>
                                <button onClick={() => onDeleteTask(task.id)} className="text-red-500 hover:text-red-400 p-1">
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- GUIDE TAB --- */}
            {activeTab === 'GUIDE' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="text-center mb-8">
                         <h2 className="font-display text-4xl text-yellow-400 mb-2">Manual do Mestre</h2>
                         <p className="text-orange-200">Como guiar seu pequeno herói nesta jornada.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#5d4037] p-5 rounded border-2 border-[#8d6e63] shadow-lg">
                            <h3 className="font-display text-xl text-green-300">Ciclo de Recompensas</h3>
                            <p className="text-sm mt-2">Aprove tarefas concluídas para dar XP e Esmeraldas ao jogador. Use Esmeraldas para comprar blocos ou recompensas reais.</p>
                        </div>
                        <div className="bg-[#5d4037] p-5 rounded border-2 border-[#8d6e63] shadow-lg">
                            <h3 className="font-display text-xl text-red-300">Penalidades</h3>
                            <p className="text-sm mt-2">Você pode remover HP se o jogador não cumprir as missões. Use com sabedoria para manter o desafio!</p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- LOG TAB --- */}
            {activeTab === 'LOG' && (
                <div className="space-y-2">
                    {activities.length === 0 ? (
                        <p className="text-center py-10 text-gray-500 italic">Nenhuma atividade registrada.</p>
                    ) : (
                        activities.map((act, i) => (
                            <div key={act.id || i} className="bg-black/20 p-3 rounded border-l-4 border-blue-500 flex justify-between items-center">
                                <div>
                                    <p className="text-sm">{act.detail}</p>
                                    <p className="text-[10px] text-gray-500">{new Date(act.timestamp).toLocaleString()}</p>
                                </div>
                                {act.amount && (
                                    <span className={`text-xs font-bold ${act.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {act.amount > 0 ? '+' : ''}{act.amount} {act.currency}
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* --- ADMIN TAB --- */}
            {activeTab === 'ADMIN' && (
                <div className="space-y-8">
                    <div className="bg-red-950/40 p-6 rounded border-2 border-red-900">
                         <h3 className="font-display text-2xl text-red-400 mb-6 flex items-center gap-2"><AlertCircle/> Comandos de Crise</h3>
                         
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-gray-400">AJUSTE DE SAÚDE</p>
                                <div className="flex gap-2">
                                    <button onClick={() => onAdjustCurrency(-10, 'HP')} className="btn-game btn-danger flex-1">DANO (-10 HP)</button>
                                    <button onClick={() => onAdjustCurrency(10, 'HP')} className="btn-game btn-primary flex-1">CURA (+10 HP)</button>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-gray-400">AJUSTE DE MOEDAS (ESMERALDAS)</p>
                                <div className="flex gap-2">
                                    <button onClick={() => onAdjustCurrency(-50, 'EMERALD')} className="btn-game bg-red-700 text-white border-red-900 flex-1">-50 🟢</button>
                                    <button onClick={() => onAdjustCurrency(50, 'EMERALD')} className="btn-game bg-green-700 text-white border-green-900 flex-1">+50 🟢</button>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            )}
        </div>

        {/* IMAGE INSPECTOR MODAL */}
        {inspectingTask && (
            <div className="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center p-4" onClick={() => setInspectingTask(null)}>
                <div className="relative max-w-4xl w-full flex flex-col items-center">
                    <img src={inspectingTask.evidenceUrl} className="max-h-[80vh] border-8 border-white shadow-2xl" alt="Prova completa" />
                    <button className="mt-6 btn-game btn-secondary px-10" onClick={() => setInspectingTask(null)}>FECHAR</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default ParentPanel;
