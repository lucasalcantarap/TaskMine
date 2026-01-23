
import React, { useState } from 'react';
import { Task, TaskStatus, Reward, WorldActivity, TimeOfDay, UserProfile } from '../types';
import { Camera, CheckCircle, XCircle, Trash2, History, ShieldAlert, LayoutGrid, Gem, Settings, Eye, EyeOff, Plus, ChevronRight, Coins, X, Heart, Sparkles } from 'lucide-react';
import { sfx } from '../services/audio';

interface ParentPanelProps {
  tasks: Task[];
  rewards: Reward[];
  activities: WorldActivity[];
  profile: UserProfile;
  onAddTask: (t: any) => void;
  onDeleteTask: (id: string) => void;
  onApproveTask: (id: string, feedback: string) => void;
  onRejectTask: (id: string) => void;
  onUpdateProfile: (p: any) => void;
  onAdjustCurrency: (amount: number, type: 'XP' | 'EMERALD' | 'DIAMOND' | 'HP') => void;
  onAddReward: (r: any) => void;
  onDeleteReward: (id: string) => void;
}

const ParentPanel: React.FC<ParentPanelProps> = ({ 
  tasks, rewards, activities, profile, onAddTask, onDeleteTask, onApproveTask, onRejectTask, onUpdateProfile, onAdjustCurrency, onAddReward, onDeleteReward 
}) => {
  const [tab, setTab] = useState<'REVIEW' | 'TASKS' | 'STORE' | 'LOGS' | 'SETTINGS'>('REVIEW');
  const [showNewTask, setShowNewTask] = useState(false);
  
  const [manualAmount, setManualAmount] = useState<number>(0);
  const [manualType, setManualType] = useState<'XP' | 'EMERALD' | 'DIAMOND' | 'HP'>('EMERALD');

  const [newTask, setNewTask] = useState({
    title: '',
    timeOfDay: TimeOfDay.MORNING,
    emeralds: 15,
    diamonds: 0,
    steps: [] as string[],
    currentStep: ''
  });

  const pending = tasks.filter(t => t.status === TaskStatus.COMPLETED);

  const handleCreateTask = () => {
    if (!newTask.title || newTask.steps.length === 0) return;
    onAddTask({
      title: newTask.title,
      description: '',
      timeOfDay: newTask.timeOfDay,
      points: 50,
      emeralds: newTask.emeralds,
      diamonds: newTask.diamonds,
      steps: newTask.steps.map(s => ({ id: Math.random().toString(), text: s, completed: false })),
      durationMinutes: 15
    });
    setNewTask({ title: '', timeOfDay: TimeOfDay.MORNING, emeralds: 15, diamonds: 0, steps: [], currentStep: '' });
    setShowNewTask(false);
    sfx.play('success');
  };

  const applyManualAdjustment = (isPenalty: boolean) => {
    const amount = isPenalty ? -Math.abs(manualAmount) : Math.abs(manualAmount);
    if (amount === 0) return;
    onAdjustCurrency(amount, manualType);
    setManualAmount(0);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 mc-font">
      {/* HUD MONITORAMENTO DO MUNDO */}
      <div className="mc-panel-pixel bg-[#1a1a1c] border-white/5 p-6 flex flex-col md:flex-row justify-between items-center text-white gap-4">
         <div className="flex items-center gap-4">
            <div className="w-14 h-14 mc-slot bg-zinc-800 border-white/10 flex items-center justify-center">
               <span className="text-3xl">{profile.hp <= 0 ? '💀' : '🛡️'}</span>
            </div>
            <div>
               <h3 className="font-black uppercase text-mc-diamond">Console do Mestre <span className="text-[8px] text-zinc-500 block">Herói: {profile.name}</span></h3>
               <div className="flex gap-4 mt-1 items-center">
                  <div className="flex items-center gap-1"><Heart size={10} className="text-mc-red"/> <span className="text-[10px] font-black">{profile.hp}/100</span></div>
                  <div className="flex items-center gap-1"><Sparkles size={10} className="text-emerald-500"/> <span className="text-[10px] font-black">LVL {profile.level}</span></div>
                  <div className="flex items-center gap-1 text-mc-green"><span className="text-[10px] font-black">◆ {profile.emeralds}</span></div>
                  <div className="flex items-center gap-1 text-mc-blue"><span className="text-[10px] font-black">💎 {profile.diamonds}</span></div>
               </div>
            </div>
         </div>
         
         <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/10">
            <select 
                value={manualType} 
                onChange={(e) => setManualType(e.target.value as any)}
                className="bg-zinc-800 text-[10px] font-black p-2 border-none outline-none text-white mc-font"
            >
                <option value="EMERALD">ESMERALDAS (◆)</option>
                <option value="DIAMOND">DIAMANTES (💎)</option>
                <option value="XP">EXPERIÊNCIA (XP)</option>
                <option value="HP">VIDA (HP)</option>
            </select>
            <input 
                type="number" 
                value={manualAmount || ''} 
                onChange={(e) => setManualAmount(Number(e.target.value))}
                placeholder="VALOR"
                className="w-20 bg-zinc-900 p-2 text-center text-sm font-black text-white mc-slot border-none"
            />
            <div className="flex gap-1">
                <button onClick={() => applyManualAdjustment(true)} className="bg-red-600 hover:bg-red-500 p-2 mc-btn-pixel border-none text-[10px] font-black">-</button>
                <button onClick={() => applyManualAdjustment(false)} className="bg-emerald-600 hover:bg-emerald-500 p-2 mc-btn-pixel border-none text-[10px] font-black">+</button>
            </div>
         </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'REVIEW', icon: Camera, label: 'Aprovações', count: pending.length },
          { id: 'TASKS', icon: LayoutGrid, label: 'Missões' },
          { id: 'STORE', icon: Gem, label: 'Loja' },
          { id: 'LOGS', icon: History, label: 'Atividades' },
          { id: 'SETTINGS', icon: Settings, label: 'Ajustes' }
        ].map(btn => (
          <button 
            key={btn.id}
            onClick={() => { setTab(btn.id as any); sfx.play('click'); }}
            className={`flex items-center gap-2 px-6 py-4 mc-btn-pixel whitespace-nowrap ${tab === btn.id ? 'primary' : 'bg-zinc-800 text-white border-white/5'}`}
          >
            <btn.icon size={16} />
            <span className="text-xs uppercase font-black">{btn.label}</span>
            {btn.count ? <span className="bg-red-600 px-2 rounded-sm text-[8px]">{btn.count}</span> : null}
          </button>
        ))}
      </nav>

      <div className="mc-panel-pixel p-8 bg-[#c6c6c6] min-h-[50vh] border-none shadow-2xl relative">
        {tab === 'REVIEW' && (
          <div className="space-y-6 animate-in slide-in-from-bottom">
             <div className="flex items-center justify-between border-b-4 border-black/5 pb-2">
                <h3 className="text-xl font-black uppercase text-black/80">Fila de Revisão</h3>
                <span className="text-[10px] font-black bg-black/10 px-3 py-1 rounded-full uppercase">Herói Aguardando: {pending.length}</span>
             </div>
             {pending.length === 0 ? (
               <div className="py-24 text-center text-black/20 font-black uppercase tracking-tighter text-2xl">O reino está em ordem.</div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pending.map(task => (
                    <div key={task.id} className="mc-panel-pixel bg-white p-4 space-y-4 shadow-xl border-none">
                       <div className="aspect-video bg-black rounded overflow-hidden border-2 border-black/10 relative">
                          <img src={task.evidenceUrl} className="w-full h-full object-contain" />
                       </div>
                       <div className="flex justify-between items-center">
                          <div>
                             <h5 className="font-black uppercase text-black leading-tight">{task.title}</h5>
                             <div className="flex items-center gap-2 mt-1">
                                <span className="text-[8px] font-black text-mc-green">◆ {task.emeralds}</span>
                                <span className="text-[8px] font-black text-mc-blue">💎 {task.diamonds}</span>
                                <span className="text-[8px] font-bold text-zinc-400 uppercase">| {task.timeOfDay}</span>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => onRejectTask(task.id)} className="p-3 bg-red-500 hover:bg-red-400 text-white mc-btn-pixel border-none"><XCircle size={20}/></button>
                             <button onClick={() => onApproveTask(task.id, 'Missão cumprida!')} className="p-3 bg-mc-green hover:bg-emerald-400 text-black mc-btn-pixel border-none"><CheckCircle size={20}/></button>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        )}

        {tab === 'TASKS' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center border-b-4 border-black/5 pb-2">
                <h3 className="text-xl font-black uppercase text-black/80">Gestão de Missões</h3>
                <button onClick={() => setShowNewTask(!showNewTask)} className="mc-btn-pixel primary text-[10px] px-6">+ NOVA MISSÃO</button>
             </div>

             {showNewTask && (
               <div className="bg-black/5 p-6 mc-slot border-none space-y-4 animate-in slide-in-from-top">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-black/60">Nome da Missão</label>
                        <input className="w-full p-3 mc-slot border-none text-black font-black" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="Ex: Arrumar Cama" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-black/60">Bioma (Período)</label>
                        <select className="w-full p-3 mc-slot border-none font-black text-black" value={newTask.timeOfDay} onChange={e => setNewTask({...newTask, timeOfDay: e.target.value as TimeOfDay})}>
                           <option value={TimeOfDay.MORNING}>Manhã</option>
                           <option value={TimeOfDay.AFTERNOON}>Tarde</option>
                           <option value={TimeOfDay.NIGHT}>Noite</option>
                        </select>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-mc-green">Esmeraldas (◆)</label>
                        <input type="number" className="w-full p-3 mc-slot border-none font-black text-mc-green" value={newTask.emeralds} onChange={e => setNewTask({...newTask, emeralds: Number(e.target.value)})} />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-mc-blue">Diamantes (💎)</label>
                        <input type="number" className="w-full p-3 mc-slot border-none font-black text-mc-blue" value={newTask.diamonds} onChange={e => setNewTask({...newTask, diamonds: Number(e.target.value)})} />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[8px] font-black uppercase text-black/60">Etapas da Missão</label>
                     <div className="flex gap-2">
                        <input className="flex-grow p-3 mc-slot border-none font-black text-black" value={newTask.currentStep} onChange={e => setNewTask({...newTask, currentStep: e.target.value})} placeholder="Ex: Dobrar lençol" />
                        <button onClick={() => { if(newTask.currentStep) setNewTask({...newTask, steps: [...newTask.steps, newTask.currentStep], currentStep: ''})}} className="mc-btn-pixel primary px-4">+</button>
                     </div>
                     <div className="flex flex-wrap gap-2 pt-2">
                        {newTask.steps.map((s, idx) => (
                           <span key={idx} className="bg-white px-3 py-1.5 text-[8px] font-black border border-black/10 flex items-center gap-2 shadow-sm">
                              {s} <XCircle size={12} className="text-red-500 cursor-pointer" onClick={() => setNewTask({...newTask, steps: newTask.steps.filter((_, i) => i !== idx)})}/>
                           </span>
                        ))}
                     </div>
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-black/5">
                     <button onClick={handleCreateTask} className="flex-grow mc-btn-pixel primary py-4 text-xs font-black">CRIAR MISSÃO</button>
                     <button onClick={() => setShowNewTask(false)} className="mc-btn-pixel py-4 px-8 text-xs font-black">CANCELAR</button>
                  </div>
               </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map(t => (
                  <div key={t.id} className="mc-slot p-4 bg-white border-none flex justify-between items-center group hover:bg-zinc-50 transition-colors">
                     <div>
                        <h6 className="font-black uppercase text-black text-sm">{t.title}</h6>
                        <p className={`text-[8px] font-bold uppercase tracking-widest ${t.status === TaskStatus.FAILED ? 'text-red-500' : 'text-zinc-400'}`}>
                            {t.timeOfDay} • {t.status}
                        </p>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="flex gap-2 text-[8px] font-black">
                            <span className="text-mc-green">◆ {t.emeralds}</span>
                            <span className="text-mc-blue">💎 {t.diamonds}</span>
                        </div>
                        <button onClick={() => onDeleteTask(t.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {tab === 'LOGS' && (
          <div className="space-y-4">
             <h3 className="text-xl font-black uppercase text-black/80 border-b-4 border-black/5 pb-2">Registros do Servidor</h3>
             <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-2 custom-scroll">
                {activities.map((log: any) => (
                  <div key={log.id} className="mc-slot p-3 bg-white/60 border-none text-[10px] flex justify-between items-center hover:bg-white transition-colors">
                     <div className="flex items-center gap-4">
                        <span className="font-bold text-zinc-400 text-[8px]">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className="font-black uppercase text-black">{log.detail}</span>
                     </div>
                     <span className={`font-black ${log.amount && log.amount < 0 ? 'text-red-600' : 'text-mc-green'}`}>
                        {log.amount ? (log.amount > 0 ? '+' : '') + log.amount : ''} {log.currency || ''}
                     </span>
                  </div>
                ))}
             </div>
          </div>
        )}

        {tab === 'SETTINGS' && (
          <div className="space-y-8 animate-in fade-in">
             <h3 className="text-xl font-black uppercase text-black/80 border-b-4 border-black/5 pb-2">Configurações Avançadas</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="mc-panel-pixel bg-white p-6 border-none space-y-4 shadow-lg">
                   <p className="font-black uppercase text-sm text-black">Modo Baixo Sensorial</p>
                   <button 
                    onClick={() => onUpdateProfile({ sensoryMode: profile.sensoryMode === 'low_sensory' ? 'standard' : 'low_sensory' })}
                    className={`mc-btn-pixel p-3 w-full ${profile.sensoryMode === 'low_sensory' ? 'primary' : 'bg-zinc-200 border-none text-zinc-400'}`}
                   >
                    {profile.sensoryMode === 'low_sensory' ? <EyeOff size={18} className="mx-auto" /> : <Eye size={18} className="mx-auto" />}
                   </button>
                </div>
                <div className="mc-panel-pixel bg-white p-6 border-none space-y-4 shadow-lg">
                   <p className="font-black uppercase text-sm text-black">Curas de Emergência</p>
                   <button onClick={() => onAdjustCurrency(100, 'HP')} className="mc-btn-pixel primary p-3 w-full flex items-center justify-center gap-2">
                       <Heart size={18}/> REVIVER / CURAR HERÓI
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="mc-panel-pixel p-6 bg-red-600/10 border-red-500/20 shadow-inner">
         <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="text-red-500" />
            <h3 className="font-black uppercase text-red-500">Multas e Penalidades Rápidas</h3>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button onClick={() => onAdjustCurrency(-50, 'XP')} className="mc-btn-pixel danger text-[8px] py-4 uppercase font-black">Perder 50 XP</button>
            <button onClick={() => onAdjustCurrency(-10, 'EMERALD')} className="mc-btn-pixel danger text-[8px] py-4 uppercase font-black">Multa 10 ◆</button>
            <button onClick={() => onAdjustCurrency(-1, 'DIAMOND')} className="mc-btn-pixel danger text-[8px] py-4 uppercase font-black">Confiscar 1 💎</button>
            <button onClick={() => onAdjustCurrency(-20, 'HP')} className="mc-btn-pixel danger text-[8px] py-4 uppercase font-black">Dano Crítico (-20 HP)</button>
         </div>
      </div>
    </div>
  );
};
export default ParentPanel;
