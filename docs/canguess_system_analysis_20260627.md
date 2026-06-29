# 🧠 ANÁLISE E MAPEAMENTO DA ARQUITETURA DO SISTEMA — CanGuess

**Data da Análise:** 28 de Junho de 2026
**Agente Responsável:** Agente DDS
**Sistema:** React + Router DOM + Context API + Supabase
**Objetivo:** Realizar uma análise arquitetural completa do projeto CanGuess, atualizando o documento de referência com base no estado atual do código no repositório `main`, identificando fluxos, componentes, rotas, contextos, integrações e problemas.

---

## 1. CURRENT SYSTEM STATE

Esta seção apresenta uma fotografia do sistema CanGuess na data da análise, destacando os principais elementos e suas interconexões.

### 1.1 Visão Geral

O projeto CanGuess é uma aplicação web desenvolvida com React, utilizando `react-router-dom` para roteamento, Context API para gerenciamento de estado e Supabase como backend-as-a-service (BaaS) para banco de dados e autenticação. O sistema é composto por um frontend em React e um conjunto de *engines* em Python para geração de assets e processamento de dados. O objetivo principal é gerenciar eventos de palpites, desde o cadastro e configuração até a exibição de rankings.

### 1.2 Arquitetura Geral

A arquitetura do CanGuess pode ser dividida em três camadas principais:

*   **Frontend (React):** Responsável pela interface do usuário, lógica de apresentação, roteamento e consumo de dados. Utiliza componentes, contextos e serviços para organizar o código.
*   **Backend (Supabase):** Atua como o principal serviço de persistência de dados e autenticação. As interações com o banco de dados são realizadas diretamente do frontend via SDK do Supabase, e há funções RPC (Remote Procedure Call) para lógicas mais complexas.
*   **Engines (Python):** Scripts Python que atuam como processadores de dados e geradores de assets. São responsáveis por criar manifestos de eventos, banners, arquivos Markdown e processar palpites para gerar rankings. Esses scripts são executados fora do ambiente de runtime do frontend, provavelmente em um pipeline de CI/CD ou manualmente.

---

## 2. 🔁 FLUXO DE EXECUÇÃO REAL DO SISTEMA

Esta seção detalha o fluxo de execução do sistema, focando no que realmente acontece no código.

### 2.1 Inicialização da Aplicação

O processo de inicialização segue a estrutura padrão de uma aplicação React com `react-router-dom`:

```
main.jsx
  ↓
App.jsx
  ↓
AuthProvider (inicializa sessão Supabase)
  ↓
UserProvider (carrega dados do usuário autenticado, se houver)
  ↓
EventProvider (contexto global para dados do evento)
  ↓
AppRoutes (define as rotas da aplicação)
```

**Observação:** Há uma inconsistência onde `AppShell` (utilizado para rotas públicas) também encapsula um `EventProvider` próprio, sobrescrevendo o `EventProvider` global para essas rotas. Isso pode levar a perda de estado e re-renders desnecessários, conforme detalhado na seção de problemas.

### 2.2 Fluxo de Autenticação

O sistema utiliza o Supabase para autenticação de usuários. Há dois fluxos principais:

*   **Login de Usuário:**
    ```
    Login.jsx
      ↓
    useAuth() (do AuthContext)
      ↓
    AuthContext.login(email, password) → supabase.auth.signInWithPassword()
      ↓
    Redirecionamento para Home (ou rota protegida)
    ```
*   **Criação de Usuário (Guest):**
    O sistema permite que usuários 
possam fazer palpites como 
convidados (guest users) sem a necessidade de um registro completo. Este fluxo é iniciado na página `Predictions.jsx`:

    ```
    Predictions.jsx
      ↓
    validarUsuario() (chamado ao tentar enviar palpite)
      ↓
    findUserByPhone() (busca usuário existente no Supabase)
      ↓
    SE NÃO EXISTE: createGuestUser() (insere novo usuário na tabela `users` com `is_guest: true`)
      ↓
    setUser(currentUser) (atualiza estado local)
    ```

    **Problema Identificado:** A criação de `guest_users` é feita diretamente na tabela `users` com um flag `is_guest`. Há também uma tabela `guest_users` mencionada em `userService.js`, mas que não parece ser utilizada no fluxo de criação de palpites. Isso pode gerar inconsistência e duplicação de dados de usuários convidados.

