# 🧠 SYSTEM RUNTIME MAP & ARCHITECTURE ANALYSIS — CanGuess

**Data:** Jun 23, 2026  
**Sistema:** React + Router DOM + Context API + Supabase  
**Objetivo:** Mapear a execução real, identificar riscos estruturais e gerar infográfico visual

---

## 1. 🔁 EXECUTION FLOW GRAPH (RUNTIME REAL)

### 1.1 Cadeia de Inicialização do Aplicativo

```
main.jsx
  ↓
BrowserRouter
  ↓
App.jsx
  ↓
AuthProvider (inicializa session Supabase)
  ↓
UserProvider (carrega usuário via AuthService)
  ↓
EventProvider (cria contexto vazio)
  ↓
AppRoutes (ativa roteador)
  ↓
Route match (/) → AppShell
  ↓
AppShell (PROBLEMA: cria NOVO EventProvider!)
  ↓
AppInitializer (lê ?code do URL)
  ↓
loadEventByCode(code) → Supabase query
  ↓
setCurrentEvent(data) → atualiza contexto
```

### 1.2 Fluxo de Execução: Usuário Acessa `/events?code=CANGUESS01`

```
User clicks "Buscar eventos" → Header.handleSearch()
  ↓
navigate(`/events?code=${code}`)
  ↓
Router matches /events → EventHome.jsx
  ↓
useSearchParams() → extrai code
  ↓
useEffect([code]) → fetch Manifest.${code}.json
  ↓
setManifest(data)
  ↓
Renderiza página com banner + conteúdo
  ↓
window.CANGUESS_EVENT_CODE = code (global state!)
```

### 1.3 Fluxo de Execução: Usuário Faz Login

```
User acessa /login
  ↓
Login.jsx → useAuth() → AuthContext
  ↓
handleLogin(identifier, password)
  ↓
AuthContext.login(identifier, password)
  ↓
  1. resolveIdentity(identifier) → query users table
  ↓
  2. supabase.auth.signInWithPassword(email, password)
  ↓
  3. setUser(data.user)
  ↓
  4. setSession(data.session)
  ↓
  5. setWorkspace("CanGuess") [hardcoded!]
  ↓
navigate("/") → Home.jsx
  ↓
Header.jsx lê localStorage.getItem("canguess_user") [INCONSISTÊNCIA!]
```

### 1.4 Fluxo de Execução: Usuário Faz Palpite

```
User acessa /palpites?code=CANGUESS01
  ↓
Predictions.jsx
  ↓
useLocation() → extrai code do URL
  ↓
useEffect([code]) → fetch /data/${code}.event.json
  ↓
setEngine(data), setRounds(normalizedRounds)
  ↓
User preenche formulário → validarUsuario()
  ↓
  1. query users table by phone
  ↓
  2. Se não existe: insert novo guest user
  ↓
  3. setUser(currentUser)
  ↓
  4. setStep("bets")
  ↓
User escolhe palpites → escolher(index, value)
  ↓
setBets({ [index]: value })
  ↓
User clica "Confirmar" → confirmarEnvio()
  ↓
  1. mapeia rounds para inserts
  ↓
  2. supabase.from("predicts").upsert(inserts)
  ↓
  3. setShowSuccess(true)
```

---

## 2. 🧭 ROUTING GRAPH ANALYSIS

### 2.1 Mapa Completo de Rotas

| Rota | Componente | Tipo | Proteção | Status |
|------|-----------|------|----------|--------|
| `/` | Home | Público | Nenhuma | ✅ OK |
| `/login` | Login | Público | Nenhuma | ✅ OK |
| `/register` | Register | Público | Nenhuma | 🔴 **DUPLICADA** (linhas 41 e 51) |
| `/palpites` | Predictions | Público | Nenhuma | ✅ OK |
| `/ranking` | Ranking | Público | Nenhuma | ✅ OK |
| `/events` | EventHome | Público | Nenhuma | ✅ OK |
| `/admin-login` | AdminLogin | Público | Nenhuma | ✅ OK |
| `/admin/*` | AdminLayout | Protegido | AdminGuard | ✅ OK |
| `/admin` | Admin | Protegido | AdminGuard | ✅ OK |
| `/admin/resultados` | Placeholder | Protegido | AdminGuard | ⚠️ Placeholder |
| `/admin/usuarios` | Placeholder | Protegido | AdminGuard | ⚠️ Placeholder |
| `/admin/consultas` | Placeholder | Protegido | AdminGuard | ⚠️ Placeholder |
| `/admin/palpites` | MapaPalpites | Protegido | AdminGuard | ✅ OK |
| `/admin/cadastros` | CadastrosHome | Protegido | AdminGuard | ✅ OK |
| `/admin/cadastros/times` | CadastrosTimes | Protegido | AdminGuard | ✅ OK |
| `/admin/cadastros/eventos` | CadastrosEventos | Protegido | AdminGuard | ✅ OK |
| `/admin/cadastros/fases` | CadastrosFases | Protegido | AdminGuard | ✅ OK |
| `/admin/cadastros/rodadas` | CadastrosRodadas | Protegido | AdminGuard | ✅ OK |
| `/admin/cadastros/eventos/:eventId/estrutura` | EventDashboard | Protegido | AdminGuard | ✅ OK |
| `/admin/cadastros/eventos/:eventId/rounds` | CadastroRounds | Protegido | AdminGuard | ✅ OK |
| `/admin/cadastros/eventos/:eventId/parts` | CadastroParts | Protegido | AdminGuard | ✅ OK |

### 2.2 Problemas Identificados

#### 🔴 **CRÍTICO: Rota `/register` Duplicada**

**Localização:** `AppRoutes.jsx` linhas 41 e 51

```jsx
// Linha 41 (dentro de AppShell)
<Route path="/register" element={<Register />} />

// Linha 51 (fora de AppShell)
<Route path="/register" element={<Register />} />
```

**Impacto:** A segunda definição sobrescreve a primeira. Usuários que acessam `/register` vão para a versão sem `AppShell`, sem `Header` e sem `BottomNav`.

