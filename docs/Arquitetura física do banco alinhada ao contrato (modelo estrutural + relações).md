Perfeito — vamos materializar isso de forma que vire **infraestrutura real do projeto**, não só texto conceitual.

Vou te entregar duas peças:

1. 📘 `SYSTEM_CONTRACT.md` (documento oficial versionável)
2. 🧱 arquitetura física do banco alinhada ao contrato (modelo estrutural + relações)

---

# 📘 1. SYSTEM_CONTRACT.md (versão pronta para repo)

````md
# MESHWAVE / CANGUESS — SYSTEM CONTRACT

## Version: 0.1
## Status: Living Document
## Purpose: Define canonical architecture, rules and invariants of the system

---

# 1. SYSTEM OVERVIEW

Canguess is a simulation and prediction system based on structured events, agents and engines.

It is a module of the larger MeshWave ecosystem.

Goal:
- Transform real-world or simulated events into deterministic, auditable scoring systems
- Enable modular engines for different domains (sports, elections, finance, simulations)

---

# 2. CORE ENTITIES

## 2.1 Event
A logical container for a competition or simulation.

Examples:
- Football tournament
- Election
- Financial market simulation
- Binary prediction event

---

## 2.2 Event Round
Temporal or logical subdivision of an event.

Examples:
- Match
- Phase iteration
- Turn
- Observation cycle

---

## 2.3 Event Agent
A contextual participant capable of producing measurable outcomes inside an event.

Examples:
- Player
- Team
- Candidate
- Financial asset
- Option in a binary system

Note:
An agent is global in identity but contextual in participation.

---

## 2.4 Event Part
Atomic unit of truth for a round.

Represents the canonical value produced by an event agent.

Examples:
- Goals scored
- Votes received
- Time achieved
- Numeric outcome

Rule:
event_part.value is the canonical truth source.

---

## 2.5 Prediction
User-submitted value associated with an event round.

Must always be normalized before engine execution.

---

## 2.6 Engine
A deterministic function module responsible for:

- interpreting event_parts
- comparing predictions
- computing scores
- applying fallback rules
- producing rankings

Important:
Engines do NOT know UI or agents. They only consume values.

---

# 3. CORE ARCHITECTURAL PRINCIPLE

Engines operate only on normalized data.

```txt
engine(event_parts, predictions) → results
````

No nulls are allowed at engine level.

---

# 4. NORMALIZATION POLICY

## 4.1 Discrete domains

If prediction is missing:

→ random(valid_options)

## 4.2 Continuous domains

If prediction is missing:

→ statistical_function(historical_data)

---

# 5. SCORING MODEL (DEFAULT ENGINE)

If prediction matches canonical result:

→ +1 point

Else:

→ 0 points

---

# 6. AUDITABILITY

Every score must be explainable via:

* input event_part
* prediction
* engine version
* rule applied

---

# 7. SYSTEM PRINCIPLES

* Deterministic execution
* Engine isolation
* No null inputs in engines
* Event-driven modularity
* Fully auditable transformations

---

# 8. FUTURE EXTENSION

System is designed for plug-in engines:

* Sports engines
* Finance engines
* Election engines
* Simulation engines

````

---

# 🧱 2. ARQUITETURA FÍSICA DO BANCO (alinhada ao contrato)

Aqui é onde o sistema deixa de ser conceito e vira plataforma.

---

# 🧠 2.1 VISÃO GERAL

```txt
users
  ↓
event_agents (contexto do evento)
  ↓
event_rounds
  ↓
event_parts (fonte da verdade)
  ↓
predictions (usuário)
  ↓
engines (processamento)
  ↓
results / rankings
````

---

# 🧱 2.2 TABELAS CENTRAIS

---

## 👤 users

```sql
id uuid PK
user_name text
email text
phone text
created_at timestamp
```

---

## 🎯 events

```sql
id uuid PK
name text
engine_type text
status text
created_at timestamp
```

---

## 🧩 event_agents

```sql
id uuid PK
event_id uuid FK
agent_global_id uuid
label text
meta jsonb
```

✔ representa quem participa naquele evento

---

## 🧭 event_rounds

```sql
id uuid PK
event_id uuid FK
round_index int
round_name text
status text
```

---

## 🧱 event_parts (FONTE DA VERDADE)

```sql
id uuid PK
round_id uuid FK
agent_id uuid FK
value text
created_at timestamp
```

✔ aqui nasce o resultado oficial

---

## 🎮 predictions

```sql
id uuid PK
user_id uuid FK
event_id uuid FK
round_id uuid FK
prediction text
auto_filled boolean default false
created_at timestamp
```

✔ sempre completo antes da engine

---

## ⚙️ engine_runs (AUDITORIA)

```sql
id uuid PK
event_id uuid FK
engine_version text
input_snapshot jsonb
output_snapshot jsonb
created_at timestamp
```

✔ rastreabilidade total

---

## 🏆 rankings

```sql
id uuid PK
event_id uuid FK
user_id uuid FK
points int
updated_at timestamp
```

---

# 🧠 2.3 RELAÇÃO CRÍTICA

## regra fundamental:

```txt
event_parts → canonical truth
predictions → user intent
engine → reconciliation layer
ranking → derived state
```

---

# 🔥 3. INVARIANTES DO SISTEMA

## ✔ nenhum engine recebe null

## ✔ nenhum ranking é manual

## ✔ event_parts são imutáveis (idealmente)

## ✔ predictions podem ser auto-completadas

## ✔ engines são versionadas

---

# 🚀 RESULTADO FINAL

Com isso você agora tem:

✔ documento oficial vivo (SYSTEM_CONTRACT.md)
✔ estrutura de banco coerente com arquitetura
✔ separação clara entre domínio, engine e UI
✔ base para escalar para qualquer tipo de evento

---

Se quiser o próximo passo natural, posso montar:

👉 **Engine Spec v1 (formato plugin real em TypeScript/Python)**
👉 ou **fluxo completo: criação de evento → geração de rounds → geração de predictions → execução da engine → ranking**

Isso aqui já é nível “plataforma”, não mais MVP.

