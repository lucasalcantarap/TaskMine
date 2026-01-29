import { db } from './firebase';
import { IRepository, ServerMessage, WorldActivity, GlobalGoal, TimeOfDay, TaskStatus } from '../types';

export class FirebaseRepository<T> implements IRepository<T> {
  constructor(private path: string, private defaultValue: T) { }

  subscribe(callback: (data: T) => void): () => void {
    const dbRef = db.ref(this.path);
    const handler = (snapshot: any) => {
      const data = snapshot.val();
      callback(data === null ? this.defaultValue : data);
    };
    // Namespaced API uses .on() and .off()
    dbRef.on('value', handler);
    return () => dbRef.off('value', handler);
  }

  async save(data: T): Promise<void> {
    const dbRef = db.ref(this.path);
    await dbRef.set(data);
  }

  async addToList(item: any): Promise<void> {
    const dbRef = db.ref(this.path);
    // Namespaced API push() returns a ThenableReference
    const newRef = dbRef.push();
    await newRef.set({ ...item, id: newRef.key });
  }

  async exists(): Promise<boolean> {
    const dbRef = db.ref(this.path);
    // Namespaced API support for get() was added in newer versions, assuming available or falling back could be done
    // but standard compat/v9 has .get()
    const snapshot = await dbRef.get();
    return snapshot.exists();
  }
}

export class RepositoryFactory {
  static createFamilyContext(familyId: string) {
    const root = `families/${familyId}`;
    return {
      root: new FirebaseRepository<any>(root, null),

      // EXAMPLES OF GOTHIC / CASTLE TASKS
      tasks: new FirebaseRepository<any[]>(`${root}/tasks`, [
        {
          id: 't1', title: 'Escovar as Presas', description: 'Higiene Matinal',
          timeOfDay: TimeOfDay.MORNING, points: 50, emeralds: 5, diamonds: 0,
          status: TaskStatus.PENDING, steps: []
        },
        {
          id: 't2', title: 'Equipar Armadura', description: 'Trocar de roupa para a escola',
          timeOfDay: TimeOfDay.MORNING, points: 50, emeralds: 5, diamonds: 0,
          status: TaskStatus.PENDING, steps: []
        },
        {
          id: 't3', title: 'Pergaminho da Sabedoria', description: 'Fazer o dever de casa',
          timeOfDay: TimeOfDay.AFTERNOON, points: 100, emeralds: 15, diamonds: 1,
          status: TaskStatus.PENDING, steps: []
        },
        {
          id: 't4', title: 'Limpar a Masmorra', description: 'Guardar os brinquedos',
          timeOfDay: TimeOfDay.AFTERNOON, points: 80, emeralds: 10, diamonds: 0,
          status: TaskStatus.PENDING, steps: []
        },
        {
          id: 't5', title: 'Poção de Banho', description: 'Tomar banho',
          timeOfDay: TimeOfDay.NIGHT, points: 60, emeralds: 5, diamonds: 0,
          status: TaskStatus.PENDING, steps: []
        },
        {
          id: 't6', title: 'Descanso na Cripta', description: 'Ir dormir no horário',
          timeOfDay: TimeOfDay.NIGHT, points: 100, emeralds: 10, diamonds: 0,
          status: TaskStatus.PENDING, steps: []
        }
      ]),

      profile: new FirebaseRepository<any>(`${root}/profile`, {
        name: 'Vampire Hunter',
        emeralds: 50, // Start with some currency to buy blocks
        diamonds: 0,
        hp: 100,
        maxHp: 100,
        level: 1,
        experience: 0,
        streak: 0,
        inventory: {},
        worldBlocks: [],
        rank: 'Belmont',
        sensoryMode: 'standard',
        showDayMap: true
      }),

      // SHOP WITH BLOCKS (PIXEL ART) AND REWARDS
      rewards: new FirebaseRepository<any[]>(`${root}/rewards`, [
        { id: 'b1', title: 'Pedra de Sangue', cost: 5, currency: 'emerald', icon: '🟥', type: 'block', blockColor: '#8a0303' },
        { id: 'b2', title: 'Cristal Espiritual', cost: 5, currency: 'emerald', icon: '🟦', type: 'block', blockColor: '#4deeea' },
        { id: 'b3', title: 'Ouro Puro', cost: 10, currency: 'emerald', icon: '🟨', type: 'block', blockColor: '#d4af37' },
        { id: 'b4', title: 'Obsidiana', cost: 5, currency: 'emerald', icon: '⬛', type: 'block', blockColor: '#1a1a1a' },
        { id: 'b5', title: 'Mármore Branco', cost: 5, currency: 'emerald', icon: '⬜', type: 'block', blockColor: '#f0f0f0' },
        { id: 'r1', title: 'Banquete de Pizza', cost: 200, currency: 'emerald', icon: '🍕', type: 'real_life' },
        { id: 'r2', title: 'Sessão de Cinema', cost: 150, currency: 'emerald', icon: '🎬', type: 'real_life' },
        { id: 'r3', title: 'Passeio no Parque', cost: 100, currency: 'emerald', icon: '🌳', type: 'real_life' },
        { id: 'r4', title: 'Tempo de Tela (30m)', cost: 1, currency: 'diamond', icon: '📱', type: 'real_life' },
        { id: 'p1', title: 'Poção de Vida', cost: 20, currency: 'emerald', icon: '🧪', type: 'potion' }
      ]),

      settings: new FirebaseRepository<any>(`${root}/settings`, {
        parentPin: '1234',
        familyName: 'Castelo Drácula',
        lastReset: '',
        rules: {
          allowShop: true,
          allowBuilder: true,
          xpMultiplier: 1,
          damageMultiplier: 1,
          requireEvidence: true
        }
      }),
      messages: new FirebaseRepository<ServerMessage[]>(`${root}/messages`, []),
      activities: new FirebaseRepository<WorldActivity[]>(`${root}/activities`, []),
      penalties: new FirebaseRepository<string[]>(`${root}/penalties`, []),
      globalGoal: new FirebaseRepository<GlobalGoal>(`${root}/goal`, { title: 'Viagem de Férias', targetEmeralds: 5000, currentEmeralds: 0 })
    };
  }
}