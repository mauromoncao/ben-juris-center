# BEN IA — Guia de Build e Publicação

## Pré-requisitos

- Node.js 18+ instalado
- Git instalado
- Conta Expo em https://expo.dev (já criada: mauromoncao-adv)
- Projeto Expo criado com ID: `a59da214-860d-4fcf-9337-845ab213c155`

---

## 1. Clonar e instalar

```bash
git clone https://github.com/mauromoncao/ben-juris-center.git
cd ben-juris-center/ben-ia-mobile
npm install
```

---

## 2. Login no Expo

```bash
npx eas-cli@latest login
# E-mail: mauromoncaoestudos@gmail.com
# Senha: (a da conta expo.dev)
```

---

## 3. Gerar APK Android (gratuito, ~10 min)

```bash
npx eas-cli@latest build --platform android --profile preview
```

- Expo faz o build na nuvem
- Ao final, gera um link de download do APK
- Instale no celular Android direto pelo link

---

## 4. Publicar na Play Store (Android)

**Pré-requisito**: Conta Google Play Developer ($25 USD em https://play.google.com/console)

```bash
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest submit --platform android --latest
```

---

## 5. Publicar na App Store (iOS)

**Pré-requisito**: Apple Developer Program ($99/ano em https://developer.apple.com)

```bash
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --latest
```

---

## Informações do App

| Campo | Valor |
|-------|-------|
| Nome | BEN IA |
| Versão | 1.1.0 |
| Package Android | br.adv.mauromoncao.benia |
| Bundle iOS | br.adv.mauromoncao.benia |
| Expo Slug | ben-ia-app |
| Expo Project ID | a59da214-860d-4fcf-9337-845ab213c155 |
| API Base | https://ben-juris-center.vercel.app |
| Agentes | 45 agentes IA |

---

## Acesso ao App

- **Senha provisória**: 12345678
- **E-mail autorizado 1**: mauromoncaoestudos@gmail.com
- **E-mail autorizado 2**: mauromoncaoadv.escritorio@gmail.com

---

## Estrutura do Projeto

```
ben-ia-mobile/
├── app/
│   ├── _layout.tsx        # Root layout com AuthProvider
│   └── index.tsx          # Tela principal (login + chat)
├── src/
│   ├── components/
│   │   ├── AuthContext.tsx # Autenticação (senha + email)
│   │   ├── AgentList.tsx   # Sidebar com 45 agentes
│   │   ├── ChatScreen.tsx  # Tela de chat
│   │   └── LoginScreen.tsx # Tela de login
│   ├── constants/
│   │   └── agents.ts      # Dados de todos os agentes
│   └── screens/           # Screens alternativas (expo-router)
├── assets/
│   ├── icon.png           # Ícone do app (Falcon 1024×1024)
│   ├── splash-icon.png    # Splash screen
│   ├── falcon-logo.png    # Logo Falcão (avatares)
│   └── android-icon-*.png # Ícones adaptativos Android
├── app.json               # Configuração Expo
└── eas.json               # Configuração EAS Build
```
