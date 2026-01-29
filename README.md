
# ⚔️ MineTask: Adventure Edition

> **Transformando a rotina familiar em uma aventura épica de voxels!**

O **MineTask** é uma aplicação web progressiva (PWA) gamificada, projetada para auxiliar crianças (com foco em neurodivergência: TDAH e Autismo) a organizarem suas tarefas diárias. O sistema utiliza mecânicas de RPG e a estética visual de "Minecraft" misturada com "Magic Cat Academy" para criar engajamento positivo.

---

## 🌟 Funcionalidades Principais

### 🛡️ Para os Heróis (Crianças)
*   **Gamificação Visual**: Interface vibrante ("Plastic Voxel") com avatares que evoluem (de Camiseta a Armadura de Netherite).
*   **Sistema de Provas**: Envio de fotos ou desenhos para comprovar que a tarefa foi feita.
*   **Feedback Imediato**: Sons de sucesso, ganho de XP e barras de progresso visuais.
*   **Modo Construtor Avançado**: Editor de pixel art com ferramenta de balde (flood fill), preview de blocos e sons de construção.
*   **Loja de Recompensas**: Troca de moedas virtuais por blocos de construção ou poções de cura (HP).
*   **Mensagens Master**: Recebimento de incentivos em tempo real através de um letreiro (marquee) no HUD.
*   **Progressão Dinâmica**: Sistema de níveis com avatares evolutivos e recompensas variáveis por dificuldade.

### 👑 Para os Mestres (Pais)
*   **Painel de Controle (Dungeon Master)**: Interface administrativa para criar missões e gerenciar a economia do jogo.
*   **Ciclo de Aprovação**: As tarefas não somem sozinhas; os pais aprovam ou rejeitam as evidências enviadas com feedback personalizado.
*   **Master Messaging**: Envio de mensagens curtas de incentivo que aparecem instantaneamente para o herói.
*   **Daily Reset & Penalidades**: Sistema que aplica penalidade de HP para tarefas não concluídas do dia anterior, incentivando a consistência.
*   **Modo Combo**: Ferramenta rápida para criar rotinas inteiras (ex: "Rotina Matinal" cria 5 tarefas de uma vez).
*   **Ajustes Manuais**: Poder de administrador para curar o herói, dar bônus de XP ou moedas extras.

---

## 🛠️ Stack Tecnológica

*   **Frontend**: React 19 (Hooks, Functional Components).
*   **Build Tool**: Vite.
*   **Linguagem**: TypeScript.
*   **Estilização**: Tailwind CSS + Variáveis CSS para Temas (Voxel/Stone/Wood).
*   **Backend / Database**: Firebase Realtime Database (via API compat).
*   **Assets**: Ícones `lucide-react`, Fontes Google (`Bangers`, `Fredoka`, `VT323`).
*   **Audio**: Sintetizador de áudio nativo (Web Audio API) para efeitos sonoros sem arquivos mp3 externos.

---

## 🚀 Como Rodar e Fazer Deploy

### 1. No Vercel (Recomendado)
Para rodar online rapidamente:
1. Suba este código para um repositório no **GitHub**.
2. No painel do **Vercel**, conecte o repositório.
3. Adicione as variáveis de ambiente (conforme seção abaixo) nas configurações do projeto no Vercel.
4. O Vercel detectará automaticamente o Vite e fará o build (`npm run build`).

### 2. Localmente
### Pré-requisitos
*   Node.js 18 ou superior.
*   Conta no Firebase (Plano Spark gratuito serve).

### 1. Instalação
```bash
git clone https://github.com/seu-usuario/minetask.git
cd minetask
npm install
```

### 2. Configuração do Firebase
Crie um arquivo `.env` na raiz do projeto com as credenciais do seu projeto Firebase:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_DB_URL=https://seu-projeto-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

> **Nota**: No Firebase Console, certifique-se de habilitar o **Realtime Database** e configurar as regras de segurança para desenvolvimento (leitura/escrita `true` ou autenticação anônima).

### 3. Execução
```bash
npm run dev
```
Acesse `http://localhost:5173`.

---

## 🎨 Estrutura de Temas

O projeto utiliza um sistema de temas definido em `index.css`:
*   **Cores de Materiais**: `--mat-grass`, `--mat-stone`, `--mat-wood` definem a paleta baseada em blocos.
*   **Tipografia**:
    *   `Bangers`: Títulos e botões de ação (Vibe Arcade).
    *   `VT323`: Números, datas e dados técnicos (Vibe Retro/Console).
    *   `Fredoka`: Textos de leitura (Acessibilidade e conforto).

---

## 📱 Guia de Uso Rápido

1.  Ao abrir, clique em **Novo Jogo**.
2.  Defina o nome do Mundo e o PIN dos pais (importante para bloquear o painel administrativo).
3.  Guarde o **Código do Servidor** gerado (ex: `BRAVE-CREEPER-123`).
4.  Use esse código para logar em outros dispositivos (celular da criança).

---

Feito com 💜 para ajudar famílias a transformarem o caos em diversão.
