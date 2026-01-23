import { useState, useEffect, useCallback, useRef } from 'react';
import { Task, TaskStatus, UserProfile, Reward, SystemSettings, ServerMessage, WorldActivity, GlobalGoal, TimeOfDay } from '../types';
import { RepositoryFactory } from '../services/storage';
import { GameEngine } from '../services/game-logic';
import { sfx } from '../services/audio';

export const useGameController = (familyId: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const [activities, setActivities] = useState<WorldActivity[]>([]);
  
  const repos = useRef<ReturnType<typeof RepositoryFactory.createFamilyContext> | null>(null);

  useEffect(() => {
    if (!familyId) return;
    repos.current = RepositoryFactory.createFamilyContext(familyId);
    if (!repos.current) return;

    const unsubs = [
      repos.current.tasks.subscribe((data) => {
        const list = Array.isArray(data) ? data : Object.values(data || {});
        setTasks(list.filter(item => !!item));
      }),
      repos.current.profile.subscribe(setProfile),
      repos.current.rewards.subscribe((data) => {
         const list = Array.isArray(data) ? data : Object.values(data || {});
         setRewards(list.filter(item => !!item));
      }),
      repos.current.settings.subscribe(setSettings),
      repos.current.messages.subscribe(msgs => setMessages(Object.values(msgs || {}) as ServerMessage[])),
      repos.current.activities.subscribe(acts => setActivities((Object.values(acts || {}) as WorldActivity[]).sort((a,b) => b.timestamp - a.timestamp).slice(0, 50))),
    ];

    // Checagem de Penalidades ao carregar
    checkDailyPenalties();

    return () => unsubs.forEach(unsub => unsub());
  }, [familyId]);

  // Função para verificar se o horário passou e aplicar dano
  const checkDailyPenalties = () => {
    if (!repos.current) return;
    
    // Simples verificação de horário atual
    const hour = new Date().getHours();
    
    // Regra: Manhã acaba as 12h, Tarde acaba as 18h
    // Se tiver tarefa PENDENTE de manhã e for tarde, aplica dano
    // Esta é uma lógica client-side simples. Em prod seria Cloud Functions.
  };

  const logActivity = useCallback((type: WorldActivity['type'], detail: string, amount?: number, currency?: string) => {
    if (!repos.current || !profile) return;
    const act: Omit<WorldActivity, 'id'> = {
      type,
      user: profile.name,
      detail,
      timestamp: Date.now(),
      amount,
      currency
    };
    (repos.current.activities as any).addToList(act);
  }, [profile]);

  return {
    isReady: !!profile && !!settings,
    data: { tasks, profile, rewards, settings, messages, activities },
    actions: { 
      // Criação de Combo (Várias tarefas de uma vez)
      createTaskCombo: (comboName: string, subTasks: string[], time: TimeOfDay, rewardXP: number) => {
        if (!repos.current) return;
        const newTasks = subTasks.map((title, idx) => ({
            id: Date.now().toString() + idx,
            title: title,
            description: `Parte do combo: ${comboName}`,
            timeOfDay: time,
            points: Math.floor(rewardXP / subTasks.length),
            emeralds: Math.floor((rewardXP / 5) / subTasks.length),
            diamonds: 0,
            status: TaskStatus.PENDING,
            steps: []
        } as Task));
        
        // Merge com tarefas existentes
        repos.current.tasks.save([...tasks, ...newTasks]);
        logActivity('MANUAL_ADJUST', `Combo Criado: ${comboName}`);
        sfx.play('levelup');
      },

      addTask: (taskData: Omit<Task, 'id' | 'status'>) => {
        if (!repos.current) return;
        const newTask: Task = { ...taskData, id: Date.now().toString(), status: TaskStatus.PENDING };
        repos.current.tasks.save([...tasks, newTask]);
        sfx.play('pop');
      },
      
      deleteTask: (id: string) => {
          if (!repos.current) return;
          repos.current.tasks.save(tasks.filter(t => t.id !== id));
      },

      updateTasks: (newTasks: Task[]) => {
          if (!repos.current) return;
          repos.current.tasks.save(newTasks);
      },

      completeTask: (taskId: string, url: string, type: 'photo' | 'drawing') => {
        if (!repos.current) return;
        const updated = tasks.map(t => t.id === taskId ? { ...t, status: TaskStatus.COMPLETED, evidenceUrl: url, evidenceType: type, completedAt: Date.now() } : t);
        repos.current.tasks.save(updated);
        logActivity('TASK_DONE', `Enviou evidência para tarefa.`);
        sfx.play('success');
      },
      
      approveTask: (taskId: string, feedback: string) => {
        if (!repos.current || !profile) return;
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const newProfile = GameEngine.calculateLevelUp(profile, task);
        repos.current.profile.save(newProfile);
        repos.current.tasks.save(tasks.map(t => t.id === taskId ? { ...t, status: TaskStatus.APPROVED, parentFeedback: feedback } : t));
        
        logActivity('TASK_APPROVED', `Aprovada: ${task.title}`, task.points, 'XP');
        sfx.play('levelup');
      },
      
      rejectTask: (id: string) => {
        if (!repos.current) return;
        // Volta para Pendente e limpa evidência
        repos.current.tasks.save(tasks.map(t => t.id === id ? { ...t, status: TaskStatus.REJECTED, evidenceUrl: undefined } : t));
        logActivity('TASK_FAILED', `Evidência recusada pelo Admin.`);
        sfx.play('error');
      },

      buyReward: async (rewardId: string) => {
        if (!repos.current || !profile) return false;
        const reward = rewards.find(r => r.id === rewardId);
        if (!reward) return false;
        
        const balance = reward.currency === 'diamond' ? profile.diamonds : profile.emeralds;
        if (balance >= reward.cost) {
          const newProfile = {
            ...profile,
            [reward.currency === 'diamond' ? 'diamonds' : 'emeralds']: balance - reward.cost,
            inventory: { ...profile.inventory, [rewardId]: (profile.inventory[rewardId] || 0) + 1 }
          };
          await repos.current.profile.save(newProfile);
          logActivity('ITEM_BOUGHT', `Comprou: ${reward.title}`, reward.cost, reward.currency);
          sfx.play('buy');
          return true;
        }
        return false;
      },
      
      adjustCurrency: (amount: number, currency: 'XP' | 'EMERALD' | 'DIAMOND' | 'HP') => {
        if (!repos.current || !profile) return;
        let updates: any = {};
        if (currency === 'XP') updates.experience = Math.max(0, profile.experience + amount);
        if (currency === 'EMERALD') updates.emeralds = Math.max(0, profile.emeralds + amount);
        if (currency === 'DIAMOND') updates.diamonds = Math.max(0, profile.diamonds + amount);
        if (currency === 'HP') updates.hp = Math.min(100, Math.max(0, profile.hp + amount));
        
        repos.current.profile.save({ ...profile, ...updates });
        logActivity('MANUAL_ADJUST', `Admin ajustou ${currency}: ${amount > 0 ? '+' : ''}${amount}`);
      },

      updateProfile: (updates: Partial<UserProfile>) => {
        if (!repos.current || !profile) return;
        repos.current.profile.save({ ...profile, ...updates });
      },

      updateSettings: (pin: string, familyName: string, rules: any) => {
        if (!repos.current || !settings) return;
        repos.current.settings.save({ ...settings, parentPin: pin, familyName, rules });
      },
      
      addReward: (r: any) => repos.current?.rewards.save([...rewards, { ...r, id: Date.now().toString() }]),
      deleteReward: (id: string) => repos.current?.rewards.save(rewards.filter(r => r.id !== id)),
    }
  };
};