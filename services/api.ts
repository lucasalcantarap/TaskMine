
import { Task, UserProfile, Reward, SystemSettings } from '../types';

// Serviço para persistência JSON gratuita
const CLOUD_API = 'https://jsonblob.com/api/jsonBlob';

class ApiService {
  private getLocalKey(endpoint: string) {
    return `db_${endpoint.split('/')[1]}`;
  }

  // Gera Seed Local para fallback caso a nuvem falhe
  generateLocalId(): string {
    return `OFFLINE_${Date.now()}`;
  }

  private async request<T>(endpoint: string): Promise<T | null> {
    const localData = localStorage.getItem(this.getLocalKey(endpoint));
    if (!localData) return null;
    try {
      return JSON.parse(localData) as T;
    } catch (e) {
      return null;
    }
  }

  /**
   * Limpa e extrai o ID correto de links, textos com aspas ou query params
   */
  public cleanSeed(seed: string): string {
    if (!seed) return '';
    
    // Decodifica URI caso venha encoded
    let cleaned = decodeURIComponent(seed).trim();
    
    // Remove aspas
    cleaned = cleaned.replace(/['"]/g, '');

    // Se for uma URL completa do JSONBlob
    const jsonBlobMatch = cleaned.match(/jsonblob\.com\/api\/jsonBlob\/([a-zA-Z0-9-]+)/);
    if (jsonBlobMatch && jsonBlobMatch[1]) return jsonBlobMatch[1];

    // Se for o nosso Link Mágico (?join=...)
    if (cleaned.includes('join=')) {
        const parts = cleaned.split('join=');
        if (parts[1]) {
            return parts[1].split('&')[0]; // Pega o ID depois do join= e antes de outros params
        }
    }

    // Se tiver barras (ex: URL genérica), pega a última parte
    if (cleaned.includes('/')) {
        const parts = cleaned.split('/');
        return parts[parts.length - 1];
    }
    
    return cleaned;
  }

  /**
   * Cria um novo "mundo" na nuvem (Blob JSON) e retorna o ID (Seed)
   */
  async createCloudWorld(initialData: any): Promise<string | null> {
    try {
      const response = await fetch(CLOUD_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(initialData),
        referrerPolicy: 'no-referrer'
      });

      if (response.ok) {
        // Tenta pegar pelo header x-jsonblob (específico do serviço)
        const specificHeader = response.headers.get('x-jsonblob');
        if (specificHeader) return specificHeader;

        // Tenta header Location
        const location = response.headers.get('Location');
        if (location) {
          const parts = location.split('/');
          return parts[parts.length - 1]; 
        }
      }
      return null;
    } catch (e) {
      console.warn("API Offline ou Bloqueada (AdBlock?). Retornando nulo para ativar modo Offline.", e);
      return null;
    }
  }

  async syncToCloud(seed: string, data: any): Promise<boolean> {
    const cleanId = this.cleanSeed(seed);
    
    // Se for modo offline, não tenta sincronizar, apenas retorna sucesso (simulado)
    if (!cleanId || cleanId.startsWith('OFFLINE')) return true;

    try {
      const response = await fetch(`${CLOUD_API}/${cleanId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });
      return response.ok;
    } catch (e) {
      console.error("Erro ao sincronizar nuvem", e);
      return false;
    }
  }

  async fetchFromCloud(seed: string): Promise<any | null> {
    const cleanId = this.cleanSeed(seed);
    if (!cleanId || cleanId.startsWith('OFFLINE')) return null;

    try {
      const response = await fetch(`${CLOUD_API}/${cleanId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.error("Erro ao baixar dados da nuvem", e);
      return null;
    }
  }

  // --- Métodos Locais (Cache/Offline) ---

  // Fixed UserProfile initialization: added missing properties to comply with UserProfile type
  async getProfile(): Promise<UserProfile> {
    const data = await this.request<UserProfile>('/profile');
    return data || { 
      name: 'Player 1', 
      emeralds: 0, 
      diamonds: 0,
      hp: 100,
      maxHp: 100,
      level: 1, 
      experience: 0, 
      inventory: {}, 
      worldBlocks: [],
      rank: 'NOOB',
      sensoryMode: 'standard',
      showDayMap: true,
      streak: 0
    };
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    localStorage.setItem('db_profile', JSON.stringify(profile));
  }

  async getTasks(): Promise<Task[]> {
    const data = await this.request<Task[]>('/tasks');
    return data || [];
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    localStorage.setItem('db_tasks', JSON.stringify(tasks));
  }

  async getRewards(): Promise<Reward[]> {
    const data = await this.request<Reward[]>('/rewards');
    return data || [];
  }

  async saveRewards(rewards: Reward[]): Promise<void> {
    localStorage.setItem('db_rewards', JSON.stringify(rewards));
  }

  // Fixed SystemSettings initialization: added missing 'familyName' and 'rules' property
  async getSettings(): Promise<SystemSettings> {
    const data = await this.request<SystemSettings>('/settings');
    return data || { 
      parentPin: '1234', 
      familyName: 'Minetask Family',
      rules: {
        allowShop: true,
        allowBuilder: true,
        xpMultiplier: 1,
        damageMultiplier: 1,
        requireEvidence: true
      }
    };
  }

  async saveSettings(settings: SystemSettings): Promise<void> {
    localStorage.setItem('db_settings', JSON.stringify(settings));
  }
}

export const api = new ApiService();