### 2.3 Fluxo de Eventos

O ciclo de vida de um evento no CanGuess envolve as seguintes etapas:

1.  **Cadastro de Evento:** Realizado via `EventDashboard.jsx` no painel administrativo. O evento é salvo na tabela `events` do Supabase.
2.  **Definição de Fases:** As fases são criadas e associadas a um evento, também via `EventDashboard.jsx`, e salvas na tabela `event_phases`.
3.  **Criação de Rounds:** Os rounds são gerados para cada fase, com base no número de rounds definidos na fase. Isso pode ser feito manualmente ou via RPCs do Supabase (`add_event_rounds`). Salvos na tabela `event_rounds`.
4.  **Seleção de Parts:** Os participantes (`event_parts`) são associados aos rounds, gerenciados via `CadastrosParts.jsx`.
5.  **Geração de Engines:** Scripts Python (`create_events_assets.py`, `engine_canguess_2_0.py`) são executados para gerar os assets públicos do evento (banners, arquivos Markdown) e os arquivos JSON (`event.json`, `predicts.json`) que contêm os dados do evento e os rankings calculados.
6.  **Exibição no EventHome:** A página `EventHome.jsx` lê o `Manifest.{code}.json` e os arquivos Markdown correspondentes para exibir as informações do evento.
7.  **Recebimento de Palpites:** A página `Predictions.jsx` permite que usuários (registrados ou convidados) enviem seus palpites, que são salvos na tabela `predicts` do Supabase.
8.  **Ranking:** A página `Ranking.jsx` lê `event.json` e `predicts.json` para exibir a classificação dos participantes.

### 2.4 Pipeline Administrativo Atual

O pipeline administrativo é centralizado no `EventDashboard.jsx`, que consolidou funcionalidades que antes poderiam estar espalhadas em outras páginas de cadastro. A análise detalhada revela:

*   **Cadastro de Eventos:** O `EventDashboard.jsx` permite o cadastro e edição de eventos, salvando na tabela `events`. As funções RPC `add_event_rounds`, `create_default_phases`, `add_event_phases` são utilizadas para gerenciar fases e rounds no Supabase.
*   **Fases:** As fases são criadas e associadas ao evento. A criação de rounds pode ser automatizada via `syncRounds` que chama RPCs.
*   **Rounds:** A quantidade de rounds é gerenciada por fase. A edição e salvamento de rounds ocorrem diretamente no `EventDashboard.jsx`.
*   **Parts:** A seleção de participantes é feita em `CadastrosParts.jsx`, que parece estar integrada ao fluxo.
*   **Quebras Silenciosas:** Não foram identificadas quebras silenciosas evidentes durante a análise do código, mas a complexidade da interação entre o frontend e as RPCs do Supabase pode ocultar problemas de persistência ou atualização de estado que só seriam visíveis em tempo de execução.

---

## 3. 🗺️ MAPA DE COMPONENTES

Esta seção descreve os principais componentes do frontend e suas responsabilidades.

### 3.1 Componentes Reutilizáveis

*   `Header.jsx`: Cabeçalho da aplicação, com navegação e busca.
*   `BottomNav.jsx`: Barra de navegação inferior, com links para Home, Palpites, Ranking e Admin.
*   `AdminGuard.jsx`: Componente de proteção de rotas administrativas.

### 3.2 Páginas (Views)

