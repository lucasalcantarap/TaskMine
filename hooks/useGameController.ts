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
  const [syncedPenalties, setSyncedPenalties] = useState<string[]>([]);

  const repos = useRef<ReturnType<typeof RepositoryFactory.createFamilyContext> | null>(null);

  useEffect(() => {
    if (!familyId) return;
    repos.current = RepositoryFactory.createFamilyContext(familyId);
    if (!repos.current) return;

    const unsubs = [
      repos.current.tasks.subscribe((data: any) => {
        const list = Array.isArray(data) ? data : Object.values(data || {});
        setTasks(list.filter((item: any) => !!item));
      }),
      repos.current.profile.subscribe(setProfile),
      repos.current.rewards.subscribe((data: any) => {
        const list = Array.isArray(data) ? data : Object.values(data || {});
        setRewards(list.filter((item: any) => !!item));
      }),
      repos.current.settings.subscribe(setSettings),
      repos.current.messages.subscribe((msgs: any) => setMessages(Object.values(msgs || {}) as ServerMessage[])),
      repos.current.activities.subscribe((acts: any) => setActivities((Object.values(acts || {}) as WorldActivity[]).sort((a, b) => b.timestamp - a.timestamp).slice(0, 50))),
      (repos.current as any).penalties.subscribe(setSyncedPenalties),
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

  const isReady = !!profile && !!settings;

  // Função para verificar se o horário passou e aplicar dano
  // Olá aluno! Aqui é onde a "mágica" do jogo acontece. 
  // Usamos um useEffect (no mount) para chamar essa função.
  // Ela verifica o horário real e compara com o 'timeOfDay' das tarefas.
  // Função para verificar se é um novo dia e resetar tarefas recorrentes
  const checkDailyReset = useCallback(() => {
    if (!repos.current || !settings || !profile) return;

    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    if (settings.lastReset !== today) {
      // 1. Resetar tarefas recorrentes
      const resetTasks = tasks.map(t => ({
        ...t,
        status: (t.recurrence === 'daily' || !t.recurrence) ? TaskStatus.PENDING : t.status,
        evidenceUrl: (t.recurrence === 'daily' || !t.recurrence) ? undefined : t.evidenceUrl,
        evidenceType: (t.recurrence === 'daily' || !t.recurrence) ? undefined : t.evidenceType,
        completedAt: (t.recurrence === 'daily' || !t.recurrence) ? undefined : t.completedAt,
      }));

      // 2. Limpar penalidades sincronizadas para o novo dia
      (repos.current as any).penalties.save([]);

      // 3. Salvar novo estado
      repos.current.tasks.save(resetTasks);
      repos.current.settings.save({ ...settings, lastReset: today });

      logActivity('SYSTEM_RESET', `Novo dia iniciado: ${today}`);
      sfx.play('levelup');
    }
  }, [tasks, settings, profile, logActivity]);

  const checkDailyPenalties = useCallback(() => {
    if (!repos.current || !profile || !settings) return;

    const hour = new Date().getHours();
    const alreadyPenalized = syncedPenalties || [];

    let damage = 0;
    const newPenalizedIds = [...alreadyPenalized];

    tasks.forEach((task: Task) => {
      if (task.status === TaskStatus.PENDING && !alreadyPenalized.includes(task.id)) {
        let isLate = false;

        if (task.timeOfDay === TimeOfDay.MORNING && hour >= 13) isLate = true;
        if (task.timeOfDay === TimeOfDay.AFTERNOON && hour >= 19) isLate = true;

        if (isLate) {
          damage += (10 * (settings.rules.damageMultiplier || 1));
          newPenalizedIds.push(task.id);
        }
      }
    });

    if (damage > 0) {
      const newHp = Math.max(0, profile.hp - damage);
      repos.current.profile.save({ ...profile, hp: newHp });
      (repos.current as any).penalties.save(newPenalizedIds);

      logActivity('MANUAL_ADJUST', `Dano por tarefas atrasadas: -${damage} HP`);
      sfx.play('error');
    }
  }, [tasks, profile, settings, logActivity, syncedPenalties]);

  useEffect(() => {
    if (isReady) {
      checkDailyReset();
      checkDailyPenalties();
    }
  }, [isReady, checkDailyReset, checkDailyPenalties]);

  return {
    isReady,
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
        repos.current.tasks.save(tasks.filter((t: Task) => t.id !== id));
      },

      updateTasks: (newTasks: Task[]) => {
        if (!repos.current) return;
        repos.current.tasks.save(newTasks);
      },

      completeTask: (taskId: string, url: string, type: 'photo' | 'drawing') => {
        if (!repos.current) return;
        const updated = tasks.map((t: Task) => t.id === taskId ? { ...t, status: TaskStatus.COMPLETED, evidenceUrl: url, evidenceType: type, completedAt: Date.now() } : t);
        repos.current.tasks.save(updated);
        logActivity('TASK_DONE', `Enviou evidência para tarefa.`);
        sfx.play('success');
      },

      approveTask: (taskId: string, feedback: string) => {
        if (!repos.current || !profile || !settings) return;
        const task = tasks.find((t: Task) => t.id === taskId);
        if (!task) return;

        const newProfile = GameEngine.calculateLevelUp(profile, task);
        repos.current.profile.save(newProfile);
        repos.current.tasks.save(tasks.map((t: Task) => t.id === taskId ? { ...t, status: TaskStatus.APPROVED, parentFeedback: feedback } : t));

        logActivity('TASK_DONE', `Aprovada: ${task.title}`, task.points, 'XP');
        sfx.play('levelup');
      },

      rejectTask: (id: string) => {
        if (!repos.current) return;
        // Volta para Pendente e limpa evidência
        repos.current.tasks.save(tasks.map((t: Task) => t.id === id ? { ...t, status: TaskStatus.REJECTED, evidenceUrl: undefined } : t));
        logActivity('TASK_FAILED', `Evidência recusada pelo Admin.`);
        sfx.play('error');
      },

      buyReward: async (rewardId: string) => {
        if (!repos.current || !profile) return false;
        const reward = rewards.find(r => r.id === rewardId);
        if (!reward) return false;

        const balance = reward.currency === 'diamond' ? profile.diamonds : profile.emeralds;
        if (balance >= reward.cost) {
          let updates: Partial<UserProfile> = {
            [reward.currency === 'diamond' ? 'diamonds' : 'emeralds']: balance - reward.cost,
          };

          if (reward.type === 'potion') {
            updates.hp = Math.min(profile.maxHp, profile.hp + 25); // Heals 25 HP
            logActivity('ITEM_BOUGHT', `Usou ${reward.title}: +25 HP`);
            sfx.play('levelup');
          } else {
            updates.inventory = { ...profile.inventory, [rewardId]: (profile.inventory[rewardId] || 0) + 1 };
            logActivity('ITEM_BOUGHT', `Comprou: ${reward.title}`, reward.cost, reward.currency);
            sfx.play('buy');
          }

          await repos.current.profile.save({ ...profile, ...updates });
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

      addReward: (r: Reward) => repos.current?.rewards.save([...rewards, { ...r, id: Date.now().toString() }]),
      deleteReward: (id: string) => repos.current?.rewards.save(rewards.filter((r: Reward) => r.id !== id)),
    }
  };
};