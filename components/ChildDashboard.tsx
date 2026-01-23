
import React, { useState, useRef } from 'react';
import { Task, TimeOfDay, TaskStatus, UserProfile, Reward } from '../types';
import { Check, Camera, Clock, Gift, X, RefreshCw, AlertTriangle, ChevronRight, Heart, Palette, Zap } from 'lucide-react';
import { sfx } from '../services/audio';
import { GameEngine } from '../services/game-logic';
import { ImageUtils } from '../services/image-utils';
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

const ChildDashboard: React.FC<ChildDashboardProps> = ({ tasks, profile, rewards, onCompleteTask, onBuyReward, onUpdateProfile }) => {
  const [activeModal, setActiveModal] = useState<'NONE' | 'SHOP' | 'STATS' | 'BUILDER'>('NONE');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarData = GameEngine.getAvatarForLevel(profile.level);
  const nextLevelXp = profile.level * 100;
  const xpProgress = Math.min((profile.experience / nextLevelXp) * 100, 100);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedTask) {
        setIsUploading(true);
        try {
            const compressedBase64 = await ImageUtils.compress(file, 800, 0.7);
            onCompleteTask(selectedTask.id, compressedBase64, 'photo');
            setSelectedTask(null);
        } catch (err) {
            alert("Erro ao processar imagem.");
        } finally {
            setIsUploading(false);
        }
    }
  };

  const handleTaskClick = (task: Task) => {
    if (task.status === TaskStatus.APPROVED) { sfx.play('pop'); return; }
    if (task.status === TaskStatus.COMPLETED) { alert("Os pais estão conferindo sua tarefa!"); return; }
    setSelectedTask(task);
  };

  // Fix: Explicitly typing as React.FC to allow the 'key' prop in JSX mapping at line 173
  const QuestCard: React.FC<{ task: Task }> = ({ task }) => {
    const isDone = task.status === TaskStatus.APPROVED;
    const isReview = task.status === TaskStatus.COMPLETED;
    const isRejected = task.status === TaskStatus.REJECTED;

    let bgClass = "bg-[#a07449]";
    let borderClass = "border-[#6d4e34]";
    let iconBg = "bg-[#6d4e34]";
    let Icon = Zap;

    if (isDone) {
        bgClass = "bg-green-600";
        borderClass = "border-green-900";
        iconBg = "bg-green-800";
        Icon = Check;
    } else if (isReview) {
        bgClass = "bg-yellow-500";
        borderClass = "border-yellow-700";
        iconBg = "bg-yellow-600";
        Icon = Clock;
    } else if (isRejected) {
        bgClass = "bg-red-600";
        borderClass = "border-red-900";
        iconBg = "bg-red-800";
        Icon = AlertTriangle;
    }

    return (
        <div 
            onClick={() => handleTaskClick(task)}
            className={`
                relative p-4 mb-3 rounded-lg border-b-8 transition-all active:scale-95 cursor-pointer
                ${bgClass} ${borderClass} shadow-lg group overflow-hidden
            `}
        >
            <div className="relative flex justify-between items-center gap-4">
                <div className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-lg border-4 border-black/20 ${iconBg} shadow-inner`}>
                   <Icon size={28} className="text-white drop-shadow-md" />
                </div>
                
                <div className="flex-grow">
                    <h4 className="font-display text-xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">{task.title}</h4>
                    <div className="flex gap-2 mt-2">
                        <span className="text-xs font-bold bg-black/40 px-2 py-1 rounded text-white border border-white/20">
                             ✨ {task.points} Experiência
                        </span>
                        {task.emeralds > 0 && (
                            <span className="text-xs font-bold bg-green-500/80 px-2 py-1 rounded text-black border border-green-700">
                                🟢 {task.emeralds} Moedas
                            </span>
                        )}
                    </div>
                </div>
            </div>
            {isRejected && <div className="absolute top-0 right-0 bg-white text-red-600 text-[10px] px-2 font-black rounded-bl-lg">TENTE NOVAMENTE</div>}
        </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />

       {/* HUD SUPERIOR */}
       <div className="sticky top-2 z-40 mb-8 mx-2">
           <div className="bg-[#c6c6c6] border-4 border-[#333] p-3 flex flex-col md:flex-row items-center justify-between shadow-[0_8px_0_rgba(0,0,0,0.2)] rounded-lg">
               
               {/* Player Info */}
               <div className="flex items-center gap-4 w-full md:w-auto p-2 bg-[#8b8b8b] border-4 border-[#333] rounded-lg shadow-inner">
                   <div className="w-16 h-16 bg-[#8fd3fe] border-4 border-white flex items-center justify-center text-4xl shadow-md rounded-md">
                       {avatarData.emoji}
                   </div>
                   <div className="flex flex-col">
                       <span className="font-display text-2xl text-yellow-300 drop-shadow-md">{profile.name}</span>
                       <span className="text-xs uppercase font-black text-white bg-black/20 px-2 py-0.5 rounded">Nível {profile.level} • {profile.rank}</span>
                   </div>
               </div>

               {/* Stats */}
               <div className="flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                   <div className="flex justify-center md:justify-end gap-1">
                       {[...Array(5)].map((_,i) => (
                           <Heart key={i} size={24} className={i < Math.ceil(profile.hp/20) ? "fill-red-500 text-red-700 drop-shadow-md" : "fill-gray-700 text-gray-500"} />
                       ))}
                   </div>
                   
                   <div className="w-full md:w-72 h-6 bg-[#333] border-4 border-white relative rounded-md overflow-hidden shadow-inner">
                       <div className="h-full bg-gradient-to-r from-green-400 to-green-600" style={{width: `${xpProgress}%`}}></div>
                       <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white drop-shadow-md">
                           EXPERIÊNCIA: {profile.experience} / {nextLevelXp}
                       </div>
                   </div>

                   <div className="flex justify-center md:justify-end gap-4 text-sm font-black font-pixel bg-black/40 p-1.5 rounded-md text-white border border-white/10">
                       <span className="flex items-center text-green-400 text-lg">🟢 {profile.emeralds}</span>
                       <span className="flex items-center text-cyan-400 text-lg">💎 {profile.diamonds}</span>
                   </div>
               </div>
           </div>
       </div>

       {/* COLUNAS DE TAREFAS */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
           {[
               { id: TimeOfDay.MORNING, label: 'Manhã', icon: '🌅', bg: 'bg-sky-400/20' },
               { id: TimeOfDay.AFTERNOON, label: 'Tarde', icon: '☀️', bg: 'bg-orange-400/20' },
               { id: TimeOfDay.NIGHT, label: 'Noite', icon: '🌙', bg: 'bg-indigo-900/20' }
           ].map(section => (
                <div key={section.id} className={`flex flex-col h-full panel-game ${section.bg} backdrop-blur-md`}>
                    <div className="p-4 border-b-4 border-black/10 flex items-center justify-center gap-3 bg-white/40">
                        <span className="text-3xl drop-shadow-md">{section.icon}</span>
                        <h3 className="font-display text-2xl text-gray-800 tracking-wide">{section.label}</h3>
                    </div>
                    
                    <div className="p-4 min-h-[300px]">
                        {tasks.filter(t => t.timeOfDay === section.id).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 py-16">
                                <span className="text-5xl grayscale">💤</span>
                                <span className="font-black font-pixel mt-4 text-gray-600">SEM TAREFAS</span>
                            </div>
                        ) : (
                            tasks.filter(t => t.timeOfDay === section.id).map(t => <QuestCard key={t.id} task={t}/>)
                        )}
                    </div>
                </div>
           ))}
       </div>

       {/* BOTÕES DE AÇÃO */}
       <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
           <button 
               onClick={() => { setActiveModal('BUILDER'); sfx.play('click'); }}
               className="w-20 h-20 bg-[#a07449] rounded-xl border-b-8 border-[#6d4e34] shadow-2xl flex flex-col items-center justify-center text-white hover:translate-y-1 hover:border-b-4 transition-all"
               title="Área de Construção"
           >
               <Palette size={32} />
               <span className="text-[10px] font-black font-pixel mt-1">CONSTRUIR</span>
           </button>

           <button 
               onClick={() => { setActiveModal('SHOP'); sfx.play('click'); }}
               className="w-20 h-20 bg-yellow-400 rounded-xl border-b-8 border-yellow-700 shadow-2xl flex flex-col items-center justify-center text-black hover:translate-y-1 hover:border-b-4 transition-all"
               title="Loja de Prêmios"
           >
               <Gift size={32} />
               <span className="text-[10px] font-black font-pixel mt-1">LOJA</span>
           </button>
       </div>

       {/* MODAL DE TAREFA */}
       {selectedTask && (
           <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
               <div className="panel-game max-w-sm w-full p-0 bg-white overflow-hidden">
                   <div className="h-6 bg-green-500 w-full"></div>
                   <div className="p-8 text-center">
                       <h3 className="font-display text-4xl text-gray-800 mb-4">{selectedTask.title}</h3>
                       <p className="text-gray-600 mb-8 text-lg font-bold">
                           {selectedTask.description || "Complete esta tarefa para ganhar suas recompensas!"}
                       </p>
                       
                       {isUploading ? (
                           <div className="py-8 flex flex-col items-center gap-4">
                               <RefreshCw className="animate-spin text-green-600" size={56}/>
                               <span className="text-2xl font-black text-green-600 font-pixel">ENVIANDO...</span>
                           </div>
                       ) : (
                           <div className="flex flex-col gap-4">
                               <button onClick={() => fileInputRef.current?.click()} className="btn-game btn-primary w-full py-4 text-2xl">
                                   <Camera size={28} /> MANDAR FOTO
                               </button>
                               <button onClick={() => setSelectedTask(null)} className="btn-game bg-gray-300 text-gray-700 border-gray-500 w-full py-2">
                                   FECHAR
                               </button>
                           </div>
                       )}
                   </div>
               </div>
           </div>
       )}

       {/* LOJA */}
       {activeModal === 'SHOP' && (
           <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
               <div className="panel-dark w-full max-w-4xl flex flex-col max-h-[90vh] rounded-xl overflow-hidden">
                   <div className="p-5 border-b-4 border-black/30 flex justify-between items-center bg-gray-800">
                       <h2 className="font-display text-4xl text-yellow-400">Loja de Prêmios</h2>
                       <button onClick={() => setActiveModal('NONE')} className="btn-game btn-danger py-1 px-4">FECHAR</button>
                   </div>
                   <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto bg-gray-700">
                       {rewards.map(r => {
                           const canBuy = (r.currency === 'diamond' ? profile.diamonds : profile.emeralds) >= r.cost;
                           return (
                               <div key={r.id} className={`p-4 rounded-lg border-4 flex flex-col items-center gap-3 ${canBuy ? 'bg-gray-800 border-yellow-500' : 'bg-gray-900 border-gray-600 opacity-50'}`}>
                                   <div className="text-5xl drop-shadow-lg" style={r.type === 'block' ? {color: r.blockColor} : {}}>{r.icon}</div>
                                   <div className="text-center">
                                       <p className="font-black text-white text-sm leading-tight">{r.title}</p>
                                       <p className={`font-black font-pixel mt-1 ${r.currency === 'diamond' ? 'text-cyan-400' : 'text-green-400'}`}>
                                           {r.cost} {r.currency === 'diamond' ? '💎' : 'Moedas'}
                                       </p>
                                   </div>
                                   <button 
                                       disabled={!canBuy}
                                       onClick={() => onBuyReward(r.id)}
                                       className={`w-full py-2 rounded-md font-black text-xs border-b-4 ${canBuy ? 'bg-green-500 border-green-800 text-white' : 'bg-gray-700 border-gray-900 text-gray-500'}`}
                                   >
                                       COMPRAR
                                   </button>
                               </div>
                           );
                       })}
                   </div>
               </div>
           </div>
       )}

       {activeModal === 'BUILDER' && (
           <BuilderMode 
              profile={profile} 
              rewards={rewards} 
              onUpdateProfile={onUpdateProfile} 
              onClose={() => setActiveModal('NONE')} 
            />
       )}
    </div>
  );
};

export default ChildDashboard;
