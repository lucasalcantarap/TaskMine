
import { UserProfile, Task } from '../types';

export const AVATARS_BY_LEVEL = [
  { level: 1, emoji: "👕", name: "Steve (Novato)", desc: "Apenas uma camiseta azul." },
  { level: 3, emoji: "🟤", name: "Couro (Explorador)", desc: "Proteção básica para explorar." },
  { level: 5, emoji: "⚪", name: "Ferro (Guerreiro)", desc: "Armadura brilhante e resistente." },
  { level: 10, emoji: "🟡", name: "Ouro (Veterano)", desc: "Estiloso, mas quebra rápido!" },
  { level: 20, emoji: "💎", name: "Diamante (Mestre)", desc: "A proteção suprema do jogo." },
  { level: 50, emoji: "🟣", name: "Netherite (Lenda)", desc: "Mais forte que diamante." }
];

export class GameEngine {
  
  static getAvatarForLevel(level: number) {
    return AVATARS_BY_LEVEL.slice().reverse().find(a => level >= a.level) || AVATARS_BY_LEVEL[0];
  }

  /**
   * Calcula o novo estado do perfil após aprovar uma tarefa.
   * Regra: Tarefa dá XP e Esmeraldas. Level Up dá Cristais (Diamantes).
   */
  static calculateLevelUp(profile: UserProfile, task: Task): UserProfile {
    // 1. Adicionar recompensas básicas da tarefa
    // 'points' no objeto Task representa o XP
    const xpGained = task.points || 10; 
    const emeraldsGained = task.emeralds || 0;
    
    let newEmeralds = profile.emeralds + emeraldsGained;
    let newDiamonds = profile.diamonds + (task.diamonds || 0); // Diamantes diretos são raros, mas possíveis

    // 2. Calcular XP acumulado
    let currentExperience = profile.experience + xpGained;
    let currentLevel = profile.level;
    const xpForNextLevel = currentLevel * 100;

    // 3. Verificar Level Up (Pode subir mais de um nível se o XP for alto)
    let levelsGained = 0;
    while (currentExperience >= (currentLevel * 100)) {
      currentExperience -= (currentLevel * 100);
      currentLevel++;
      levelsGained++;
    }

    // 4. Bônus de Level Up (Cristais)
    if (levelsGained > 0) {
        // Ganha 5 cristais por nível subido
        const crystalReward = levelsGained * 5;
        newDiamonds += crystalReward;
        
        // Recupera HP ao subir de nível
        profile.hp = profile.maxHp; 
    }

    const avatarData = this.getAvatarForLevel(currentLevel);

    return {
      ...profile,
      experience: currentExperience,
      level: currentLevel,
      emeralds: newEmeralds,
      diamonds: newDiamonds,
      rank: avatarData.name
    };
  }
}