**Risco:** 🔴 Crítico — Inconsistência de layout, usuário perde contexto de navegação.

---

#### 🟠 **ALTO: Nesting Incorreto de AppShell**

**Problema:** `AppShell` envolve apenas as rotas públicas, mas cria um **novo `EventProvider`** internamente.

```jsx
// App.jsx
<AuthProvider>
  <UserProvider>
    <EventProvider>  {/* ← Provider 1 (global) */}
      <AppRoutes />
    </EventProvider>
  </UserProvider>
</AuthProvider>

// AppShell.jsx
export default function AppShell() {
  return (
    <EventProvider>  {/* ← Provider 2 (local) — SOBRESCREVE! */}
      <AppInitializer />
      <AppLayout />
    </EventProvider>
  );
}
```

**Impacto:** 
- Rotas públicas usam o `EventProvider` local (AppShell)
- Rotas admin usam o `EventProvider` global (App.jsx)
- **Estado de evento não persiste entre navegação pública ↔ admin**

**Risco:** 🟠 Alto — Re-render desnecessários, perda de estado, confusão de contexto.

---

#### 🟡 **MÉDIO: Rotas Admin com Placeholders**

**Localização:** `AppRoutes.jsx` linhas 65-67

```jsx
<Route path="resultados" element={<div>Resultados</div>} />
<Route path="usuarios" element={<div>Usuários</div>} />
<Route path="consultas" element={<div>Consultas</div>} />
```

**Impacto:** Rotas existem mas não têm implementação real. Usuários podem navegar para páginas vazias.

**Risco:** 🟡 Médio — Confusão UX, falta de funcionalidade.

---

### 2.3 Análise de Proteção de Rotas

| Tipo | Mecanismo | Segurança | Status |
|------|-----------|----------|--------|
| Admin | `localStorage.getItem("admin_auth") === "true"` | ⚠️ Fraca | 🔴 Cliente-side apenas |
| Auth | Supabase session + `AuthContext` | ✅ Forte | ✅ OK |
| Guest | Sem proteção, permite acesso | ✅ Intencional | ✅ OK |

**Risco Admin:** 🔴 Crítico — Proteção apenas no cliente. Um usuário pode fazer `localStorage.setItem("admin_auth", "true")` e acessar `/admin`.

---

## 3. 🧠 STATE PROPAGATION MAP

### 3.1 AuthContext (Autenticação)

```
AuthContext.Provider (App.jsx)
  ├─ state: user, session, workspace, loading
  ├─ mutations: login(), logout(), setWorkspace()
  │
  └─ Consumidores:
      ├─ Login.jsx → useAuth() → login(identifier, password)
      ├─ Header.jsx → ❌ NÃO consome! (usa localStorage)
      ├─ AdminGuard.jsx → ❌ NÃO consome! (usa localStorage)
      └─ AuthService.js → ❌ Paralelo, não integrado
```

**Problema:** Header e AdminGuard não consomem `AuthContext`, criando dois sistemas de autenticação paralelos.

---

### 3.2 EventContext (Eventos)

```
EventContext.Provider (App.jsx - GLOBAL)
  ├─ state: currentEvent, loading, error
  ├─ mutations: loadEventByCode(), clearEvent()
  │
  ├─ EventProvider (AppShell.jsx - LOCAL) ← SOBRESCREVE!
  │   ├─ state: currentEvent, loading, error [NOVO]
  │   ├─ mutations: loadEventByCode(), clearEvent()
  │   │
  │   └─ Consumidores:
  │       ├─ AppInitializer.jsx → useEvent() → loadEventByCode(code)
  │       └─ ❌ Nenhum outro componente público consome
  │
  └─ Consumidores (admin):
      └─ ❌ Nenhum consumidor identificado
```

**Problema:** 
1. Dois providers paralelos (global + local)
2. Apenas `AppInitializer` consome (e ele é invisível)
3. Páginas como `EventHome`, `Predictions`, `Ranking` **não usam contexto**, leem URL diretamente

---

### 3.3 UserContext (Usuário Secundário)

```
UserContext.Provider (App.jsx)
  ├─ state: user, loading
  ├─ mutations: login(), logout(), isGuest(), isLogged()
  │
  └─ Consumidores:
      └─ ❌ NENHUM CONSUMIDOR IDENTIFICADO!
```

**Problema:** `UserContext` existe mas não é consumido em nenhuma página pública. É código morto.

---

### 3.4 localStorage (Estado Paralelo)

```
localStorage
  ├─ "canguess_user" → Header.jsx (lê)
  ├─ "last_event_code" → EventContext (escreve)
  ├─ "admin_auth" → AdminGuard.jsx (lê)
  │
  └─ Problema: Não sincronizado com AuthContext/EventContext
```

---

### 3.5 URL Query Params (Estado Implícito)

```
?code=CANGUESS01
  ├─ AppInitializer.jsx → lê e chama loadEventByCode()
  ├─ EventHome.jsx → lê e faz fetch local
  ├─ Predictions.jsx → lê e faz fetch local
  ├─ Ranking.jsx → lê e faz fetch local
  ├─ BottomNav.jsx → lê e cria links com ?code=...
  │
  └─ Problema: Estado duplicado em múltiplos lugares
```

---

### 3.6 window.CANGUESS_EVENT_CODE (Global Não Reativo)

```
EventHome.jsx
  └─ window.CANGUESS_EVENT_CODE = code
      └─ ❌ Nenhum consumidor identificado
      └─ ❌ Não reativo (não dispara re-render)
      └─ ❌ Anti-pattern: estado global não rastreável
```

---

## 4. 💥 SIDE EFFECT CHAIN DETECTION

### 4.1 AppInitializer - Efeito de Inicialização

```
useEffect([loadEventByCode])
  ↓
Lê window.location.search
  ↓
Extrai ?code
  ↓
Chama loadEventByCode(code)
  ↓
Supabase query → setCurrentEvent()
  ↓
Re-render de AppShell
```

**Status:** ✅ OK — Efeito bem estruturado, sem loops.

---

