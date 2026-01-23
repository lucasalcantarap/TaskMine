
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
    if (task.status === TaskStatus.COMPLETED) { alert("O Mestre está analisando!"); return; }
    setSelectedTask(task);
  };

  // Minecraft Wooden Sign / Quest Card
  const QuestCard = ({ task }: { task: Task }) => {
    const isDone = task.status === TaskStatus.APPROVED;
    const isReview = task.status === TaskStatus.COMPLETED;
    const isRejected = task.status === TaskStatus.REJECTED;

    let bgClass = "bg-[#a07449]"; // Wood default
    let borderClass = "border-[#6d4e34]";
    let iconBg = "bg-[#6d4e34]";
    let textColor = "text-white";
    let Icon = Zap;

    if (isDone) {
        bgClass = "bg-[#4ca34c]"; // Success Green
        borderClass = "border-[#2e6b2e]";
        iconBg = "bg-[#2e6b2e]";
        Icon = Check;
    } else if (isReview) {
        bgClass = "bg-[#ffd700]"; // Gold Wait
        borderClass = "border-[#b8860b]";
        iconBg = "bg-[#b8860b]";
        textColor = "text-[#5d4037]";
        Icon = Clock;
    } else if (isRejected) {
        bgClass = "bg-[#ff5252]"; // Red Danger
        borderClass = "border-[#8b0000]";
        iconBg = "bg-[#8b0000]";
        Icon = AlertTriangle;
    }

    return (
        <div 
            onClick={() => handleTaskClick(task)}
            className={`
                relative p-3 mb-4 rounded-lg border-b-4 transition-transform active:scale-95 cursor-pointer
                ${bgClass} ${borderClass} shadow-md group overflow-hidden
            `}
        >
            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")'}}></div>

            <div className="relative flex justify-between items-center gap-3">
                <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded border-2 border-black/20 ${iconBg} shadow-inner`}>
                   <Icon size={24} className="text-white drop-shadow-md" />
                </div>
                
                <div className="flex-grow">
                    <h4 className={`font-display text-lg leading-tight ${textColor} drop-shadow-sm`}>{task.title}</h4>
                    <div className="flex gap-2 mt-1">
                        <span className="text-xs font-bold bg-black/20 px-2 py-0.5 rounded text-white flex items-center gap-1">
                             ✨ {task.points} XP
                        </span>
                        {task.diamonds > 0 && (
                            <span className="text-xs font-bold bg-cyan-400/80 px-2 py-0.5 rounded text-black border border-cyan-600">
                                💎 Raro
                            </span>
                        )}
                    </div>
                </div>

                {isRejected && <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-2 font-bold animate-pulse">REFAZER</div>}
            </div>
        </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />

       {/* HUD SUPERIOR - Minecraft Style */}
       <div className="sticky top-2 z-40 mb-8 mx-2">
           <div className="bg-[#c6c6c6] border-4 border-[#555] p-2 flex flex-col md:flex-row items-center justify-between shadow-[inset_4px_4px_0_#fff,inset_-4px_-4px_0_#000] rounded">
               
               {/* Player Info */}
               <div className="flex items-center gap-4 w-full md:w-auto p-2 bg-[#8b8b8b] border-2 border-[#555] rounded shadow-inner">
                   <div className="w-14 h-14 bg-[#8fd3fe] border-2 border-white flex items-center justify-center text-3xl shadow-md">
                       {avatarData.emoji}
                   </div>
                   <div className="flex flex-col text-white">
                       <span className="font-pixel text-2xl leading-none text-yellow-300 drop-shadow-md">{profile.name}</span>
                       <span className="text-xs uppercase font-bold text-gray-200">Lvl {profile.level} • {profile.rank}</span>
                   </div>
               </div>

               {/* Stats & Health */}
               <div className="flex flex-col gap-1 w-full md:w-auto mt-2 md:mt-0">
                   {/* Hearts */}
                   <div className="flex justify-center md:justify-end gap-1 mb-1">
                       {[...Array(5)].map((_,i) => (
                           <Heart key={i} size={20} className={i < Math.ceil(profile.hp/20) ? "fill-red-500 text-red-600 drop-shadow-sm" : "fill-gray-700 text-gray-500"} />
                       ))}
                   </div>
                   
                   {/* XP Bar */}
                   <div className="w-full md:w-64 h-5 bg-[#333] border-2 border-white relative rounded-full overflow-hidden">
                       <div 
                            className="h-full bg-gradient-to-r from-green-400 to-green-600" 
                            style={{width: `${xpProgress}%`}}
                       ></div>
                       <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-black drop-shadow-md">
                           XP: {profile.experience}/{nextLevelXp}
                       </div>
                   </div>

                   {/* Currencies */}
                   <div className="flex justify-center md:justify-end gap-3 text-sm font-bold mt-1 font-pixel bg-black/30 p-1 rounded text-white">
                       <span className="flex items-center text-green-400">🟢 {profile.emeralds}</span>
                       <span className="flex items-center text-cyan-400">💎 {profile.diamonds}</span>
                   </div>
               </div>
           </div>
       </div>

       {/* MAPA DE QUESTS (COLUNAS) */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
           {[
               { id: TimeOfDay.MORNING, label: 'Manhã', icon: '🌅', bg: 'bg-sky-200' },
               { id: TimeOfDay.AFTERNOON, label: 'Tarde', icon: '☀️', bg: 'bg-orange-100' },
               { id: TimeOfDay.NIGHT, label: 'Noite', icon: '🌙', bg: 'bg-indigo-900 text-white' }
           ].map(section => (
                <div key={section.id} className={`flex flex-col h-full panel-game ${section.bg} border-4 border-white`}>
                    <div className="p-3 border-b-4 border-black/10 flex items-center justify-center gap-2 bg-white/50 backdrop-blur-sm">
                        <span className="text-2xl">{section.icon}</span>
                        <h3 className="font-display text-xl text-gray-800 tracking-wide">{section.label}</h3>
                    </div>
                    
                    <div className="p-3 min-h-[300px]">
                        {tasks.filter(t => t.timeOfDay === section.id).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-40 py-10">
                                <span className="text-4xl grayscale">💤</span>
                                <span className="font-bold font-pixel mt-2 text-gray-500">Sem Missões</span>
                            </div>
                        ) : (
                            tasks.filter(t => t.timeOfDay === section.id).map(t => <QuestCard key={t.id} task={t}/>)
                        )}
                    </div>
                </div>
           ))}
       </div>

       {/* Floating Action Buttons (Inventory Style) */}
       <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
           <button 
               onClick={() => { setActiveModal('BUILDER'); sfx.play('click'); }}
               className="w-16 h-16 bg-[#a07449] rounded-lg border-b-4 border-[#6d4e34] shadow-lg flex flex-col items-center justify-center text-white hover:translate-y-1 hover:border-b-0 transition-all active:bg-[#8b5e3c]"
               title="Grimório de Arte"
           >
               <Palette size={24} />
               <span className="text-[10px] font-bold font-pixel">CRIAR</span>
           </button>

           <button 
               onClick={() => { setActiveModal('SHOP'); sfx.play('click'); }}
               className="w-16 h-16 bg-[#ffd700] rounded-lg border-b-4 border-[#b8860b] shadow-lg flex flex-col items-center justify-center text-[#5d4037] hover:translate-y-1 hover:border-b-0 transition-all active:bg-[#ffc107]"
               title="Mercador"
           >
               <Gift size={28} />
               <span className="text-[10px] font-bold font-pixel">LOJA</span>
           </button>
       </div>

       {/* Task Detail Modal (Scroll Style) */}
       {selectedTask && (
           <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
               <div className="panel-game max-w-sm w-full p-0 bg-[#fdf5e6] overflow-hidden relative">
                   <div className="h-4 bg-red-500 w-full absolute top-0"></div>
                   
                   <div className="p-8 text-center">
                       <h3 className="font-display text-3xl text-[#5d4037] mb-2">{selectedTask.title}</h3>
                       <div className="w-16 h-1 bg-[#5d4037] mx-auto mb-6 rounded"></div>
                       <p className="text-[#8d6e63] mb-8 text-lg font-medium leading-relaxed">
                           "{selectedTask.description || "Complete esta missão para ganhar recompensas incríveis!"}"
                       </p>
                       
                       {isUploading ? (
                           <div className="py-8 flex flex-col items-center gap-4">
                               <RefreshCw className="animate-spin text-[#5d4037]" size={48}/>
                               <span className="text-xl font-bold text-[#5d4037] animate-pulse font-pixel">ENVIANDO...</span>
                           </div>
                       ) : (
                           <div className="flex flex-col gap-3">
                               <button onClick={() => fileInputRef.current?.click()} className="btn-game btn-primary w-full py-4 text-xl shadow-lg">
                                   <Camera size={24} /> PROVAR SUCESSO
                               </button>
                               <button onClick={() => setSelectedTask(null)} className="btn-game bg-gray-300 text-gray-700 border-gray-400 w-full py-3">
                                   DEIXAR PARA DEPOIS
                               </button>
                           </div>
                       )}
                   </div>
               </div>
           </div>
       )}

       {/* Shop Modal (Villager Trade Style) */}
       {activeModal === 'SHOP' && (
           <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in">
               <div className="panel-wood w-full max-w-3xl flex flex-col max-h-[90vh] rounded-xl shadow-2xl border-4 border-[#6d4e34]">
                   {/* Header */}
                   <div className="p-4 border-b-4 border-[#6d4e34] flex justify-between items-center bg-[#8b5e3c]">
                       <div className="flex items-center gap-3">
                           <div className="bg-[#ffd700] p-2 rounded border-2 border-[#b8860b]">
                               <Gift className="text-[#5d4037]" size={24} />
                           </div>
                           <h2 className="font-display text-3xl text-white drop-shadow-md">Mercado da Vila</h2>
                       </div>
                       <button onClick={() => setActiveModal('NONE')} className="bg-red-500 text-white p-2 rounded border-b-4 border-red-800 active:border-b-0 active:translate-y-1"><X size={24}/></button>
                   </div>
                   
                   <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto bg-[#c6c6c6]">
                       {rewards.map(r => {
                           const canBuy = (r.currency === 'diamond' ? profile.diamonds : profile.emeralds) >= r.cost;
                           const isBlock = r.type === 'block';
                           
                           return (
                               <button 
                                   key={r.id}
                                   onClick={() => canBuy && onBuyReward(r.id)}
                                   disabled={!canBuy}
                                   className={`
                                       relative p-2 flex flex-col items-center gap-2 transition-all group
                                       border-4 ${canBuy ? 'bg-[#8b8b8b] border-[#555] hover:bg-[#a0a0a0] hover:scale-105 cursor-pointer' : 'bg-[#555] border-[#333] opacity-60 cursor-not-allowed'}
                                   `}
                               >
                                   {/* Item Frame Look */}
                                   <div className={`w-20 h-20 bg-[#333] border-4 border-[#222] shadow-inner flex items-center justify-center mb-1 relative`}>
                                        <div className="text-4xl filter drop-shadow-md transform group-hover:scale-110 transition-transform" style={isBlock ? {color: r.blockColor} : {}}>
                                            {r.icon}
                                        </div>
                                   </div>

                                   <div className="text-center w-full bg-[#333] p-2 rounded-sm border border-[#000]">
                                       <h3 className="font-bold text-white font-pixel text-lg truncate w-full">{r.title}</h3>
                                       <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 text-sm font-bold rounded ${r.currency === 'diamond' ? 'text-cyan-300' : 'text-green-400'}`}>
                                           {r.cost} {r.currency === 'diamond' ? '💎' : '🟢'}
                                       </div>
                                   </div>
                                   
                                   {canBuy && (
                                       <div className="absolute top-2 right-2 bg-yellow-400 text-black p-1 rounded-full animate-bounce shadow-md">
                                           <Zap size={12} fill="currentColor"/>
                                       </div>
                                   )}
                               </button>
                           );
                       })}
                   </div>
               </div>
           </div>
       )}

       {/* Builder Mode Modal */}
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
