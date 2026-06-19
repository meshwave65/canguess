Perfeito — agora vamos consolidar isso corretamente como evolução real do sistema.

---

# 📘 CANGUESS SYSTEM CONTRACT

## Versão 0.6

### A ERA DO CONTEXTO VIVO, EVENT-FIRST E ARQUITETURA DE EXPERIÊNCIA

---

# 🧭 0. PREFÁCIO — O SISTEMA COMO EXPERIÊNCIA CONTÍNUA

O Canguess evolui mais uma vez.

Se a versão 0.5 resolveu **identidade e participação**,
a versão 0.6 resolve algo mais profundo:

> O sistema não é uma aplicação com páginas.
> O sistema é um ambiente contínuo baseado em contexto.

Agora, tudo passa a existir dentro de um **evento ativo**.

O usuário não navega mais o sistema.

Ele entra em um contexto e permanece nele.

---

# 📌 1. EVOLUÇÃO DAS VERSÕES

---

## Versão 0.1 → 0.4 (Fundação)

* eventos
* rounds
* engine
* primeiras apostas
* estrutura de backend

---

## Versão 0.5 (Identidade e Participação)

* users vs guest_users
* participação sem autenticação
* predicts universal
* workspace conceitual
* evento como porta de entrada

---

## 🚀 Versão 0.6 (ATUAL)

# A ERA DO CONTEXTO VIVO

---

# 🧠 2. PRINCÍPIO FUNDAMENTAL DA VERSÃO 0.6

## ❌ Antes

```
Página define contexto
```

## ✅ Agora

```
Contexto define páginas
```

---

O sistema passa a operar assim:

```
EVENTO ATIVO (CODE)
        ↓
cria realidade do usuário
        ↓
todas as páginas derivam dele
```

---

# 🧩 3. O EVENTO COMO KERNEL DO SISTEMA

O evento agora é:

> o núcleo operacional do sistema

Ele contém:

* identidade do workspace
* regras
* rounds
* assets
* comportamento da UI
* permissões de interação

---

## Evento ativo significa:

✔ existe contexto
✔ existe navegação válida
✔ existe participação possível
✔ existe identidade operacional (guest ou user)

---

# 🌐 4. NOVA ARQUITETURA DE ENTRADA

## Ordem de resolução do contexto

### 1º URL (prioridade máxima)

```
/events/?code=R410M9SQ
```

---

### 2º localStorage

```
lastEventCode
```

---

### 3º fallback do sistema

```
evento default (CanGuess Featured)
```

---

## Resultado:

O sistema nunca inicia “vazio”.

Ele sempre inicia **em um evento**.

---

# 🧠 5. EVENT CONTEXT COMO CAMADA GLOBAL

Foi introduzido o conceito definitivo:

## EventContext é o kernel do frontend

Ele contém:

```js
event
workspace
rounds
code
loadEventByCode()
clearEvent()
```

---

## Regra central:

> Nenhuma página deve funcionar sem EventContext

---

# 📱 6. NAVEGAÇÃO BASEADA EM CONTEXTO

## Antes

```
/ranking
/palpites
/eventos
```

---

## Agora

```
/ranking  → depende de event
/palpites → depende de event
/events   → inicializa event
```

---

## Regra de UX:

Se não há contexto:

* bloqueia navegação
* mostra fallback inteligente

---

## Exemplo:

### Ranking sem evento:

> “Selecione um evento primeiro”

### Predictions sem evento:

> “Evento ainda não selecionado”
> [Buscar evento]

---

# 👤 7. GUEST CONTINUA, MAS AGORA É OPERACIONAL

A versão 0.6 NÃO muda o guest.

Mas muda seu papel.

---

## Guest agora é:

> identidade operacional dentro de um evento ativo

---

## Regra:

```
EVENTO → cria contexto → cria participação (guest ou user)
```

---

## Importante:

* Ranking → guest permitido
* EventHome → guest permitido
* Predictions → guest possível, mas upgrade obrigatório

---

# 🧠 8. EVENT HOME COMO RENDERIZADOR DE REALIDADE

O EventHome deixa de ser página estática.

Ele passa a ser:

> renderer de manifesto do evento

---

## Ele não contém conteúdo

