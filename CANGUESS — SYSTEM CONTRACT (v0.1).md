
# 📘 MESHWAVE / CANGUESS — SYSTEM CONTRACT (v0.1)

## 🧭 1. Visão do Sistema

O sistema Canguess (bolão) é um módulo operacional da arquitetura maior MeshWave, cujo objetivo é:

> Criar um ambiente de simulação e aferição de resultados baseado em eventos, agentes e engines determinísticas, com capacidade de evolução modular e auditoria completa.

---

# 🧱 2. Conceitos Fundamentais

## 2.1 Evento

Um evento é uma unidade de simulação ou competição.

Exemplos:

* Copa do Mundo (bolão)
* Eleição
* Partida de futebol
* Cotação financeira
* Resultado binário (sim/não)

---

## 2.2 Event Round

Subdivisão temporal ou lógica do evento.

Ex:

* jogo
* turno
* fase
* período de aferição

---

## 2.3 Event Agent

Entidade reconhecida pelo evento como capaz de gerar um resultado observável.

Ex:

* jogador
* time
* candidato
* ativo financeiro
* opção de voto

✔ agentes são contextuais ao evento
✔ um mesmo agent global pode atuar em múltiplos eventos

---

## 2.4 Event Part

Elemento atômico que contém o **valor canônico do mundo real dentro de um round**.

Ex:

* gols de cada time
* votos de um candidato
* valor de cotação
* tempo de prova

```txt id="event_part"
event_part.value = canonical_result
```

✔ é a fonte da verdade do resultado do evento

---

## 2.5 Prediction (Bolão)

Valor inserido pelo usuário associado a um event_round.

---

## 2.6 Engine

Um módulo lógico responsável por:

* interpretar event_parts
* calcular resultados
* aplicar regras de pontuação
* normalizar dados incompletos
* produzir ranking

✔ engines são independentes de agentes
✔ engines só consomem valores

---

# ⚙️ 3. PRINCÍPIO FUNDAMENTAL DA ARQUITETURA

> Engines NÃO conhecem entidades, apenas valores.

```txt id="core_principle"
engine(input event_parts) → output result
```

---

# 🧩 4. NORMALIZAÇÃO DE DADOS

Todo dado deve ser completo antes de entrar na engine.

---

## 4.1 Política de completude

Se prediction estiver vazio:

### Casos discretos:

```txt id="discrete_fallback"
random(valid_options)
```

### Casos contínuos:

```txt id="continuous_fallback"
statistical_function(historical_data)
```

---

## 4.2 Garantia do sistema

✔ nunca existe null na engine
✔ nunca existe valor fora do domínio
✔ nunca existe inconsciência de regra

---

# 🎯 5. MODELO DE RANKING (BOLÃO)

## Regra base:

* comparação entre prediction vs event_part
* acerto = +1 ponto
* erro = 0 pontos

```txt id="scoring_basic"
if prediction == canonical_result:
    points += 1
```

---

## Resultado visual na UI:

* ⚽ = acerto
* valor do palpite = erro
* vazio = não exibido

---

# 🧠 6. SISTEMA DE EVENTOS

Cada evento define:

* event_agents
* valid_options
* ruleset
* engine associada
* fallback policy

---

## Exemplo:

### Futebol

```txt id="football_event"
valid_options = [1, X, 2]
engine = simple_match_engine
fallback = random(valid_options)
```

---

### Eleição

```txt id="election_event"
valid_options = candidatos
engine = vote_engine
fallback = historical_distribution
```

---

### Cotação

```txt id="market_event"
valid_options = numeric
engine = statistical_engine
fallback = moving_average
```

---

# 🧩 7. PRINCÍPIOS ARQUITETURAIS

## 7.1 Separação absoluta

* UI não calcula lógica de jogo
* Engine não conhece UI
* Agent não conhece engine

---

## 7.2 Determinismo

Mesmo com fallback:

✔ resultado deve ser reproduzível
✔ regras devem ser explícitas
✔ inputs devem ser rastreáveis

---

## 7.3 Completude obrigatória

✔ engine nunca roda com dados incompletos

---

## 7.4 Evolução modular

✔ engines podem ser adicionadas sem quebrar o sistema

---

# 🧾 8. AUDITORIA E RASTREABILIDADE

Cada resultado deve poder responder:

* por que esse ponto foi dado?
* qual regra foi aplicada?
* qual input gerou isso?

---

# 🔥 9. DIREÇÃO FUTURA (IMPORTANTE)

O sistema está evoluindo para:

> 🧠 “plataforma de engines de simulação de realidade”

onde bolão é só o primeiro caso de uso.

---

# 📌 STATUS DO DOCUMENTO

* Versão: v0.1
* Tipo: contrato vivo do sistema
* Atualização: contínua conforme evolução do projeto

---

Se quiser, no próximo passo posso transformar isso em algo ainda mais útil:

👉 versão em **Markdown oficial do repositório (SYSTEM_CONTRACT.md)**
👉 ou evoluir isso para um **Engine Spec padrão (JSON + TS interface)**
👉 ou ainda desenhar a **arquitetura física do banco alinhada com esse contrato**

Isso aqui virou o “núcleo conceitual” do teu sistema — vale muito manter isso vivo e versionado.