*   `Home.jsx`: Página inicial.
*   `Login.jsx`: Página de login de usuários.
*   `Register.jsx`: Página de registro de usuários.
*   `EventHome.jsx`: Exibe informações detalhadas de um evento.
*   `Predictions.jsx`: Página para envio de palpites.
*   `Ranking.jsx`: Exibe o ranking de um evento.
*   `AdminLogin.jsx`: Página de login para administradores.
*   `Admin.jsx`: Dashboard administrativo.
*   `EventDashboard.jsx`: Gerenciamento de eventos, fases e rounds.
*   `CadastrosHome.jsx`: Página inicial para cadastros administrativos.
*   `CadastrosTimes.jsx`: Cadastro de times.
*   `CadastrosEventos.jsx`: Cadastro de eventos (parece ser uma página legada, substituída por `EventDashboard`).
*   `CadastrosFases.jsx`: Cadastro de fases (parece ser uma página legada, substituída por `EventDashboard`).
*   `CadastrosRodadas.jsx`: Cadastro de rodadas (parece ser uma página legada, substituída por `EventDashboard`).
*   `CadastrosRounds.jsx`: Cadastro de rounds (parece ser uma página legada, substituída por `EventDashboard`).
*   `CadastrosParts.jsx`: Cadastro de participantes.
*   `MapaPalpites.jsx`: Visualização de palpites.

---

## 4. 🧭 MAPA DE ROTAS

| Rota | Componente | Proteção | Status | Observações |
|---|---|---|---|---|
| `/` | `Home` | Nenhuma | ATIVO | Página inicial. |
| `/login` | `Login` | Nenhuma | ATIVO | Login de usuários. |
| `/register` | `Register` | Nenhuma | ATIVO / DUPLICADO | Rota duplicada em `AppRoutes.jsx`, uma dentro e outra fora de `AppShell`. A externa não tem layout completo. |
| `/palpites` | `Predictions` | Nenhuma | ATIVO | Envio de palpites. |
| `/ranking` | `Ranking` | Nenhuma | ATIVO | Exibição de ranking. |
| `/events` | `EventHome` | Nenhuma | ATIVO | Exibição de evento. |
| `/admin-login` | `AdminLogin` | Nenhuma | ATIVO | Login administrativo. |
| `/admin/*` | `AdminLayout` | `AdminGuard` | ATIVO | Layout para rotas administrativas. |
| `/admin` | `Admin` | `AdminGuard` | ATIVO | Dashboard administrativo. |
| `/admin/resultados` | `div` (Placeholder) | `AdminGuard` | ÓRFÃO | Placeholder, sem implementação real. |
| `/admin/usuarios` | `div` (Placeholder) | `AdminGuard` | ÓRFÃO | Placeholder, sem implementação real. |
| `/admin/consultas` | `div` (Placeholder) | `AdminGuard` | ÓRFÃO | Placeholder, sem implementação real. |
| `/admin/palpites` | `MapaPalpites` | `AdminGuard` | ATIVO | Visualização de palpites. |
| `/admin/cadastros` | `CadastrosHome` | `AdminGuard` | ATIVO | Página inicial de cadastros. |
| `/admin/cadastros/times` | `CadastrosTimes` | `AdminGuard` | ATIVO | Cadastro de times. |
| `/admin/cadastros/eventos` | `CadastrosEventos` | `AdminGuard` | LEGADO | Provavelmente substituída por `EventDashboard`. |
| `/admin/cadastros/fases` | `CadastrosFases` | `AdminGuard` | LEGADO | Provavelmente substituída por `EventDashboard`. |
| `/admin/cadastros/rodadas` | `CadastrosRodadas` | `AdminGuard` | LEGADO | Provavelmente substituída por `EventDashboard`. |
| `/admin/cadastros/eventos/:eventId/estrutura` | `EventDashboard` | `AdminGuard` | ATIVO | Gerenciamento principal de eventos. |
| `/admin/cadastros/eventos/:eventId/rounds` | `CadastroRounds` | `AdminGuard` | ATIVO | Gerenciamento de rounds (integrado ao `EventDashboard`). |
| `/admin/cadastros/eventos/:eventId/parts` | `CadastroParts` | `AdminGuard` | ATIVO | Gerenciamento de participantes. |

**Páginas Órfãs e Legadas Encontradas:**

*   `pages/EventPage.jsx.leg`
*   `pages/Ranking.jsx.bkp`
*   `pages/Ranking.jsxxxx`
*   `pages/admin/CadastrosRodadas.jsx.bak`

