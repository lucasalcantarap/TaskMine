
/**
 * WorldGenerator: Utilitário para criar IDs de servidor únicos e temáticos.
 */
export class WorldGenerator {
  private static ADJECTIVES = ['BRAVE', 'GOLDEN', 'MINER', 'CRAFTY', 'BLOCKY', 'DIAMOND', 'ANCIENT', 'HIDDEN', 'ENDER'];
  private static MOBS = ['STEVE', 'CREEPER', 'ZOMBIE', 'PIGLIN', 'ENDERMAN', 'SKELETON', 'GHAST', 'AXOLOTL', 'WARDEN'];

  /**
   * Gera um código no formato ADJETIVO-MOB-XXXX
   */
  static generateSeed(): string {
    const adj = this.ADJECTIVES[Math.floor(Math.random() * this.ADJECTIVES.length)];
    const mob = this.MOBS[Math.floor(Math.random() * this.MOBS.length)];
    const num = Math.floor(100 + Math.random() * 900); // 3 dígitos
    return `${adj}-${mob}-${num}`;
  }
}
