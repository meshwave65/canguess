Perfeito — agora sim você está no ponto certo: **antes de código, alinhar o cérebro do sistema**.

Vou fazer exatamente o que você pediu aqui:

✔ atualizar a documentação
✔ com narrativa histórica (não técnica seca)
✔ incluindo o estado atual + evolução + lógica de sessão/workspace
✔ sem cortar contexto
✔ mantendo o “espírito Sofia/Canguess” que você descreveu

---

# 📘 CANGUESS / CAN-GUESS SYSTEM

## Versão 0.5 — A ERA DA IDENTIDADE, AUTENTICAÇÃO E CONTEXTO

---

# 🧭 0. PREFÁCIO — O SISTEMA COMO ORGANISMO EM EVOLUÇÃO

O Canguess não pode mais ser entendido como um sistema tradicional de login, páginas e banco de dados.

Ele já passou desse estágio.

O que existe hoje é algo mais próximo de um organismo em crescimento, onde cada decisão técnica não é apenas uma implementação, mas uma consequência de uma necessidade real que surgiu durante o uso.

Este documento não descreve “como o sistema funciona”.

Ele descreve:

> como o sistema foi sendo forçado a funcionar da forma que funciona hoje.

---

# 🧠 1. A CAMADA INVISÍVEL — O PROBLEMA QUE SEMPRE EXISTIU

Durante muito tempo, o sistema operou com uma falsa sensação de simplicidade:

* usuários entram
* fazem login
* escolhem eventos
* fazem palpites
* geram ranking

Mas essa visão escondia um problema estrutural profundo:

> não existia uma identidade única e confiável atravessando todas as camadas do sistema.

---

# ⚠️ 1.1 O PROBLEMA REAL NÃO ERA LOGIN

O login, como normalmente se entende em aplicações modernas, nunca foi suficiente aqui.

Porque o sistema começou híbrido:

* tabela `users` própria
* Supabase Auth separado
* dados paralelos coexistindo
* inconsistências de cadastro inevitáveis
* variações de identidade entre camadas

Isso gerou um problema silencioso:

> o sistema não sabia exatamente quem era o usuário de forma global.

---

# 🧩 2. A DESCOBERTA FUNDAMENTAL — IDENTIDADE NÃO É LOGIN

Com o tempo ficou claro:

Login não é identidade.

Login é apenas o ato de acessar uma identidade já existente.

A identidade real do sistema sempre deveria ser:

> `auth.uid()` (Supabase Auth)

---

# 🔐 3. A REGRA DE OURO DO SISTEMA

A partir desta fase, uma regra se torna absoluta:

### ✔ REGRA CENTRAL

> Toda operação crítica deve ser vinculada a `auth.uid()`.

---

### ❌ NÃO É ACEITO COMO FONTE DE VERDADE:

* `user_name`
* `email`
* `phone`
* tabela `users` isoladamente

---

### ✔ APENAS:

```
auth.uid()
```

representa o usuário real no sistema.

---

# 🧠 4. O MODELO DE USUÁRIO (ATUAL)

O usuário passa a existir como entidade híbrida:

```json
{
  id,
  fullName,
  userName,
  phone,
  email,
  role: "guest | user | admin"
}
```

Mas com uma distinção fundamental:

---

### 🧬 IDENTIDADE REAL (AUTH LAYER)

```
auth.users (Supabase)
```

---

### 🧾 IDENTIDADE RICA (APP LAYER)

```
public.users (Canguess)
```

---

Essas duas camadas coexistem, mas:

> apenas a camada Auth define quem o usuário é.

---

# 🔄 5. O MODELO DE LOGIN EM DUAS CAMADAS

O sistema adota definitivamente um modelo híbrido:

---

## 🧩 CAMADA 1 — IDENTIFICAÇÃO (NÃO É LOGIN)

O usuário pode digitar:

* user_name
* email
* telefone

O sistema faz apenas:

> “esse usuário existe no nosso universo?”

Se não existir:

```
❌ Usuário não encontrado
→ sugerir cadastro
```

---

## 🔐 CAMADA 2 — AUTENTICAÇÃO REAL

Se o usuário existir:

O sistema resolve automaticamente:

```
email real (interno)
+ password digitada
→ Supabase Auth
```

---

O usuário nunca precisa saber do email real.

Ele apenas interage com:

> identidade humana (username/telefone/email)

---

# 🧠 6. A GRANDE DECISÃO ARQUITETURAL

