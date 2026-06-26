Perfeito — agora sim estamos no ponto certo para consolidar isso como **produto de verdade, com memória histórica e não só evolução técnica**.

Vou te entregar a versão **1.0 do CANGUESS SYSTEM CONTRACT**, mantendo:

* linguagem acessível (não só técnica)
* histórico fiel (sem apagar decisões anteriores)
* visão de produto + comunidade + sistema
* e principalmente: coerência com tudo que você já construiu

---

# 📘 CANGUESS SYSTEM CONTRACT

## Versão 1.0

### A NASCENTE DA COMUNIDADE CANGUESS

### DO SISTEMA DE BOLÕES À REDE SOCIAL DE CONTEXTOS

---

# 🧭 0. PREFÁCIO — O MOMENTO EM QUE O SISTEMA GANHA IDENTIDADE

O Canguess chega à sua versão 1.0 não como um ponto de chegada técnico, mas como um ponto de ancoragem conceitual.

Durante suas versões anteriores, o sistema evoluiu de forma orgânica, quase experimental, sempre resolvendo problemas imediatos: criação de eventos, apostas, ranking, engine de cálculo, e estrutura de participação.

Mas algo mudou ao longo do caminho.

O sistema deixou de ser apenas um “bolão inteligente”.

E passou a se comportar como algo maior:

> uma estrutura social baseada em eventos, contexto e participação coletiva.

A versão 1.0 marca o momento em que isso deixa de ser percepção e passa a ser definição.

---

# 📌 1. EVOLUÇÃO HISTÓRICA (VERSÕES COMO MEMÓRIA VIVA)

O Canguess não recomeça a cada versão. Ele acumula.

---

## 🧱 Versões 0.1 → 0.4 — A Fundação Técnica

O sistema nasce como um motor de eventos e previsões.

* criação de eventos
* rounds e partidas
* engine de cálculo de pontos
* primeiros palpites
* estrutura de backend funcional

📌 Nesta fase:

> o sistema era uma ferramenta de bolão

---

## 🧩 Versão 0.5 — Identidade e Participação

Aqui surge a primeira mudança estrutural importante:

* usuários e guests coexistem
* participação sem autenticação
* predicts universais
* introdução do conceito de workspace
* evento como porta de entrada do sistema

📌 Nesta fase:

> o sistema começa a se abrir como plataforma

---

## 🌐 Versão 0.6 — O SISTEMA ORIENTADO A CONTEXTO

A mudança mais profunda até então.

* evento passa a ser o núcleo do sistema
* EventContext controla toda a experiência
* navegação depende de evento ativo
* UI deixa de ser fixa e passa a ser contextual
* engine se integra ao conceito de “realidade do evento”
* manifest-driven UI começa a existir
* regras de exposição começam a surgir (is_open)

📌 Nesta fase:

> o sistema deixa de ser páginas e vira ambiente

---

## 🚀 Versão 1.0 — A NASCENTE DA COMUNIDADE

Agora o sistema deixa de ser apenas estrutura técnica e passa a ser um ecossistema social.

📌 Nesta fase:

> o Canguess deixa de ser um produto de eventos
> e passa a ser uma rede de comunidades baseadas em eventos e contextos

---

# 🧠 2. PRINCÍPIO FUNDAMENTAL DO SISTEMA

O princípio central permanece, mas agora amadurecido:

## ❌ Antes

O sistema era composto por páginas e funcionalidades isoladas.

## ✅ Agora

O sistema é composto por contextos vivos que definem a experiência.

---

## Fórmula do sistema:

```text id="core01"
EVENTO ATIVO → CONTEXTO → EXPERIÊNCIA COMPLETA DO USUÁRIO
```

---

# 🧩 3. O EVENTO COMO UNIDADE SOCIAL

O evento deixa de ser apenas um objeto técnico.

Ele passa a ser:

> a menor unidade social do Canguess

---

## Um evento contém:

* identidade
* regras
* rounds
* palpites
* participantes
* permissões
* comportamento da UI
* estado de abertura (is_open)

---

## Evento ativo significa:

✔ existe comunidade temporária
✔ existe interação social
✔ existe competição ou participação
✔ existe contexto compartilhado

---

# 🌐 4. ARQUITETURA DE ENTRADA DO SISTEMA

O sistema sempre inicia a partir de um evento.

Ordem de resolução:

### 1. URL (prioridade máxima)

```text
/events/?code=XXXX
```

### 2. Memória local

```text
lastEventCode
```

### 3. Fallback

```text
evento padrão (CanGuess Featured)
```

---

📌 Resultado:

> o usuário nunca entra em um “sistema vazio”

---

# 🧠 5. EVENT CONTEXT — O CORAÇÃO DO FRONTEND

O EventContext se consolida como núcleo da experiência.

Ele contém:

* evento ativo
* workspace associado
* rounds
* código
* carregamento e reset de contexto

---

## Regra fundamental:

> nenhuma tela existe sem contexto de evento

---