### 4.2 Header - Múltiplos Efeitos Não Relacionados

```
useEffect([]) → console.log("[Header] mounted")
  ↓ (sem dependências, roda 1x)

useEffect([showSearch]) → console.log("[Header] showSearch:", showSearch)
  ↓ (roda toda vez que showSearch muda)

useEffect([]) → localStorage.getItem("canguess_user")
  ↓ (sem dependências, roda 1x)
  ↓
setUser(JSON.parse(stored))
  ↓
Re-render de Header
```

**Status:** ⚠️ Questionável — Efeitos de debug (linhas 15-21) devem ser removidos em produção.

---

### 4.3 EventHome - Fetch de Manifest

```
useEffect([code])
  ↓
if (!code) return
  ↓
fetch(`/data/events/Manifest.${code}.json`)
  ↓
setManifest(data)
  ↓
Promise.all([loadText(intro), loadText(rules), loadText(general)])
  ↓
setContent({ intro, rules, general })
  ↓
Re-render de EventHome
```

**Status:** ✅ OK — Efeito bem estruturado.

**Nota:** Também escreve `window.CANGUESS_EVENT_CODE = code` (anti-pattern, mas não causa loop).

---

### 4.4 Predictions - Fetch de Event + Validação

```
useEffect([code])
  ↓
fetch(`/data/${code}.event.json`)
  ↓
setEngine(data)
  ↓
setRounds(normalizedRounds)
  ↓
Re-render de Predictions

useEffect([]) (implícito em validarUsuario)
  ↓
supabase.from("users").select()
  ↓
if (!currentUser) → insert novo guest
  ↓
setUser(currentUser)
  ↓
setStep("bets")
  ↓
Re-render de Predictions
```

**Status:** ✅ OK — Efeitos bem estruturados.

---

### 4.5 Ranking - Fetch de Event + Predictions

```
useEffect([code])
  ↓
fetch(`/data/${code}.event.json`)
  ↓
fetch(`/data/${code}.predicts.json`)
  ↓
setRounds(data)
  ↓
setRanking(computedRanking)
  ↓
Re-render de Ranking
```

**Status:** ✅ OK — Efeitos bem estruturados.

---

### 4.6 AuthContext - Inicialização de Sessão

```
useEffect([])
  ↓
supabase.auth.getSession()
  ↓
setSession(data?.session)
  ↓
setUser(data?.session?.user)
  ↓
setLoading(false)
  ↓
supabase.auth.onAuthStateChange() → listener
  ↓
Re-render de App (todas as rotas)
  ↓
return () → listener.subscription.unsubscribe()
```

**Status:** ✅ OK — Efeito bem estruturado com cleanup.

---

### 4.7 Ranking - Re-render Cascade Potencial

```
Ranking.jsx monta
  ↓
useEffect([code]) → fetch + setState
  ↓
Re-render 1: setRounds()
  ↓
Re-render 2: setRanking()
  ↓
Possível: Re-render 3 se houver outro efeito
```

**Status:** 🟡 Médio — Múltiplos setState em sequência. Considerar usar um único setState com objeto.

---

## 5. 🔗 COUPLING ANALYSIS

### 5.1 Acoplamento: Header ↔ localStorage

```
Header.jsx
  ├─ Lê: localStorage.getItem("canguess_user")
  ├─ Escreve: localStorage.removeItem("canguess_user") [logout]
  │
  └─ Problema: Não sincronizado com AuthContext
      └─ AuthContext.logout() → supabase.auth.signOut()
      └─ Header.logout() → localStorage.removeItem()
      └─ ❌ Dois sistemas paralelos
```

**Risco:** 🔴 Crítico — Se usuário faz logout via AuthContext, Header não sabe. Ou vice-versa.

---

### 5.2 Acoplamento: AdminGuard ↔ localStorage

```
AdminGuard.jsx
  ├─ Lê: localStorage.getItem("admin_auth")
  │
  └─ Problema: Proteção apenas no cliente
      └─ Usuário pode fazer localStorage.setItem("admin_auth", "true")
      └─ ❌ Segurança falsa
```

**Risco:** 🔴 Crítico — Proteção de rota ineficaz.

---

### 5.3 Acoplamento: Páginas ↔ URL Query Params

```
EventHome.jsx, Predictions.jsx, Ranking.jsx
  ├─ Leem: useSearchParams() ou location.search
  ├─ Fazem: fetch(`/data/${code}.event.json`)
  │
  └─ Problema: Não usam EventContext
      └─ ❌ Duplicação de lógica de carregamento
      └─ ❌ Sem sincronização com AppInitializer
```

**Risco:** 🟠 Alto — Cada página faz seu próprio fetch. Se EventContext carrega dados, páginas não sabem.

---

### 5.4 Acoplamento: AuthService ↔ Supabase (Paralelo)

```
AuthService.js
  ├─ Implementa: login(), logout(), getCurrentUser()
  │
  └─ Problema: AuthContext também implementa login()
      └─ ❌ Dois pipelines de autenticação
      └─ ❌ Inconsistência de estado
```

**Risco:** 🟠 Alto — Qual usar? Qual é a fonte de verdade?

---

### 5.5 Acoplamento: EventContext (Global) vs EventProvider (Local)

```
App.jsx
  └─ <EventProvider> (global)
      └─ AppRoutes
          └─ <Route path="/" element={<AppShell />}>
              └─ <EventProvider> (local) ← SOBRESCREVE!
```

**Risco:** 🔴 Crítico — Contexto global é inacessível em rotas públicas.

---

## 6. 🚨 DUPLICATION & INCONSISTENCY REPORT

### 6.1 Rotas Duplicadas

| Rota | Localização | Problema |
|------|------------|----------|
| `/register` | Linhas 41 e 51 | 🔴 Definida 2x, segunda sobrescreve primeira |

---

### 6.2 Componentes Duplicados

| Componente | Localização | Problema |
|-----------|------------|----------|
| `AdminGuard` | `components/AdminGuard.jsx` + `pages/AdminGuard.jsx` | 🟡 Mesmo código em 2 lugares |

---

