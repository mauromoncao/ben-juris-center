# BEN IA — Guia de Build e Publicação

## Pré-requisitos
```bash
npm install -g expo-cli eas-cli
eas login   # login com sua conta Expo (expo.dev)
```

---

## 1. Instalar dependências
```bash
cd ben-ia-app
npm install
```

---

## 2. Android — APK de teste (distribuição interna)
```bash
eas build --platform android --profile preview
```
Gera um **APK instalável** diretamente. Expo enviará o link para download por email.

## 3. Android — App Bundle para Play Store
```bash
eas build --platform android --profile production
```
Gera `.aab` para upload no Google Play Console.

## 4. iOS — Build para App Store
```bash
eas build --platform ios --profile production
```
Requer conta Apple Developer ($99/ano). EAS gerencia certificados automaticamente.

## 5. Submit para as lojas
```bash
# Google Play (requer google-play-key.json)
eas submit --platform android --latest

# App Store Connect
eas submit --platform ios --latest
```

---

## Estrutura do projeto
```
ben-ia-app/
├── app.json              # Config Expo (bundle ID, versão, ícone)
├── eas.json              # Perfis de build EAS
├── assets/
│   ├── icon.png                      # Ícone do app (1024x1024) — Falcon BEN
│   ├── android-icon-foreground.png   # Ícone adaptativo Android (foreground)
│   ├── android-icon-background.png   # Ícone adaptativo Android (background navy)
│   ├── splash-icon.png               # Tela de splash
│   ├── falcon-logo.png               # Logo Falcão BEN (128px) — avatares chat
│   └── falcon-logo-lg.png            # Logo Falcão BEN (512px) — alta res
└── src/
    ├── screens/
    │   ├── ChatScreen.tsx            # Chat principal — 45 agentes
    │   └── ProfileScreen.tsx         # Perfil + stats
    ├── data/agents.ts                # 45 agentes BEN IA
    └── context/AuthContext.tsx       # Auth: senha + Google
```

---

## Identidade visual
| Elemento | Cor |
|----------|-----|
| Background geral | `#F2F4F8` |
| Cards | `#FFFFFF` |
| Header/Sidebar | `#0d1f3c` |
| Mensagem usuário | `#0d1f3c` (texto branco) |
| Mensagem bot | `#FFFFFF` (texto `#1A1A1A`) |
| Dourado acento | `#E4B71E` |
| Logo | Falcão BEN — `zsDQqxh9.png` (B circuit board dourado/roxo) |

---

## API
- Endpoint: `https://ben-juris-center.vercel.app/api/agents/run`
- POST `{ agentId, input, clientId, context }`
- Todos os 45 agentes funcionando ✅ (v6.2, build fix TypeScript 2026-03-14)

---

## Bundle IDs
- **iOS:** `br.adv.mauromoncao.benia`
- **Android:** `br.adv.mauromoncao.benia`
