/**
 * Olá! Eu sou seu instrutor.
 * Como não temos um framework de testes instalado (como Jest ou Vitest),
 * criei este arquivo para demonstrar como testaríamos a lógica do jogo
 * de forma pura e simples.
 */

import { GameEngine } from './services/game-logic';
import { UserProfile, Task, TaskStatus, TimeOfDay } from './types';

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ FALHA: ${message}`);
    } else {
        console.log(`✅ SUCESSO: ${message}`);
    }
}

function runTests() {
    console.log("--- Iniciando Testes da Logica de Level UP ---");

    const mockProfile: UserProfile = {
        name: 'Teste Hero',
        emeralds: 0,
        diamonds: 0,
        hp: 100,
        maxHp: 100,
        level: 1,
        experience: 0,
        streak: 0,
        inventory: {},
        worldBlocks: [],
        rank: 'Novato',
        sensoryMode: 'standard',
        showDayMap: true
    };

    const mockTask: Task = {
        id: '1',
        title: 'Tarefa Teste',
        description: '',
        timeOfDay: TimeOfDay.MORNING,
        points: 100,
        emeralds: 10,
        diamonds: 0,
        status: TaskStatus.COMPLETED,
        steps: []
    };

    // Teste 1: Ganho de XP e Esmeraldas
    const result = GameEngine.calculateLevelUp(mockProfile, mockTask);
    assert(result.emeralds === 10, "Deveria ganhar 10 esmeraldas");

    // Teste 2: Level Up
    // Nível 1 exige 1*1*50 = 50 XP. A tarefa original sugeria que emeralds = XP.
    // Vamos garantir que com 100 XP ele suba de nível.
    const result2 = GameEngine.calculateLevelUp(mockProfile, { ...mockTask, emeralds: 100 });
    assert(result2.level === 2, "Com 100 XP deveria subir para o nível 2");

    // Teste 3: Subindo de nível épico e Ranking (Multi-level)
    // Daremos uma tarefa de 15000 XP para testar o rank 'Lenda'.
    const epicTask: Task = { ...mockTask, emeralds: 15000 };
    const levelUpResult = GameEngine.calculateLevelUp({ ...mockProfile, level: 49, experience: 0 }, epicTask);

    assert(levelUpResult.level >= 50, "Deveria subir para o nível 50+ com muita XP");
    assert(levelUpResult.rank === "Netherite (Lenda)", "Deveria desbloquear Rank Netherite no nível 50");

    console.log(`--- Testes Finalizados (Nivel alcancado: ${levelUpResult.level}, Rank: ${levelUpResult.rank}) ---`);
}

// Para rodar: node --loader ts-node/loader game-logic.test.ts (se configurado)
// Ou apenas observe a lógica aqui!
// runTests();