Esses arquivos são resquícios de versões anteriores e não devem ser considerados parte do fluxo principal. As rotas `/admin/resultados`, `/admin/usuarios`, `/admin/consultas` são placeholders sem funcionalidade.

---

## 5. ⚛️ CONTEXTOS E ESTADOS GLOBAIS

O sistema utiliza a Context API do React para gerenciar estados globais, mas há inconsistências e duplicações.

### 5.1 AuthContext

*   **Uso:** Gerencia o estado de autenticação do usuário (logado, sessão Supabase).
*   **Problemas:** `Header.jsx` e `AdminGuard.jsx` não consomem `AuthContext`, utilizando `localStorage` diretamente para verificar autenticação. Isso cria dois sistemas de autenticação paralelos e inconsistentes.

### 5.2 EventContext

*   **Uso:** Deveria gerenciar o evento atualmente selecionado.
*   **Problemas:** Existem dois `EventProvider`s: um global em `App.jsx` e outro local em `AppShell.jsx`. O `EventProvider` local sobrescreve o global para rotas públicas, causando perda de estado entre navegação pública e administrativa. Além disso, páginas como `EventHome`, `Predictions` e `Ranking` não utilizam o contexto, lendo o código do evento diretamente da URL e fazendo fetches locais.

### 5.3 UserContext

*   **Uso:** Deveria gerenciar informações do usuário.
*   **Problemas:** `UserContext` existe, mas não é consumido por nenhum componente identificado, tornando-o código morto.

### 5.4 localStorage e window globals

*   **Uso:** `localStorage` é usado para `canguess_user` (lido pelo `Header`), `last_event_code` (escrito pelo `EventContext`) e `admin_auth` (lido pelo `AdminGuard`). `window.CANGUESS_EVENT_CODE` é um estado global não reativo definido em `EventHome.jsx`.
*   **Problemas:** O uso de `localStorage` e `window globals` para gerenciar estados importantes leva a inconsistências, falta de reatividade e dificuldade de rastreamento, especialmente quando há contextos dedicados para essas informações.

---

## 6. 🔒 SEGURANÇA

A segurança do sistema apresenta pontos críticos que precisam de atenção.

### 6.1 AdminGuard

*   **Mecanismo:** A proteção de rotas administrativas é baseada em `localStorage.getItem("admin_auth") === "true"`.
*   **Risco:** 🔴 **Crítico** - Esta é uma proteção apenas no lado do cliente. Um usuário mal-intencionado pode facilmente manipular o `localStorage` no navegador para obter acesso às rotas administrativas, sem qualquer validação no servidor. A senha do administrador (`ADMIN_PASSWORD = "991521"`) também está hardcoded no frontend (`AdminLogin.jsx`), o que é uma falha de segurança grave.

### 6.2 Autenticação e Permissões

*   A autenticação de usuários comuns via Supabase é robusta. No entanto, a separação entre usuários registrados e convidados precisa ser mais clara e segura, especialmente na persistência de dados.
*   Não há validação server-side explícita para muitas operações, o que pode permitir que usuários enviem dados inválidos ou realizem ações não autorizadas diretamente via API do Supabase.

---

## 7. ⚙️ ENGINES

Os scripts Python na pasta `engines` são cruciais para a geração de assets e processamento de dados.

*   `create_events_assets.py`: Responsável por criar a estrutura de arquivos de um evento, incluindo banners (placeholders), arquivos Markdown (`Intro.md`, `Rules.md`, `General.md`) e o `Manifest.{code}.json`.
*   `engine_canguess_2_0.py`: Processa os dados do evento e dos palpites para gerar os arquivos `event.json` e `predicts.json`, que são consumidos pelo frontend para exibir o ranking. Este script interage diretamente com o Supabase para buscar dados de eventos, rounds, palpites e usuários.

**Observação:** A execução desses scripts parece ser manual ou parte de um processo externo, não integrado diretamente ao frontend. A dependência de caminhos fixos (`/mnt/hd1tb/projetos/canguess/frontend/public/assets/events`) sugere um ambiente de execução específico.