### 6.3 Contextos Duplicados

| Contexto | Localização | Problema |
|---------|------------|----------|
| `EventContext` | Global (App.jsx) + Local (AppShell.jsx) | 🔴 Dois providers, um sobrescreve o outro |
| `AuthContext` | App.jsx | 🟡 Não consumido por Header/AdminGuard |
| `UserContext` | App.jsx | 🔴 Criado mas não consumido em nenhum lugar |

---

### 6.4 Lógica de Autenticação Duplicada

| Implementação | Localização | Problema |
|--------------|------------|----------|
| `AuthContext.login()` | `contexts/AuthContext.jsx` | ✅ Usado por Login.jsx |
| `AuthService.login()` | `services/authService.js` | ⚠️ Não usado em fluxo público |
| `AuthService.register()` | `services/authService.js` | ✅ Usado por Register.jsx |

---

### 6.5 Lógica de Carregamento de Evento Duplicada

| Implementação | Localização | Problema |
|--------------|------------|----------|
| `EventContext.loadEventByCode()` | `contexts/EventContext.jsx` | ⚠️ Carrega do Supabase |
| `EventHome.jsx` fetch | `pages/EventHome.jsx` | ⚠️ Carrega de `/data/events/Manifest.${code}.json` |
| `Predictions.jsx` fetch | `pages/Predictions.jsx` | ⚠️ Carrega de `/data/${code}.event.json` |
| `Ranking.jsx` fetch | `pages/Ranking.jsx` | ⚠️ Carrega de `/data/${code}.event.json` |

**Problema:** Múltiplas fontes de verdade para dados de evento.

---

### 6.6 Lógica de Guest User Duplicada

| Implementação | Localização | Problema |
|--------------|------------|----------|
| `createGuestUser()` | `services/userService.js` | ⚠️ Não usado |
| `validarUsuario()` em Predictions | `pages/Predictions.jsx` | ✅ Cria guest inline |

---

## 7. 🚨 CRITICAL ISSUES REPORT (PRIORITIZED)

### 🔴 CRÍTICO (Quebra Sistema)

#### Issue #1: Rota `/register` Duplicada

**Localização:** `AppRoutes.jsx` linhas 41 e 51

**Causa Raiz:** Definição acidental de rota em dois lugares.

**Impacto:** Usuários que acessam `/register` vão para versão sem layout (sem Header/BottomNav).

**Severidade:** 🔴 Crítico

**Solução:** Remover linha 51 (duplicata).

---

#### Issue #2: EventProvider Aninhado (Sobrescreve Contexto Global)

**Localização:** `AppShell.jsx` linha 71 + `App.jsx` linha 10

**Causa Raiz:** `AppShell` cria novo `EventProvider`, sobrescrevendo o global.

**Impacto:** 
- Rotas públicas usam contexto local (AppShell)
- Rotas admin usam contexto global (App.jsx)
- Estado não persiste entre navegação pública ↔ admin

**Severidade:** 🔴 Crítico

**Solução:** Remover `<EventProvider>` de `AppShell.jsx`, usar apenas o global.

---

#### Issue #3: AdminGuard com Proteção Apenas no Cliente

**Localização:** `components/AdminGuard.jsx` linha 4

**Causa Raiz:** Verificação de `localStorage.getItem("admin_auth")` no cliente.

**Impacto:** Usuário pode fazer `localStorage.setItem("admin_auth", "true")` e acessar `/admin`.

**Severidade:** 🔴 Crítico (Segurança)

**Solução:** Implementar proteção server-side (verificar token JWT/sessão Supabase).

---

#### Issue #4: Header Não Sincronizado com AuthContext

**Localização:** `components/Header.jsx` linhas 26-37, 44-48

**Causa Raiz:** Header lê `localStorage.getItem("canguess_user")` em vez de consumir `useAuth()`.

**Impacto:** 
- Logout via AuthContext não atualiza Header
- Logout via Header não atualiza AuthContext
- Dois sistemas de autenticação paralelos

**Severidade:** 🔴 Crítico

**Solução:** Header deve consumir `useAuth()` e sincronizar com AuthContext.

---

### 🟠 ALTO IMPACTO (Re-render / Performance)

#### Issue #5: Páginas Públicas Não Usam EventContext

**Localização:** `pages/EventHome.jsx`, `pages/Predictions.jsx`, `pages/Ranking.jsx`

**Causa Raiz:** Páginas fazem fetch local em vez de consumir `EventContext.currentEvent`.

**Impacto:**
- Duplicação de fetch
- Sem sincronização entre páginas
- Se EventContext carrega dados, páginas não sabem

**Severidade:** 🟠 Alto

**Solução:** Páginas devem consumir `useEvent()` e usar `currentEvent` do contexto.

---

#### Issue #6: UserContext Criado Mas Não Consumido

**Localização:** `contexts/UserContext.jsx` + `App.jsx` linha 9

**Causa Raiz:** Contexto implementado mas nenhuma página o consome.

**Impacto:** Código morto, confusão sobre qual usar (UserContext vs AuthContext).

**Severidade:** 🟠 Alto

**Solução:** Remover `UserContext` e consolidar em `AuthContext`, ou documentar seu propósito.

---

#### Issue #7: Múltiplos setState em Sequência (Ranking.jsx)

**Localização:** `pages/Ranking.jsx` linhas 13-64

**Causa Raiz:** Dois `setState` em sequência (`setRounds` + `setRanking`).

**Impacto:** Duas re-renders em vez de uma.

**Severidade:** 🟠 Alto (Performance)

**Solução:** Usar um único `setState` com objeto: `setData({ rounds, ranking })`.

---

#### Issue #8: window.CANGUESS_EVENT_CODE (Global Não Reativo)

**Localização:** `pages/EventHome.jsx` linha 22

**Causa Raiz:** Escrita em variável global não reativa.

**Impacto:** Nenhum consumidor identificado. Anti-pattern.

**Severidade:** 🟠 Alto

**Solução:** Remover ou documentar uso. Se necessário, usar contexto.

---

### 🟡 MÉDIO IMPACTO

