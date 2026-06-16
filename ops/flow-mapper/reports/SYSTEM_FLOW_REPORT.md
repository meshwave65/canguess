# Relatório de Fluxo do Sistema Canguess Flow Mapper - Execução Inicial

## 1. Visão Geral do Sistema Atual

Este relatório apresenta a análise inicial da arquitetura de navegação do repositório `bolao` (frontend), com foco na identificação de rotas, fluxos de navegação e dependências de UI. O objetivo é construir um modelo vivo do sistema como um grafo de fluxos de navegação, dependências de UI e transições de estado.

O sistema `bolao` utiliza `react-router-dom` para gerenciar suas rotas. A estrutura principal de rotas é definida em `src/routes/AppRoutes.jsx`. A aplicação é dividida em áreas públicas e protegidas por autenticação de administrador.

## 2. Mapa de Navegação Inicial

Com base na análise dos arquivos `AppRoutes.jsx`, `BottomNav.jsx` e `AdminLayout.jsx`, o grafo de navegação inicial foi construído. Abaixo, uma representação textual das principais rotas e seus fluxos:

**Rotas Públicas:**

*   `/` (Home)
*   `/login` (Login)
*   `/palpites` (Palpites)
*   `/ranking` (Ranking)

**Fluxo de Login Admin:**

*   `/admin-login` (Login do Administrador)
*   Redirecionamento para `/admin` após autenticação bem-sucedida.

**Rotas Protegidas (Admin):**

*   `/admin` (Dashboard do Administrador)
*   `/admin/usuarios` (Gerenciamento de Usuários)
*   `/admin/palpites` (Mapa de Palpites)
*   `/admin/cadastros` (Home de Cadastros)
    *   `/admin/cadastros/times` (Cadastro de Times)
    *   `/admin/cadastros/eventos` (Cadastro de Eventos)
    *   `/admin/cadastros/rodadas` (Cadastro de Rodadas)
    *   `/admin/cadastros/fases` (Cadastro de Fases - **Órfã**)
*   `/admin/resultados` (Resultados)
*   `/admin/consultas` (Consultas)

**Tabela de Rotas e Componentes Associados:**

| Rota                 | Componente Principal | Tipo de Acesso   | Origem de Navegação Principal |
| :------------------- | :------------------- | :--------------- | :---------------------------- |
| `/`                  | `Home`               | Pública          | Direta, BottomNav             |
| `/login`             | `Login`              | Pública          | Header                        |
| `/palpites`          | `Predictions`        | Pública          | BottomNav                     |
| `/ranking`           | `Ranking`            | Pública          | BottomNav                     |
| `/admin-login`       | `AdminLogin`         | Autenticação Admin | BottomNav, AdminGuard         |
| `/admin`             | `Admin`              | Admin Protegida  | AdminLogin (sucesso), Sidebar |
| `/admin/usuarios`    | `<div>Usuários</div>` | Admin Protegida  | Sidebar                       |
| `/admin/palpites`    | `MapaPalpites`       | Admin Protegida  | Sidebar                       |
| `/admin/cadastros`   | `CadastrosHome`      | Admin Protegida  | Sidebar                       |
| `/admin/cadastros/times` | `CadastrosTimes`     | Admin Protegida  | Menu Cadastros                |
| `/admin/cadastros/eventos` | `CadastrosEventos`   | Admin Protegida  | Menu Cadastros                |
| `/admin/cadastros/rodadas` | `CadastrosRodadas`   | Admin Protegida  | Menu Cadastros                |
| `/admin/cadastros/fases` | `CadastrosFases`     | Admin Protegida  | **Órfã**                      |
| `/admin/resultados`  | `<div>Resultados</div>` | Admin Protegida  | Admin (Link)                  |
| `/admin/consultas`   | `<div>Consultas</div>` | Admin Protegida  | Admin (Link)                  |
| `/events`            | (Não Definido)       | **Drift**        | Header (Botão)                |

## 3. Identificação de Possíveis Drifts e Páginas Órfãs

Durante a análise, foram identificados os seguintes pontos de atenção:

*   **Drift: `/events`**
    *   Existe um link no componente `Header.jsx` que direciona para `/events` (botão '🔎 Buscar eventos'). No entanto, a rota `/events` não está definida em `AppRoutes.jsx`. Isso representa um **drift**, onde a UI sugere uma navegação que não possui uma rota correspondente no sistema.

*   **Página Órfã: `/admin/cadastros/fases`**
    *   A rota `/admin/cadastros/fases` está definida em `AppRoutes.jsx` e associada ao componente `CadastrosFases`. Contudo, não foi encontrado um link direto para esta rota nos menus de navegação (`AdminLayout.jsx` ou `CadastrosHome.jsx`). Isso indica que a página é **órfã**, ou seja, existe, mas não é acessível através dos fluxos de navegação esperados.

*   **Redundância de Componentes: `AdminLogin.jsx` e `AdminGuard.jsx`**
    *   Foram encontradas duplicações dos componentes `AdminLogin.jsx` e `AdminGuard.jsx` em `src/pages/AdminLogin.jsx` (utilizado) e `src/pages/admin/AdminLogin.jsx` (não utilizado), e `src/components/AdminGuard.jsx` (utilizado) e `src/pages/admin/AdminGuard.jsx` (não utilizado). Embora a rota principal utilize as versões corretas, a existência de arquivos duplicados pode gerar confusão e manutenção desnecessária.

## 4. Recomendações Iniciais

Para melhorar a observabilidade e a consistência arquitetural do sistema, as seguintes recomendações são propostas:

1.  **Resolver o Drift `/events`:**
    *   Decidir se a rota `/events` deve ser implementada. Se sim, adicioná-la a `AppRoutes.jsx` e criar o componente correspondente. Se não, remover o link do `Header.jsx`.

2.  **Integrar a Página Órfã `/admin/cadastros/fases`:**
    *   Adicionar um link para `/admin/cadastros/fases` no menu de cadastros (`CadastrosHome.jsx`) ou em outro local apropriado dentro da área administrativa, tornando-a acessível.

3.  **Remover Redundâncias:**
    *   Excluir os arquivos `src/pages/admin/AdminLogin.jsx` e `src/pages/admin/AdminGuard.jsx` para evitar confusão e garantir que apenas as versões ativas dos componentes sejam mantidas.

4.  **Padronização de Nomenclatura:**
    *   Considerar a padronização de nomes de rotas e componentes para maior clareza e manutenibilidade. Por exemplo, `CadastroRounds` e `CadastroParts` em vez de `CadastrosRodadas` e `CadastrosFases` para consistência com o padrão `CadastrosX`.

Este relatório serve como base para futuras análises e para o acompanhamento da evolução da arquitetura de navegação do sistema Canguess Flow Mapper.
