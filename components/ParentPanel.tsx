
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
      const tasks = ["Escovar Presas", "Arrumar Caixão", "Limpar Capa"];
      tasks.forEach(t => {
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

            {/* --- GUIDE TAB (Manual do Pai) --- */}
            {activeTab === 'GUIDE' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="text-center mb-8">
                         <h2 className="font-display text-4xl text-yellow-400 mb-2">Manual do Mestre</h2>
                         <p className="text-orange-200">Como guiar seu pequeno herói nesta jornada.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Card 1: Ciclo */}
                        <div className="bg-[#5d4037] p-5 rounded border-2 border-[#8d6e63] shadow-lg">
                            <h3 className="font-display text-xl text-green-300 mb-3 flex items-center gap-2"><BookOpen size={20}/> O Ciclo do Jogo</h3>
                            <ul className="text-sm space-y-2 text-gray-200 list-disc list-inside font-medium">
                                <li>Você cria as <strong>Missões</strong> na aba "Missões".</li>
                                <li>A criança visualiza e marca como feita tirando uma <strong>Foto</strong>.</li>
                                <li>A tarefa fica "Em Revisão". O XP só é entregue quando você <strong>Aprovar</strong> na aba "Julgar".</li>
                                <li>Se a foto estiver ruim, você pode <strong>Recusar</strong> para que ela tente de novo.</li>
                            </ul>
                        </div>

                        {/* Card 2: Economia */}
                        <div className="bg-[#5d4037] p-5 rounded border-2 border-[#8d6e63] shadow-lg">
                            <h3 className="font-display text-xl text-yellow-300 mb-3 flex items-center gap-2"><Coins size={20}/> Economia & Níveis</h3>
                            <ul className="text-sm space-y-2 text-gray-200 list-disc list-inside font-medium">
                                <li><strong>XP:</strong> Sobe o nível e muda o avatar (Camiseta -> Armadura).</li>
                                <li><strong>Esmeraldas (Verde):</strong> Moeda comum. Ganha ao completar tarefas. Usada para comprar blocos de construção.</li>
                                <li><strong>Diamantes (Azul):</strong> Moeda rara. Dê apenas em tarefas difíceis. Usada para comprar prêmios reais (ex: TV).</li>
                            </ul>
                        </div>

                        {/* Card 3: Criativo */}
                        <div className="bg-[#5d4037] p-5 rounded border-2 border-[#8d6e63] shadow-lg">
                            <h3 className="font-display text-xl text-blue-300 mb-3 flex items-center gap-2"><Gift size={20}/> O Modo Construtor</h3>
                            <p className="text-sm text-gray-200 mb-2 font-medium">
                                A criança usa as Esmeraldas ganhas para comprar <strong>Blocos</strong> na Loja.
                                No "Grimório de Arte" (botão de paleta no painel dela), ela pode pintar e criar o próprio mundo pixelado.
                                Incentive isso! É a maior motivação do app.
                            </p>
                        </div>

                        {/* Card 4: Saúde */}
                        <div className="bg-[#5d4037] p-5 rounded border-2 border-[#8d6e63] shadow-lg">
                            <h3 className="font-display text-xl text-red-300 mb-3 flex items-center gap-2"><Heart size={20}/> Sistema de Vida (HP)</h3>
                            <p className="text-sm text-gray-200 mb-2 font-medium">
                                O HP (Corações) é visual. Se chegar a zero, não há "Game Over" real, mas serve como indicador comportamental.
                                Você pode retirar HP na aba "Perigo" caso regras da casa sejam quebradas, mas use com moderação para não desmotivar.
                            </p>
                        </div>
                    </div>

                    <div className="bg-black/30 p-4 rounded border border-yellow-500/30 text-center">
                        <p className="text-yellow-200 italic font-pixel text-sm">
                            "A constância é a chave. Tente aprovar as tarefas todos os dias para manter o 'Streak' e a motivação altos!"
                        </p>
                    </div>
                </div>
            )}

            {/* --- LOG TAB --- */}
            {activeTab === 'LOG' && (
                <div className="bg-gray-900 border-4 border-gray-600 rounded-lg p-4 font-mono text-sm h-[600px] overflow-y-auto">
                    {activities.map((act, i) => (
                        <div key={i} className="flex gap-4 p-2 border-b border-gray-700 text-gray-300 hover:bg-white/5">
                            <span className="text-gray-500 w-16 text-right">{new Date(act.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span className={`font-bold ${act.type.includes('APPROVED') ? 'text-green-400' : 'text-blue-400'}`}>[{act.type}]</span>
                            <span>{act.detail}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* --- QUESTS TAB --- */}
            {activeTab === 'QUESTS' && (
                <div className="space-y-8">
                    {/* Creator Tool */}
                    <div className="bg-gray-800 p-6 border-4 border-blue-500 rounded-lg shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-display text-2xl text-blue-300">Nova Missão</h3>
                            <button onClick={() => setComboMode(!comboMode)} className={`text-xs px-3 py-2 border-2 font-bold transition-all rounded ${comboMode ? 'bg-yellow-500 text-black border-yellow-700' : 'bg-gray-700 text-gray-400 border-gray-500'}`}>
                                <Zap size={14} className="inline mr-1"/> MODO COMBO
                            </button>
                        </div>
                        
                        {comboMode ? (
                             <div className="p-6 bg-blue-900/30 border-2 border-dashed border-blue-500 text-center rounded">
                                 <p className="text-blue-300 text-sm mb-4 font-bold">Cria várias tarefas padrão de uma vez.</p>
                                 <button onClick={handleCreateCombo} className="btn-game btn-gold w-full">
                                     GERAR COMBO "ROTINA MATINAL"
                                 </button>
                             </div>
                        ) : (
                            <div className="flex flex-col md:flex-row gap-4">
                                <input 
                                    className="input-game flex-grow"
                                    placeholder="Ex: Arrumar a Cama..."
                                    value={newTaskTitle}
                                    onChange={e => setNewTaskTitle(e.target.value)}
                                />
                                <select 
                                    className="input-game md:w-48 cursor-pointer"
                                    value={newTaskTime}
                                    onChange={e => setNewTaskTime(e.target.value as TimeOfDay)}
                                >
                                    <option value="Manhã">☀️ Manhã</option>
                                    <option value="Tarde">🌤️ Tarde</option>
                                    <option value="Noite">🌙 Noite</option>
                                </select>
                                <button onClick={handleAddTask} className="btn-game btn-primary px-6">
                                    <Plus size={24}/>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* List */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 pl-2">Missões Ativas</h3>
                        {tasks.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-3 bg-gray-800 border-2 border-gray-600 rounded hover:bg-gray-700 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 flex items-center justify-center font-bold border-2 rounded ${t.status === 'Aprovada' ? 'bg-green-800 border-green-500' : 'bg-gray-900 border-gray-700'}`}>
                                        {t.status === 'Aprovada' ? <Check size={20}/> : t.title.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold font-display text-lg">{t.title}</h4>
                                        <p className="text-xs text-gray-400 font-pixel uppercase">{t.points} XP • {t.timeOfDay}</p>
                                    </div>
                                </div>
                                <button onClick={() => onDeleteTask(t.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-900/20 transition-colors rounded"><Trash2 size={20}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- ADMIN TAB (DANGER ZONE) --- */}
            {activeTab === 'ADMIN' && (
                <div className="p-4 space-y-8">
                    <div className="bg-red-950/50 p-6 border-4 border-red-600 rounded-lg relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 opacity-10">
                            <Skull size={200} className="text-red-500"/>
                        </div>

                        <h3 className="text-red-400 font-display text-3xl mb-6 flex items-center gap-2">
                            <Sword size={32}/> Zona de Manipulação
                        </h3>
                        
                        <div className="flex flex-col gap-6 relative z-10">
                            <div className="flex flex-col gap-2">
                                <label className="text-red-300 text-sm font-bold uppercase font-pixel">Valor a Aplicar</label>
                                <input 
                                    type="number" 
                                    className="input-game text-4xl text-center bg-black border-red-800 text-red-500"
                                    value={adminValue}
                                    onChange={(e) => setAdminValue(Number(e.target.value))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => onAdjustCurrency(adminValue, 'XP')} className="btn-game bg-green-900 border-green-600 text-green-300">
                                    + XP
                                </button>
                                <button onClick={() => onAdjustCurrency(adminValue, 'EMERALD')} className="btn-game bg-emerald-900 border-emerald-600 text-emerald-300">
                                    + GEMAS
                                </button>
                                <button onClick={() => onAdjustCurrency(-adminValue, 'HP')} className="btn-game btn-danger border-red-800">
                                    CAUSAR DANO (HP)
                                </button>
                                <button onClick={() => onAdjustCurrency(adminValue, 'HP')} className="btn-game bg-pink-900 border-pink-600 text-pink-300">
                                    CURAR (HP)
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Reward Creator in Danger Zone to consolidate */}
                    <div className="bg-gray-800 p-6 border-4 border-gray-600 rounded-lg">
                        <h3 className="font-display text-white text-xl mb-4">Criar Recompensa Manual</h3>
                        <div className="flex gap-2">
                             <input 
                                className="input-game flex-grow text-sm" 
                                placeholder="Título (ex: Cinema)"
                                value={rewardTitle}
                                onChange={e => setRewardTitle(e.target.value)}
                             />
                             <input 
                                type="number"
                                className="input-game w-24 text-sm" 
                                placeholder="Custo"
                                value={rewardCost}
                                onChange={e => setRewardCost(Number(e.target.value))}
                             />
                             <button onClick={handleAddReward} className="btn-game btn-secondary py-1 text-sm">CRIAR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* FULLSCREEN MODAL */}
        {inspectingTask && (
            <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-6 backdrop-blur-md">
                <div className="w-full max-w-4xl flex flex-col items-center">
                    <div className="relative w-full aspect-video bg-black border-4 border-white mb-8 shadow-2xl">
                         <img src={inspectingTask.evidenceUrl} className="w-full h-full object-contain" alt="Evidência Full"/>
                         <button onClick={() => setInspectingTask(null)} className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full border-2 border-white"><X/></button>
                    </div>
                    
                    <div className="flex gap-4 w-full max-w-md">
                         <button onClick={() => { onRejectTask(inspectingTask.id); setInspectingTask(null); }} className="btn-game btn-danger flex-1 py-4 text-xl">
                            RECUSAR
                         </button>
                         <button onClick={() => { onApproveTask(inspectingTask.id, 'Boa!'); setInspectingTask(null); }} className="btn-game btn-primary flex-1 py-4 text-xl">
                            APROVAR
                         </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ParentPanel;
