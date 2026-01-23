
import { db } from './firebase';
import { ref, onValue, set, push, get } from 'firebase/database';
import { IRepository, ServerMessage, WorldActivity, GlobalGoal } from '../types';

export class FirebaseRepository<T> implements IRepository<T> {
  constructor(private path: string, private defaultValue: T) {}

  subscribe(callback: (data: T) => void): () => void {
    const dbRef = ref(db, this.path);
    return onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      callback(data === null ? this.defaultValue : data);
    });
  }

  async save(data: T): Promise<void> {
    const dbRef = ref(db, this.path);
    await set(dbRef, data);
  }

  async addToList(item: any): Promise<void> {
    const dbRef = ref(db, this.path);
    const newRef = push(dbRef);
    await set(newRef, { ...item, id: newRef.key });
  }

  async exists(): Promise<boolean> {
    const dbRef = ref(db, this.path);
    const snapshot = await get(dbRef);
    return snapshot.exists();
  }
}

export class RepositoryFactory {
  static createFamilyContext(familyId: string) {
    const root = `families/${familyId}`;
    return {
      root: new FirebaseRepository<any>(root, null),
      tasks: new FirebaseRepository<any[]>(`${root}/tasks`, []),
      profile: new FirebaseRepository<any>(`${root}/profile`, {
        name: 'Herói',
        emeralds: 0,
        diamonds: 0,
        hp: 100,
        maxHp: 100,
        level: 1,
        experience: 0,
        streak: 0,
        inventory: {},
        worldBlocks: [],
        rank: 'Steve',
        sensoryMode: 'standard',
        showDayMap: true
      }),
      rewards: new FirebaseRepository<any[]>(`${root}/rewards`, [
        { id: '1', title: 'Bloco de Grama', cost: 10, currency: 'emerald', icon: '🌱', type: 'block', blockColor: '#58a034' },
        { id: '2', title: 'Bloco de Pedra', cost: 20, currency: 'emerald', icon: '🪨', type: 'block', blockColor: '#8b8b8b' },
        { id: '3', title: 'Tempo Extra (15min)', cost: 5, currency: 'diamond', icon: '⏳', type: 'real_life' }
      ]),
      settings: new FirebaseRepository<any>(`${root}/settings`, { 
        parentPin: '1234', 
        familyName: 'Novo Mundo',
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
      globalGoal: new FirebaseRepository<GlobalGoal>(`${root}/goal`, { title: 'Passeio Especial', targetEmeralds: 1000, currentEmeralds: 0 })
    };
  }
}