# 📱 6. NAVEGAÇÃO BASEADA EM REALIDADE

A navegação deixa de ser estrutural e passa a ser contextual.

---

## Antes:

* /ranking
* /palpites
* /eventos

---

## Agora:

* ranking depende do evento ativo
* palpites dependem do evento ativo
* eventos inicializam contexto

---

## UX padrão:

Se não houver evento:

* bloqueia navegação
* exibe chamada para seleção de evento

---

# 👤 7. USUÁRIOS, GUESTS E PARTICIPAÇÃO

O sistema mantém abertura total à participação.

Mas agora com papel definido:

* guest = participante leve dentro de um evento
* user = identidade persistente
* ambos coexistem no mesmo sistema social

---

📌 Importante:

> o evento cria o contexto de participação, não o login

---

# 🧠 8. WORKSPACES — A BASE DA COMUNIDADE

Aqui nasce a estrutura social real do sistema.

---

## Um workspace é:

> uma comunidade controlada por um usuário

---

## Um workspace pode conter:

* múltiplos eventos
* múltiplos participantes
* regras próprias
* identidade visual própria
* permissões

---

## Isso transforma o sistema em:

> uma rede de comunidades independentes dentro de uma plataforma única

---

# 🧩 9. EVENTOS COMO ARQUIVOS + MANIFESTO

O evento deixa de ser apenas banco de dados.

Ele passa a ser composto por artefatos:

```
event.json
predicts.json
manifest.json
assets/
```

---

## Manifesto define:

* estrutura da UI
* conteúdo do evento
* ordem de exibição
* regras visuais

---

📌 O sistema passa a ser:

> manifest-driven

---

# 🧠 10. SISTEMA DE ARQUIVOS POR EVENTO

Cada evento é isolado.

```
/events/{code}/
    event.json
    predicts.json
    manifest.json
    assets/
```

---

📌 Benefício:

* isolamento total
* escalabilidade natural
* fácil portabilidade
* clareza estrutural

---

# ⚙️ 11. ENGINE — DE MOTOR PARA CAMADA SOCIAL

O engine deixa de ser apenas cálculo.

Ele passa a ser:

* gerador de contexto
* agregador de participação
* formador de ranking
* estruturador de dados sociais

---

📌 Ele agora alimenta:

* ranking
* participação
* validação
* visibilidade

---

# 🟡 12. VALIDAÇÃO DE PALPITES (REGRA SOCIAL CENTRAL)

O sistema introduz um conceito crítico:

---

## Modos de validação:

### 🔵 Automático

* palpite já nasce ativo
* usado em enquetes e pesquisas

---

### 🟡 Manual

* palpite precisa aprovação
* usado em competições e bolões estruturados

---

📌 Isso define o nível de formalidade do evento.

---

# 🌐 13. EXPOSIÇÃO DOS PREDICTS (is_open)

O sistema separa claramente:

* participação
* exposição

---

## Antes de is_open:

* usuário participa
* dados são privados

---

## Depois de is_open:

* palpites são expostos
* competição se torna pública
* participação se encerra

---

📌 Isso cria ciclo social completo:

> participação → fechamento → revelação

---

# 🚨 14. PRINCÍPIO DE EXPERIÊNCIA

O usuário nunca deve sentir que está fora do sistema.

Ele sempre deve estar dentro de:

* um evento
* um contexto
* uma comunidade

---

Se isso não existir:

* fallback automático
* evento padrão
* ou bloqueio guiado

---

# 🧭 15. FILOSOFIA DO CANGUESS 1.0

O sistema agora assume uma identidade clara:

---

## Antes:

> uma ferramenta de bolão

## Agora:

> uma rede de comunidades baseadas em eventos interativos

---

## O sistema pensa assim:

* o evento é o centro
* a comunidade é o efeito
* o ranking é consequência
* a interação é o produto
* a plataforma é o ambiente

---

# 🚀 16. ESTADO ATUAL DO SISTEMA

✔ EventContext como núcleo
✔ eventos como comunidades
✔ workspaces como organizações
✔ engine funcional e evolutivo
✔ predicts com ciclo de vida
✔ validação configurável
✔ exposição controlada por estado
✔ arquitetura baseada em contexto
✔ estrutura de assets por evento
✔ visão de rede social emergente

---

# 🧩 CONCLUSÃO DA VERSÃO 1.0

O Canguess deixa de ser um sistema que organiza eventos.

E passa a ser:

> um ecossistema onde eventos são a forma primária de interação social

---

# 🧭 NOTA FINAL DE DIREÇÃO

A versão 1.0 não encerra o projeto.

Ela inaugura a fase seguinte:

> crescimento controlado de uma rede social baseada em eventos estruturados

---

Se quiser o próximo passo natural agora, ele é bem claro:

👉 criar a branch `dev-social-core` e separar:

* engine atual (estável)
* evolução social (workspaces + validação + exposição)

Só me fala e eu te ajudo a estruturar isso sem quebrar nada.

