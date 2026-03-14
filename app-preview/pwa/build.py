#!/usr/bin/env python3
"""Build PWA index.html"""

html = r"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="theme-color" content="#0A1628">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="BEN IA">
<meta name="description" content="Workspace Jurídico Inteligente — 45 Agentes IA">
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="icon-192.png">
<title>BEN IA</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body{height:100%;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0A1628;color:#E0EAFF}
:root{
  --bg:#0A1628;--sidebar:#0d1f3c;--card:#0d1f3c;--input:#0f2645;
  --border:#1a3560;--gold:#E2B714;--gold2:#F7D060;
  --text:#E0EAFF;--muted:#7096C8;--dim:#4a6080;
  --user:#1a3a6e;--bot:#0d2340;--red:#EF4444;
}
#app{display:flex;height:100vh;overflow:hidden}
/* SIDEBAR */
#sidebar{width:280px;flex-shrink:0;background:var(--sidebar);border-right:1px solid var(--border);display:flex;flex-direction:column;transition:transform .25s cubic-bezier(.4,0,.2,1);z-index:50}
#sidebar-header{display:flex;align-items:center;justify-content:space-between;padding:16px 16px 14px;border-bottom:1px solid var(--border)}
.logo-row{display:flex;align-items:center;gap:10px}
.logo-icon{width:36px;height:36px;border-radius:9px;overflow:hidden;border:1.5px solid rgba(226,183,20,.4);flex-shrink:0}
.logo-icon img{width:100%;height:100%;object-fit:cover}
.logo-title{font-size:16px;font-weight:800;color:var(--gold);letter-spacing:1.5px}
.logo-sub{font-size:10px;color:var(--muted)}
.logout-btn{padding:6px 10px;border-radius:8px;border:1px solid rgba(239,68,68,.25);background:rgba(239,68,68,.1);color:#EF4444;font-size:11px;font-weight:600;cursor:pointer}
#agent-scroll{flex:1;overflow-y:auto;overflow-x:hidden}
#agent-scroll::-webkit-scrollbar{width:3px}
#agent-scroll::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
.section-lbl{font-size:9px;font-weight:700;letter-spacing:2px;color:var(--dim);padding:14px 14px 6px;text-transform:uppercase}
.cat-header{display:flex;align-items:center;gap:7px;padding:9px 14px;cursor:pointer;transition:background .15s}
.cat-header:hover{background:rgba(255,255,255,.04)}
.cat-dot{width:7px;height:7px;border-radius:3.5px;flex-shrink:0}
.cat-label{flex:1;font-size:12px;font-weight:700;letter-spacing:.3px}
.cat-count{font-size:11px;color:var(--dim)}
.cat-chv{font-size:12px;color:var(--dim);transition:transform .2s;display:inline-block}
.agent-item{display:flex;align-items:center;gap:8px;padding:8px 14px 8px 22px;cursor:pointer;border-left:2px solid transparent;margin-left:8px;transition:background .15s,border-color .15s}
.agent-item:hover{background:rgba(255,255,255,.05)}
.agent-item.active{background:rgba(255,255,255,.08);border-left-color:var(--gold)}
.agent-emoji{font-size:16px;width:22px;text-align:center;flex-shrink:0}
.agent-name{flex:1;font-size:12.5px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.badge{padding:2px 5px;border-radius:4px;font-size:8px;font-weight:700;color:#fff;letter-spacing:.4px;flex-shrink:0}
.sidebar-footer{padding:10px 14px;border-top:1px solid var(--border)}
.sidebar-footer-txt{font-size:10px;color:var(--dim);text-align:center}
/* MAIN */
#main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
#chat-header{display:flex;align-items:center;gap:10px;padding:14px 14px 12px;background:var(--sidebar);border-bottom:1px solid var(--border);flex-shrink:0}
#menu-btn{width:36px;height:36px;border-radius:10px;border:1px solid var(--border);background:rgba(255,255,255,.07);display:none;align-items:center;justify-content:center;cursor:pointer;font-size:18px;color:var(--text);flex-shrink:0}
#agent-avatar{width:34px;height:34px;border-radius:9px;overflow:hidden;border:1px solid rgba(226,183,20,.3);flex-shrink:0}
#agent-avatar img{width:100%;height:100%;object-fit:cover}
#agent-info{flex:1;min-width:0}
#agent-header-name{font-size:14px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#agent-header-sub{font-size:11px;color:var(--muted)}
#clear-btn{width:34px;height:34px;border-radius:9px;border:1px solid var(--border);background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;color:var(--muted);flex-shrink:0}
/* MESSAGES */
#messages{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:14px}
#messages::-webkit-scrollbar{width:3px}
#messages::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
/* Welcome */
#welcome{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;gap:16px;min-height:100%}
.welcome-icon{width:90px;height:90px;border-radius:22px;overflow:hidden;border:2px solid rgba(226,183,20,.3)}
.welcome-icon img{width:100%;height:100%;object-fit:cover}
.welcome-title{font-size:22px;font-weight:800;color:var(--text)}
.welcome-txt{font-size:14px;color:var(--muted);text-align:center;max-width:260px;line-height:1.6}
.welcome-btn{padding:13px 32px;background:#1d4ed8;border:none;border-radius:12px;font-size:15px;font-weight:700;color:#fff;cursor:pointer;font-family:inherit}
.cat-grid{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:360px}
.cat-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:100px;cursor:pointer;transition:background .15s}
.cat-card:hover{background:rgba(255,255,255,.06)}
.cat-card-emoji{font-size:22px}
.cat-card-label{font-size:12px;font-weight:700}
.cat-card-count{font-size:10px;color:var(--dim)}
/* Empty state */
#empty-state{display:none;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;gap:14px;min-height:300px}
#empty-icon{width:90px;height:90px;border-radius:22px;overflow:hidden;border:2px solid rgba(226,183,20,.3)}
#empty-icon img{width:100%;height:100%;object-fit:cover}
#empty-name{font-size:17px;font-weight:700;color:var(--text);text-align:center}
#empty-desc{font-size:13px;color:var(--muted);text-align:center;line-height:1.6;max-width:280px}
#empty-hint{background:rgba(29,78,216,.15);border:1px solid rgba(29,78,216,.3);border-radius:12px;padding:12px 16px;font-size:12px;color:#93C5FD;text-align:center;line-height:1.6;max-width:280px}
/* Bubbles */
.msg-row{display:flex;align-items:flex-end;gap:8px}
.msg-row.user{flex-direction:row-reverse}
.avatar{width:30px;height:30px;border-radius:8px;overflow:hidden;flex-shrink:0;border:1px solid rgba(226,183,20,.25)}
.avatar img{width:100%;height:100%;object-fit:cover}
.bubble{max-width:78%;padding:11px 14px;border-radius:16px;font-size:14px;line-height:1.6;word-break:break-word}
.bubble.bot{background:var(--bot);border:1px solid var(--border);border-bottom-left-radius:4px;color:var(--text)}
.bubble.user{background:var(--user);border-bottom-right-radius:4px;color:#fff}
.bubble-meta{display:flex;align-items:center;gap:6px;margin-top:6px;opacity:.6}
.meta-txt{font-size:10px;color:var(--muted)}
.copy-btn{margin-left:auto;padding:2px 6px;border-radius:4px;border:1px solid var(--border);background:transparent;color:var(--muted);font-size:10px;cursor:pointer}
/* Typing */
.typing-row{display:flex;align-items:flex-end;gap:8px}
.typing-bubble{background:var(--bot);border:1px solid var(--border);border-radius:16px;border-bottom-left-radius:4px;padding:14px 18px;display:flex;align-items:center;gap:8px}
.dot{width:7px;height:7px;border-radius:50%;background:var(--gold);animation:bounce .9s infinite}
.dot:nth-child(2){animation-delay:.15s}
.dot:nth-child(3){animation-delay:.3s}
@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
/* Input */
#input-bar{display:flex;align-items:flex-end;gap:8px;padding:12px 14px 20px;background:var(--card);border-top:1px solid var(--border);flex-shrink:0}
#msg-input{flex:1;background:var(--input);border:1.5px solid var(--border);border-radius:22px;padding:10px 16px;font-size:15px;color:var(--text);resize:none;max-height:110px;overflow-y:auto;line-height:1.5;outline:none;font-family:inherit}
#msg-input:focus{border-color:rgba(226,183,20,.5)}
#msg-input::placeholder{color:var(--dim)}
#send-btn{width:44px;height:44px;border-radius:22px;background:var(--sidebar);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;font-size:18px;color:var(--text);transition:background .15s}
#send-btn:disabled{opacity:.4;cursor:default}
/* LOGIN */
#login-screen{position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;z-index:999;overflow-y:auto}
.login-logo{width:90px;height:90px;border-radius:20px;overflow:hidden;border:1.5px solid rgba(226,183,20,.4);margin-bottom:20px;box-shadow:0 0 40px rgba(168,85,247,.4)}
.login-logo img{width:100%;height:100%;object-fit:cover}
.login-title{font-size:30px;font-weight:800;color:var(--gold);letter-spacing:3px;margin-bottom:4px}
.login-sub{font-size:13px;color:var(--muted);margin-bottom:36px}
.login-card{width:100%;max-width:380px;background:var(--card);border-radius:16px;padding:24px;border:1px solid var(--border);box-shadow:0 8px 40px rgba(0,0,0,.5)}
.lc-title{font-size:17px;font-weight:700;margin-bottom:4px}
.lc-sub{font-size:13px;color:var(--muted);margin-bottom:20px}
.login-input{width:100%;background:var(--input);border:1px solid var(--border);border-radius:10px;padding:14px 16px;font-size:15px;color:var(--text);outline:none;margin-bottom:10px;font-family:inherit}
.login-input:focus{border-color:rgba(226,183,20,.5)}
.login-input::placeholder{color:var(--dim)}
.login-input.err{border-color:var(--red)}
.login-err{font-size:13px;color:var(--red);margin-bottom:10px;padding-left:4px;display:none}
.login-btn{width:100%;padding:15px;background:#1d4ed8;border:none;border-radius:10px;font-size:16px;font-weight:700;color:#fff;cursor:pointer;margin-top:4px;font-family:inherit;transition:background .15s}
.login-btn:hover{background:#1e40af}
.hint-toggle{text-align:center;margin-top:14px;font-size:12px;color:var(--dim);cursor:pointer;padding:4px}
.hint-box{background:rgba(226,183,20,.07);border:1px solid rgba(226,183,20,.2);border-radius:8px;padding:12px;margin-top:8px;font-size:12px;color:var(--muted);line-height:1.8;display:none}
.hint-box b{color:var(--gold)}
.login-footer{font-size:11px;color:var(--dim);margin-top:28px}
/* Overlay */
#overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:40}
/* Mobile */
@media(max-width:640px){
  #sidebar{position:fixed;left:0;top:0;bottom:0;width:285px;transform:translateX(-100%)}
  #sidebar.open{transform:translateX(0)}
  #menu-btn{display:flex!important}
  #overlay.open{display:block}
}
/* Markdown */
.bubble p{margin-bottom:8px}
.bubble p:last-child{margin-bottom:0}
.bubble code{background:rgba(255,255,255,.1);border-radius:4px;padding:1px 5px;font-family:monospace;font-size:13px}
.bubble pre{background:rgba(0,0,0,.4);border-radius:8px;padding:12px;overflow-x:auto;margin:8px 0}
.bubble pre code{background:none;padding:0}
.bubble ul,.bubble ol{padding-left:20px;margin:6px 0}
.bubble li{margin-bottom:3px}
.bubble strong{color:var(--gold2)}
.bubble h3{font-size:14px;font-weight:700;margin:10px 0 6px;color:var(--gold2)}
</style>
</head>
<body>
<!-- LOGIN -->
<div id="login-screen">
  <div class="login-logo"><img src="icon-192.png" alt="BEN IA"></div>
  <div class="login-title">BEN IA</div>
  <div class="login-sub">Workspace Jurídico Inteligente</div>
  <div class="login-card">
    <div class="lc-title">Acesso Restrito</div>
    <div class="lc-sub">Use a senha ou e-mail autorizado</div>
    <input class="login-input" id="cred" type="password" placeholder="Senha ou e-mail Gmail" autocomplete="off" autocapitalize="none">
    <div class="login-err" id="lerr"></div>
    <button class="login-btn" onclick="doLogin()">Entrar</button>
    <div class="hint-toggle" onclick="toggleHint()">▼ Como acessar?</div>
    <div class="hint-box" id="hbox">
      <b>Senha provisória:</b> 12345678<br>
      <b>Ou e-mail:</b> mauromoncaoestudos@gmail.com<br>
      mauromoncaoadv.escritorio@gmail.com
    </div>
  </div>
  <div class="login-footer">BEN IA v1.1 · Acesso exclusivo · 2026</div>
</div>

<div id="overlay" onclick="closeSidebar()"></div>

<!-- APP -->
<div id="app" style="display:none">
  <div id="sidebar">
    <div id="sidebar-header">
      <div class="logo-row">
        <div class="logo-icon"><img src="icon-192.png" alt="BEN"></div>
        <div>
          <div class="logo-title">BEN IA</div>
          <div class="logo-sub">Workspace</div>
        </div>
      </div>
      <button class="logout-btn" onclick="doLogout()">Sair</button>
    </div>
    <div id="agent-scroll">
      <div class="section-lbl">AGENTES</div>
      <div id="agent-list"></div>
    </div>
    <div class="sidebar-footer"><div class="sidebar-footer-txt">BEN IA v1.1 · Acesso restrito</div></div>
  </div>

  <div id="main">
    <div id="chat-header">
      <button id="menu-btn" onclick="openSidebar()">☰</button>
      <div id="agent-avatar"><img src="icon-192.png" alt="BEN"></div>
      <div id="agent-info">
        <div id="ahn">BEN IA</div>
        <div id="ahs">Selecione um agente</div>
      </div>
      <button id="clear-btn" onclick="clearChat()">🗑</button>
    </div>

    <div id="messages">
      <div id="welcome">
        <div class="welcome-icon"><img src="icon-192.png" alt="BEN"></div>
        <div class="welcome-title">Bem-vindo ao BEN IA</div>
        <div class="welcome-txt">Selecione um agente para iniciar</div>
        <button class="welcome-btn" onclick="openSidebar()">Ver Agentes</button>
        <div class="cat-grid" id="cat-cards"></div>
      </div>
      <div id="empty-state">
        <div id="empty-icon"><img src="icon-192.png" alt="BEN"></div>
        <div id="empty-name"></div>
        <div id="empty-desc"></div>
        <div id="empty-hint">💬 Digite sua mensagem abaixo para começar</div>
      </div>
    </div>

    <div id="input-bar">
      <textarea id="msg-input" rows="1" placeholder="Mensagem para o agente..."
        onkeydown="handleKey(event)" oninput="autoResize(this)"></textarea>
      <button id="send-btn" onclick="sendMsg()" disabled>➤</button>
    </div>
  </div>
</div>

<script>
const API='https://ben-juris-center.vercel.app';
const AUTH_PWD='12345678';
const ALLOWED=['mauromoncaoestudos@gmail.com','mauromoncaoadv.escritorio@gmail.com'];
const CATS=[
  {key:'juridico',label:'Jurídico',color:'#93C5FD',emoji:'⚖️',agents:[
    {id:'ben-super-agente-juridico',e:'⭐',s:'Agente Maximus',n:'AGENTE OPERACIONAL MAXIMUS',b:'OPUS',bc:'#92400e'},
    {id:'ben-agente-operacional-premium',e:'🔷',s:'Agente Premium',n:'AGENTE OPERACIONAL PREMIUM',b:'SONNET',bc:'#1d4ed8'},
    {id:'ben-agente-operacional-standard',e:'🟢',s:'Agente Standard',n:'AGENTE OPERACIONAL STANDARD',b:'HAIKU',bc:'#16a34a'},
    {id:'ben-tributarista-estrategista',e:'⚖️',s:'Tributarista Estrat.',n:'AGENTE TRIBUTARISTA ESTRATEGISTA',b:'OPUS',bc:'#b45309'},
    {id:'ben-processualista-estrategico',e:'📋',s:'Processualista Estrat.',n:'AGENTE PROCESSUALISTA ESTRATÉGICO',b:'OPUS',bc:'#1e3a5f'},
    {id:'ben-peticionista-juridico',e:'⚖️',s:'Peticionista',n:'BEN Peticionista Jurídico'},
    {id:'ben-contratualista',e:'📋',s:'Contratualista',n:'BEN Contratualista'},
    {id:'ben-mandatario-juridico',e:'📜',s:'Mandatário',n:'BEN Mandatário Jurídico'},
    {id:'ben-analista-processual',e:'🔬',s:'Analista Proc.',n:'BEN Analista Processual'},
    {id:'ben-tributarista',e:'💰',s:'Tributarista',n:'BEN Tributarista'},
    {id:'ben-trabalhista',e:'👷',s:'Trabalhista',n:'BEN Trabalhista'},
    {id:'ben-previdenciarista',e:'🏛️',s:'Previdenciarista',n:'BEN Previdenciarista'},
    {id:'ben-constitucionalista',e:'⚡',s:'Constitucionalista',n:'BEN Constitucionalista'},
    {id:'ben-especialista-compliance',e:'🛡️',s:'Compliance',n:'BEN Especialista Compliance'},
    {id:'ben-pesquisador-juridico',e:'🔎',s:'Pesquisador',n:'BEN Pesquisador Jurídico'},
    {id:'ben-relator-juridico',e:'📚',s:'Relator',n:'BEN Relator Jurídico'},
    {id:'ben-redator-juridico',e:'✒️',s:'Redator',n:'BEN Redator Jurídico'},
    {id:'ben-auditor-processual',e:'🔏',s:'Auditor',n:'BEN Auditor Processual'},
    {id:'ben-gestor-juridico',e:'🏢',s:'Gestor',n:'BEN Gestor Jurídico'},
    {id:'ben-revisor-juridico',e:'📝',s:'Revisor',n:'BEN Revisor Jurídico'},
    {id:'ben-peticionista',e:'⚖️',s:'Peticionista G.',n:'BEN Peticionista'},
  ]},
  {key:'contador',label:'Contador',color:'#FCD34D',emoji:'🧮',agents:[
    {id:'ben-contador-tributarista',e:'🧮',s:'Triagem',n:'BEN Contador — Triagem',b:'SONNET',bc:'#1d4ed8'},
    {id:'ben-contador-especialista',e:'📊',s:'Especialista',n:'BEN Contador — Especialista',b:'SONNET',bc:'#1d4ed8'},
    {id:'ben-contador-planejamento',e:'🗺️',s:'Planejamento',n:'BEN Contador — Planejamento',b:'SONNET',bc:'#1d4ed8'},
    {id:'ben-contador-creditos',e:'💳',s:'Créditos',n:'BEN Contador — Créditos',b:'SONNET',bc:'#1d4ed8'},
    {id:'ben-contador-auditoria',e:'🔍',s:'Auditoria',n:'BEN Contador — Auditoria',b:'SONNET',bc:'#1d4ed8'},
    {id:'ben-contador-relatorio',e:'📋',s:'Relatório',n:'BEN Contador — Relatório',b:'SONNET',bc:'#1d4ed8'},
  ]},
  {key:'perito',label:'Perito Forense',color:'#C4B5FD',emoji:'🔬',agents:[
    {id:'ben-perito-forense',e:'🔬',s:'Padrão',n:'BEN Perito Forense — Padrão',b:'SONNET',bc:'#1d4ed8'},
    {id:'ben-perito-forense-profundo',e:'🧬',s:'Profundo',n:'BEN Perito Forense — Profundo',b:'OPUS',bc:'#b45309'},
    {id:'ben-perito-forense-digital',e:'💻',s:'Digital',n:'BEN Perito Forense Digital',b:'SONNET',bc:'#1d4ed8'},
    {id:'ben-perito-forense-laudo',e:'📄',s:'Laudo',n:'BEN Perito Forense — Laudo',b:'SONNET',bc:'#1d4ed8'},
    {id:'ben-perito-forense-contestar',e:'🛡️',s:'Contraditório',n:'BEN Perito — Contraditório',b:'SONNET',bc:'#1d4ed8'},
    {id:'ben-perito-forense-relatorio',e:'📊',s:'Relatório',n:'BEN Perito Forense — Relatório',b:'SONNET',bc:'#1d4ed8'},
    {id:'ben-perito-imobiliario',e:'🏠',s:'Imobiliário',n:'BEN Perito Imobiliário — ABNT',b:'SONNET',bc:'#1d4ed8'},
  ]},
  {key:'growth',label:'Growth & Marketing',color:'#6EE7B7',emoji:'📣',agents:[
    {id:'ben-atendente',e:'🤝',s:'Atendente',n:'BEN Atendente'},
    {id:'ben-conteudista',e:'✍️',s:'Conteudista',n:'BEN Conteudista Jurídico'},
    {id:'ben-estrategista-campanhas',e:'📊',s:'Campanhas',n:'BEN Estrategista Campanhas'},
    {id:'ben-estrategista-marketing',e:'📣',s:'Marketing',n:'BEN Estrategista Marketing'},
    {id:'ben-analista-relatorios',e:'📈',s:'Relatórios',n:'BEN Analista de Relatórios'},
    {id:'ben-diretor-criativo',e:'🎨',s:'Dir. Criativo',n:'BEN Diretor Criativo'},
  ]},
  {key:'sistema',label:'Sistema',color:'#A5B4FC',emoji:'🤖',agents:[
    {id:'ben-assistente-geral',e:'🤖',s:'BEN Copilot',n:'BEN Copilot',b:'FIXO',bc:'#6d28d9'},
    {id:'ben-engenheiro-prompt',e:'🧠',s:'Eng. Prompt',n:'BEN Engenheiro de Prompt'},
    {id:'ben-analista-monitoramento',e:'🔍',s:'Monitoramento',n:'BEN Analista Monitoramento'},
    {id:'ben-monitor-juridico',e:'📡',s:'Monitor Jurídico',n:'BEN Monitor Jurídico DJe + CNJ',b:'NEW',bc:'#0e7490'},
    {id:'ben-assistente-cnj',e:'⚖️',s:'Assistente CNJ',n:'BEN Assistente CNJ DataJud',b:'NEW',bc:'#0e7490'},
  ]},
];
const DESCS={
  'ben-assistente-geral':'Copiloto universal BEN IA — sem restrições temáticas.',
  'ben-super-agente-juridico':'Análise jurídica de máxima profundidade.',
  'ben-agente-operacional-premium':'Análise jurídica premium de alto nível.',
  'ben-agente-operacional-standard':'Operações jurídicas rápidas e precisas.',
  'ben-contador-tributarista':'Triagem e análise tributária especializada.',
  'ben-perito-forense':'Perícia forense padrão com análise técnica.',
  'ben-atendente':'Atendimento ao cliente profissional.',
};

let agent=null,msgs=[],busy=false;
let exp={juridico:true,contador:false,perito:false,growth:false,sistema:false};
let hintOn=false;

// AUTH
function checkAuth(){localStorage.getItem('ben_ia_auth')==='true'?showApp():showLogin()}
function showLogin(){document.getElementById('login-screen').style.display='flex';document.getElementById('app').style.display='none'}
function showApp(){
  document.getElementById('login-screen').style.display='none';
  document.getElementById('app').style.display='flex';
  renderList();renderCards();
  // auto-select BEN Copilot
  setTimeout(()=>selectAgent('ben-assistente-geral'),200);
}
function doLogin(){
  const v=document.getElementById('cred').value.trim();
  if(!v){showErr('Digite a senha ou e-mail.');return}
  if(v===AUTH_PWD||ALLOWED.includes(v.toLowerCase())){
    localStorage.setItem('ben_ia_auth','true');showApp();
  }else showErr('Credencial não autorizada.');
}
function showErr(m){const e=document.getElementById('lerr');e.textContent='⚠ '+m;e.style.display='block';document.getElementById('cred').classList.add('err')}
function doLogout(){localStorage.removeItem('ben_ia_auth');location.reload()}
function toggleHint(){hintOn=!hintOn;document.getElementById('hbox').style.display=hintOn?'block':'none'}
document.getElementById('cred').addEventListener('keydown',e=>{
  if(e.key==='Enter')doLogin();
  setTimeout(()=>{const f=document.getElementById('cred');f.type=f.value.includes('@')?'text':'password'},0);
});

// SIDEBAR
function renderList(){
  const l=document.getElementById('agent-list');l.innerHTML='';
  CATS.forEach(cat=>{
    const d=document.createElement('div');
    const agHtml=cat.agents.map(a=>`
      <div class="agent-item${agent&&agent.id===a.id?' active':''}" id="ai-${a.id}" onclick="selectAgent('${a.id}')">
        <span class="agent-emoji">${a.e}</span>
        <span class="agent-name">${a.s}</span>
        ${a.b?`<span class="badge" style="background:${a.bc||'#1d4ed8'}">${a.b}</span>`:''}
      </div>`).join('');
    d.innerHTML=`
      <div class="cat-header" onclick="toggleCat('${cat.key}')">
        <div class="cat-dot" style="background:${cat.color}"></div>
        <span class="cat-label" style="color:${cat.color}">${cat.label}</span>
        <span class="cat-count">${cat.agents.length}</span>
        <span class="cat-chv" id="chv-${cat.key}" style="transform:rotate(${exp[cat.key]?0:-90}deg)">▾</span>
      </div>
      <div id="ag-${cat.key}" style="display:${exp[cat.key]?'block':'none'}">${agHtml}</div>`;
    l.appendChild(d);
  });
}
function toggleCat(k){
  exp[k]=!exp[k];
  document.getElementById('ag-'+k).style.display=exp[k]?'block':'none';
  document.getElementById('chv-'+k).style.transform=`rotate(${exp[k]?0:-90}deg)`;
}
function renderCards(){
  document.getElementById('cat-cards').innerHTML=CATS.map(c=>`
    <div class="cat-card" onclick="openSidebar()">
      <div class="cat-card-emoji">${c.emoji}</div>
      <div class="cat-card-label" style="color:${c.color}">${c.label}</div>
      <div class="cat-card-count">${c.agents.length} agentes</div>
    </div>`).join('');
}
function openSidebar(){document.getElementById('sidebar').classList.add('open');document.getElementById('overlay').classList.add('open')}
function closeSidebar(){document.getElementById('sidebar').classList.remove('open');document.getElementById('overlay').classList.remove('open')}

// AGENT SELECT
function selectAgent(id){
  const a=CATS.flatMap(c=>c.agents).find(x=>x.id===id);
  if(!a)return;
  agent=a;msgs=[];
  document.getElementById('ahn').textContent=a.s;
  document.getElementById('ahs').textContent=a.n;
  document.querySelectorAll('.agent-item').forEach(el=>el.classList.remove('active'));
  const el=document.getElementById('ai-'+id);if(el)el.classList.add('active');
  document.getElementById('welcome').style.display='none';
  const es=document.getElementById('empty-state');
  es.style.display='flex';
  document.getElementById('empty-name').textContent=a.n;
  document.getElementById('empty-desc').textContent=DESCS[id]||'Agente especializado BEN IA — pronto para ajudar.';
  clearMsgs();
  closeSidebar();
  document.getElementById('msg-input').focus();
}

// CHAT
function clearMsgs(){document.querySelectorAll('.msg-row,.typing-row').forEach(e=>e.remove())}

async function sendMsg(){
  if(!agent||busy)return;
  const inp=document.getElementById('msg-input');
  const txt=inp.value.trim();if(!txt)return;
  inp.value='';inp.style.height='';
  document.getElementById('send-btn').disabled=true;
  document.getElementById('empty-state').style.display='none';
  const box=document.getElementById('messages');
  const um={id:uid(),role:'user',content:txt};msgs.push(um);
  busy=true;box.appendChild(mkBubble(um));addTyping();
  const t0=Date.now();
  try{
    const r=await fetch(API+'/api/agents/run',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({agentId:agent.id,input:txt,clientId:'dr-mauro-moncao',context:'',useSearch:false})});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const d=await r.json();
    const el=((Date.now()-t0)/1000).toFixed(1);
    const bm={id:uid(),role:'assistant',content:d.response||d.content||'Sem resposta.',elapsed:el};
    msgs.push(bm);removeTyping();box.appendChild(mkBubble(bm));
  }catch(e){
    const em={id:uid(),role:'assistant',content:'⚠️ Erro: '+e.message+'\n\nVerifique sua conexão.'};
    msgs.push(em);removeTyping();box.appendChild(mkBubble(em));
  }
  busy=false;document.getElementById('send-btn').disabled=false;scroll();
}
function clearChat(){if(!agent)return;msgs=[];clearMsgs();document.getElementById('empty-state').style.display='flex'}
function mkBubble(m){
  const r=document.createElement('div');
  r.className='msg-row '+m.role;r.id='m-'+m.id;
  if(m.role==='assistant'){
    r.innerHTML=`<div class="avatar"><img src="icon-192.png" alt="BEN"></div>
      <div class="bubble bot"><div>${fmtTxt(m.content)}</div>
      <div class="bubble-meta">${m.elapsed?`<span class="meta-txt">${m.elapsed}s</span>`:''}
        <button class="copy-btn" onclick="cpMsg('${m.id}')">⧉ Copiar</button></div></div>`;
  }else{
    r.innerHTML=`<div class="bubble user">${esc(m.content)}</div>`;
  }
  return r;
}
function addTyping(){
  removeTyping();
  const r=document.createElement('div');r.className='typing-row';r.id='ty';
  r.innerHTML=`<div class="avatar"><img src="icon-192.png" alt="BEN"></div>
    <div class="typing-bubble"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
  document.getElementById('messages').appendChild(r);scroll();
}
function removeTyping(){const t=document.getElementById('ty');if(t)t.remove()}
function cpMsg(id){
  const m=msgs.find(x=>x.id===id);if(!m)return;
  navigator.clipboard.writeText(m.content).then(()=>{
    const b=document.querySelector('#m-'+id+' .copy-btn');
    if(b){b.textContent='✓ Copiado';setTimeout(()=>b.textContent='⧉ Copiar',1500)}
  }).catch(()=>{const t=document.createElement('textarea');t.value=m.content;document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t)});
}
function handleKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg()}}
function autoResize(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,110)+'px';document.getElementById('send-btn').disabled=!el.value.trim()||busy}
function scroll(){setTimeout(()=>{const b=document.getElementById('messages');b.scrollTop=b.scrollHeight},80)}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2)}
function esc(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}
function fmtTxt(t){
  let h=esc(t);
  h=h.replace(/```([\s\S]*?)```/g,'<pre><code>$1</code></pre>');
  h=h.replace(/`([^`]+)`/g,'<code>$1</code>');
  h=h.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  h=h.replace(/^### (.+)$/gm,'<h3>$1</h3>');
  h=h.replace(/^[•·*\-] (.+)$/gm,'<li>$1</li>');
  h=h.replace(/(<li>[\s\S]*?<\/li>\n?)+/g,'<ul>$&</ul>');
  h=h.replace(/<br><br>/g,'</p><p>');
  return '<p>'+h+'</p>';
}
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
checkAuth();
</script>
</body>
</html>"""

with open('/home/user/webapp/app-preview/pwa/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"PWA created: {len(html):,} chars = {len(html.encode())//1024} KB")
