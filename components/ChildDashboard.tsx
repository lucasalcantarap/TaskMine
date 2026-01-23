
import React, { useState, useRef } from 'react';
import { Task, TimeOfDay, TaskStatus, UserProfile, Reward } from '../types';
import { Check, Camera, Clock, Gift, Sword, X, RefreshCw, AlertTriangle } from 'lucide-react';
import { sfx } from '../services/audio';
import { GameEngine } from '../services/game-logic';
import { ImageUtils } from '../services/image-utils';

interface ChildDashboardProps {
  tasks: Task[];
  profile: UserProfile;
  rewards: Reward[];
  onCompleteTask: (id: string, url: string, type: 'photo' | 'drawing') => void;
  onBuyReward: (id: string) => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onUpdateTask: (newTasks: Task[]) => void;
}

const ChildDashboard: React.FC<ChildDashboardProps> = ({ tasks, profile, rewards, onCompleteTask, onBuyReward }) => {
  const [activeModal, setActiveModal] = useState<'NONE' | 'SHOP' | 'STATS'>('NONE');
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
            // Compressão Client-side para economizar banda do Firebase
            const compressedBase64 = await ImageUtils.compress(file, 800, 0.7);
            onCompleteTask(selectedTask.id, compressedBase64, 'photo');
            setSelectedTask(null);
        } catch (err) {
            alert("Erro ao processar imagem. Tente novamente.");
        } finally {
            setIsUploading(false);
        }
    }
  };

  const handleTaskClick = (task: Task) => {
    if (task.status === TaskStatus.APPROVED) { sfx.play('pop'); return; }
    if (task.status === TaskStatus.COMPLETED) { alert("O Mestre está analisando esta prova!"); return; }
    setSelectedTask(task);
  };

  // Card do Kanban
  const DungeonCard = ({ task }: { task: Task }) => {
    const isDone = task.status === TaskStatus.APPROVED;
    const isReview = task.status === TaskStatus.COMPLETED;
    const isRejected = task.status === TaskStatus.REJECTED;

    let borderClass = "border-gray-600";
    let bgClass = "bg-[#222]";
    let statusIcon = <div className="bg-black/50 p-1 rounded"><Camera size={16} className="text-gray-400"/></div>;

    if (isDone) {
        borderClass = "border-[#2f4f2f]"; // Mossy
        bgClass = "bg-[#1a2e1a]";
        statusIcon = <Check size={20} className="text-green-500"/>;
    } else if (isReview) {
        borderClass = "border-[#cfaa33]"; // Gold
        statusIcon = <Clock size={20} className="text-yellow-500 animate-pulse"/>;
    } else if (isRejected) {
        borderClass = "border-[#4a1c1c]"; // Nether
        bgClass = "bg-[#2e1111]";
        statusIcon = <AlertTriangle size={20} className="text-red-500"/>;
    }

    return (
        <div 
            onClick={() => handleTaskClick(task)}
            className={`
                dungeon-slot p-3 mb-3 border-l-4 ${borderClass} ${bgClass} 
                flex flex-col gap-2 cursor-pointer relative hover:brightness-110
            `}
        >
            <div className="flex justify-between items-start">
                <span className={`text-lg leading-none ${isDone ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                    {task.title}
                </span>
                {statusIcon}
            </div>
            
            <div className="flex justify-between items-end mt-2">
                <div className="flex gap-2">
                    <span className="text-xs bg-black px-1 text-gold border border-gray-700">{task.points} XP</span>
                    {task.diamonds > 0 && <span className="text-xs bg-cyan-900 px-1 text-cyan-200 border border-cyan-700">💎 Rare</span>}
                </div>
                {isRejected && <span className="text-xs text-red-400 font-bold blink">REFAZER!</span>}
            </div>
        </div>
    );
  };

  // Renderiza coluna por período (Manhã/Tarde/Noite)
  const renderColumn = (period: TimeOfDay, icon: string) => {
      const periodTasks = tasks.filter(t => t.timeOfDay === period);
      return (
        <div className="dungeon-panel flex flex-col h-full min-h-[300px]">
            <div className="bg-[#111] p-2 border-b-2 border-[#000] text-center text-xl text-shadow uppercase flex items-center justify-center gap-2">
                <span>{icon}</span> {period}
            </div>
            <div className="p-2 flex-grow bg-[#1a1a1a]">
                {periodTasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <div className="w-10 h-10 border-2 border-dashed border-gray-500 mb-2"></div>
                        <span className="text-xs">Vazio</span>
                    </div>
                ) : (
                    periodTasks.map(t => <DungeonCard key={t.id} task={t}/>)
                )}
            </div>
        </div>
      );
  };

  return (
    <div className="min-h-screen pb-24 pt-20 px-4">
       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />

       {/* HUD SUPERIOR */}
       <div className="fixed top-0 left-0 w-full z-50 p-2 pointer-events-none">
           <div className="max-w-4xl mx-auto dungeon-panel bg-[#222] p-2 pointer-events-auto flex items-center justify-between gap-4">
               
               {/* Avatar */}
               <div className="flex items-center gap-3" onClick={() => setActiveModal('STATS')}>
                   <div className="w-12 h-12 bg-[#444] border-2 border-black flex items-center justify-center text-2xl shadow-inner">
                       {avatarData.emoji}
                   </div>
                   <div className="flex flex-col">
                       <span className="text-xl text-shadow leading-none text-white">{profile.name}</span>
                       <span className="text-xs text-gold">LVL {profile.level} • {profile.rank}</span>
                   </div>
               </div>

               {/* Status Stats */}
               <div className="flex flex-col items-end gap-1">
                   <div className="flex gap-3 text-lg">
                       <span className="text-red-500 text-shadow">❤️ {profile.hp}</span>
                       <span className="text-diamond text-shadow">💎 {profile.diamonds}</span>
                       <span className="text-green-500 text-shadow">🟢 {profile.emeralds}</span>
                   </div>
                   {/* XP Bar */}
                   <div className="w-32 h-4 bg-black border border-gray-600 relative">
                       <div className="h-full bg-green-700 transition-all" style={{width: `${xpProgress}%`}}></div>
                       <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/80">XP</div>
                   </div>
               </div>
           </div>
       </div>

       {/* KANBAN BOARD */}
       <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
           {renderColumn(TimeOfDay.MORNING, '☀️')}
           {renderColumn(TimeOfDay.AFTERNOON, '🗡️')}
           {renderColumn(TimeOfDay.NIGHT, '🌙')}
       </div>

       {/* BOTÃO LOJA */}
       <div className="fixed bottom-6 right-6 z-50">
           <button 
               onClick={() => { setActiveModal('SHOP'); sfx.play('click'); }}
               className="dungeon-btn btn-gold w-16 h-16 rounded-full border-4 shadow-lg animate-bounce"
           >
               <Gift size={32} />
           </button>
       </div>

       {/* MODAL UPLOAD */}
       {selectedTask && (
           <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
               <div className="dungeon-panel bg-[#222] max-w-sm w-full p-6 text-center">
                   <h3 className="text-2xl text-shadow mb-2">{selectedTask.title}</h3>
                   <p className="text-sm text-gray-400 mb-6">{selectedTask.description || "Tire uma foto para provar!"}</p>
                   
                   {isUploading ? (
                       <div className="py-8 flex flex-col items-center">
                           <RefreshCw className="animate-spin text-gold mb-2" size={32}/>
                           <span className="text-xs blink">Enviando para o Mestre...</span>
                       </div>
                   ) : (
                       <div className="flex flex-col gap-3">
                           <button onClick={() => fileInputRef.current?.click()} className="dungeon-btn btn-stone py-4 flex gap-2">
                               <Camera /> TIRAR FOTO
                           </button>
                           <button onClick={() => setSelectedTask(null)} className="dungeon-btn bg-red-900 py-2 text-sm">
                               CANCELAR
                           </button>
                       </div>
                   )}
               </div>
           </div>
       )}

       {/* MODAL LOJA */}
       {activeModal === 'SHOP' && (
           <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4">
               <div className="dungeon-panel w-full max-w-lg flex flex-col max-h-[85vh]">
                   <div className="bg-[#333] p-3 border-b-4 border-black flex justify-between items-center">
                       <h2 className="text-2xl text-gold text-shadow">Mercador Ambulante</h2>
                       <button onClick={() => setActiveModal('NONE')} className="text-red-500 font-bold border border-red-900 px-2 bg-black">X</button>
                   </div>
                   
                   <div className="p-4 grid grid-cols-2 gap-4 overflow-y-auto bg-[#1a1a1a]">
                       {rewards.map(r => {
                           const canBuy = (r.currency === 'diamond' ? profile.diamonds : profile.emeralds) >= r.cost;
                           return (
                               <button 
                                   key={r.id}
                                   onClick={() => canBuy && onBuyReward(r.id)}
                                   disabled={!canBuy}
                                   className={`
                                       dungeon-slot p-3 flex flex-col items-center text-center relative group
                                       ${canBuy ? 'hover:border-gold cursor-pointer' : 'opacity-40 cursor-not-allowed'}
                                   `}
                               >
                                   <div className="text-4xl mb-2">{r.icon}</div>
                                   <span className="text-lg leading-tight text-gray-300 group-hover:text-white">{r.title}</span>
                                   <div className={`mt-2 px-2 py-0.5 text-sm font-bold border border-black ${r.currency === 'diamond' ? 'bg-cyan-900 text-cyan-200' : 'bg-green-900 text-green-200'}`}>
                                       {r.cost} {r.currency === 'diamond' ? '💎' : '🟢'}
                                   </div>
                               </button>
                           );
                       })}
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default ChildDashboard;
