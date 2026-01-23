
import React, { useState, useEffect, useRef } from 'react';
import { Task, TimeOfDay, TaskStatus, UserProfile, Reward, TaskStep } from '../types';
import { X, Sun, SunMedium, Moon, ShoppingBag, Camera, Heart, Sparkles, Package, CheckCircle2, Clock, Map as MapIcon, ChevronRight, LayoutGrid, Zap, RefreshCw, Loader, Trophy } from 'lucide-react';
import { sfx } from '../services/audio';
import { GameEngine } from '../services/game-logic';
import BuilderMode from './BuilderMode';

interface ChildDashboardProps {
  tasks: Task[];
  profile: UserProfile;
  rewards: Reward[];
  onCompleteTask: (id: string, url: string, type: 'photo' | 'drawing') => void;
  onBuyReward: (id: string) => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onUpdateTask: (newTasks: Task[]) => void;
}

const ChildDashboard: React.FC<ChildDashboardProps> = ({ 
  tasks, profile, rewards, onCompleteTask, onBuyReward, onUpdateProfile, onUpdateTask 
}) => {
  const [tab, setTab] = useState<TimeOfDay | 'SHOP' | 'INV' | 'MAP'>(TimeOfDay.MORNING);
  const [showBuilder, setShowBuilder] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const currentRank = GameEngine.getRankInfo(profile.level);
  const xpNeeded = GameEngine.getXpRequired(profile.level);

  // Verificação de Bioma por Horário Real
  useEffect(() => {
    const checkTimeGaps = () => {
      const now = new Date();
      const hour = now.getHours();
      let currentPeriod: TimeOfDay = TimeOfDay.MORNING;
      
      if (hour >= 12 && hour < 18) currentPeriod = TimeOfDay.AFTERNOON;
      if (hour >= 18 || hour < 6) currentPeriod = TimeOfDay.NIGHT;

      let hasChanges = false;
      let penalty = 0;

      const updatedTasks = tasks.map(t => {
        // Lógica de Falha: se o período passou e não foi aprovado/enviado
        const isPastMorning = currentPeriod !== TimeOfDay.MORNING && t.timeOfDay === TimeOfDay.MORNING;
        const isPastAfternoon = currentPeriod === TimeOfDay.NIGHT && t.timeOfDay === TimeOfDay.AFTERNOON;

        const isUnfinished = t.status !== TaskStatus.APPROVED && t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.FAILED;

        if ((isPastMorning || isPastAfternoon) && isUnfinished) {
          hasChanges = true;
          penalty += 20; // Dano maior por falha de tempo
          return { ...t, status: TaskStatus.FAILED };
        }
        return t;
      });

      if (hasChanges) {
        onUpdateTask(updatedTasks);
        if (profile.hp > 0) {
            onUpdateProfile({ hp: Math.max(0, profile.hp - penalty) });
            sfx.play('error');
        }
      }
    };

    const interval = setInterval(checkTimeGaps, 60000); 
    checkTimeGaps();
    return () => clearInterval(interval);
  }, [tasks, profile.hp]);

  useEffect(() => {
    let interval: number;
    if (focusTask && timer > 0 && focusTask.status === TaskStatus.DOING) {
      interval = window.setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [focusTask, timer]);

  const toggleStep = (taskId: string, stepId: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const newSteps = t.steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s);
        const started = newSteps.some(s => s.completed);
        const allDone = newSteps.every(s => s.completed);
        
        return {
          ...t,
          steps: newSteps,
          status: allDone ? TaskStatus.DOING : started ? TaskStatus.STARTED : TaskStatus.PENDING
        };
      }
      return t;
    });
    onUpdateTask(updatedTasks);
    sfx.play('pop');
  };

  const startTask = (task: Task) => {
    if (profile.hp <= 0) return;
    const updated = tasks.map(t => t.id === task.id ? { ...t, status: TaskStatus.STARTED } : t);
    onUpdateTask(updated);
    setFocusTask({ ...task, status: TaskStatus.STARTED });
    setTimer((task.durationMinutes || 15) * 60);
    sfx.play('success');
  };

  const handleFinishMission = () => {
    if (!focusTask) return;
    const allStepsDone = focusTask.steps.every(s => s.completed);
    if (!allStepsDone) {
        sfx.play('error');
        alert("Objetivos incompletos! Você não pode provar a missão ainda.");
        return;
    }
    sfx.play('click');
    evidenceInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && focusTask) {
      setIsCapturing(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        onCompleteTask(focusTask.id, reader.result as string, 'photo');
        setIsCapturing(false);
        setFocusTask(null);
        sfx.play('success');
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch(status) {
        case TaskStatus.APPROVED: return 'MISSÃO CUMPRIDA';
        case TaskStatus.COMPLETED: return 'AGUARDANDO MESTRE';
        case TaskStatus.FAILED: return 'FALHOU NO TEMPO';
        case TaskStatus.STARTED: return 'INICIADA';
        case TaskStatus.DOING: return 'NA ATIVA';
        default: return 'DISPONÍVEL';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch(status) {
        case TaskStatus.APPROVED: return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
        case TaskStatus.COMPLETED: return 'text-mc-blue border-mc-blue/30 bg-mc-blue/10';
        case TaskStatus.FAILED: return 'text-red-500 border-red-500/30 bg-red-500/10';
        case TaskStatus.STARTED: 
        case TaskStatus.DOING: return 'text-mc-gold border-mc-gold/30 bg-mc-gold/10';
        default: return 'text-zinc-500 border-white/10 bg-black/20';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 mc-font">
      <input type="file" ref={evidenceInputRef} className="hidden" accept="image/*" capture="environment" onChange={onFileChange} />

      {/* HUD PRINCIPAL */}
      <div className="mc-panel-pixel p-6 bg-[#1a1a1c]/80 backdrop-blur-xl border-white/5 text-white flex flex-col md:flex-row gap-8 items-center shadow-2xl">
         <div className="relative">
            <div className={`w-28 h-28 mc-slot bg-[#222] border-4 flex items-center justify-center text-6xl shadow-inner ${profile.hp <= 0 ? 'grayscale' : ''}`}>
               {profile.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" /> : <span>{profile.hp <= 0 ? '💀' : currentRank.emoji}</span>}
            </div>
            <div className="absolute -bottom-3 -right-3 bg-mc-gold text-black px-3 py-1 text-xs font-black border-2 border-black shadow-lg">LV.{profile.level}</div>
         </div>
         
         <div className="flex-grow w-full space-y-5">
            <div className="flex justify-between items-end">
               <div className="space-y-1">
                  <h2 className="text-3xl uppercase font-black leading-none drop-shadow-md">{profile.name}</h2>
                  <span className="text-[10px] text-mc-blue font-black uppercase tracking-[0.2em]">{currentRank.name}</span>
               </div>
               <div className="flex gap-8">
                  <div className="text-center">
                    <span className="text-[10px] text-mc-green uppercase block font-black mb-1">Esmeraldas</span>
                    <span className="text-3xl font-black drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">◆ {profile.emeralds}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-mc-blue uppercase block font-black mb-1">Diamantes</span>
                    <span className="text-3xl font-black text-mc-blue drop-shadow-[0_0_10px_rgba(59,130,246,0.4)]">💎 {profile.diamonds}</span>
                  </div>
               </div>
            </div>
            
            <div className="space-y-3">
               <div className="relative h-6 bg-black/60 rounded-sm border border-white/10 overflow-hidden shadow-inner">
                  <div className={`h-full transition-all duration-1000 ${profile.hp < 30 ? 'bg-red-600 animate-pulse' : 'bg-mc-red'}`} style={{ width: `${profile.hp}%` }}></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase text-white drop-shadow-md">SAÚDE: {profile.hp} / 100</div>
               </div>
               <div className="relative h-6 bg-black/60 rounded-sm border border-white/10 overflow-hidden shadow-inner">
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(profile.experience/xpNeeded)*100}%` }}></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase text-white drop-shadow-md">XP: {profile.experience} / {xpNeeded}</div>
               </div>
            </div>
         </div>
      </div>

      {profile.hp <= 0 && (
          <div className="mc-panel-pixel p-10 bg-red-950/90 border-red-500 text-center space-y-6 animate-bounce">
              <h2 className="text-5xl text-red-500 font-black uppercase">VOCÊ MORREU!</h2>
              <p className="text-white text-sm uppercase leading-relaxed font-bold max-w-lg mx-auto">Sua rotina desmoronou. Peça ao seu Mestre (Pais) para usar uma Poção de Cura no Console!</p>
              <Heart size={64} className="mx-auto text-red-900" />
          </div>
      )}

      {/* NAVEGAÇÃO DE BIOMAS */}
      <div className={profile.hp <= 0 ? 'opacity-20 pointer-events-none' : ''}>
          <nav className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { id: 'MAP', icon: MapIcon, label: 'Jornada' },
              { id: TimeOfDay.MORNING, icon: Sun, label: 'Manhã' },
              { id: TimeOfDay.AFTERNOON, icon: SunMedium, label: 'Tarde' },
              { id: TimeOfDay.NIGHT, icon: Moon, label: 'Noite' },
              { id: 'INV', icon: Package, label: 'Baú' },
              { id: 'SHOP', icon: ShoppingBag, label: 'Loja' }
            ].map(item => (
              <button 
                key={item.id} 
                onClick={() => { sfx.play('click'); setTab(item.id as any); }}
                className={`flex flex-col items-center p-5 mc-btn-pixel transition-all hover:scale-105 ${tab === item.id ? 'primary -translate-y-2' : 'bg-zinc-800 text-zinc-400 border-white/5'}`}
              >
                  <item.icon size={24} className={tab === item.id ? 'animate-bounce' : ''} />
                  <span className="text-[10px] uppercase mt-2 font-black tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="min-h-[50vh] mt-8">
            {tab === 'MAP' && (
              <div className="mc-panel-pixel p-10 bg-zinc-900/60 space-y-10 animate-in fade-in border-white/5">
                  <div className="flex items-center gap-4">
                     <div className="h-px bg-white/10 flex-grow"></div>
                     <h3 className="uppercase font-black tracking-[0.4em] text-zinc-500 text-xs">Caminho da Sobrevivência</h3>
                     <div className="h-px bg-white/10 flex-grow"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {[TimeOfDay.MORNING, TimeOfDay.AFTERNOON, TimeOfDay.NIGHT].map((time, i) => {
                        const timeTasks = tasks.filter(t => t.timeOfDay === time);
                        const done = timeTasks.filter(t => t.status === TaskStatus.APPROVED).length;
                        const failed = timeTasks.filter(t => t.status === TaskStatus.FAILED).length;
                        const isComplete = timeTasks.length > 0 && done === timeTasks.length;
                        
                        return (
                            <div key={time} className={`p-8 mc-slot flex flex-col items-center gap-4 transition-all ${isComplete ? 'bg-emerald-900/40 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : failed > 0 ? 'bg-red-950 border-red-500' : 'bg-zinc-900 border-white/10'}`}>
                                <div className="text-4xl">{i === 0 ? '🌅' : i === 1 ? '☀️' : '🌙'}</div>
                                <div className="text-center">
                                    <p className="font-black text-xs uppercase text-white">{time}</p>
                                    <p className={`text-[10px] font-black uppercase mt-1 ${isComplete ? 'text-emerald-400' : failed > 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                                        {done} FEITO / {failed} FALHOU
                                    </p>
                                </div>
                                {isComplete && <Trophy className="text-mc-gold animate-pulse" size={24} />}
                            </div>
                        );
                    })}
                  </div>
              </div>
            )}

            {(tab === TimeOfDay.MORNING || tab === TimeOfDay.AFTERNOON || tab === TimeOfDay.NIGHT) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom">
                  {tasks.filter(t => t.timeOfDay === tab).map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => { 
                          if(task.status === TaskStatus.PENDING) startTask(task);
                          else if(task.status === TaskStatus.STARTED || task.status === TaskStatus.DOING) setFocusTask(task);
                          sfx.play('click'); 
                      }}
                      className={`mc-panel-pixel p-6 cursor-pointer transition-all hover:-translate-y-2 group ${task.status === TaskStatus.FAILED ? 'opacity-40 grayscale pointer-events-none' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex justify-between items-center mb-6">
                          <span className={`text-[10px] font-black px-3 py-1 border uppercase tracking-tighter ${getStatusColor(task.status)}`}>
                            {getStatusLabel(task.status)}
                          </span>
                          <div className="flex gap-2 text-xs font-black">
                            {task.diamonds > 0 && <span className="text-mc-blue drop-shadow-md">💎{task.diamonds}</span>}
                            <span className="text-mc-green drop-shadow-md">◆{task.emeralds}</span>
                          </div>
                      </div>
                      <h4 className="text-xl font-black uppercase text-white group-hover:text-mc-gold transition-colors">{task.title}</h4>
                      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                            <Clock size={14} className="text-zinc-600"/> {task.durationMinutes || 15} MIN
                          </div>
                          <ChevronRight size={18} className="text-zinc-700 group-hover:text-white transition-all group-hover:translate-x-1" />
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.timeOfDay === tab).length === 0 && (
                      <div className="col-span-full py-24 text-center mc-panel-pixel bg-white/5 border-dashed border-white/10 opacity-30">
                          <p className="font-black uppercase text-xs">Nenhum bioma de missões aqui</p>
                      </div>
                  )}
              </div>
            )}

            {tab === 'SHOP' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {rewards.map(reward => {
                    const canAfford = (reward.currency === 'diamond' ? profile.diamonds : profile.emeralds) >= reward.cost;
                    return (
                        <button 
                        key={reward.id} 
                        onClick={() => { if(canAfford) { onBuyReward(reward.id); sfx.play('buy'); } }} 
                        className={`mc-slot p-6 flex flex-col items-center gap-3 transition-all ${!canAfford ? 'opacity-20 grayscale' : 'hover:-translate-y-2 hover:bg-white/10'}`}
                        >
                        <span className="text-5xl drop-shadow-2xl">{reward.icon}</span>
                        <p className="text-[10px] font-black uppercase text-center text-zinc-300 leading-tight h-8 flex items-center">{reward.title}</p>
                        <div className={`mt-2 font-black text-xs ${reward.currency === 'diamond' ? 'text-mc-blue' : 'text-mc-green'}`}>
                            {reward.currency === 'diamond' ? '💎' : '◆'} {reward.cost}
                        </div>
                        </button>
                    );
                  })}
              </div>
            )}

            {tab === 'INV' && (
              <div className="space-y-8">
                  <div className="flex justify-between items-center p-6 mc-panel-pixel bg-zinc-900 border-white/5">
                    <h3 className="uppercase font-black text-xl text-white flex items-center gap-4"><Package size={28} className="text-mc-blue"/> Seu Grande Baú</h3>
                    <button onClick={() => setShowBuilder(true)} className="mc-btn-pixel primary text-[12px] px-8 py-4 shadow-[0_6px_0_#065f46]">MODO CONSTRUÇÃO</button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-10 gap-3">
                    {Object.entries(profile.inventory || {}).map(([id, count]) => {
                      const item = rewards.find(r => r.id === id);
                      if (!item || (count as number) <= 0) return null;
                      return (
                        <div key={id} className="mc-slot aspect-square flex items-center justify-center relative bg-white/5 border-white/5 group hover:border-mc-blue transition-colors">
                            <span className="text-4xl group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="absolute bottom-0 right-0 bg-black text-white text-[10px] px-2 py-0.5 font-black border-l-2 border-t-2 border-white/10">
                                {count as number}
                            </span>
                        </div>
                      );
                    })}
                  </div>
              </div>
            )}
          </div>
      </div>

      {/* MODO FOCO (EM ANDAMENTO) */}
      {focusTask && (
        <div className="fixed inset-0 z-[300] bg-black/98 flex flex-col animate-in fade-in duration-500 overflow-y-auto">
           <div className="max-w-2xl mx-auto w-full flex flex-col min-h-full p-8 gap-8">
              <div className="flex justify-between items-center">
                 <button onClick={() => setFocusTask(null)} className="mc-btn-pixel danger p-4 shadow-[0_6px_0_#7f1d1d]"><X size={28}/></button>
                 <div className="text-center">
                    <h2 className="text-4xl text-white font-black uppercase tracking-tight drop-shadow-2xl">{focusTask.title}</h2>
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <div className="w-2 h-2 rounded-full bg-mc-gold animate-ping"></div>
                        <span className="text-[10px] font-black text-mc-gold uppercase tracking-[0.3em]">Em execução...</span>
                    </div>
                 </div>
                 <div className="w-16"></div>
              </div>

              <div className="flex-grow mc-panel-pixel bg-[#c6c6c6] p-12 space-y-8 border-none shadow-inner">
                 <div className="flex items-center gap-4 border-b-4 border-black/5 pb-6">
                    <Zap size={28} className="text-mc-gold" />
                    <p className="text-[12px] font-black text-black/60 uppercase tracking-tighter">Cumpra os objetivos para ganhar recompensas!</p>
                 </div>
                 <div className="space-y-4">
                    {focusTask.steps.map((step, idx) => (
                       <button 
                        key={step.id} 
                        onClick={() => toggleStep(focusTask.id, step.id)}
                        className={`w-full p-6 flex items-center gap-6 mc-slot border-none text-left transition-all active:scale-95 ${step.completed ? 'opacity-40 bg-emerald-500/10' : 'bg-white shadow-2xl hover:bg-zinc-50'}`}
                       >
                          <div className={`w-8 h-8 border-4 border-black flex items-center justify-center ${step.completed ? 'bg-emerald-500' : 'bg-zinc-200'}`}>
                             {step.completed && <CheckCircle2 size={20} className="text-white" />}
                             {!step.completed && <span className="text-xs font-black text-black/20">{idx + 1}</span>}
                          </div>
                          <span className={`text-2xl font-black uppercase text-black ${step.completed ? 'line-through text-zinc-400' : ''}`}>{step.text}</span>
                       </button>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="mc-panel-pixel bg-black/40 border-white/5 p-6 flex justify-between items-center">
                    <div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase block">Cronômetro</span>
                        <span className="text-5xl font-black text-mc-red font-mono drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                        {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                    <Clock size={40} className="text-white/10" />
                 </div>
                 <button 
                   disabled={!focusTask.steps.every(s => s.completed) || isCapturing}
                   onClick={handleFinishMission}
                   className="w-full py-8 mc-btn-pixel primary text-2xl font-black disabled:opacity-50 disabled:grayscale transition-all shadow-[0_10px_0_#065f46] hover:-translate-y-1 active:translate-y-1 flex items-center justify-center gap-4"
                >
                    {isCapturing ? <Loader className="animate-spin" /> : <Camera size={36}/>}
                    FINALIZAR MISSÃO
                 </button>
              </div>
           </div>
        </div>
      )}

      {showBuilder && <BuilderMode profile={profile} rewards={rewards} onUpdateProfile={onUpdateProfile} onClose={() => setShowBuilder(false)} />}
    </div>
  );
};

export default ChildDashboard;