Ele contém:

```
manifest.json
```

---

## Manifesto define:

* banner
* seções
* ordem de exibição
* arquivos .md
* regras visuais
* conteúdo externo

---

## Estrutura física:

```
/assets/events/[code]/
    Banner_[code].png
    Intro_[code].md
    Rules_[code].md
    General_[code].md

/data/events/[code].manifest.json
```

---

# 🧾 9. EVENTO COMO SISTEMA DE ARQUIVOS (NÃO BANCO DE DADOS)

Mudança estrutural importante:

## ❌ Antes

Evento era tabela + campos

## ✅ Agora

Evento é:

> conjunto de artefatos físicos + manifest

---

## O manifest conecta tudo:

```json
{
  "banner": "/assets/events/R410/Banner_R410.png",
  "sections": [
    "Intro_R410.md",
    "Rules_R410.md",
    "General_R410.md"
  ]
}
```

---

# 🧠 10. EVENTO SEMPRE COMPLETO (REGRA OBRIGATÓRIA)

Todo evento deve existir com:

✔ Banner
✔ Intro.md
✔ Rules.md
✔ General.md
✔ Manifest.json

---

## Regra crítica:

> ausência de arquivo = erro do sistema, não optionalidade

---

## Benefício:

* elimina ambiguidade
* elimina UI quebrada silenciosa
* garante previsibilidade total

---

# ⚙️ 11. CRIAÇÃO DE EVENTO AGORA É UMA RPC DE ECOSSISTEMA

Criar evento não é mais INSERT.

É:

```
RPC: create_event_ecosystem()
```

---

## Ele cria:

* event row
* phases
* rounds
* guest entry baseline
* assets folder
* default banner
* default markdowns
* manifest.json
* status inicial (draft/structuring)

---

# 🟡 12. STATUS AGORA É CENTRALIZADO (EVITANDO CAOS)

Problema identificado na v0.5:

> múltiplos status por domínio

---

## v0.6 resolve isso:

### Status único por entidade principal:

#### Event status:

```
draft
structuring
active
finished
archived
```

---

## Substados são derivados, não persistidos:

* ranking status → derivado de event
* prediction status → derivado de event
* phase status → derivado de event

---

## Regra:

> não existe status duplicado por feature

---

# 🧭 13. EXPERIÊNCIA DO USUÁRIO (FLUXO FINAL)

## Entrada:

```
link / QR / code
```

↓

## Sistema:

```
resolve event context
```

↓

## Usuário entra direto:

```
EventHome
```

↓

## Navegação:

```
/ranking
/palpites
```

↓

## Sem quebra de contexto

---

# 🚨 14. NOVO PRINCÍPIO DE UX

> O usuário nunca vê o sistema “sem evento”

---

Se isso acontecer:

✔ fallback automático
✔ evento default CanGuess
✔ ou bloqueio inteligente com CTA

---

# 🧠 15. FILOSOFIA DA VERSÃO 0.6

## Antes:

> sistema orientado a páginas

## Agora:

> sistema orientado a realidade contextual

---

## O sistema agora pensa assim:

* existe um evento ativo
* tudo gira ao redor dele
* identidade é secundária
* participação é primária
* navegação é consequência

---

# 🚀 16. ESTADO ATUAL DO CANGUESS

✔ EventContext como kernel
✔ evento como entrypoint absoluto
✔ guest como identidade operacional
✔ manifest-driven UI
✔ assets estruturados por evento
✔ navegação dependente de contexto
✔ status centralizado
✔ UX baseada em evento contínuo

---

# 🧩 CONCLUSÃO DA VERSÃO 0.6

A mudança desta versão não foi técnica.

Foi estrutural:

> o Canguess deixa de ser uma aplicação com eventos
> e passa a ser um sistema onde o evento é o próprio ambiente

---

Se quiser o próximo passo, o ideal agora é escolher UMA destas três evoluções:

### 🔥 1. Implementar EventContext bootstrap (URL → storage → default)

### 🔥 2. Criar EventHome v1 (manifest-driven real)

### 🔥 3. RPC create_event_ecosystem (Supabase + assets + markdown + manifest)

Só me diz qual você quer atacar primeiro.

