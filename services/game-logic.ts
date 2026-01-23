
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
    // Encontra o avatar com o maior nível que seja menor ou igual ao nível atual
    return AVATARS_BY_LEVEL.slice().reverse().find(a => level >= a.level) || AVATARS_BY_LEVEL[0];
  }

  /**
   * Calcula o novo estado do perfil após aprovar uma tarefa.
   */
  static calculateLevelUp(profile: UserProfile, task: Task): UserProfile {
    // 1. Adicionar recompensas
    const xpGained = task.emeralds || 0; 
    const newEmeralds = profile.emeralds + (task.emeralds || 0);
    const newDiamonds = profile.diamonds + (task.diamonds || 0);

    // 2. Calcular XP acumulado
    let currentExperience = profile.experience + xpGained;
    let currentLevel = profile.level;
    const xpForNextLevel = currentLevel * 100;

    // 3. Verificar Level Up
    if (currentExperience >= xpForNextLevel) {
      currentLevel++;
      currentExperience = currentExperience - xpForNextLevel;
    }

    // 4. Atualizar Rank baseado no nível
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