---

## 8. 📊 ESTADOS DO SISTEMA

O CanGuess utiliza estados conceituais para eventos, como `STRUCTURE`, `OPEN`, `PROGRESS`, `DONE`, `PAUSED`, `CANCELED`, `TRANSFER`. Estes estados são implementados como strings em campos do banco de dados e utilizados na lógica do frontend (ex: `BottomNav.jsx` para habilitar/desabilitar palpites e ranking).

### 8.1 Proposta de Tabela Centralizada de Status

A proposta de uma tabela única de status com códigos imutáveis (`01 STRUCTURE`, `02 OPEN`, etc.) é uma boa prática para garantir a consistência e a rastreabilidade dos estados ao longo do tempo. A arquitetura atual suporta essa mudança, pois os estados são atualmente strings e podem ser facilmente substituídos por códigos numéricos ou referências a uma tabela de lookup. Isso traria os seguintes benefícios:

*   **Consistência:** Garante que os estados sejam sempre os mesmos em todo o sistema.
*   **Rastreabilidade:** Novos estados podem ser adicionados com novos códigos, e estados antigos podem ser desativados, mas nunca removidos, mantendo o histórico.
*   **Flexibilidade:** Facilita a adição de novos estados sem impactar a lógica existente.

---

## 9. 🚀 ARQUITETURA FUTURA: CONCEITO SOCIAL

O sistema está evoluindo para um novo paradigma social, onde a distinção entre palpites oficiais e sociais é fundamental. A arquitetura atual precisa ser avaliada quanto à sua capacidade de suportar essa separação sem criar uma estrutura paralela complexa.

### 9.1 Cangueteiro vs. GuessUser

*   **Cangueteiro:** Usuário que envia palpites informais, não concorre a prêmios, não gera aposta oficial, mas pode acompanhar seu desempenho.
*   **GuessUser:** Usuário validado, participa oficialmente dos eventos, seus palpites entram no ranking oficial.

### 9.2 Suporte da Arquitetura Atual

Atualmente, o sistema já possui um mecanismo de 
criação de usuários convidados (`is_guest: true` na tabela `users`), o que pode ser a base para o conceito de "Cangueteiro". A separação de palpites oficiais e sociais pode ser implementada adicionando um campo `type` (e.g., `official`, `social`) na tabela `predicts` e ajustando a lógica de ranking para filtrar por este campo. Isso evitaria a criação de estruturas paralelas complexas.

---

## 10. ⚠️ PROBLEMAS ENCONTRADOS

Esta seção consolida os problemas identificados durante a análise, comparando com o documento anterior e destacando novas questões.

### 10.1 Problemas Persistentes do Documento Anterior

*   **Rota `/register` Duplicada:** Conforme o documento anterior, a rota `/register` ainda está duplicada em `AppRoutes.jsx`, uma dentro e outra fora de `AppShell`. A versão externa não possui o layout completo, causando inconsistência na experiência do usuário.
*   **Nesting Incorreto de `AppShell` e `EventProvider`:** O problema de dois `EventProvider`s (um global e um local) persiste, levando à perda de estado e re-renders desnecessários. Rotas públicas usam o `EventProvider` local, enquanto rotas admin usam o global, resultando em inconsistência na gestão do estado do evento.
*   **Rotas Admin com Placeholders:** As rotas `/admin/resultados`, `/admin/usuarios`, `/admin/consultas` ainda são placeholders sem implementação real, conforme identificado no documento anterior.
*   **`AuthContext` não utilizado por `Header` e `AdminGuard`:** `Header.jsx` e `AdminGuard.jsx` continuam utilizando `localStorage` para autenticação, ignorando o `AuthContext` e criando um sistema de autenticação paralelo e menos seguro.
*   **`UserContext` Inativo:** O `UserContext` ainda existe, mas não é consumido por nenhum componente, permanecendo como código morto.
*   **Uso Excessivo de `localStorage` e `window globals`:** O sistema ainda depende de `localStorage` e `window.CANGUESS_EVENT_CODE` para gerenciar estados, o que é uma má prática e leva a inconsistências e dificuldade de depuração.

