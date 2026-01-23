
import React, { useState, useRef } from 'react';
import { Task, TimeOfDay, TaskStatus, UserProfile, Reward } from '../types';
import { Gift, FlaskConical, Sword, Clock, Pickaxe, Check, AlertCircle } from 'lucide-react';
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

const ChildDashboard: React.FC<ChildDashboardProps> = ({ 
  tasks, profile, rewards, onCompleteTask, onBuyReward 
}) => {
  const [activeModal, setActiveModal] = useState<'NONE' | 'SHOP' | 'STATS'>('NONE');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarData = GameEngine.getAvatarForLevel(profile.level);
  const nextLevelXp = profile.level * 100;
  const progress = Math.min((profile.experience / nextLevelXp) * 100, 100);

  // Filtra tarefas
  const morningTasks = tasks.filter(t => t.timeOfDay === TimeOfDay.MORNING);
  const afternoonTasks = tasks.filter(t => t.timeOfDay === TimeOfDay.AFTERNOON);
  const nightTasks = tasks.filter(t => t.timeOfDay === TimeOfDay.NIGHT);

  const handleTaskClick = (task: Task) => {
    if (task.status === TaskStatus.APPROVED) { sfx.play('click'); return; }
    if (task.status === TaskStatus.COMPLETED) { alert("O Mestre já está analisando isso!"); return; }
    
    setSelectedTask(task);
    // Simula clique no input de arquivo
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedTask) {
        const reader = new FileReader();
        reader.onloadend = () => {
            onCompleteTask(selectedTask.id, reader.result as string, 'photo');
            setSelectedTask(null);
            sfx.play('success');
        };
        reader.readAsDataURL(file);
    }
  };

  // Componente de Cartão de Bioma (Lista de Tarefas)
  const BiomeCard = ({ title, icon, items, bgClass }: { title: string, icon: any, items: Task[], bgClass: string }) => {
    const completedCount = items.filter(t => t.status === TaskStatus.APPROVED).length;
    const isFullComplete = items.length > 0 && completedCount === items.length;

    return (
        <div className={`flex-none w-[85vw] md:w-96 h-[65vh] rounded-xl border-4 border-black relative flex flex-col shadow-2xl overflow-hidden ${bgClass}`}>
            
            {/* Header */}
            <div className="bg-black/70 p-4 border-b-4 border-black flex justify-between items-center backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg text-white">{icon}</div>
                    <div>
                        <h3 className="font-game text-white text-sm text-stroke tracking-wider">{title}</h3>
                        <div className="w-24 h-2 bg-gray-700 mt-1 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 transition-all" style={{ width: `${(completedCount / Math.max(items.length, 1)) * 100}%` }}></div>
                        </div>
                    </div>
                </div>
                {isFullComplete && <Check className="text-green-400 w-8 h-8 animate-bounce" />}
            </div>

            {/* Lista Scrollável */}
            <div className="p-4 overflow-y-auto flex-grow space-y-3">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-80">
                         <div className="bg-black/40 p-4 rounded-xl">
                            <h4 className="font-game text-xs text-white mb-2">SEM MISSÕES</h4>
                            <p className="font-pixel text-gray-300 text-lg">Explore outros biomas.</p>
                         </div>
                    </div>
                ) : (
                    items.map(task => {
                        const isDone = task.status === TaskStatus.APPROVED;
                        const isReview = task.status === TaskStatus.COMPLETED;
                        
                        return (
                            <div 
                                key={task.id}
                                onClick={() => handleTaskClick(task)}
                                className={`
                                    relative p-3 border-b-4 border-r-4 rounded-lg flex items-center gap-3 transition-transform active:scale-95 cursor-pointer
                                    ${isDone ? 'bg-green-900/80 border-green-950 opacity-70 grayscale' : 'bg-[#c6c6c6] border-[#555]'}
                                    ${isReview ? 'bg-yellow-200 border-yellow-600' : ''}
                                `}
                            >
                                {/* Ícone de Status */}
                                <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border-2 border-black/20 rounded ${isDone ? 'bg-green-500' : 'bg-white'}`}>
                                    <span className="text-2xl">{isDone ? '✅' : isReview ? '⏳' : '📦'}</span>
                                </div>

                                {/* Texto */}
                                <div className="flex-grow min-w-0">
                                    <h4 className={`font-game text-[10px] leading-tight mb-1 truncate ${isDone ? 'text-green-100 line-through' : 'text-[#212121]'}`}>
                                        {task.title}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="font-pixel text-sm font-bold text-blue-800 bg-blue-200 px-1 rounded border border-blue-400">
                                            +{task.points} XP
                                        </span>
                                        {task.emeralds > 0 && (
                                            <span className="font-pixel text-sm font-bold text-green-800 bg-green-200 px-1 rounded border border-green-400">
                                                +{task.emeralds} 🟢
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="pb-24 pt-2 h-full flex flex-col">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />

      {/* HUD SUPERIOR (Always Visible) */}
      <div className="bg-[#212121] border-b-4 border-black p-3 fixed top-0 left-0 w-full z-50 shadow-xl flex gap-3 items-center">
         {/* Avatar & Level */}
         <div className="relative">
             <div className="w-14 h-14 bg-[#8b8b8b] border-2 border-white flex items-center justify-center shadow-inner">
                 <span className="text-3xl animate-pulse">{profile.hp > 0 ? avatarData.emoji : '💀'}</span>
             </div>
             <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white font-game text-[8px] px-1 border border-white">
                LV.{profile.level}
             </div>
         </div>

         {/* Stats Bars */}
         <div className="flex-grow min-w-0 flex flex-col justify-center gap-1">
             <div className="flex justify-between items-end">
                 <span className="font-game text-[10px] text-white truncate">{profile.name}</span>
                 <span className={`font-game text-[8px] ${profile.hp < 30 ? 'text-red-500 animate-pulse' : 'text-red-400'}`}>
                    ♥ {profile.hp}
                 </span>
             </div>
             {/* XP Bar */}
             <div className="h-4 bg-black border border-[#555] relative w-full">
                 <div className="h-full bg-gradient-to-r from-green-600 to-lime-400 transition-all duration-700" style={{ width: `${progress}%` }}></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-pixel text-[10px] text-white drop-shadow-md tracking-wider">
                        XP {Math.floor(profile.experience)} / {nextLevelXp}
                    </span>
                 </div>
             </div>
         </div>

         {/* Wallet */}
         <div className="flex flex-col gap-1">
             <div className="bg-black/40 px-2 py-1 flex items-center justify-between gap-2 border border-[#555] rounded min-w-[60px]">
                 <span className="text-xs">💎</span>
                 <span className="font-game text-[8px] text-cyan-300">{profile.diamonds}</span>
             </div>
             <div className="bg-black/40 px-2 py-1 flex items-center justify-between gap-2 border border-[#555] rounded min-w-[60px]">
                 <span className="text-xs">🟢</span>
                 <span className="font-game text-[8px] text-green-300">{profile.emeralds}</span>
             </div>
         </div>
      </div>

      <div className="h-24"></div> {/* Spacer for fixed header */}

      {/* ÁREA DE JOGO (BIOMAS SCROLLÁVEIS) */}
      <div className="flex overflow-x-auto gap-4 px-4 pb-8 snap-x snap-mandatory items-start scroll-smooth">
        <div className="snap-center pt-2">
            <BiomeCard title="MANHÃ" icon={<Clock size={20}/>} items={morningTasks} bgClass="bg-biome-overworld" />
        </div>
        <div className="snap-center pt-2">
            <BiomeCard title="TARDE" icon={<Pickaxe size={20}/>} items={afternoonTasks} bgClass="bg-biome-cave" />
        </div>
        <div className="snap-center pt-2">
            <BiomeCard title="NOITE" icon={<Sword size={20}/>} items={nightTasks} bgClass="bg-biome-nether" />
        </div>
      </div>

      {/* HOTBAR (Navegação Inferior) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#c6c6c6] p-1 border-2 border-black flex gap-2 shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-50 rounded">
         <button 
            onClick={() => setActiveModal('SHOP')}
            className="w-16 h-16 bg-[#8b8b8b] border-2 border-white hover:bg-[#a0a0a0] active:border-[#555] active:bg-[#6b6b6b] flex flex-col items-center justify-center gap-1 group relative"
         >
             <Gift size={28} className="text-white drop-shadow-md group-hover:-translate-y-1 transition-transform"/>
             <span className="font-pixel text-[10px] text-white bg-black/50 px-1 rounded">LOJA</span>
         </button>
         
         <div className="w-1 bg-[#555] mx-1"></div>

         <button 
            onClick={() => setActiveModal('STATS')}
            className="w-16 h-16 bg-[#8b8b8b] border-2 border-white hover:bg-[#a0a0a0] active:border-[#555] active:bg-[#6b6b6b] flex flex-col items-center justify-center gap-1 group relative"
         >
             <FlaskConical size={28} className="text-purple-300 drop-shadow-md group-hover:-translate-y-1 transition-transform"/>
             <span className="font-pixel text-[10px] text-white bg-black/50 px-1 rounded">POÇÕES</span>
         </button>
      </div>

      {/* MODAL (Genérico para Loja e Stats) */}
      {activeModal !== 'NONE' && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="mc-panel w-full max-w-md flex flex-col max-h-[85vh] relative">
                
                {/* Header */}
                <div className="bg-[#3b3b3b] p-3 border-b-2 border-[#1a1a1a] flex justify-between items-center">
                    <h2 className="font-game text-white text-xs">
                        {activeModal === 'SHOP' ? 'MERCADOR VIAJANTE' : 'ALQUIMIA & STREAK'}
                    </h2>
                    <button onClick={() => setActiveModal('NONE')} className="bg-red-600 text-white w-8 h-8 border-2 border-black font-bold hover:bg-red-500">X</button>
                </div>

                {/* Conteúdo */}
                <div className="p-4 overflow-y-auto bg-[#c6c6c6] flex-grow">
                    {activeModal === 'SHOP' && (
                        <div className="grid grid-cols-2 gap-3">
                            {rewards.length === 0 && <p className="col-span-2 text-center font-pixel text-gray-600">Loja vazia. Peça para o Mestre adicionar itens!</p>}
                            {rewards.map(r => {
                                const canBuy = (r.currency === 'diamond' ? profile.diamonds : profile.emeralds) >= r.cost;
                                return (
                                    <div key={r.id} onClick={() => canBuy && onBuyReward(r.id)} 
                                        className={`p-2 border-2 border-[#555] bg-[#8b8b8b] hover:bg-[#9b9b9b] active:translate-y-1 cursor-pointer flex flex-col items-center gap-2 relative ${!canBuy ? 'opacity-50 grayscale' : ''}`}
                                    >
                                        <div className="w-12 h-12 bg-black/20 flex items-center justify-center text-3xl rounded border border-white/10">
                                            {r.icon}
                                        </div>
                                        <div className="text-center w-full">
                                            <div className="font-pixel text-sm font-bold leading-tight h-8 flex items-center justify-center text-white drop-shadow-sm">{r.title}</div>
                                            <button className={`w-full mt-1 font-game text-[8px] py-2 rounded text-white ${r.currency === 'diamond' ? 'bg-cyan-600' : 'bg-green-600'}`}>
                                                {r.cost} {r.currency === 'diamond' ? '💎' : '🟢'}
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {activeModal === 'STATS' && (
                        <div className="flex flex-col gap-4 text-center">
                            <div className="bg-[#212121] p-6 border-4 border-[#000] rounded">
                                <div className="text-6xl mb-2 animate-bounce">🔥</div>
                                <h3 className="font-game text-white text-xs mb-2">SEQUÊNCIA (STREAK)</h3>
                                <p className="font-pixel text-5xl text-orange-500 font-bold">{profile.streak || 0} Dias</p>
                            </div>
                            
                            <div className="text-left bg-[#8b8b8b] p-4 border-2 border-white">
                                <p className="font-game text-[10px] text-[#212121] mb-2">PRÓXIMA RECOMPENSA:</p>
                                <div className="w-full h-4 bg-[#373737] border border-white rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400" style={{ width: `${Math.min(((profile.streak || 0)/7)*100, 100)}%` }}></div>
                                </div>
                                <p className="font-pixel text-xs text-[#212121] mt-1 text-right">Meta: 7 Dias</p>
                            </div>
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
