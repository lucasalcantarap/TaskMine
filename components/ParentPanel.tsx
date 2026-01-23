
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

const ParentPanel: React.FC<ParentPanelProps> = ({ 
  tasks, rewards, activities, profile, settings, 
  onAddTask, onDeleteTask, onApproveTask, onRejectTask, 
  onAdjustCurrency, onAddReward, onDeleteReward 
}) => {
  const [activeTab, setActiveTab] = useState<'REVIEW' | 'QUESTS' | 'LOG' | 'ADMIN' | 'GUIDE'>('REVIEW');
  const [inspectingTask, setInspectingTask] = useState<Task | null>(null);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState<TimeOfDay>(TimeOfDay.MORNING);
  
  const pendingTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);

  const handleAddTask = () => {
      if (!newTaskTitle) return;
      onAddTask({
          title: newTaskTitle, description: '', timeOfDay: newTaskTime,
          points: 50, emeralds: 5, diamonds: 0, steps: [], status: TaskStatus.PENDING
      });
      setNewTaskTitle('');
      sfx.play('pop');
  };

  return (
    <div className="w-full text-gray-100 max-w-6xl mx-auto">
        {/* HEADER PAINEL DOS PAIS */}
        <div className="bg-gray-800 p-6 mb-8 rounded-xl border-4 border-gray-700 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-600 rounded-lg border-4 border-indigo-900 shadow-lg">
                        <Shield size={40} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-display text-4xl text-white drop-shadow-md">Painel dos Pais</h1>
                        <p className="text-indigo-300 font-black text-sm uppercase">Gerenciar Mundo: {settings?.familyName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-black/40 px-6 py-3 border-4 border-gray-700 rounded-lg">
                    <div className="text-center">
                        <p className="text-[10px] text-gray-400 font-black uppercase">Vida da Criança</p>
                        <div className="flex gap-1 justify-center mt-1">
                            {[...Array(5)].map((_,i) => (
                                <Heart key={i} size={20} className={i < Math.ceil(profile.hp/20) ? "fill-red-500 text-red-700" : "fill-gray-800"} />
                            ))}
                        </div>
                    </div>
                    <div className="h-10 w-px bg-gray-700 mx-2"></div>
                    <div className="text-center">
                        <p className="text-[10px] text-gray-400 font-black uppercase">Nível Atual</p>
                        <p className="font-display text-2xl text-yellow-400">{profile.level}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* NAVEGAÇÃO */}
        <div className="flex gap-2 mb-1 overflow-x-auto pb-2">
            {[
                { id: 'REVIEW', label: 'Conferir', icon: <Check size={20}/>, badge: pendingTasks.length, color: 'bg-green-600' },
                { id: 'QUESTS', label: 'Tarefas', icon: <Scroll size={20}/>, color: 'bg-blue-600' },
                { id: 'GUIDE', label: 'Instruções', icon: <BookOpen size={20}/>, color: 'bg-yellow-600' },
                { id: 'LOG', label: 'Histórico', icon: <Activity size={20}/>, color: 'bg-gray-600' },
                { id: 'ADMIN', label: 'Ajustes', icon: <Skull size={20}/>, color: 'bg-red-700' }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); sfx.play('click'); }}
                    className={`
                        px-6 py-3 rounded-t-lg font-display text-xl flex items-center gap-3 transition-all whitespace-nowrap border-4 border-b-0
                        ${activeTab === tab.id ? `${tab.color} text-white border-black/20` : 'bg-gray-800 text-gray-500 border-transparent'}
                    `}
                >
                    {tab.icon} {tab.label}
                    {tab.badge ? <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">{tab.badge}</span> : null}
                </button>
            ))}
        </div>

        {/* ÁREA DE CONTEÚDO */}
        <div className="bg-gray-800 border-4 border-gray-700 p-6 rounded-b-xl min-h-[500px] shadow-inner">
            
            {activeTab === 'REVIEW' && (
                <div className="space-y-6">
                    {pendingTasks.length === 0 ? (
                        <div className="text-center py-24 opacity-50">
                            <Check size={80} className="mx-auto text-green-500 mb-6"/>
                            <h3 className="text-3xl font-display text-white">Nenhuma tarefa pendente</h3>
                            <p className="font-bold text-gray-400">As fotos que a criança tirar aparecerão aqui para sua aprovação.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {pendingTasks.map(task => (
                                <div key={task.id} className="bg-gray-900 border-4 border-yellow-500 rounded-xl overflow-hidden shadow-2xl">
                                    <div className="p-4 bg-yellow-600 flex justify-between items-center">
                                        <h3 className="font-display text-2xl text-white">{task.title}</h3>
                                        <span className="text-xs font-black bg-black/40 text-white px-3 py-1 rounded-full uppercase">Esperando</span>
                                    </div>
                                    <div className="p-4 flex items-center justify-center bg-black min-h-[300px]">
                                        <img 
                                            src={task.evidenceUrl} 
                                            className="max-h-72 border-4 border-white shadow-lg cursor-zoom-in" 
                                            alt="Prova da tarefa"
                                            onClick={() => setInspectingTask(task)}
                                        />
                                    </div>
                                    <div className="p-4 flex gap-4 bg-gray-900">
                                        <button onClick={() => onRejectTask(task.id)} className="btn-game btn-danger flex-1 text-lg">RECUSAR</button>
                                        <button onClick={() => onApproveTask(task.id, 'Muito bem!')} className="btn-game btn-primary flex-1 text-lg">APROVAR</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'QUESTS' && (
                <div className="space-y-8">
                    <div className="bg-gray-700 p-6 rounded-xl border-4 border-blue-600 shadow-xl">
                        <h3 className="font-display text-3xl text-blue-300 mb-6">Criar Nova Tarefa</h3>
                        <div className="flex flex-col md:flex-row gap-4">
                            <input 
                                className="input-game flex-grow text-xl" 
                                placeholder="Ex: Arrumar o quarto" 
                                value={newTaskTitle} 
                                onChange={e => setNewTaskTitle(e.target.value)} 
                            />
                            <select 
                                className="input-game md:w-48 font-black" 
                                value={newTaskTime} 
                                onChange={e => setNewTaskTime(e.target.value as TimeOfDay)}
                            >
                                <option value={TimeOfDay.MORNING}>Manhã</option>
                                <option value={TimeOfDay.AFTERNOON}>Tarde</option>
                                <option value={TimeOfDay.NIGHT}>Noite</option>
                            </select>
                            <button onClick={handleAddTask} className="btn-game btn-primary px-8">CRIAR</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tasks.map(task => (
                            <div key={task.id} className="bg-gray-900 p-4 rounded-lg flex justify-between items-center border-4 border-gray-700 group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 flex items-center justify-center font-display text-2xl rounded-md border-4 ${task.status === TaskStatus.APPROVED ? 'bg-green-600 border-green-900' : 'bg-gray-800 border-gray-700'}`}>
                                        {task.status === TaskStatus.APPROVED ? <Check/> : task.title.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-black text-white text-lg">{task.title}</p>
                                        <p className="text-xs text-blue-400 font-bold uppercase">{task.timeOfDay} • {task.points} Exp</p>
                                    </div>
                                </div>
                                <button onClick={() => onDeleteTask(task.id)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'GUIDE' && (
                <div className="max-w-4xl mx-auto space-y-12 py-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="text-center">
                        <h2 className="font-display text-5xl text-yellow-400 mb-4">Como o Jogo Funciona</h2>
                        <p className="text-gray-300 text-lg font-bold">Guia rápido para começar a usar o MineTask com seu filho.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-700 p-6 rounded-xl border-t-8 border-blue-500 shadow-xl">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center font-display text-2xl text-white mb-4">1</div>
                            <h3 className="font-display text-2xl text-white mb-3">Crie Tarefas</h3>
                            <p className="text-sm text-gray-300 leading-relaxed font-bold">Adicione tarefas na aba <strong>"Tarefas"</strong>. Elas aparecerão para a criança nos períodos de Manhã, Tarde ou Noite.</p>
                        </div>
                        <div className="bg-gray-700 p-6 rounded-xl border-t-8 border-yellow-500 shadow-xl">
                            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center font-display text-2xl text-white mb-4">2</div>
                            <h3 className="font-display text-2xl text-white mb-3">Conferir Fotos</h3>
                            <p className="text-sm text-gray-300 leading-relaxed font-bold">A criança tira uma foto provando que fez a tarefa. Você confere e aprova na aba <strong>"Conferir"</strong>.</p>
                        </div>
                        <div className="bg-gray-700 p-6 rounded-xl border-t-8 border-green-500 shadow-xl">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center font-display text-2xl text-white mb-4">3</div>
                            <h3 className="font-display text-2xl text-white mb-3">Premiação</h3>
                            <p className="text-sm text-gray-300 leading-relaxed font-bold">Ao aprovar, a criança ganha <strong>Moedas</strong>. Ela usa as moedas para comprar itens ou construir o mundo dela.</p>
                        </div>
                    </div>

                    <div className="bg-blue-900/30 p-8 rounded-xl border-4 border-blue-500/50">
                        <h3 className="font-display text-2xl text-blue-300 mb-4 flex items-center gap-3"><AlertCircle/> Dica Importante</h3>
                        <p className="text-blue-100 font-bold leading-relaxed">
                            O jogo é focado no reforço positivo. Sempre tente dar um feedback carinhoso para seu filho. 
                            O sistema de "Vida" (HP) serve apenas para mostrar quando rotinas estão sendo deixadas de lado por muito tempo.
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'LOG' && (
                <div className="space-y-3">
                    <h3 className="text-gray-400 font-black text-xs uppercase mb-4 tracking-widest">Atividades Recentes</h3>
                    {activities.length === 0 ? (
                        <p className="text-center py-12 text-gray-500 italic font-bold">Nenhum registro encontrado.</p>
                    ) : (
                        activities.map((act, i) => (
                            <div key={i} className="bg-black/30 p-4 rounded-lg flex justify-between items-center border border-gray-700">
                                <div>
                                    <p className="text-white font-bold">{act.detail}</p>
                                    <p className="text-[10px] text-gray-500 font-black uppercase">{new Date(act.timestamp).toLocaleString()}</p>
                                </div>
                                <span className={`font-display text-xl ${act.amount && act.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {act.amount && `${act.amount > 0 ? '+' : ''}${act.amount}`}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'ADMIN' && (
                <div className="space-y-8">
                    <div className="bg-red-900/20 p-8 rounded-xl border-4 border-red-600 shadow-xl">
                         <h3 className="font-display text-3xl text-red-500 mb-6 flex items-center gap-3"><Sword/> Painel de Controle Crítico</h3>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <p className="text-sm font-black text-red-300 uppercase tracking-widest">Vida e Saúde</p>
                                <div className="flex gap-4">
                                    <button onClick={() => onAdjustCurrency(-20, 'HP')} className="btn-game btn-danger flex-1 py-4">Tirar Vida (-20)</button>
                                    <button onClick={() => onAdjustCurrency(20, 'HP')} className="btn-game bg-green-700 text-white border-green-900 flex-1 py-4">Dar Vida (+20)</button>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-sm font-black text-green-300 uppercase tracking-widest">Bônus de Moedas</p>
                                <div className="flex gap-4">
                                    <button onClick={() => onAdjustCurrency(50, 'EMERALD')} className="btn-game bg-green-600 text-white border-green-900 flex-1 py-4">Bônus +50 🟢</button>
                                    <button onClick={() => onAdjustCurrency(10, 'DIAMOND')} className="btn-game bg-cyan-600 text-white border-cyan-900 flex-1 py-4">Bônus +10 💎</button>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            )}
        </div>

        {/* MODAL DE INSPEÇÃO DE IMAGEM */}
        {inspectingTask && (
            <div className="fixed inset-0 bg-black/95 z-[300] flex flex-col items-center justify-center p-6" onClick={() => setInspectingTask(null)}>
                <div className="relative max-w-5xl w-full flex flex-col items-center">
                    <img src={inspectingTask.evidenceUrl} className="max-h-[85vh] border-8 border-white shadow-2xl rounded-lg" alt="Imagem completa" />
                    <div className="mt-8 flex gap-6 w-full max-w-md">
                        <button onClick={(e) => { e.stopPropagation(); onRejectTask(inspectingTask.id); setInspectingTask(null); }} className="btn-game btn-danger flex-1 py-5 text-2xl">RECUSAR</button>
                        <button onClick={(e) => { e.stopPropagation(); onApproveTask(inspectingTask.id, 'Ótimo trabalho!'); setInspectingTask(null); }} className="btn-game btn-primary flex-1 py-5 text-2xl">APROVAR</button>
                    </div>
                    <button className="absolute top-0 right-0 p-4 text-white hover:text-red-500 transition-colors" onClick={() => setInspectingTask(null)}><X size={48}/></button>
                </div>
            </div>
        )}
    </div>
  );
};

export default ParentPanel;