#### Issue #9: Rotas Admin com Placeholders

**Localização:** `AppRoutes.jsx` linhas 65-67

**Causa Raiz:** Rotas definidas mas sem implementação real.

**Impacto:** Usuários podem navegar para páginas vazias.

**Severidade:** 🟡 Médio

**Solução:** Implementar componentes ou remover rotas.

---

#### Issue #10: Efeitos de Debug em Produção

**Localização:** `components/Header.jsx` linhas 15-21

**Causa Raiz:** `console.log` deixados no código.

**Impacto:** Poluição de console, possível vazamento de informações.

**Severidade:** 🟡 Médio

**Solução:** Remover ou envolver com `if (process.env.NODE_ENV === 'development')`.

---

#### Issue #11: AuthService Paralelo Não Integrado

**Localização:** `services/authService.js`

**Causa Raiz:** Implementação de autenticação paralela a `AuthContext`.

**Impacto:** Confusão sobre qual usar, possível inconsistência.

**Severidade:** 🟡 Médio

**Solução:** Consolidar em `AuthContext` ou documentar quando usar cada um.

---

### 🟢 MELHORIAS

#### Issue #12: Usar React Router Links em vez de Anchor Tags

**Localização:** `pages/admin/AdminLayout.jsx` linhas 16-21

**Causa Raiz:** Uso de `<a href="/admin/...">` em vez de `<Link to="/admin/...">`.

**Impacto:** Full page reload em vez de navegação SPA.

**Severidade:** 🟢 Melhoria

**Solução:** Substituir `<a>` por `<Link>`.

---

#### Issue #13: Documentar Propósito de UserContext

**Localização:** `contexts/UserContext.jsx`

**Causa Raiz:** Contexto existe mas propósito não é claro.

**Impacto:** Confusão para novos desenvolvedores.

**Severidade:** 🟢 Melhoria

**Solução:** Adicionar comentário explicando quando usar `UserContext` vs `AuthContext`.

---

## 8. 💡 SUGESTÕES DE CORREÇÃO (ORDERED)

### Passo 1: Remover Rota Duplicada `/register`

**Arquivo:** `frontend/src/routes/AppRoutes.jsx`

**Ação:** Remover linha 51

```jsx
// ANTES
<Route path="/register" element={<Register />} />  // linha 41
...
<Route path="/register" element={<Register />} />  // linha 51 ← REMOVER

// DEPOIS
<Route path="/register" element={<Register />} />  // linha 41 apenas
```

**Impacto Esperado:** ✅ Rota `/register` agora consistente com layout.

---

### Passo 2: Remover EventProvider Aninhado de AppShell

**Arquivo:** `frontend/src/layout/AppShell.jsx`

**Ação:** Remover `<EventProvider>` wrapper

```jsx
// ANTES
export default function AppShell() {
  return (
    <EventProvider>
      <AppInitializer />
      <AppLayout />
    </EventProvider>
  );
}

// DEPOIS
export default function AppShell() {
  return (
    <>
      <AppInitializer />
      <AppLayout />
    </>
  );
}
```

**Impacto Esperado:** ✅ Contexto global agora acessível em rotas públicas.

---

### Passo 3: Sincronizar Header com AuthContext

**Arquivo:** `frontend/src/components/Header.jsx`

**Ação:** Consumir `useAuth()` em vez de `localStorage`

```jsx
// ANTES
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const stored = localStorage.getItem("canguess_user");
    if (!stored) return;
    try {
      setUser(JSON.parse(stored));
    } catch (e) {
      localStorage.removeItem("canguess_user");
    }
  }, []);
  
  function logout() {
    localStorage.removeItem("canguess_user");
    setUser(null);
    navigate("/login");
  }

// DEPOIS
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  async function handleLogout() {
    await logout();
    navigate("/login");
  }
```

**Impacto Esperado:** ✅ Header sincronizado com AuthContext.

---

### Passo 4: Páginas Públicas Consomem EventContext

**Arquivo:** `frontend/src/pages/EventHome.jsx`, `Predictions.jsx`, `Ranking.jsx`

**Ação:** Consumir `useEvent()` em vez de fazer fetch local

```jsx
// ANTES (EventHome.jsx)
export default function EventHome() {
  const [params] = useSearchParams();
  const code = params.get("code");
  const [manifest, setManifest] = useState(null);
  
  useEffect(() => {
    if (!code) return;
    fetch(`/data/events/Manifest.${code}.json`)
      .then(r => r.json())
      .then(data => setManifest(data));
  }, [code]);

// DEPOIS (EventHome.jsx)
import { useEvent } from "../contexts/EventContext";

export default function EventHome() {
  const [params] = useSearchParams();
  const code = params.get("code");
  const { currentEvent, loadEventByCode, loading } = useEvent();
  
  useEffect(() => {
    if (code) {
      loadEventByCode(code);
    }
  }, [code, loadEventByCode]);
  
  if (loading) return <div>Carregando...</div>;
  if (!currentEvent) return <div>Evento não encontrado</div>;
  
  // Usar currentEvent em vez de manifest
```

**Impacto Esperado:** ✅ Páginas sincronizadas com EventContext.

---

### Passo 5: Remover UserContext (Código Morto)

**Arquivo:** `frontend/src/contexts/UserContext.jsx`, `App.jsx`

**Ação:** Remover provider e contexto

```jsx
// ANTES (App.jsx)
<AuthProvider>
  <UserProvider>
    <EventProvider>
      <AppRoutes />
    </EventProvider>
  </UserProvider>
</AuthProvider>

// DEPOIS (App.jsx)
<AuthProvider>
  <EventProvider>
    <AppRoutes />
  </EventProvider>
</AuthProvider>
```

**Impacto Esperado:** ✅ Código mais limpo, sem duplicação.

---

### Passo 6: Implementar Proteção Server-Side para Admin

**Arquivo:** `backend/main.py` (ou criar middleware)

**Ação:** Verificar token JWT/sessão antes de servir rotas admin

