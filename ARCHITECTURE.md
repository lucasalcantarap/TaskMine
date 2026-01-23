
# Arquitetura do Sistema - MineTask

## Visão Geral
O MineTask adota uma arquitetura **Client-Serverless** utilizando React no cliente e Firebase Realtime Database como backend. A lógica de negócio é fortemente centralizada em *Hooks* customizados para garantir a separação entre UI e Regras de Negócio.

## 📂 Estrutura de Diretórios

```
/src
  /components     # Componentes de UI (Burros e Inteligentes)
    /ChildDashboard.tsx  # Interface da Criança (Inventário, Missões)
    /ParentPanel.tsx     # Interface dos Pais (Gestão, Aprovação)
    /BuilderMode.tsx     # Editor de Pixel Art (Lógica Canvas/Grid)
  /hooks
    /useGameController.ts # Cérebro da aplicação. Gerencia todo o estado.
  /services
    /firebase.ts      # Inicialização do Firebase
    /storage.ts       # Camada de Abstração (Repository Pattern)
    /game-logic.ts    # Regras de XP, Níveis e Avatares
    /audio.ts         # Sintetizador de SFX
    /image-utils.ts   # Compressão de imagens no cliente
  /types.ts           # Interfaces TypeScript compartilhadas
```

## 🧩 Padrões de Projeto

### 1. Repository Pattern (`services/storage.ts`)
Para evitar acoplamento direto dos componentes com a API do Firebase, utilizamos uma classe `FirebaseRepository<T>`.
*   **Responsabilidade**: Ler, escrever e escutar mudanças em caminhos específicos do banco (`families/{id}/tasks`, etc).
*   **Benefício**: Se decidirmos trocar o Firebase por LocalStorage ou Supabase no futuro, alteramos apenas este arquivo.

### 2. Centralized State Controller (`hooks/useGameController.ts`)
Ao invés de espalhar `useEffect` e `firebase.on()` por vários componentes, todo o estado do jogo é gerenciado por este Hook.
*   **Inputs**: `familyId`.
*   **Outputs**: Objeto `data` (tarefas, perfil, configurações) e objeto `actions` (funções para modificar o estado: `addTask`, `completeTask`, `buyReward`).
*   **Logica**: Aqui residem as regras de validação (ex: "Tem saldo suficiente para comprar?", "O nível é suficiente para este item?").

### 3. Otimização de Imagens (`services/image-utils.ts`)
Como o Realtime Database tem limites e custos por banda, **não enviamos imagens brutas**.
*   Antes do upload, as imagens capturadas pela câmera passam por um `canvas` off-screen.
*   São redimensionadas para max 800px e comprimidas para JPEG 0.7.
*   O resultado é uma string Base64 leve armazenada diretamente no objeto da tarefa JSON.

### 4. Audio System (`services/audio.ts`)
Para evitar latência de rede e carregamento de arquivos `.mp3`, utilizamos a **Web Audio API**.
*   Os sons (moeda, level up, erro) são sintetizados matematicamente (Oscillators) em tempo real.
*   Garante feedback sonoro instantâneo mesmo em conexões lentas.

## 💾 Modelo de Dados (Firebase)

A estrutura do banco é uma árvore JSON baseada no `familyId`:

```json
families: {
  "BRAVE-CREEPER-999": {
    "profile": {
      "name": "Steve",
      "hp": 100,
      "xp": 1500,
      "inventory": { "block_dirt": 10 }
    },
    "tasks": [
      { "id": "t1", "title": "Dever de Casa", "status": "PENDING" }
    ],
    "settings": {
      "pin": "1234"
    },
    "activities": [ ...logs... ]
  }
}
```

## 🎨 Design System (Plastic Voxel)
O CSS segue uma abordagem híbrida Tailwind + CSS Variables.
*   Classes utilitárias para layout (`flex`, `grid`, `p-4`).
*   Variáveis semânticas para o tema (`--mat-grass`, `--bg-sky`) permitindo trocas fáceis de paleta.
*   Componentes visuais (Botões, Painéis) imitam a geometria de blocos 3D usando `box-shadow` sólido e bordas grossas.
