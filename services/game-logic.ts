
import { UserProfile, Task, TimeOfDay } from '../types';

// Avatares estilo Pixel Art gerados dinamicamente via DiceBear API
export const AVATARS_BY_LEVEL = [
  { 
    level: 1, 
    image: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Steve&backgroundColor=b6e3f4", 
    name: "Novato", 
    desc: "Apenas o começo." 
  },
  { 
    level: 3, 
    image: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Explorer&glasses=probability=100&backgroundColor=c0aede", 
    name: "Explorador", 
    desc: "Pronto para aventura." 
  },
  { 
    level: 5, 
    image: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Warrior&clothing=armor&backgroundColor=ffdfbf", 
    name: "Guerreiro", 
    desc: "Forte e corajoso." 
  },
  { 
    level: 10, 
    image: "https://api.dicebear.com/9.x/pixel-art/svg?seed=King&clothing=cape&backgroundColor=ffd5dc", 
    name: "Veterano", 
    desc: "Respeitado por todos." 
  },
  { 
    level: 20, 
    image: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Wizard&clothing=robe&backgroundColor=d1d4f9", 
    name: "Mestre", 
    desc: "Lenda viva." 
  },
  { 
    level: 50, 
    image: "https://api.dicebear.com/9.x/pixel-art/svg?seed=GodMode&eyes=variant15&backgroundColor=ffdfbf", 
    name: "Deus Voxel", 
    desc: "Onipotente." 
  }
];

export class GameEngine {
  
  static getAvatarForLevel(level: number) {
    return AVATARS_BY_LEVEL.slice().reverse().find(a => level >= a.level) || AVATARS_BY_LEVEL[0];
  }

  static isTaskExpired(task: Task): boolean {
    const hour = new Date().getHours();
    
    // Definição dos finais de turno
    const morningEnd = 12;   // 12:00
    const afternoonEnd = 18; // 18:00
    // Noite termina as 06:00 do dia seguinte, lógica tratada pelo reset diário ou checagem simples
    
    if (task.timeOfDay === TimeOfDay.MORNING && hour >= morningEnd) return true;
    if (task.timeOfDay === TimeOfDay.AFTERNOON && hour >= afternoonEnd) return true;
    // Tarefas da noite só expiram tecnicamente as 6am, assumimos que não expiram no mesmo dia para simplificar
    
    return false;
  }

  static calculateLevelUp(profile: UserProfile, task: Task): UserProfile {
    const xpGained = task.points || 10; 
    const emeraldsGained = task.emeralds || 0;
    
    let newEmeralds = profile.emeralds + emeraldsGained;
    let newDiamonds = profile.diamonds + (task.diamonds || 0);

    let currentExperience = profile.experience + xpGained;
    let currentLevel = profile.level;

    // Lógica de Level Up
    let levelsGained = 0;
    while (currentExperience >= (currentLevel * 100)) {
      currentExperience -= (currentLevel * 100);
      currentLevel++;
      levelsGained++;
    }

    if (levelsGained > 0) {
        newDiamonds += levelsGained * 5; // Bônus de 5 diamantes por nível
    }

    // Retorna novo objeto sem mutar o anterior
    return {
      ...profile,
      experience: currentExperience,
      level: currentLevel,
      emeralds: newEmeralds,
      diamonds: newDiamonds,
      hp: levelsGained > 0 ? profile.maxHp : profile.hp, // Cura ao upar
      rank: this.getAvatarForLevel(currentLevel).name
    };
  }
}
