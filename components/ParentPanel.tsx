
import React, { useState } from 'react';
import { Task, TaskStatus, Reward, WorldActivity, TimeOfDay, UserProfile, SystemSettings } from '../types';
import { Eye, Trash2, Check, X, Skull, Ghost, Zap, Settings, PlusCircle, Save, Clock, ListChecks, ArrowLeft } from 'lucide-react';
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

const ParentPanel: React.FC<ParentPanelProps> = ({ 
  tasks, profile, settings, onAddTask, onDeleteTask, onApproveTask, onRejectTask, onAdjustCurrency, onUpdateSettings
}) => {
  const [activeTab, setActiveTab] = useState<'MONITOR' | 'QUESTS' | 'SYSTEM'>('MONITOR');
  
  // Criador de Quest
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPeriod, setNewTaskPeriod] = useState<TimeOfDay>(TimeOfDay.MORNING);
  const [newTaskXP, setNewTaskXP] = useState(50);
  const [newTaskEmeralds, setNewTaskEmeralds] = useState(10);

  // Configs
  const [editServerName, setEditServerName] = useState(settings?.familyName || '');
  const [editPin, setEditPin] = useState(settings?.parentPin || '');

  const pendingTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
  const activeTasks = tasks.filter(t => t.status === TaskStatus.DOING || t.status === TaskStatus.STARTED);

  const handleCreateTask = () => {
    if (!newTaskTitle) return;
    onAddTask({
        title: newTaskTitle,
        description: '',
        timeOfDay: newTaskPeriod,
        points: newTaskXP,
        emeralds: newTaskEmeralds,
        diamonds: 0,
        steps: [{ id: '1', text: newTaskTitle, completed: false }],
        status: TaskStatus.PENDING
    });
    setNewTaskTitle('');
    setShowTaskModal(false);
    sfx.play('pop');
  };

  const handleSaveSettings = () => {
    if (onUpdateSettings && settings) {
        if (editPin.length < 4) {
            alert("O PIN deve ter 4 números.");
            return;
        }
        onUpdateSettings(editPin, editServerName, settings.rules);
        sfx.play('success');
        alert("Salvo!");
    }
  };

  return (
    <div className="pb-20 bg-[#e0e0e0] min-h-screen">
         {/* HEADER ADMIN */}
         <div className="bg-[#263238] p-4 shadow-lg sticky top-0 z-40">
            <div className="flex justify-between items-center max-w-5xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg shadow-inner">
                        <Settings size={20} className="text-white animate-spin-slow"/>
                    </div>
                    <div>
                        <h2 className="font-game text-xs text-blue-200 tracking-widest">SERVER ADMIN</h2>
                        <h1 className="font-pixel text-xl text-white font-bold">{settings?.familyName || 'Mundo'}</h1>
                    </div>
                </div>
                <div className="bg-black/30 px-3 py-1 rounded border border-white/10 text-white font-pixel">
                    PIN: ****
                </div>
            </div>
         </div>

         <div className="max-w-5xl mx-auto p-4">
            
            {/* MENU DE ABAS */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                    { id: 'MONITOR', icon: <Eye size={18}/>, label: 'MONITORAMENTO', alert: pendingTasks.length },
                    { id: 'QUESTS', icon: <ListChecks size={18}/>, label: 'MISSÕES', alert: 0 },
                    { id: 'SYSTEM', icon: <Settings size={18}/>, label: 'SISTEMA', alert: 0 }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            flex items-center gap-2 px-6 py-3 rounded-lg font-game text-[10px] transition-all whitespace-nowrap
                            ${activeTab === tab.id 
                                ? 'bg-blue-600 text-white shadow-lg translate-y-0' 
                                : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50 translate-y-1'}
                        `}
                    >
                        {tab.icon} {tab.label}
                        {tab.alert > 0 && <span className="bg-red-500 text-white px-2 rounded-full">{tab.alert}</span>}
                    </button>
                ))}
            </div>

            {/* CONTEÚDO */}
            <div className="bg-white rounded-xl shadow-xl border-2 border-gray-200 overflow-hidden min-h-[60vh]">
                
                {/* --- MONITOR --- */}
                {activeTab === 'MONITOR' && (
                    <div className="p-6 space-y-8">
                        {/* Status em Tempo Real */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h3 className="font-game text-[10px] text-blue-800 mb-3 flex items-center gap-2">
                                    <Clock size={14}/> EM ATIVIDADE ({activeTasks.length})
                                </h3>
                                {activeTasks.length === 0 ? <p className="text-sm text-gray-400">Nenhuma missão iniciada.</p> : (
                                    <ul className="space-y-2">
                                        {activeTasks.map(t => (
                                            <li key={t.id} className="flex justify-between text-sm bg-white p-2 rounded shadow-sm">
                                                <span>{t.title}</span>
                                                <span className="text-blue-500 font-bold">...</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                <h3 className="font-game text-[10px] text-yellow-800 mb-3 flex items-center gap-2">
                                    <Eye size={14}/> PENDENTE APROVAÇÃO ({pendingTasks.length})
                                </h3>
                                {pendingTasks.length === 0 ? <p className="text-sm text-gray-400">Tudo verificado.</p> : (
                                    <div className="space-y-4">
                                        {pendingTasks.map(t => (
                                            <div key={t.id} className="bg-white p-3 rounded shadow-md border border-gray-200">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold">{t.title}</span>
                                                    <span className="text-xs bg-gray-200 px-2 rounded">{t.timeOfDay}</span>
                                                </div>
                                                {t.evidenceUrl && (
                                                    <div className="h-32 bg-gray-100 mb-2 rounded overflow-hidden flex items-center justify-center">
                                                        <img src={t.evidenceUrl} className="h-full object-cover"/>
                                                    </div>
                                                )}
                                                <div className="flex gap-2 mt-2">
                                                    <button onClick={() => onRejectTask(t.id)} className="flex-1 bg-red-100 text-red-700 py-2 rounded hover:bg-red-200 text-xs font-bold">RECUSAR</button>
                                                    <button onClick={() => onApproveTask(t.id, 'Ok')} className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 text-xs font-bold shadow">APROVAR (+{t.points}XP)</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ações Rápidas de Admin */}
                        <div className="border-t pt-6">
                            <h3 className="font-game text-[10px] text-gray-500 mb-4">COMANDOS DO MESTRE</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <button onClick={() => onAdjustCurrency(100, 'HP')} className="p-3 bg-green-100 text-green-800 rounded hover:bg-green-200 flex flex-col items-center gap-1">
                                    <Check size={20}/> <span className="text-xs font-bold">CURAR TUDO</span>
                                </button>
                                <button onClick={() => onAdjustCurrency(-10, 'HP')} className="p-3 bg-red-100 text-red-800 rounded hover:bg-red-200 flex flex-col items-center gap-1">
                                    <Skull size={20}/> <span className="text-xs font-bold">DANO (-10HP)</span>
                                </button>
                                <button onClick={() => onAdjustCurrency(50, 'XP')} className="p-3 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 flex flex-col items-center gap-1">
                                    <Zap size={20}/> <span className="text-xs font-bold">XP BÔNUS</span>
                                </button>
                                <button onClick={() => onAdjustCurrency(-10, 'XP')} className="p-3 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 flex flex-col items-center gap-1">
                                    <Ghost size={20}/> <span className="text-xs font-bold">REMOVER XP</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- QUESTS --- */}
                {activeTab === 'QUESTS' && (
                    <div className="p-6">
                        <button 
                            onClick={() => setShowTaskModal(true)}
                            className="w-full py-4 border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-xl mb-6 flex items-center justify-center gap-2 font-bold"
                        >
                            <PlusCircle/> Adicionar Nova Missão
                        </button>

                        <div className="space-y-2">
                            {tasks.map(t => (
                                <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-10 rounded-full ${t.timeOfDay === TimeOfDay.MORNING ? 'bg-blue-400' : t.timeOfDay === TimeOfDay.AFTERNOON ? 'bg-orange-400' : 'bg-purple-800'}`}></div>
                                        <div>
                                            <p className="font-bold text-gray-800">{t.title}</p>
                                            <p className="text-xs text-gray-500">{t.points} XP • {t.emeralds} Coins</p>
                                        </div>
                                    </div>
                                    <button onClick={() => onDeleteTask(t.id)} className="text-red-400 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- SYSTEM --- */}
                {activeTab === 'SYSTEM' && (
                    <div className="p-6 max-w-lg mx-auto">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Nome da Família</label>
                                <input 
                                    value={editServerName} 
                                    onChange={e => setEditServerName(e.target.value)}
                                    className="w-full p-2 border rounded font-pixel text-lg"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">PIN de Segurança</label>
                                <input 
                                    type="text"
                                    maxLength={4}
                                    value={editPin} 
                                    onChange={e => setEditPin(e.target.value.replace(/\D/g,''))}
                                    className="w-full p-2 border rounded font-pixel text-lg tracking-[0.5em]"
                                />
                            </div>
                            <button onClick={handleSaveSettings} className="w-full bg-blue-600 text-white py-3 rounded font-bold shadow hover:bg-blue-700">
                                SALVAR CONFIGURAÇÕES
                            </button>
                        </div>
                    </div>
                )}

            </div>
         </div>

         {/* MODAL CRIAR QUEST */}
         {showTaskModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                    <h3 className="font-game text-xs mb-4">NOVA MISSÃO</h3>
                    
                    <div className="space-y-3">
                        <input 
                            placeholder="Título (ex: Arrumar Cama)" 
                            value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                        <select 
                            value={newTaskPeriod} onChange={e => setNewTaskPeriod(e.target.value as TimeOfDay)}
                            className="w-full p-2 border rounded"
                        >
                            <option value={TimeOfDay.MORNING}>Manhã</option>
                            <option value={TimeOfDay.AFTERNOON}>Tarde</option>
                            <option value={TimeOfDay.NIGHT}>Noite</option>
                        </select>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-xs text-gray-500">XP</label>
                                <input type="number" value={newTaskXP} onChange={e => setNewTaskXP(Number(e.target.value))} className="w-full p-2 border rounded"/>
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500">Esmeraldas</label>
                                <input type="number" value={newTaskEmeralds} onChange={e => setNewTaskEmeralds(Number(e.target.value))} className="w-full p-2 border rounded"/>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                        <button onClick={() => setShowTaskModal(false)} className="flex-1 py-2 border rounded hover:bg-gray-50">Cancelar</button>
                        <button onClick={handleCreateTask} className="flex-1 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">CRIAR</button>
                    </div>
                </div>
            </div>
         )}
    </div>
  );
};

export default ParentPanel;
