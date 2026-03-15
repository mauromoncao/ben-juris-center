# BEN IA — App Mobile

App móvel do BEN Ecosystem IA Workspace para Android e iOS.

## Acesso

| Método | Credencial |
|---|---|
| Senha provisória | `12345678` |
| Gmail autorizado | `mauromoncaoestudos@gmail.com` |
| Gmail autorizado | `mauromoncaoadv.escritorio@gmail.com` |

## Agentes disponíveis (45 total)

| Categoria | Qtd |
|---|---|
| ⚖️ Jurídico | 21 |
| 🧮 Contador | 6 |
| 🔬 Perito Forense | 7 |
| 📣 Growth & Marketing | 6 |
| 🤖 Sistema | 5 |

## Limitações (por design)

- ❌ Sem acesso ao Growth Center
- ❌ Sem acesso ao Juris Center  
- ❌ Sem acesso ao HUB Estratégico
- ❌ Sem módulos de processos, prazos, agenda, financeiro, BI

## Como rodar

```bash
npm install
npx expo start
```

## Como compilar

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

## API

Todos os agentes conectam via:
```
POST https://juris.mauromoncao.adv.br/api/agents/run
```

## Estrutura

```
ben-ia-mobile/
├── app/
│   ├── _layout.tsx       # Root layout + AuthProvider
│   └── index.tsx         # Tela principal (login / workspace)
├── src/
│   ├── components/
│   │   ├── AuthContext.tsx   # Autenticação (senha + Gmail)
│   │   ├── LoginScreen.tsx   # Tela de login
│   │   ├── AgentList.tsx     # Sidebar com todos os agentes
│   │   └── ChatScreen.tsx    # Chat com agente selecionado
│   └── constants/
│       └── agents.ts         # Dados de todos os 45 agentes
├── assets/images/
│   └── icon.png              # Ícone Falcon original
└── app.json                  # Config Expo
```
