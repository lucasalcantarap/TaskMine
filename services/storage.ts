
import { IRepository, ServerMessage, WorldActivity, GlobalGoal } from '../types';

// Event bus for local updates to sync within the same session
class LocalBus {
  private listeners: Record<string, Function[]> = {};
  
  emit(key: string, data: any) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(cb => cb(data));
    }
  }

  subscribe(key: string, cb: Function) {
    if (!this.listeners[key]) this.listeners[key] = [];
    this.listeners[key].push(cb);
    return () => {
      this.listeners[key] = this.listeners[key].filter(l => l !== cb);
    };
  }
}
const bus = new LocalBus();

export class LocalRepository<T> implements IRepository<T> {
  constructor(private key: string, private defaultValue: T) {}

  subscribe(callback: (data: T) => void): () => void {
    // Initial call
    this.get().then(data => callback(data));
    
    // Subscribe to internal bus
    const unsubBus = bus.subscribe(this.key, callback);
    
    // Subscribe to storage events (cross-tab sync)
    const handleStorage = (e: StorageEvent) => {
        if (e.key === this.key && e.newValue) {
            callback(JSON.parse(e.newValue));
        }
    };
    window.addEventListener('storage', handleStorage);
    
    return () => {
        unsubBus();
        window.removeEventListener('storage', handleStorage);
    };
  }

  async save(data: T): Promise<void> {
    localStorage.setItem(this.key, JSON.stringify(data));
    bus.emit(this.key, data);
  }

  private async get(): Promise<T> {
    const val = localStorage.getItem(this.key);
    return val ? JSON.parse(val) : this.defaultValue;
  }

  async addToList(item: any): Promise<void> {
    const list = (await this.get()) as any;
    const newItem = { ...item, id: item.id || Date.now().toString() };
    
    if (Array.isArray(list)) {
        const newList = [...list, newItem];
        await this.save(newList as any);
    } else {
        const currentList = list ? Object.values(list) : [];
        await this.save([...currentList, newItem] as any);
    }
  }

  async exists(): Promise<boolean> {
    return localStorage.getItem(this.key) !== null;
  }
}

export class RepositoryFactory {
  static createFamilyContext(familyId: string) {
    const root = `minetask_${familyId}`;
    return {
      root: new LocalRepository<any>(root, null),
      tasks: new LocalRepository<any[]>(`${root}_tasks`, []),
      profile: new LocalRepository<any>(`${root}_profile`, {
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
      rewards: new LocalRepository<any[]>(`${root}_rewards`, [
        { id: '1', title: 'Bloco de Grama', cost: 10, currency: 'emerald', icon: '🌱', type: 'block', blockColor: '#58a034' },
        { id: '2', title: 'Bloco de Pedra', cost: 20, currency: 'emerald', icon: '🪨', type: 'block', blockColor: '#8b8b8b' },
        { id: '3', title: 'Tempo Extra (15min)', cost: 5, currency: 'diamond', icon: '⏳', type: 'real_life' }
      ]),
      settings: new LocalRepository<any>(`${root}_settings`, { 
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
      messages: new LocalRepository<ServerMessage[]>(`${root}_messages`, []),
      activities: new LocalRepository<WorldActivity[]>(`${root}_activities`, []),
      globalGoal: new LocalRepository<GlobalGoal>(`${root}_goal`, { title: 'Passeio Especial', targetEmeralds: 1000, currentEmeralds: 0 })
    };
  }
}