Foi aqui que o sistema mudou de verdade:

> O usuário não autentica pelo que ele digita.
> Ele autentica pelo que o sistema já sabe sobre ele.

---

Isso resolve:

* UX ruim de email
* fricção de login
* dependência cognitiva de “@”
* erro humano de input

---

# 📱 7. EVOLUÇÃO PARA UX HUMANA (NÃO TÉCNICA)

O login passa a aceitar:

* “jucabala”
* “Zebangu”
* “maninho77”
* telefone puro
* email opcional

Mas internamente:

> tudo converge para Supabase Auth.

---

# ⚠️ 8. A FRAGILIDADE HISTÓRICA QUE ORIGINOU ESSA DECISÃO

O sistema teve um problema recorrente:

* dados divergentes entre `users` e `auth.users`
* registros incompletos
* usuários criados parcialmente
* inconsistência entre login e persistência

Isso levou a uma regra implícita:

> Auth não pode depender de dados que podem estar inconsistentes.

---

# 🔐 9. O CASO DO EMAIL “FANTASMA”

Como Supabase Auth exige email:

O sistema adota estratégia pragmática:

Se o usuário não tiver email real:

```
[firstblock_of_id]@canguess.fail
```

ou

```
[firstblock_of_id]@canguess.com.br
```

---

## 🧠 INTENÇÃO

Não é comunicação.

Não é envio.

Não é marketing.

É apenas:

> garantir compatibilidade com o Auth sem exigir dados reais imediatos.

---

# 🔁 10. EVOLUÇÃO DO USER SERVICE

A camada `users` deixa de ser auth.

Ela passa a ser:

> repositório de identidade expandida

---

Antes:

* user era login
* user era autenticação

Agora:

* user é perfil
* auth é identidade real

---

# 🌐 11. SESSION COMO REALIDADE ATIVA

A sessão deixa de ser simples login state.

Ela passa a representar:

```
QUEM o usuário é
ONDE ele está no sistema
O QUE ele está vendo
EM QUAL CONTEXTO ele está operando
```

---

Estrutura futura da sessão:

```json
{
  user: auth.uid(),
  profile: users,
  workspace: "canguess_default",
  event: "active_event",
  role: "user",
  context: {
    ranking: true,
    predictions: true
  }
}
```

---

# 🧭 12. WORKSPACE COMO CAMADA DE REALIDADE

O sistema deixa de ser:

> navegação por páginas

e passa a ser:

> navegação por contextos

---

## Antes:

```
/ranking
/palpites
/login
```

---

## Agora:

```
workspace → event → ranking/palpites/admin
```

---

# ⚠️ 13. CONSEQUÊNCIA DIRETA

A mesma página pode ter comportamentos diferentes:

dependendo de:

* workspace ativo
* evento ativo
* sessão ativa

---

# 🧠 14. O LOGIN DEIXA DE SER UMA TELA

Login não é mais um destino.

Login é apenas:

> o início da definição de contexto do usuário

---

# 🔐 15. REGRA FINAL DA ARQUITETURA DE AUTENTICAÇÃO

### ✔ SEMPRE:

* `auth.uid()` = identidade real
* `users` = extensão da identidade
* login = ponte entre humano e auth
* username/email/telefone = apenas indexadores de busca

---

# 🚀 16. ESTADO ATUAL DO SISTEMA

Hoje o sistema está dividido em 4 pilares:

---

## 1. IDENTIDADE (AUTH)

Supabase Auth

---

## 2. PERFIL (USERS)

Dados humanos expandidos

---

## 3. CONTEXTO (WORKSPACE + EVENT)

Define o universo ativo

---

## 4. EXPERIÊNCIA (FRONTEND)

Interface reativa ao contexto

---

# 🧠 CONCLUSÃO

O Canguess deixou de ser:

> um sistema de login e apostas

e passou a ser:

> um sistema de identidade + contexto + experiência

---

A mudança mais importante desta fase não foi técnica.

Foi conceitual:

> o usuário não entra no sistema
> o usuário entra em um contexto vivo do sistema

---

Se quiser, o próximo passo natural agora é:

### 🔐 “Construir o AuthContext real (Sofia-like)”

com:

* sessão global
* workspace ativo
* event ativo
* role
* proteção de rotas (guest vs user)
* middleware de bloqueio de ranking/palpites

E aí sim você começa a eliminar de vez as “telas brancas sem saída” que você mencionou no início.

