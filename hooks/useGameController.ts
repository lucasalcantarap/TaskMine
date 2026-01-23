
import { useState, useEffect, useCallback, useRef } from 'react';
import { Task, TaskStatus, UserProfile, Reward, SystemSettings, ServerMessage, WorldActivity, GlobalGoal } from '../types';
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
  const [goal, setGoal] = useState<GlobalGoal | null>(null);

  const repos = useRef<ReturnType<typeof RepositoryFactory.createFamilyContext> | null>(null);

  useEffect(() => {
    if (!familyId) return;
    
    // Inicializa repositórios
    repos.current = RepositoryFactory.createFamilyContext(familyId);
    
    // Verificação de segurança caso a inicialização falhe
    if (!repos.current) return;

    const unsubs = [
      repos.current.tasks.subscribe(setTasks),
      repos.current.profile.subscribe(setProfile),
      repos.current.rewards.subscribe(setRewards),
      repos.current.settings.subscribe(setSettings),
      repos.current.messages.subscribe(msgs => setMessages(Object.values(msgs || {}) as ServerMessage[])),
      repos.current.activities.subscribe(acts => setActivities((Object.values(acts || {}) as WorldActivity[]).sort((a,b) => b.timestamp - a.timestamp))),
      repos.current.globalGoal.subscribe(setGoal)
    ];

    return () => unsubs.forEach(unsub => unsub());
  }, [familyId]);

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

  const sendMessage = useCallback((text: string, sender: 'MASTER' | 'PLAYER') => {
    if (!repos.current) return;
    const msg: Omit<ServerMessage, 'id'> = {
      text,
      sender,
      timestamp: Date.now(),
      read: false
    };
    (repos.current.messages as any).addToList(msg);
    sfx.play('click');
  }, []);

  return {
    isReady: !!profile && !!settings,
    data: { tasks, profile, rewards, settings, messages, activities, goal },
    actions: { 
      addTask: (taskData: Omit<Task, 'id' | 'status'>) => {
        if (!repos.current) return;
        const newTask: Task = { ...taskData, id: Date.now().toString(), status: TaskStatus.PENDING };
        repos.current.tasks.save([...tasks, newTask]);
        sfx.play('pop');
      },
      updateTasks: (newTasks: Task[]) => {
        if (!repos.current) return;
        repos.current.tasks.save(newTasks);
      },
      completeTask: (taskId: string, url: string, type: 'photo' | 'drawing') => {
        if (!repos.current) return;
        const updated = tasks.map(t => t.id === taskId ? { ...t, status: TaskStatus.COMPLETED, evidenceUrl: url, evidenceType: type, completedAt: Date.now() } : t);
        repos.current.tasks.save(updated);
        logActivity('TASK_DONE', `Missão concluída, aguardando aprovação.`);
        sfx.play('success');
      },
      approveTask: (taskId: string, feedback: string) => {
        if (!repos.current || !profile) return;
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const newProfile = GameEngine.calculateLevelUp(profile, task);
        repos.current.profile.save(newProfile);
        repos.current.tasks.save(tasks.map(t => t.id === taskId ? { ...t, status: TaskStatus.APPROVED, parentFeedback: feedback } : t));
        logActivity('TASK_APPROVED', `Aprovada: ${task.title}`, task.emeralds, 'EMERALD');
        sendMessage(`Mestre aprovou: ${task.title}! Recompensa entregue.`, 'MASTER');
        sfx.play('success');
      },
      rejectTask: (id: string) => {
        if (!repos.current) return;
        repos.current.tasks.save(tasks.map(t => t.id === id ? { ...t, status: TaskStatus.REJECTED, evidenceUrl: undefined } : t));
        sendMessage("Sua evidência não foi aceita. Tente novamente!", 'MASTER');
      },
      buyReward: async (rewardId: string) => {
        if (!repos.current || !profile) return false;
        
        // Verifica se a loja está permitida nas regras
        if (settings?.rules && !settings.rules.allowShop) {
            alert("A loja está fechada pelo administrador do servidor!");
            return false;
        }

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
          logActivity('ITEM_BOUGHT', `Comprou: ${reward.title}`, reward.cost, reward.currency.toUpperCase());
          sfx.play('pop');
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
        logActivity('MANUAL_ADJUST', `Mestre ajustou ${currency}`, amount, currency);
        sfx.play(amount > 0 ? 'success' : 'error');
      },
      sendMessage,
      updateProfile: (u: any) => repos.current?.profile.save({ ...profile, ...u }),
      addReward: (r: any) => repos.current?.rewards.save([...rewards, { ...r, id: Date.now().toString() }]),
      deleteReward: (id: string) => repos.current?.rewards.save(rewards.filter(r => r.id !== id)),
      deleteTask: (id: string) => repos.current?.tasks.save(tasks.filter(t => t.id !== id)),
      updateGoal: (g: GlobalGoal) => repos.current?.globalGoal.save(g),
      updateSettings: (pin: string, name: string, rules: any) => {
        repos.current?.settings.save({ parentPin: pin, familyName: name, rules });
      }
    }
  };
};
