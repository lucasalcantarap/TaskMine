
import React, { useState, useRef } from 'react';
import { Task, TimeOfDay, TaskStatus, UserProfile, Reward } from '../types';
import { Sun, Moon, Check, Camera, Shield, Cloud, Heart, X, Clock, ShoppingBag, Sword } from 'lucide-react';
import { sfx } from '../services/audio';
import { GameEngine } from '../services/game-logic';

interface ChildDashboardProps {
  tasks: Task[];
  profile: UserProfile;
  rewards: Reward[];
  onCompleteTask: (id: string, url: string, type: 'photo' | 'drawing') => void;
  onBuyReward: (id: string) => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onUpdateTask: (newTasks: Task[]) => void;
}

// --- SUB-COMPONENTE: HUD ESTILO MINECRAFT ---
const MinecraftHUD: React.FC<{ profile: UserProfile, avatarData: any, onClick: () => void }> = ({ profile, avatarData, onClick }) => {
  const nextLevelXp = profile.level * 100;
  const xpProgress = Math.min((profile.experience / nextLevelXp) * 100, 100);
  
  // Hearts Calculation (20HP max usually, represented by 10 hearts)
  const hearts = Math.ceil(profile.hp / 10);
  const maxHearts = 10;

  return (
    <div className="fixed top-0 left-0 w-full z-50 pointer-events-none p-2">
      <div 
        onClick={onClick}
        className="pointer-events-auto max-w-2xl mx-auto flex justify-between items-start"
      >
          {/* Avatar e Nome */}
          <div className="flex gap-2 items-start">
             <div className="w-16 h-16 bg-[#212121] border-4 border-white pixel-corners overflow-hidden">
                <img src={avatarData.image} alt="Skin" className="w-full h-full object-cover" />
             </div>
             <div className="mt-1">
                 <div className="bg-[#212121]/80 px-2 py-0.5 text-white font-game text-xl border-2 border-white/20 inline-block mb-1">
                    {profile.name} <span className="text-[#5f9e30]">Lvl {profile.level}</span>
                 </div>
                 
                 {/* Hearts Row */}
                 <div className="flex gap-1 flex-wrap max-w-[150px]">
                    {[...Array(maxHearts)].map((_, i) => (
                        <Heart 
                            key={i} 
                            size={16} 
                            className={`${i < hearts ? 'fill-[#d13030] text-[#7a1c1c]' : 'fill-[#212121] text-[#555]'} drop-shadow-sm`}
                        />
                    ))}
                 </div>
             </div>
          </div>

          {/* Inventory Summary */}
          <div className="flex flex-col gap-1 items-end">
              <div className="flex items-center gap-2 bg-[#212121]/80 px-3 py-1 border-2 border-[#50e4e8] text-[#50e4e8] font-game text-xl">
                  <span>{profile.diamonds}</span> 💎
              </div>
              <div className="flex items-center gap-2 bg-[#212121]/80 px-3 py-1 border-2 border-[#5f9e30] text-[#5f9e30] font-game text-xl">
                  <span>{profile.emeralds}</span> 🟢
              </div>
          </div>
      </div>
      
      {/* XP Bar (Bottom of HUD) */}
      <div className="max-w-2xl mx-auto mt-2 px-1">
          <div className="w-full h-3 bg-[#212121] border border-black relative">
              <div className="h-full bg-[#5f9e30] absolute top-0 left-0 transition-all" style={{width: `${xpProgress}%`}}></div>
              <div className="absolute -top-4 w-full text-center text-[#5f9e30] text-xs font-game mc-shadow-text">{profile.experience} / {nextLevelXp}</div>
          </div>
      </div>
    </div>
  );
};