```python
# Exemplo (FastAPI)
from fastapi import Depends, HTTPException
from supabase import create_client

async def verify_admin(token: str = Depends(oauth2_scheme)):
    user = await supabase.auth.get_user(token)
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Forbidden")
    return user
```

**Impacto Esperado:** ✅ Proteção server-side de rotas admin.

---

### Passo 7: Remover window.CANGUESS_EVENT_CODE

**Arquivo:** `frontend/src/pages/EventHome.jsx`

**Ação:** Remover linha 22

```jsx
// ANTES
useEffect(() => {
  if (code) {
    window.CANGUESS_EVENT_CODE = code;  // ← REMOVER
  }
}, [code]);

// DEPOIS
// Remover efeito inteiro ou deixar vazio
```

**Impacto Esperado:** ✅ Sem estado global não reativo.

---

### Passo 8: Consolidar AuthService em AuthContext

**Arquivo:** `frontend/src/services/authService.js`, `contexts/AuthContext.jsx`

**Ação:** Mover lógica de `AuthService` para `AuthContext`

**Impacto Esperado:** ✅ Única fonte de verdade para autenticação.

---

## 9. 🎨 INFOGRÁFICO DO SISTEMA (VISUAL FINAL)

### 9.1 ARCHITECTURE FLOW VISUAL

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      main.jsx                                   │
│              (React + BrowserRouter)                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        App.jsx                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ AuthProvider (user, session, workspace)                 │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ UserProvider (MORTO - não consumido)              │ │  │
│  │  │  ┌──────────────────────────────────────────────┐ │ │  │
│  │  │  │ EventProvider (GLOBAL - sobrescrito!)        │ │ │  │
│  │  │  │  ┌────────────────────────────────────────┐ │ │ │  │
│  │  │  │  │ AppRoutes                              │ │ │ │  │
│  │  │  │  └────────────────────────────────────────┘ │ │ │  │
│  │  │  └──────────────────────────────────────────────┘ │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
        ┌─────────────────────┐  ┌──────────────────┐
        │   AppShell          │  │  Admin Routes    │
        │ (Público)           │  │  (Protegido)     │
        │                     │  │                  │
        │ ┌─────────────────┐ │  │ ┌──────────────┐ │
        │ │EventProvider    │ │  │ │AdminGuard    │ │
        │ │(LOCAL - NOVO!)  │ │  │ │(localStorage)│ │
        │ │                 │ │  │ │              │ │
        │ │┌─────────────┐  │ │  │ │┌────────────┐│ │
        │ ││AppInitializ │  │ │  │ ││AdminLayout ││ │
        │ ││er           │  │ │  │ │└────────────┘│ │
        │ │└─────────────┘  │ │  │ └──────────────┘ │
        │ │                 │ │  │                  │
        │ │┌─────────────┐  │ │  │ ┌──────────────┐ │
        │ ││AppLayout    │  │ │  │ │Cadastros     │ │
        │ ││(Header +    │  │ │  │ │EventDashboard│ │
        │ ││ Outlet +    │  │ │  │ │...           │ │
        │ ││ BottomNav)  │  │ │  │ └──────────────┘ │
        │ │└─────────────┘  │ │  │                  │
        │ └─────────────────┘ │  │                  │
        └─────────────────────┘  └──────────────────┘
                    ↓                   ↓
        ┌─────────────────────┐  ┌──────────────────┐
        │  Rotas Públicas     │  │  Rotas Admin     │
        │                     │  │                  │
        │ / (Home)            │  │ /admin           │
        │ /login (Login)      │  │ /admin/cadastros │
        │ /register (Reg)     │  │ /admin/palpites  │
        │ /palpites (Pred)    │  │ ...              │
        │ /ranking (Rank)     │  │                  │
        │ /events (EventHome) │  │                  │
        └─────────────────────┘  └──────────────────┘
```

---

### 9.2 STATE PROPAGATION VISUAL

```
┌──────────────────────────────────────────────────────────────────┐
│                    ESTADO GLOBAL (App.jsx)                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ AuthContext                                             │   │
│  │ ├─ user (Supabase user)                               │   │
│  │ ├─ session (Supabase session)                         │   │
│  │ ├─ workspace (string)                                 │   │
│  │ └─ login(), logout(), setWorkspace()                 │   │
│  │                                                        │   │
│  │ Consumidores:                                          │   │
│  │ ├─ Login.jsx ✅                                       │   │
│  │ ├─ Header.jsx ❌ (usa localStorage)                   │   │
│  │ └─ AdminGuard.jsx ❌ (usa localStorage)               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ EventContext (GLOBAL - SOBRESCRITO)                    │   │
│  │ ├─ currentEvent (null)                                 │   │
│  │ ├─ loading (false)                                     │   │
│  │ └─ loadEventByCode(), clearEvent()                    │   │
│  │                                                        │   │
│  │ Consumidores: NENHUM ❌                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ UserContext (MORTO)                                    │   │
│  │ ├─ user (null)                                         │   │
│  │ ├─ loading (false)                                     │   │
│  │ └─ login(), logout(), isGuest(), isLogged()          │   │
│  │                                                        │   │
│  │ Consumidores: NENHUM ❌                                │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                  ESTADO LOCAL (AppShell.jsx)                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ EventContext (LOCAL - NOVO PROVIDER)                   │   │
│  │ ├─ currentEvent (carregado via Supabase)              │   │
│  │ ├─ loading (true/false)                               │   │
│  │ └─ loadEventByCode(), clearEvent()                    │   │
│  │                                                        │   │
│  │ Consumidores:                                          │   │
│  │ ├─ AppInitializer.jsx ✅ (lê ?code, chama load)      │   │
│  │ └─ Nenhum outro ❌                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    ESTADO IMPLÍCITO (URL)                        │
│                                                                  │
│  ?code=CANGUESS01                                                │
│  ├─ AppInitializer → loadEventByCode(code)                      │
│  ├─ EventHome → fetch /data/events/Manifest.${code}.json        │
│  ├─ Predictions → fetch /data/${code}.event.json                │
│  ├─ Ranking → fetch /data/${code}.event.json                    │
│  └─ BottomNav → cria links com ?code=...                        │
│                                                                  │
│  Problema: Múltiplas fontes de verdade ❌                        │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    ESTADO PARALELO (localStorage)                │
│                                                                  │
│  ├─ "canguess_user" (Header)                                    │
│  ├─ "last_event_code" (EventContext)                            │
│  ├─ "admin_auth" (AdminGuard)                                   │
│  │                                                              │
│  └─ Problema: Não sincronizado com contextos ❌                 │
└──────────────────────────────────────────────────────────────────┘
```

---

### 9.3 ROUTING MAP VISUAL

```
┌────────────────────────────────────────────────────────────────┐
│                      ROUTING TREE                              │
└────────────────────────────────────────────────────────────────┘

