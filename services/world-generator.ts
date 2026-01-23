
/**
 * WorldGenerator: Utilitário para criar IDs de servidor únicos e temáticos.
 */
export class WorldGenerator {
  private static ADJECTIVES = ['SUPER', 'MEGA', 'HIPER', 'EPICO', 'NOVO', 'REAL', 'OURO', 'BOM'];
  private static MOBS = ['HEROI', 'STEVE', 'ALEX', 'WOLF', 'FOX', 'BEAR', 'CAT', 'BEE'];

  /**
   * Gera um código no formato ADJETIVO-MOB-NUM (Ex: SUPER-FOX-99)
   * Curto e fácil para crianças digitarem se necessário.
   */
  static generateSeed(): string {
    const adj = this.ADJECTIVES[Math.floor(Math.random() * this.ADJECTIVES.length)];
    const mob = this.MOBS[Math.floor(Math.random() * this.MOBS.length)];
    const num = Math.floor(10 + Math.random() * 90); // 2 dígitos para ser rápido
    return `${adj}-${mob}-${num}`;
  }
}