const ChildDashboard: React.FC<ChildDashboardProps> = ({ tasks, profile, rewards, onCompleteTask, onBuyReward }) => {
  const [activeModal, setActiveModal] = useState<'NONE' | 'SHOP' | 'STATS'>('NONE');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarData = GameEngine.getAvatarForLevel(profile.level);
  
  // Biome Themes
  const hour = new Date().getHours();
  const getBiomeColor = () => {
      if (hour < 12) return 'linear-gradient(to bottom, #87CEEB, #E0F6FF)'; // Plains
      if (hour < 18) return 'linear-gradient(to bottom, #F0B060, #F5D0A9)'; // Desert/Savanna
      return 'linear-gradient(to bottom, #100820, #2C2045)'; // End/Cave
  };

  const filterTasks = (time: TimeOfDay) => tasks.filter(t => t.timeOfDay === time);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 600;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        };
    });
  };

  const handleTaskClick = (task: Task) => {
    if (task.status === TaskStatus.APPROVED || task.status === TaskStatus.COMPLETED) return;
    setSelectedTask(task);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedTask) {
        try {
            const compressedBase64 = await compressImage(file);
            onCompleteTask(selectedTask.id, compressedBase64, 'photo');
            setSelectedTask(null);
        } catch (err) {
            console.error(err);
            sfx.play('error');
        }
    }
  };

  const QuestScroll = ({ task }: { task: Task }) => {
    const isDone = task.status === TaskStatus.APPROVED;
    const isReview = task.status === TaskStatus.COMPLETED;
    const isFailed = task.status === TaskStatus.FAILED;
    
    // Paper/Parchment Style
    let bgColor = '#fffcd9'; // Paper
    let borderColor = '#a68b5a';
    let textColor = '#453823';

    if (isDone) {
        bgColor = '#e6ffdb'; // Success
        borderColor = '#5f9e30';
    } else if (isFailed) {
        bgColor = '#ffdbdb'; // Fail
        borderColor = '#d13030';
    } else if (isReview) {
        bgColor = '#fff4db'; // Pending
        borderColor = '#d99e2b';
    }

    return (
        <div 
            onClick={() => handleTaskClick(task)}
            className="mb-3 relative group"
        >
            {/* Paper Edge Effect */}
            <div className="absolute top-1 left-1 w-full h-full bg-black/30 rounded-sm"></div>
            
            <div className="relative p-3 border-4 cursor-pointer active:translate-y-1 transition-transform flex items-center gap-3"
                 style={{ backgroundColor: bgColor, borderColor: borderColor, imageRendering: 'pixelated' }}>
                
                <div className={`w-10 h-10 border-2 border-black/20 flex items-center justify-center shrink-0 ${isDone ? 'bg-[#5f9e30]/20' : 'bg-black/5'}`}>
                    {isDone ? <Check strokeWidth={4} size={24} className="text-[#5f9e30]" /> : 
                     isReview ? <Clock size={24} className="animate-spin text-orange-500" /> : 
                     isFailed ? <X size={24} className="text-red-500" /> :
                     <Sword size={24} className="text-[#453823]" />}
                </div>

                <div className="flex-grow min-w-0">
                    <h4 className="font-game text-xl leading-none mb-1 truncate" style={{color: textColor}}>
                        {task.title}
                    </h4>
                    <div className="flex gap-2">
                        <span className="bg-[#a68b5a] text-white px-1.5 py-0.5 text-[10px] font-bold font-game uppercase border border-[#5c4d32]">
                             {task.points} XP
                        </span>
                        {task.emeralds > 0 && (
                            <span className="bg-[#5f9e30] text-white px-1.5 py-0.5 text-[10px] font-bold font-game uppercase border border-[#3e661f]">
                                +{task.emeralds} GEMS
                            </span>
                        )}
                    </div>
                </div>

                {!isDone && !isReview && !isFailed && (
                    <div className="text-black/30">
                        <Camera size={24}/>
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen pb-28 pt-28 px-4 overflow-x-hidden relative touch-pan-y" 
         style={{ background: getBiomeColor() }}>
         
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />

      <MinecraftHUD 
        profile={profile} 
        avatarData={avatarData} 
        onClick={() => { setActiveModal('STATS'); sfx.play('click'); }} 
      />

      {/* --- LISTA DE QUESTS --- */}
      <div className="max-w-md mx-auto space-y-8">
         {/* Manhã */}
         <div>
             <div className="flex items-center gap-2 mb-2 pl-1 text-white mc-shadow-text">
                 <Sun size={24} className="text-yellow-300 fill-yellow-300"/>
                 <h3 className="font-game text-2xl">QUESTS MATINAIS</h3>
             </div>
             {filterTasks(TimeOfDay.MORNING).map(t => <QuestScroll key={t.id} task={t}/>)}
             {filterTasks(TimeOfDay.MORNING).length === 0 && <p className="text-white/50 font-game text-center">NENHUMA QUEST DISPONÍVEL</p>}
         </div>

         {/* Tarde */}
         <div>
             <div className="flex items-center gap-2 mb-2 pl-1 text-white mc-shadow-text">
                 <Cloud size={24} className="text-white fill-white"/>
                 <h3 className="font-game text-2xl">QUESTS VESPERTINAS</h3>
             </div>
             {filterTasks(TimeOfDay.AFTERNOON).map(t => <QuestScroll key={t.id} task={t}/>)}
             {filterTasks(TimeOfDay.AFTERNOON).length === 0 && <p className="text-white/50 font-game text-center">NENHUMA QUEST DISPONÍVEL</p>}
         </div>
         
         {/* Noite */}
         <div>
             <div className="flex items-center gap-2 mb-2 pl-1 text-white mc-shadow-text">
                 <Moon size={24} className="text-purple-300 fill-purple-300"/>
                 <h3 className="font-game text-2xl">QUESTS NOTURNAS</h3>
             </div>
             {filterTasks(TimeOfDay.NIGHT).map(t => <QuestScroll key={t.id} task={t}/>)}
             {filterTasks(TimeOfDay.NIGHT).length === 0 && <p className="text-white/50 font-game text-center">NENHUMA QUEST DISPONÍVEL</p>}
         </div>
      </div>

      {/* --- BOTTOM DOCK --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center pointer-events-none">
         <button 
            onClick={() => setActiveModal('SHOP')} 
            className="pointer-events-auto mc-button mc-btn-stone px-6 py-4 flex flex-col items-center gap-1 shadow-2xl hover:scale-105 transition-transform"
         >
            <div className="text-[#5f9e30]"><ShoppingBag size={28} /></div>
            <span className="text-xs text-[#aaa]">MERCADOR</span>
         </button>
      </div>

      {/* MODAL UNIVERSAL (UI DE BAÚ) */}
      {activeModal !== 'NONE' && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
            <div className="mc-panel w-full max-w-sm flex flex-col shadow-2xl">
                
                {/* Header Modal */}
                <div className="bg-[#212121] p-3 flex justify-between items-center border-b-4 border-black">
                    <h2 className="font-game text-2xl text-[#999]">
                        {activeModal === 'SHOP' ? 'Baú de Loot' : 'Estatísticas'}
                    </h2>
                    <button onClick={() => setActiveModal('NONE')} className="text-white bg-red-600 p-1 border-2 border-black hover:bg-red-700"><X size={20}/></button>
                </div>
                
                <div className="p-4 bg-[#c6c6c6] grid grid-cols-2 gap-2 overflow-y-auto max-h-[60vh]">
                    {activeModal === 'SHOP' && rewards.map(r => {
                        const canBuy = (r.currency === 'diamond' ? profile.diamonds : profile.emeralds) >= r.cost;
                        return (
                            <button key={r.id} onClick={() => canBuy && onBuyReward(r.id)} disabled={!canBuy}
                                className={`
                                    p-2 border-2 flex flex-col items-center gap-2 transition-all relative
                                    ${canBuy ? 'bg-[#8b8b8b] border-black hover:bg-[#a0a0a0] active:translate-y-1' : 'bg-[#555] border-[#333] opacity-60 cursor-not-allowed'}
                                `}
                            >
                                <div className="text-4xl drop-shadow-md">{r.icon}</div>
                                <span className="font-game text-lg leading-none text-white text-center w-full truncate">{r.title}</span>
                                <span className={`px-2 py-0.5 text-xs font-bold font-game border border-black/50 text-white ${r.currency === 'diamond' ? 'bg-[#50e4e8] text-[#004d40]' : 'bg-[#5f9e30]'}`}>
                                    {r.cost} {r.currency === 'diamond' ? 'DIA' : 'GEM'}
                                </span>
                            </button>
                        )
                    })}
                    
                    {activeModal === 'STATS' && (
                        <div className="col-span-2 text-center py-6 text-[#212121]">
                            <h3 className="font-game text-4xl mb-2">DIAS VIVOS: {profile.streak}</h3>
                            <div className="w-full h-4 bg-[#555] border-2 border-black relative mt-4">
                                <div className="h-full bg-[#50e4e8]" style={{width: '60%'}}></div>
                            </div>
                            <p className="font-game mt-1">XP PARA O PRÓXIMO NÍVEL</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ChildDashboard;