AppRoutes
│
├─ AppShell (Layout)
│  ├─ / → Home ✅
│  ├─ /login → Login ✅
│  ├─ /register → Register ✅ (1ª definição)
│  ├─ /palpites → Predictions ✅
│  ├─ /ranking → Ranking ✅
│  └─ /events → EventHome ✅
│
├─ /admin-login → AdminLogin ✅
│
├─ /register → Register ✅ (2ª definição - DUPLICATA 🔴)
│
└─ /admin/* (AdminGuard)
   └─ AdminLayout
      ├─ /admin → Admin ✅
      ├─ /admin/resultados → Placeholder ⚠️
      ├─ /admin/usuarios → Placeholder ⚠️
      ├─ /admin/consultas → Placeholder ⚠️
      ├─ /admin/palpites → MapaPalpites ✅
      ├─ /admin/cadastros → CadastrosHome ✅
      ├─ /admin/cadastros/times → CadastrosTimes ✅
      ├─ /admin/cadastros/eventos → CadastrosEventos ✅
      ├─ /admin/cadastros/fases → CadastrosFases ✅
      ├─ /admin/cadastros/rodadas → CadastrosRodadas ✅
      ├─ /admin/cadastros/eventos/:eventId/estrutura → EventDashboard ✅
      ├─ /admin/cadastros/eventos/:eventId/rounds → CadastroRounds ✅
      └─ /admin/cadastros/eventos/:eventId/parts → CadastroParts ✅

Legenda:
✅ Implementado e funcional
⚠️ Placeholder (sem implementação)
🔴 Duplicado/Conflitante
```

---

### 9.4 COMPONENT DEPENDENCY MAP

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPENDENCY GRAPH                             │
└─────────────────────────────────────────────────────────────────┘

App.jsx
├─ AuthProvider
│  └─ AuthContext (user, session, workspace)
│     └─ Login.jsx ✅
│
├─ UserProvider (MORTO)
│  └─ UserContext
│     └─ (nenhum consumidor)
│
├─ EventProvider (GLOBAL - SOBRESCRITO)
│  └─ (inacessível em rotas públicas)
│
└─ AppRoutes
   ├─ AppShell
   │  ├─ EventProvider (LOCAL - NOVO!)
   │  │  └─ AppInitializer
   │  │     └─ useEvent()
   │  │        └─ loadEventByCode()
   │  │           └─ Supabase query
   │  │
   │  ├─ Header
   │  │  ├─ localStorage (canguess_user) ❌
   │  │  ├─ useNavigate()
   │  │  └─ (não consome AuthContext)
   │  │
   │  ├─ Outlet
   │  │  ├─ Home
   │  │  │  └─ (renderiza Header novamente!) ⚠️
   │  │  │
   │  │  ├─ Login
   │  │  │  └─ useAuth() ✅
   │  │  │
   │  │  ├─ Register
   │  │  │  └─ AuthService.register() ⚠️
   │  │  │
   │  │  ├─ EventHome
   │  │  │  ├─ useSearchParams()
   │  │  │  └─ fetch /data/events/Manifest.${code}.json
   │  │  │
   │  │  ├─ Predictions
   │  │  │  ├─ useLocation()
   │  │  │  ├─ fetch /data/${code}.event.json
   │  │  │  └─ Supabase.from("users").insert()
   │  │  │
   │  │  └─ Ranking
   │  │     ├─ useLocation()
   │  │     └─ fetch /data/${code}.event.json
   │  │
   │  └─ BottomNav
   │     ├─ useLocation()
   │     └─ cria links com ?code=...
   │
   ├─ AdminLogin
   │  └─ localStorage.setItem("admin_auth", "true")
   │
   └─ AdminGuard
      ├─ localStorage.getItem("admin_auth") ❌
      └─ AdminLayout
         ├─ Sidebar (usa <a> em vez de <Link>) ⚠️
         └─ Outlet
            ├─ CadastrosHome
            ├─ CadastrosTimes
            ├─ CadastrosEventos
            ├─ CadastrosFases
            ├─ CadastrosRodadas
            ├─ EventDashboard
            ├─ CadastroRounds
            ├─ CadastroParts
            └─ MapaPalpites
```

---

### 9.5 RISK ZONES (VISUAL MARKING)

```
┌─────────────────────────────────────────────────────────────────┐
│                    RISK HEAT MAP                                │
└─────────────────────────────────────────────────────────────────┘

🔴 CRÍTICO (Quebra Sistema / Segurança)
├─ Rota /register duplicada
│  └─ Localização: AppRoutes.jsx linhas 41 + 51
│  └─ Impacto: Layout inconsistente
│
├─ EventProvider aninhado (sobrescreve global)
│  └─ Localização: AppShell.jsx + App.jsx
│  └─ Impacto: Estado não persiste entre rotas
│
├─ AdminGuard com proteção apenas no cliente
│  └─ Localização: components/AdminGuard.jsx
│  └─ Impacto: Segurança falsa, usuário pode forjar admin
│
└─ Header não sincronizado com AuthContext
   └─ Localização: components/Header.jsx
   └─ Impacto: Dois sistemas de autenticação paralelos

🟠 ALTO (Re-render / Performance / Lógica)
├─ Páginas públicas não usam EventContext
│  └─ Localização: EventHome, Predictions, Ranking
│  └─ Impacto: Duplicação de fetch, sem sincronização
│
├─ UserContext criado mas não consumido
│  └─ Localização: contexts/UserContext.jsx
│  └─ Impacto: Código morto, confusão
│
├─ Múltiplos setState em sequência
│  └─ Localização: Ranking.jsx
│  └─ Impacto: Re-renders desnecessários
│
└─ window.CANGUESS_EVENT_CODE (global não reativo)
   └─ Localização: EventHome.jsx
   └─ Impacto: Anti-pattern, sem consumidor

🟡 MÉDIO (UX / Manutenibilidade)
├─ Rotas admin com placeholders
│  └─ Localização: AppRoutes.jsx linhas 65-67
│  └─ Impacto: Páginas vazias
│
├─ Efeitos de debug em produção
│  └─ Localização: Header.jsx
│  └─ Impacto: Poluição de console
│
└─ AuthService paralelo não integrado
   └─ Localização: services/authService.js
   └─ Impacto: Confusão sobre qual usar

🟢 BAIXO (Melhoria)
├─ Usar React Router Links em vez de <a>
│  └─ Localização: AdminLayout.jsx
│  └─ Impacto: Full page reload
│
└─ Documentar propósito de UserContext
   └─ Localização: contexts/UserContext.jsx
   └─ Impacto: Confusão para novos devs
```

---

### 9.6 EXECUTION FLOW DIAGRAM

```
┌──────────────────────────────────────────────────────────────────┐
│                   REAL RUNTIME EXECUTION                         │
└──────────────────────────────────────────────────────────────────┘

CENÁRIO: Usuário acessa /events?code=CANGUESS01

┌─────────────────────────────────────────────────────────────────┐
│ 1. BROWSER NAVIGATION                                           │
│                                                                 │
│ User clicks "Buscar eventos" button                            │
│ ↓                                                               │
│ Header.handleSearch()                                          │
│ ↓                                                               │
│ navigate(`/events?code=${code}`)                              │
│ ↓                                                               │
│ React Router matches /events → EventHome.jsx                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. COMPONENT MOUNT                                              │
│                                                                 │
│ EventHome.jsx monta                                            │
│ ↓                                                               │
│ const [params] = useSearchParams()                            │
│ ↓                                                               │
│ const code = params.get("code") → "CANGUESS01"               │
│ ↓                                                               │
│ const [manifest, setManifest] = useState(null)               │
│ ↓                                                               │
│ const [loading, setLoading] = useState(true)                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. EFFECT 1: GLOBAL STATE                                       │
│                                                                 │
│ useEffect([code]) {                                            │
│   window.CANGUESS_EVENT_CODE = "CANGUESS01"  ← Anti-pattern  │
│ }                                                               │
│                                                                 │
│ Status: Escrita em variável global não reativa                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. EFFECT 2: FETCH MANIFEST                                     │
│                                                                 │
│ useEffect([code]) {                                            │
│   setLoading(true)                                             │
│   ↓                                                             │
│   fetch(`/data/events/Manifest.CANGUESS01.json`)             │
│   ↓                                                             │
│   Response → JSON                                              │
│   ↓                                                             │
│   setManifest(data)  ← Re-render 1                            │
│   ↓                                                             │
│   Promise.all([                                                │
│     fetch(data.intro),                                         │
│     fetch(data.rules),                                         │
│     fetch(data.general)                                        │
│   ])                                                            │
│   ↓                                                             │
│   setContent({ intro, rules, general })  ← Re-render 2       │
│   ↓                                                             │
│   setLoading(false)  ← Re-render 3                            │
│ }                                                               │
│                                                                 │
│ Status: 3 re-renders em sequência                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. RENDER                                                       │
│                                                                 │
│ if (loading) → <div>Carregando evento...</div>               │
│ ↓                                                               │
│ if (!manifest) → <div>Evento não encontrado</div>            │
│ ↓                                                               │
│ Renderiza:                                                      │
│ ├─ Banner (img)                                                │
│ ├─ Header (h1, p)                                              │
│ ├─ Intro card (pre)                                            │
│ ├─ Rules card (pre)                                            │
│ └─ General card (pre)                                          │
└─────────────────────────────────────────────────────────────────┘

PROBLEMA: EventContext não é consumido!
├─ AppInitializer também faz loadEventByCode()
├─ Mas EventHome faz seu próprio fetch
├─ Resultado: Duplicação de lógica, sem sincronização
└─ Se EventContext carrega dados, EventHome não sabe
```

---

## RESUMO EXECUTIVO

### Saúde do Sistema: 🔴 CRÍTICA

| Métrica | Status | Observação |
|---------|--------|-----------|
| Rotas Duplicadas | 🔴 1 | `/register` definida 2x |
| Contextos Aninhados | 🔴 1 | `EventProvider` sobrescreve global |
| Proteção de Segurança | 🔴 Fraca | Admin apenas localStorage |
| Sincronização de Estado | 🔴 Fraca | Header não sincronizado com AuthContext |
| Consumo de Contexto | 🟠 Baixo | Páginas públicas não usam EventContext |
| Código Morto | 🟠 Médio | UserContext não consumido |
| Performance | 🟠 Média | Múltiplos setState em sequência |
| Documentação | 🟡 Fraca | Propósitos de contextos não claros |

### Ações Prioritárias

1. **IMEDIATO:** Remover rota `/register` duplicada
2. **IMEDIATO:** Remover `EventProvider` aninhado de `AppShell`
3. **URGENTE:** Sincronizar Header com AuthContext
4. **URGENTE:** Implementar proteção server-side para admin
5. **IMPORTANTE:** Páginas públicas consomem EventContext
6. **IMPORTANTE:** Remover UserContext (código morto)

### Impacto Esperado Após Correções

- ✅ Roteamento consistente
- ✅ Estado global sincronizado
- ✅ Segurança melhorada
- ✅ Performance otimizada
- ✅ Código mais limpo e manutenível
- ✅ Menos confusão para novos desenvolvedores

---

**Documento Gerado:** Jun 23, 2026  
**Versão:** 1.0  
**Status:** Análise Completa
