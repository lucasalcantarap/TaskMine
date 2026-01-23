
import { UserProfile, Task } from '../types';

export const AVATARS_BY_LEVEL = [
  {emoji:"👦🏻🟩", name:"Aventureiro Inicial", desc:"Começa sua jornada entre os blocos de grama."},
  {emoji:"👦🏻🪓", name:"Lenhador Novato", desc:"Aprende a usar a picareta de madeira."},
  {emoji:"👦🏻🗡️", name:"Espadachim de Madeira", desc:"Domina a espada básica de madeira."},
  {emoji:"👦🏻🛡️", name:"Escudeiro", desc:"Protege-se com escudo de couro."},
  {emoji:"👦🏻🛡️✨", name:"Escudeiro Encantado", desc:"Escudo mágico que brilha em batalha."},
  {emoji:"👦🏻⚔️", name:"Guerreiro de Ferro", desc:"Usa espada de ferro com habilidade."},
  {emoji:"👦🏻⚔️🔥", name:"Guerreiro Flamejante", desc:"Espada flamejante que queima inimigos."},
  {emoji:"👦🏻🏹", name:"Arqueiro", desc:"Treina arco de madeira."},
  {emoji:"👦🏻🏹✨", name:"Arqueiro Encantado", desc:"Arco encantado que dispara flechas mágicas."},
  {emoji:"👦🏻💎", name:"Minerador de Diamante", desc:"Descobre o valioso diamante."},
  {emoji:"🐑👦🏻", name:"Amigo Ovelha", desc:"Adquire seu primeiro mascote fofo."},
  {emoji:"🐺👦🏻", name:"Lobo Companheiro", desc:"Lobo leal que protege em aventuras."},
  {emoji:"🐉👦🏻", name:"Dragão Inicial", desc:"Um pequeno dragão para acompanhar você."},
  {emoji:"🐉🔥👦🏻", name:"Dragão Flamejante", desc:"Dragão que cospe fogo contra inimigos."},
  {emoji:"💎⚔️👦🏻", name:"Guerreiro de Diamante", desc:"Combina força e proteção com diamante."},
  {emoji:"💎🛡️👦🏻", name:"Defensor Diamante", desc:"Escudo e armadura reluzentes de diamante."},
  {emoji:"⚒️💎👦🏻", name:"Minerador Experiente", desc:"Picareta de ferro + diamante para minerar mais rápido."},
  {emoji:"⚒️💎✨👦🏻", name:"Minerador Mágico", desc:"Picareta de diamante encantada para grandes aventuras."},
  {emoji:"👑👦🏻", name:"Pequeno Rei", desc:"Ganha sua primeira coroa de liderança."},
  {emoji:"🧙‍♂️💎⚔️", name:"Mago Guerreiro", desc:"Aprende magia e combate com diamante."},
  {emoji:"👦🏻城堡", name:"Construtor de Castelos", desc:"Começa a erguer seu primeiro castelo."},
  {emoji:"🛡️⚔️👦🏻", name:"Guerreiro Completo", desc:"Equipado com espada e escudo de ferro."},
  {emoji:"🐉💎👦🏻", name:"Dragão de Diamante", desc:"Dragão agora brilha com pedras preciosas."},
  {emoji:"🐺⚔️👦🏻", name:"Lobo Guerreiro", desc:"Lobo treinado para batalhas."},
  {emoji:"🧙‍♂️🔥⚔️", name:"Mago Flamejante", desc:"Combina magia com espada flamejante."},
  {emoji:"👦🏻🏹💎", name:"Arqueiro de Diamante", desc:"Flechas certeiras e poderosas."},
  {emoji:"⚔️✨👦🏻", name:"Espadachim Encantado", desc:"Espada reluzente com poderes mágicos."},
  {emoji:"🛡️💎✨👦🏻", name:"Guardião Encantado", desc:"Escudo e diamante com efeito mágico."},
  {emoji:"🐉👑👦🏻", name:"Dragão Chefe", desc:"Dragão com coroa, senhor do reino."},
  {emoji:"🧙‍♂️💎✨", name:"Mago Avançado", desc:"Mestre da magia com poder de diamante."}
];

export class GameEngine {
  static getXpRequired(level: number): number {
    return 200 + (level * 150);
  }

  static getRankInfo(level: number) {
    const idx = Math.min(level - 1, AVATARS_BY_LEVEL.length - 1);
    const data = AVATARS_BY_LEVEL[idx] || AVATARS_BY_LEVEL[0];
    
    // Cores de badge baseadas em progressão
    let color = '#58a034'; // Madeira/Grama
    if (level >= 10) color = '#8b8b8b'; // Pedra/Ferro
    if (level >= 20) color = '#ffcf3f'; // Ouro
    if (level >= 30) color = '#5fffff'; // Diamante

    return { ...data, color };
  }

  static calculateLevelUp(currentProfile: UserProfile, task: Task): UserProfile {
    let newXp = currentProfile.experience + task.points;
    let newLevel = currentProfile.level;
    
    while (newXp >= this.getXpRequired(newLevel)) {
      newXp -= this.getXpRequired(newLevel);
      newLevel++;
    }

    const rankInfo = this.getRankInfo(newLevel);
    const newHp = Math.min(currentProfile.maxHp, currentProfile.hp + 10); // Neurodiversidade: HP regenera mais rápido por tarefa

    return {
      ...currentProfile,
      experience: newXp,
      level: newLevel,
      rank: rankInfo.name,
      emeralds: currentProfile.emeralds + (task.emeralds || 0),
      diamonds: currentProfile.diamonds + (task.diamonds || 0),
      hp: newHp
    };
  }
}
