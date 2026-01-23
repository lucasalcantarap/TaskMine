
# ⚒️ MineTask v4.0 - Master Edition

Organizador de tarefas gamificado com estética de Minecraft, focado em neurodiversidade (TDAH/Autismo) e gestão familiar em tempo real.

## 🎮 O Conceito
MineTask transforma a rotina doméstica em uma jornada de sobrevivência. A criança assume o papel de um **Herói** que deve cumprir missões em diferentes **Biomas Temporais** (Manhã, Tarde e Noite) para ganhar recursos, subir de nível e construir seu próprio mundo voxel.

### 🕒 Lógica de Biomas e Survival
O app monitora o horário real do sistema para incentivar a percepção temporal:
- **Bioma Manhã:** 06:00 às 11:59
- **Bioma Tarde:** 12:00 às 17:59
- **Bioma Noite:** 18:00 às 05:59

**Mecânica de Falha:** Se uma missão não for enviada para revisão antes do bioma terminar, ela entra em estado `FALHOU` e o herói perde **20 HP**. Se o HP chegar a zero, o herói "morre" (fica bloqueado) e precisa de uma cura do Mestre (Pai/Mãe).

## 🚀 Funcionalidades Principais

### Para o Herói (Criança)
- **Micro-Quests:** Tarefas divididas em passos simples para evitar sobrecarga mental.
- **Prova de Valor:** Envio de fotos em tempo real como evidência de conclusão.
- **Sistema de Economia:** Ganhe **Esmeraldas** (compras comuns) e **Diamantes** (itens raros/reais).
- **Modo Construção:** Um mini-editor 3D onde blocos comprados na loja podem ser colocados no mundo.
- **Progressão:** 30 níveis com patentes e emojis que evoluem conforme o XP acumulado.

### Para o Mestre (Pais)
- **Console de Monitoramento:** Painel centralizado para aprovar ou rejeitar evidências.
- **Ajustes de Emergência:** Controle manual de HP, Esmeraldas, Diamantes e XP.
- **Gestão de Inventário:** Configuração da loja de recompensas (ex: "15 min de videogame").
- **Modo Baixo Sensorial:** Opção para reduzir estímulos visuais e animações.

## 🛠️ Arquitetura Técnica

### Stack
- **Frontend:** React 19 + TypeScript.
- **Estilização:** Tailwind CSS + Animações customizadas.
- **Persistência:** Firebase Realtime Database (Sincronização instantânea bi-direcional).
- **Áudio:** Web Audio API (Efeitos sonoros 8-bit procedurais).

### Estrutura de Pastas
- `components/`: UI dividida por contextos (Child, Parent, Builder, Canvas).
- `hooks/`: `useGameController` centraliza toda a lógica de estado e mutações.
- `services/`: 
  - `storage.ts`: Implementação do padrão Repository para Firebase.
  - `game-logic.ts`: Cálculos de XP, Level e Ranks.
  - `audio.ts`: Gerador de SFX sem arquivos externos.
- `types.ts`: Definições rigorosas de interfaces para evitar bugs de build.

## 📦 Deploy e Configuração

### Requisitos
- Uma conta no Firebase com **Realtime Database** ativo.
- Variáveis de ambiente configuradas no `vite.config.ts` ou injetadas pelo host.

### Variáveis Necessárias
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_DB_URL`

### Passos para Vercel
1. Conecte o repositório GitHub.
2. O Vercel detectará o preset do Vite automaticamente.
3. Configure as Environment Variables no dashboard da Vercel.
4. Build Command: `npm run build`.

---

## 🛡️ Segurança e Privacidade
O acesso é baseado em uma **SEED de Mundo** única (ex: `BRAVE-CREEPER-123`). O painel dos pais é protegido por um **PIN de 4 dígitos** configurável.

---
**Feito com ❤️ por Lucas**
*MineTask v4.0 - Transformando obrigações em aventuras.*
