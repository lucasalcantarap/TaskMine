# Arquitetura MineTask 2.0

## Visão Geral
O projeto segue uma arquitetura baseada em componentes funcionais React com separação clara entre **View** (Interface) e **Controller** (Lógica de Estado).

### Fluxo de Dados
1. **Liveblocks (Storage)**: Fonte única da verdade (Single Source of Truth).
2. **useGameController (Hook)**: Intermediário que gerencia leituras e escritas. Realiza validações de tipo e regras de negócio.
3. **App.tsx (Container)**: Gerencia o roteamento básico e instancia o Controller.
4. **Components (ChildDashboard/ParentPanel)**: Recebem dados puros e callbacks de ação.

## Solução de Erros de Build (Vercel)

### Problema Anterior
O código anterior tentava manipular objetos do Liveblocks (`tasks.get(index)`) assumindo que sempre estariam definidos, e utilizava *spread operators* que criavam incompatibilidades de tipo (`Task | undefined`).

### Solução Aplicada
1. **Isolamento de Mutações**: Mutações movidas para `hooks/useGameController.ts`.
2. **Strict Null Checks**: Verificação explícita `if (!currentTask) return` antes de qualquer operação.
3. **Tipagem Defensiva**: Construção explícita de objetos atualizados garantindo que todas as propriedades obrigatórias da interface `Task` estejam presentes.

## Boas Práticas Adotadas (Clean Code)
- **Single Responsibility Principle**: `App.tsx` apenas renderiza. `useGameController` apenas gerencia dados.
- **DRY (Don't Repeat Yourself)**: Lógica de atualização de perfil e tarefas centralizada.
- **Meaningful Names**: Funções de ação nomeadas semanticamente (`handleCompleteTask`, `handleApproveTask`).