### 10.2 Novos Problemas Identificados

*   **Segurança Crítica do Admin:** A proteção do painel administrativo é baseada em uma simples verificação de `localStorage` e uma senha hardcoded no frontend (`AdminLogin.jsx`). Isso permite acesso fácil a usuários mal-intencionados e representa uma falha de segurança **crítica**.
*   **Inconsistência na Gestão de Usuários Convidados:** A criação de usuários convidados (`is_guest: true` na tabela `users`) é feita diretamente na tabela `users`, mas há menção a uma tabela `guest_users` em `userService.js` que não parece ser utilizada no fluxo de criação de palpites. Isso pode gerar confusão e duplicação de dados.
*   **Dependência de Caminhos Fixos nas Engines:** Os scripts Python (`create_events_assets.py`) utilizam caminhos fixos (`/mnt/hd1tb/projetos/canguess/frontend/public/assets/events`), o que dificulta a portabilidade e a execução em diferentes ambientes.

---

## 11. 🗺️ LEGACY EVOLUTION MAP

Esta seção detalha componentes antigos que foram substituídos ou tiveram suas funcionalidades consolidadas.

| Componente Antigo | Componente Atual/Substituto | Observações |
|---|---|---|
| `CadastrosEventos.jsx` | `EventDashboard.jsx` | A funcionalidade de cadastro e gerenciamento de eventos foi consolidada no `EventDashboard`. `CadastrosEventos` é agora uma página legada. |
| `CadastrosFases.jsx` | `EventDashboard.jsx` | O gerenciamento de fases foi integrado ao `EventDashboard`. `CadastrosFases` é uma página legada. |
| `CadastrosRodadas.jsx` | `EventDashboard.jsx` / `CadastroRounds.jsx` | O gerenciamento de rodadas foi integrado ao `EventDashboard` e `CadastroRounds`. `CadastrosRodadas` é uma página legada. |
| `EventPage.jsx.leg` | `EventHome.jsx` | Versão antiga da página de exibição de eventos, substituída por `EventHome` que utiliza manifestos JSON. |
| `Ranking.jsx.bkp`, `Ranking.jsxxxx` | `Ranking.jsx` | Versões de backup ou em desenvolvimento da página de ranking. |
| `CadastrosRodadas.jsx.bak` | `CadastrosRodadas.jsx` | Versão de backup da página de cadastro de rodadas. |

---

## 12. 🗑️ ORPHAN AND DUPLICATION REPORT

Esta seção lista arquivos e rotas que são órfãos (sem uso) ou duplicados.

### 12.1 Arquivos Suspeitos

*   `pages/EventPage.jsx.leg`: Arquivo legado, sem uso no fluxo atual.
*   `pages/Ranking.jsx.bkp`: Arquivo de backup, sem uso no fluxo atual.
*   `pages/Ranking.jsxxxx`: Arquivo de backup ou em desenvolvimento, sem uso no fluxo atual.
*   `pages/admin/CadastrosRodadas.jsx.bak`: Arquivo de backup, sem uso no fluxo atual.

### 12.2 Rotas Órfãs e Duplicadas

*   `/admin/resultados`: Rota com placeholder, sem implementação real.
*   `/admin/usuarios`: Rota com placeholder, sem implementação real.
*   `/admin/consultas`: Rota com placeholder, sem implementação real.
*   `/admin/cadastros/eventos`: Rota para `CadastrosEventos.jsx`, que é uma página legada.
*   `/admin/cadastros/fases`: Rota para `CadastrosFases.jsx`, que é uma página legada.
*   `/admin/cadastros/rodadas`: Rota para `CadastrosRodadas.jsx`, que é uma página legada.
*   `/register`: Rota duplicada em `AppRoutes.jsx`, uma dentro e outra fora de `AppShell`.

---

## 13. 🚨 RISCOS

