
import React, { useState } from 'react';
import { Task, TaskStatus, Reward, WorldActivity, TimeOfDay, UserProfile, SystemSettings } from '../types';
import { Eye, Check, Settings, Plus, Trash2, Heart, Shield, Activity, Gift, Scroll, Skull, Zap } from 'lucide-react';
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
  tasks, rewards, activities, profile, settings, 
  onAddTask, onDeleteTask, onApproveTask, onRejectTask, 
  onAdjustCurrency, onAddReward, onDeleteReward 
}) => {
  const [activeTab, setActiveTab] = useState<'REVIEW' | 'QUESTS' | 'LOG' | 'ADMIN'>('REVIEW');
  const [inspectingTask, setInspectingTask] = useState<Task | null>(null);

  // Forms
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState<TimeOfDay>(TimeOfDay.MORNING);
  const [comboMode, setComboMode] = useState(false);

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
      // Exemplo de combo pré-definido (em uma versão completa, seria dinâmico)
      const tasks = ["Escovar Dentes", "Arrumar Cama", "Pentear Cabelo"];
      tasks.forEach(t => {
        onAddTask({
          title: t, description: 'Combo Matinal', timeOfDay: TimeOfDay.MORNING,
          points: 30, emeralds: 5, diamonds: 0, steps: [], status: TaskStatus.PENDING
        });
      });
      sfx.play('levelup');
      setComboMode(false);
  };

  return (
    <div className="min-h-screen bg-[#111] pb-20 text-gray-300 font-pixel">
        {/* HEADER DUNGEON MASTER */}
        <div className="bg-[#222] border-b-4 border-black p-4 sticky top-0 z-40 shadow-lg">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-[#444] p-2 border-2 border-black shadow-inner">
                        <Shield size={24} className="text-gray-200" />
                    </div>
                    <div>
                        <h1 className="text-xl text-shadow text-white uppercase">Dungeon Master</h1>
                        <p className="text-xs text-gold">{settings?.familyName || 'Servidor'}</p>
                    </div>
                </div>
                <div className="flex gap-2 bg-black/50 p-2 border border-gray-700">
                    <Heart size={16} className="text-red-600 fill-current"/> <span className="text-white">{profile.hp} HP</span>
                </div>
            </div>
        </div>

        {/* NAVEGAÇÃO */}
        <div className="max-w-5xl mx-auto px-4 mt-6 mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { id: 'REVIEW', label: 'Aprovações', icon: <Check size={18}/>, badge: pendingTasks.length },
                    { id: 'QUESTS', label: 'Quests', icon: <Scroll size={18}/> },
                    { id: 'LOG', label: 'Histórico', icon: <Activity size={18}/> },
                    { id: 'ADMIN', label: 'Console', icon: <Settings size={18}/> }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 border-2 transition-all min-w-[120px]
                            ${activeTab === tab.id ? 'bg-[#333] border-gray-400 text-white' : 'bg-[#1a1a1a] border-black hover:bg-[#222]'}
                        `}
                    >
                        {tab.icon} {tab.label}
                        {tab.badge ? <span className="bg-red-600 text-white text-xs px-1.5 border border-white animate-pulse">{tab.badge}</span> : null}
                    </button>
                ))}
            </div>
        </div>

        {/* CONTEÚDO */}
        <div className="max-w-5xl mx-auto px-4">
            
            {/* ABA: REVIEW (APROVAÇÃO COM FOTO) */}
            {activeTab === 'REVIEW' && (
                <div className="space-y-6">
                    {pendingTasks.length === 0 ? (
                        <div className="dungeon-panel bg-[#1a1a1a] p-12 text-center opacity-50 flex flex-col items-center">
                            <Check size={48} className="text-green-800 mb-4"/>
                            <h3 className="text-xl">Nenhuma evidência pendente.</h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pendingTasks.map(task => (
                                <div key={task.id} className="dungeon-panel bg-[#222] flex flex-col">
                                    <div className="p-3 bg-[#333] border-b-2 border-black flex justify-between items-center">
                                        <h3 className="text-lg text-white text-shadow">{task.title}</h3>
                                        <span className="text-xs bg-yellow-900 text-yellow-200 px-2 border border-yellow-700">REVISAR</span>
                                    </div>
                                    
                                    <div className="p-4 flex-grow flex items-center justify-center bg-black/40 min-h-[250px]">
                                        {task.evidenceUrl ? (
                                            <div className="relative w-full h-64 border-2 border-gray-700 cursor-pointer group" onClick={() => setInspectingTask(task)}>
                                                <img src={task.evidenceUrl} className="w-full h-full object-contain bg-black" alt="Prova"/>
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <Eye className="text-white" size={32}/>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-600">Sem Imagem</div>
                                        )}
                                    </div>

                                    <div className="p-3 flex gap-2">
                                        <button onClick={() => onRejectTask(task.id)} className="flex-1 dungeon-btn bg-red-900 py-3 text-sm hover:bg-red-800">
                                            RECUSAR
                                        </button>
                                        <button onClick={() => onApproveTask(task.id, 'Boa!')} className="flex-[2] dungeon-btn bg-green-900 py-3 text-lg hover:bg-green-800">
                                            ACEITAR
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ABA: LOG (ACTIVITY STREAM) */}
            {activeTab === 'LOG' && (
                <div className="dungeon-panel bg-[#111] p-4 max-h-[70vh] overflow-y-auto">
                    <h3 className="text-gray-500 border-b border-gray-800 pb-2 mb-4 uppercase text-xs font-bold">Registro do Servidor</h3>
                    <div className="space-y-2">
                        {activities.map((act, i) => (
                            <div key={i} className="flex items-start gap-3 p-2 border-b border-gray-800 hover:bg-[#1a1a1a]">
                                <div className={`mt-1 w-2 h-2 rounded-full ${act.type.includes('APPROVED') ? 'bg-green-500' : act.type.includes('FAILED') ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                <div>
                                    <p className="text-sm text-gray-300 leading-tight">
                                        <span className="text-white font-bold">{act.user}</span>: {act.detail}
                                    </p>
                                    <span className="text-[10px] text-gray-600">
                                        {new Date(act.timestamp).toLocaleTimeString()} • {act.type}
                                    </span>
                                </div>
                                {act.amount && (
                                    <div className="ml-auto text-xs font-bold text-gold border border-gray-700 px-1 bg-black">
                                        {act.amount} {act.currency}
                                    </div>
                                )}
                            </div>
                        ))}
                        {activities.length === 0 && <p className="text-center text-gray-600 py-4">Nenhuma atividade registrada.</p>}
                    </div>
                </div>
            )}

            {/* ABA: QUESTS (CRIAÇÃO) */}
            {activeTab === 'QUESTS' && (
                <div className="space-y-6">
                    <div className="dungeon-panel p-4 bg-[#222]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white text-shadow">Criar Nova Missão</h3>
                            <button onClick={() => setComboMode(!comboMode)} className={`dungeon-btn px-3 py-1 text-xs ${comboMode ? 'btn-gold' : 'btn-stone'}`}>
                                <Zap size={12} className="mr-1"/> {comboMode ? 'Modo Combo Ativo' : 'Ativar Combo'}
                            </button>
                        </div>
                        
                        {comboMode ? (
                             <div className="p-4 bg-black/30 border border-gold text-center">
                                 <p className="text-gold text-sm mb-4">Combos geram múltiplas tarefas de uma vez com recompensas maiores.</p>
                                 <button onClick={handleCreateCombo} className="dungeon-btn btn-gold w-full py-3">
                                     GERAR COMBO "ROTINA MATINAL" (3 Tarefas)
                                 </button>
                             </div>
                        ) : (
                            <div className="flex flex-col md:flex-row gap-3">
                                <input 
                                    className="dungeon-input flex-grow"
                                    placeholder="Título da Missão..."
                                    value={newTaskTitle}
                                    onChange={e => setNewTaskTitle(e.target.value)}
                                />
                                <select 
                                    className="dungeon-input cursor-pointer"
                                    value={newTaskTime}
                                    onChange={e => setNewTaskTime(e.target.value as TimeOfDay)}
                                >
                                    <option value="Manhã">Manhã</option>
                                    <option value="Tarde">Tarde</option>
                                    <option value="Noite">Noite</option>
                                </select>
                                <button onClick={handleAddTask} className="dungeon-btn btn-stone px-6">
                                    <Plus/>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        {tasks.map(t => (
                            <div key={t.id} className="bg-[#1a1a1a] border border-gray-700 p-3 flex justify-between items-center hover:border-gray-500">
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 flex items-center justify-center text-[10px] border border-gray-600 ${t.status === 'Aprovada' ? 'bg-green-900' : 'bg-black'}`}>
                                        {t.status === 'Aprovada' ? '✓' : ''}
                                    </div>
                                    <div>
                                        <h4 className="text-gray-200">{t.title}</h4>
                                        <p className="text-[10px] text-gray-500">{t.points} XP • {t.timeOfDay}</p>
                                    </div>
                                </div>
                                <button onClick={() => onDeleteTask(t.id)} className="text-red-900 hover:text-red-500"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ABA: ADMIN (CONSOLE) */}
            {activeTab === 'ADMIN' && (
                <div className="dungeon-panel p-6 space-y-6 bg-[#222]">
                    <h3 className="text-red-500 uppercase text-sm border-b border-red-900 pb-2 mb-4">Zona de Perigo (Admin)</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => onAdjustCurrency(50, 'XP')} className="dungeon-btn btn-stone py-3 text-sm text-green-400 border-green-900">+50 XP</button>
                        <button onClick={() => onAdjustCurrency(10, 'EMERALD')} className="dungeon-btn btn-stone py-3 text-sm text-green-400 border-green-900">+10 Gems</button>
                        <button onClick={() => onAdjustCurrency(-10, 'HP')} className="dungeon-btn bg-red-950 py-3 text-sm text-red-500 border-red-900 flex justify-center gap-2"><Skull size={16}/> Dano (-10 HP)</button>
                        <button onClick={() => onAdjustCurrency(100, 'HP')} className="dungeon-btn bg-blue-950 py-3 text-sm text-blue-400 border-blue-900">Curar Total</button>
                    </div>
                </div>
            )}
        </div>

        {/* MODAL FULL SCREEN */}
        {inspectingTask && (
            <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col justify-center p-4">
                <button onClick={() => setInspectingTask(null)} className="absolute top-4 right-4 text-white border border-white p-2 hover:bg-white hover:text-black">FECHAR X</button>
                <img src={inspectingTask.evidenceUrl} className="max-h-[70vh] object-contain border-4 border-white bg-[#111]" alt="Evidência Full"/>
                <div className="mt-8 flex justify-center gap-4 w-full max-w-md mx-auto">
                     <button onClick={() => { onRejectTask(inspectingTask.id); setInspectingTask(null); }} className="flex-1 dungeon-btn bg-red-800 py-4">RECUSAR PROVA</button>
                     <button onClick={() => { onApproveTask(inspectingTask.id, 'Boa!'); setInspectingTask(null); }} className="flex-1 dungeon-btn btn-gold py-4">VALIDAR (+XP)</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default ParentPanel;
