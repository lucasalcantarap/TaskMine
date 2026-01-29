
export enum TimeOfDay {
  MORNING = 'Manhã',
  AFTERNOON = 'Tarde',
  NIGHT = 'Noite'
}

export enum TaskStatus {
  PENDING = 'Pendente',
  STARTED = 'Iniciada',
  DOING = 'Fazendo',
  COMPLETED = 'Em Revisão',
  APPROVED = 'Aprovada',
  REJECTED = 'Recusada',
  FAILED = 'Falhou'
}

export interface TaskStep {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  timeOfDay: TimeOfDay;
  points: number;
  emeralds: number;
  diamonds: number;
  status: TaskStatus;
  evidenceUrl?: string;
  evidenceType?: 'photo' | 'drawing';
  completedAt?: number;
  steps: TaskStep[];
  durationMinutes?: number;
  parentFeedback?: string;
  recurrence?: 'daily' | 'none';
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  currency: 'emerald' | 'diamond';
  icon: string;
  type: 'block' | 'outfit' | 'real_life' | 'potion';
  blockColor?: string;
}

export interface PlacedBlock {
  x: number;
  y: number;
  id: string;
  color: string;
  name: string;
}

export interface UserProfile {
  name: string;
  emeralds: number;
  diamonds: number;
  hp: number;
  maxHp: number;
  level: number;
  experience: number;
  streak: number;
  inventory: { [key: string]: number };
  worldBlocks: PlacedBlock[];
  avatarUrl?: string;
  rank: string;
  sensoryMode: 'standard' | 'low_sensory';
  showDayMap: boolean;
}

export interface ActivityLog {
  id: string;
  type: 'TASK_APPROVED' | 'ITEM_BOUGHT' | 'PENALTY_APPLIED' | 'LEVEL_UP' | 'TASK_DONE' | 'MANUAL_ADJUST';
  detail: string;
  timestamp: number;
  impact?: string;
}

export interface ServerRules {
  allowShop: boolean;
  allowBuilder: boolean;
  xpMultiplier: number;
  damageMultiplier: number;
  requireEvidence: boolean;
}

export interface SystemSettings {
  parentPin: string;
  familyName: string;
  rules: ServerRules;
  lastReset?: string; // YYYY-MM-DD
}

export interface ServerMessage {
  id?: string;
  text: string;
  sender: 'MASTER' | 'PLAYER';
  timestamp: number;
  read: boolean;
}

export interface WorldActivity {
  id?: string;
  type: 'TASK_DONE' | 'ITEM_BOUGHT' | 'LEVEL_UP' | 'MANUAL_ADJUST' | 'TASK_APPROVED' | 'TASK_FAILED' | 'SYSTEM_RESET';
  user: string;
  detail: string;
  timestamp: number;
  amount?: number;
  currency?: string;
}

export interface GlobalGoal {
  title: string;
  targetEmeralds: number;
  currentEmeralds: number;
}

export interface IRepository<T> {
  subscribe(callback: (data: T) => void): () => void;
  save(data: T): Promise<void>;
  addToList(item: any): Promise<void>;
  exists(): Promise<boolean>;
}