*   **Segurança:** A vulnerabilidade na autenticação administrativa é o risco mais crítico, podendo levar a acessos não autorizados e manipulação de dados.
*   **Inconsistência de Dados:** A duplicação de `EventProvider`s e o uso de `localStorage` para estados importantes podem levar a inconsistências nos dados exibidos e manipulados pelo usuário.
*   **Manutenibilidade:** A existência de código morto, arquivos legados e múltiplos pontos de verdade para o mesmo estado aumentam a complexidade do sistema e dificultam a manutenção e a introdução de novas funcionalidades.
*   **Escalabilidade:** A dependência de arquivos JSON estáticos gerados por scripts Python pode se tornar um gargalo à medida que o número de eventos e a complexidade dos dados aumentam.

---

## 14. ✅ RECOMENDAÇÕES

*   **Refatorar Autenticação Administrativa:** Implementar um sistema de autenticação robusto para administradores, com validação no servidor e remoção da senha hardcoded. Utilizar o `AuthContext` de forma consistente.
*   **Unificar `EventProvider`:** Remover o `EventProvider` duplicado em `AppShell.jsx` e garantir que todos os componentes consumam o `EventContext` global para gerenciar o estado do evento.
*   **Remover Código Morto e Legado:** Excluir arquivos `.leg`, `.bkp`, `.jsxxxx` e `.bak`, bem como as páginas administrativas legadas (`CadastrosEventos.jsx`, `CadastrosFases.jsx`, `CadastrosRodadas.jsx`) e suas rotas associadas.
*   **Consolidar Gestão de Usuários Convidados:** Definir uma estratégia clara para usuários convidados, utilizando uma única tabela e removendo a ambiguidade entre `users` com `is_guest` e `guest_users`.
*   **Centralizar Estados do Sistema:** Implementar a proposta de uma tabela centralizada de status com códigos imutáveis para os estados dos eventos, garantindo consistência e rastreabilidade.
*   **Melhorar Geração de Assets:** Avaliar a possibilidade de integrar a execução dos scripts Python de geração de assets em um pipeline de CI/CD automatizado, ou até mesmo refatorar para que a geração seja feita on-demand via funções serverless do Supabase, eliminando a dependência de caminhos fixos.
*   **Validação Server-Side:** Implementar validações no lado do servidor para todas as operações críticas, garantindo a integridade dos dados e a segurança do sistema.
*   **Infográfico do Sistema:**

![Infográfico do Sistema CanGuess](https://private-us-east-1.manuscdn.com/sessionFile/saCKlMcmuUWrrHG6Gsa5jU/sandbox/5hWdxUubZC2UW4XoGQRtJO-images_1782676619922_na1fn_L2hvbWUvdWJ1bnR1L2Nhbmd1ZXNzL2RvY3MvY2FuZ3Vlc3Nfc3lzdGVtX2luZm9ncmFwaGlj.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvc2FDS2xNY211VVdyckhHNkdzYTVqVS9zYW5kYm94LzVoV2R4VXViWkMyVVc0WG9HUVJ0Sk8taW1hZ2VzXzE3ODI2NzY2MTk5MjJfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwyTmhibWQxWlhOekwyUnZZM012WTJGdVozVmxjM05mYzNsemRHVnRYMmx1Wm05bmNtRndhR2xqLnBuZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=jXdNQunQu5kDLQRA10X7H6TOlR7PEr-8ikTl8zplHQw2AkCEAON4qmrv9W3Hd469lo9CcvXsYAa6itXtU34X8Pvt-c9o5vz9ra2EDnEGuYNlpvaDN17~cHpWSfu4JTZ46CFjRz1i1vOtc~UgXs52PA2g9fHIHnRoKHG4oNOPgP3Wf~b91RWpd3s4MUKD1k~4kYtUfvTU8glcpnyAIaM4cRRdihnCZjLhkb7fNqqHJRg6qeuFls-XOem-5Jgcv8zg6DmfN1IY5GH-vT-SJxoMUPAqxiZ0OA2i3P4UZhqSzILY3dW7nZgxOpihUrvBWJsszXHU2Z7HX6w5FmgO4JkeUA__)

---

**Assinado:** Agente DDS
