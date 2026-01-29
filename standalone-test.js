
// Versão Vanilla JS dos testes para rodar sem dependências de TypeScript
const AVATARS_BY_LEVEL = [
    { level: 1, name: "Steve (Novato)" },
    { level: 3, name: "Couro (Explorador)" },
    { level: 5, name: "Ferro (Guerreiro)" },
    { level: 10, name: "Ouro (Veterano)" },
    { level: 20, name: "Diamante (Mestre)" },
    { level: 50, name: "Netherite (Lenda)" }
];

class GameEngine {
    static getAvatarForLevel(level) {
        return AVATARS_BY_LEVEL.slice().reverse().find(a => level >= a.level) || AVATARS_BY_LEVEL[0];
    }

    static calculateLevelUp(profile, task) {
        const xpGained = task.emeralds || 0;
        let currentExperience = profile.experience + xpGained;
        let currentLevel = profile.level;

        while (currentExperience >= (currentLevel * 100)) {
            currentExperience -= (currentLevel * 100);
            currentLevel++;
        }

        const avatarData = this.getAvatarForLevel(currentLevel);

        return {
            ...profile,
            experience: currentExperience,
            level: currentLevel,
            emeralds: profile.emeralds + (task.emeralds || 0),
            rank: avatarData.name
        };
    }
}

const fs = require('fs');
let outputs = [];

function log(msg) {
    console.log(msg);
    outputs.push(msg);
}

function assert(condition, message) {
    if (!condition) {
        log(`❌ FALHA: ${message}`);
        saveResults();
        process.exit(1);
    } else {
        log(`✅ SUCESSO: ${message}`);
    }
}

function saveResults() {
    fs.writeFileSync('c:\\Users\\bsi94915\\Downloads\\Project\\TaskMine\\test-results.txt', outputs.join('\n'));
}

function runTests() {
    log("--- Iniciando Testes Standalone (JS) ---");

    const mockProfile = {
        experience: 0,
        level: 1,
        emeralds: 0,
        rank: 'Novato'
    };

    const mockTask = { emeralds: 50 };

    // Teste 1: Ganho de Esmeraldas
    let result = GameEngine.calculateLevelUp(mockProfile, mockTask);
    assert(result.emeralds === 50, "Criança ganha 50 esmeraldas.");
    assert(result.level === 1, "Não sobe de nível com 50 XP.");

    // Teste 2: Level Up
    const bigTask = { emeralds: 100 }; // 50+100 = 150 total. 
    // Nota: calculateLevelUp usa profile como base. 
    // No teste anterior result tinha level 1, xp 50.
    result = GameEngine.calculateLevelUp(result, bigTask);
    assert(result.level === 2, "Sobe para nível 2 com 150 XP total.");
    assert(result.experience === 50, "XP sobra 50 (150 - 100).");

    // Teste 3: Ranking Dinâmico e Multi-Level
    // Para chegar ao nível 50 partindo do 49 (com 0 XP), precisa de 4900 XP.
    // Vamos dar uma tarefa épica de 5000 XP!
    const epicTask = { emeralds: 5000 };
    const godModeResult = GameEngine.calculateLevelUp({ ...mockProfile, level: 49, experience: 0, emeralds: 0 }, epicTask);

    assert(godModeResult.level >= 50, "Herói atinge nível 50 com XP suficiente.");
    assert(godModeResult.rank === "Netherite (Lenda)", "Rank de elite desbloqueia no nível 50.");

    log("--- Todos os testes passaram! ---");
    saveResults();
}

runTests();
