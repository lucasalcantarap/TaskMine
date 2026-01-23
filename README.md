
# ⚔️ MineTask: Adventure Edition

**Transformando Rotinas em Aventuras Épicas!**

O **MineTask** é um aplicativo gamificado projetado para ajudar crianças (especialmente aquelas com TDAH e Autismo) a gerenciarem suas tarefas diárias de forma divertida e visual. Inspirado na estética vibrante dos desenhos animados (estilo Nickelodeon) misturada com a mecânica de coleta de recursos do Minecraft.

---

## 📘 Manual do Usuário

### 1. Para os Pais (Mestres do Jogo)

O objetivo dos pais é atuar como "Mestres do Servidor", configurando as missões e aprovando o progresso.

**Configuração Inicial:**
1. Abra o app.
2. Selecione **"Criar Novo Mundo"**.
3. Escolha um nome para o servidor (ex: "Casa da Família").
4. Crie o perfil da criança.
5. **IMPORTANTE:** Defina um PIN de 4 dígitos. Este PIN protege a área administrativa para que a criança não altere as próprias recompensas.
6. Guarde o **Código da Família** gerado (ex: `SUPER-ZOMBIE-99`) para logar em outros dispositivos.

**Fluxo Diário:**
1. Acesse a área dos pais (escudo azul na tela de seleção).
2. Vá na aba **Tarefas** e adicione missões (ex: "Escovar Dentes", "Arrumar Cama"). Defina o horário (Manhã/Tarde/Noite).
3. Vá na aba **Recompensas** e defina prêmios reais (ex: "30min de Tablet" = 50 XP).
4. Durante o dia, acesse a aba **Aprovações** para ver as fotos que seu filho enviou. Aprove para dar XP ou rejeite se precisar refazer.

### 2. Para os Heróis (Crianças)

Seu objetivo é ganhar XP (Esmeraldas) e subir de nível para desbloquear recompensas!

**Como Jogar:**
1. Abra o app no seu tablet ou celular.
2. Veja suas missões no Bioma atual (Manhã, Tarde ou Noite).
3. Toque em uma missão.
4. **Tire uma foto** mostrando que você fez a tarefa!
5. Espere o Papai ou Mamãe aprovar.
6. Quando aprovado, você ganha XP! Use o XP na **LOJA** para comprar prêmios.

---

## 🛠️ Guia Técnico & Deploy

Este projeto é um Frontend React moderno usando Vite, TypeScript e Firebase.

### Pré-requisitos
- Node.js 18+
- Conta no Firebase (Gratuita)

### Instalação Local
```bash
git clone https://github.com/seu-usuario/minetask.git
cd minetask
npm install
npm run dev
```

### Configuração do Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Crie um **Realtime Database** e configure as regras para `read: true, write: true` (modo teste) ou configure autenticação anônima.
3. Crie um arquivo `.env` na raiz com suas credenciais:
```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_DB_URL=https://seu-projeto.firebaseio.com
```

### Deploy no Vercel (Produção)
1. Faça fork deste repositório.
2. Crie uma conta na [Vercel](https://vercel.com/).
3. Clique em **"Add New..."** > **"Project"** e selecione o repositório.
4. Nas configurações do projeto na Vercel, adicione as variáveis de ambiente do Firebase (mesmas do `.env`).
5. Clique em **Deploy**.

### Personalização (White Label)
- **Cores:** Edite `index.css` nas variáveis `:root`.
- **Ícones/Logos:** Substitua os SVGs em `components/WelcomeScreen.tsx`.
- **Lógica de XP:** Ajuste `services/game-logic.ts` para mudar a curva de nível.

---

**Feito com carinho para mentes brilhantes e criativas.** 🚀
