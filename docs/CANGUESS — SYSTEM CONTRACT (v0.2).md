Perfeito. Vou estruturar como uma **nova versão evolutiva do SYSTEM CONTRACT**, não substituindo o anterior.

A decisão que eu registraria é:

* **SYSTEM CONTRACT v0.1** continua sendo a origem histórica.
* Este documento passa a ser uma **evolução v0.2**, incorporando as decisões amadurecidas durante a implementação do MVP.
* Não vamos apagar as contradições antigas; vamos documentar **por que elas existiram e por que foram superadas**.

Isso é importante porque o problema que estamos corrigindo agora nasceu exatamente de uma dívida técnica documentada: arrays hardcoded foram aceitos como solução temporária para validar fluxo, mas nunca foram arquitetura definitiva.

Segue o documento.

---

# 📘 MESHWAVE / CANGUESS — SYSTEM CONTRACT

# Versão 0.2 — Arquitetura Evolutiva de Eventos, Agentes e Engines

## Status

**Tipo:** Documento vivo de arquitetura e domínio

**Objetivo:**

Manter a coerência conceitual, técnica e operacional do sistema durante sua evolução.

Este documento deve ser utilizado como:

* memória externa do projeto;
* referência para decisões futuras;
* mecanismo contra drift conceitual;
* registro histórico das decisões arquiteturais;
* guia para novos desenvolvedores ou agentes envolvidos no sistema.

---

# 🧭 1. Contexto do Sistema

O Canguess iniciou como um sistema de bolão esportivo.

O MVP validou:

* cadastro de eventos;
* cadastro de usuários;
* registro de palpites;
* montagem de mapas;
* cálculo inicial de pontuação;
* ranking.

Durante a evolução, foi identificado que o bolão é apenas uma aplicação específica de um modelo maior:

> Uma plataforma de interpretação de eventos reais através de agentes, partes observáveis e engines especializadas.

Portanto:

O bolão não é o sistema.

O bolão é uma engine aplicada sobre um tipo específico de evento.

---

# 🧗 2. Princípio da Escalada

## Diretriz de evolução

> A visão define o topo da montanha. A implementação acontece pelo próximo passo seguro.

O sistema deve evoluir evitando:

* reescritas prematuras;
* abandono de funcionalidades estáveis;
* mudanças arquiteturais sem necessidade imediata;
* expansão fora do objetivo atual.

Toda alteração deve responder:

1. Qual problema atual resolve?
2. Qual dívida técnica reduz?
3. Mantém o MVP funcionando?
4. Aproxima a arquitetura definitiva?

---

# 🎯 3. Objetivo Atual da Fase

## Fase: Eliminação de dívida técnica do MVP

O foco atual é:

## 3.1 Corrigir drift entre Ranking e Mapa

Problema identificado:

As telas utilizavam arrays independentes:

```javascript
const jogos = [
 {a:"QAT", b:"SUI"},
 {a:"BRA", b:"MAR"}
]
```

Esses arrays eram mantidos manualmente.

Consequência:

A posição visual poderia não representar o evento real.

Exemplo:

Banco:

```
game_index 1
QAT x SUI
```

Tela:

```
coluna 1
BRA x MAR
```

Resultado:

* usuário visualiza um jogo;
* sistema calcula outro;
* ranking apresenta informação incorreta.

---

## Regra definitiva:

Nenhuma tela pode possuir conhecimento próprio da estrutura do evento.

A estrutura deve sempre derivar do banco.

---

# 🏗️ 4. Modelo Canônico de Dados

A cadeia oficial passa a ser:

```
EVENT
 |
 |
 EVENT_PHASE
 |
 |
 EVENT_ROUND
 |
 |
 EVENT_PART
 |
 |
 ENGINE
 |
 |
 RESULT
```

---

# 🌎 5. Evento

Tabela:

```
events
```

Representa a unidade principal.

Exemplos:

* Copa do Mundo;
* Eleição;
* Campeonato;
* Cotação;
* Pesquisa.

Campos conceituais:

```
event.id
event.name
event.type
event.ruleset
event.engine
```

---

# 🧩 6. Event Phase

Representa uma divisão lógica do evento.

Exemplo futebol:

```
Copa
 |
 fase grupos
 |
 oitavas
 |
 quartas
```

Relacionamento:

```
event_phases.event_uuid
        |
        ↓
events.id
```

---

# ⚽ 7. Event Round

Representa a unidade onde ocorre uma aferição.

Exemplo:

```
Round 1

Brasil x Marrocos
```

ou:

```
Round 5

Candidato A x Candidato B
```

Cada round possui identidade própria:

```
event_rounds.id
```

Essa UUID é a referência oficial.

---

# 🧱 8. Event Part

## Conceito fundamental

Event Part representa uma parte observável do resultado real.

Exemplo futebol:

Round:

```
BRA x MAR
```

Parts:

```
Part A

agent = BRA
value = 2


Part B

agent = MAR
value = 1
```

Resultado:

```
2 x 1
```

---

## Regra:

Event Part é a fonte da verdade.

Nenhuma UI calcula resultado real.

---

# 🧠 9. Engine

A engine interpreta partes.

Entrada:

```
event_parts
```

Processamento:

```
value A
value B
```

Saída:

```
canonical_result
```

Exemplo futebol:

```
2 x 1

A > B

resultado = 1
```

---

Tabela conceitual:

```
event_parts

value_a
value_b


ENGINE

↓


result

1
X
2
```

---

# ⚙️ 10. Engines

As engines ficam isoladas em módulo próprio.

Estrutura futura:

```
/engines

   /football

      matchEngine.js


   /election

      voteEngine.js


   /market

      priceEngine.js
```

---

## Regra de segurança

O diretório engines:

* não é acessado diretamente pelo frontend;
* não expõe credenciais;
* não possui lógica de interface;
* não deve ser importado por páginas públicas.

Responsabilidade:

interpretar dados.

---

# 🔒 11. Separação de responsabilidades

## Frontend

Responsável por:

* apresentação;
* interação;
* consumo de resultados.

Não deve:

* calcular vencedor;
* determinar pontuação;
* interpretar regra.

---

## Engine

Responsável por:

* cálculo;
* normalização;
* aplicação de regras.

Não conhece:

* usuário;
* tela;
* componente React.

---

## Banco

Responsável por:

* estado persistente;
* estrutura do evento;
* histórico.

---

# 📝 12. Prediction

Palpite do usuário.

Relacionamento:

```
user

↓

event_round

↓

prediction
```

---

Exemplo:

Usuário:

```
João
```

Round:

```
BRA x MAR
```

Prediction:

```
1
```

---

# 🎲 13. Tratamento de palpites incompletos

Regra de domínio:

O usuário deve possuir participação completa.

Porém o sistema protege contra ausência.

---

## Eventos discretos:

Exemplo:

Futebol:

```
1
X
2
```

Fallback:

definido pela engine.

Possibilidades:

* random controlado;
* escolha padrão;
* regra específica.

---

## Eventos contínuos:

Exemplo:

* público;
* votação;
* cotação.

Fallback:

baseado em:

* histórico;
* média;
* mediana;
* distribuição estatística.

---

# 🏆 14. Ranking

Ranking nunca calcula diretamente.

Fluxo:

```
event_parts

↓

engine

↓

canonical_result

↓

comparação prediction

↓

score

↓

ranking
```

---

Regra:

```
prediction == result

+

1 ponto
```

---

# ⚽ 15. Representação Visual

A UI deve mostrar:

Resultado:

```
2 x 1
```

Palpite correto:

```
⚽
```

Palpite errado:

```
1
```

Sem resultado:

```
- x -
```

---

# 🧭 16. Arrays de Frontend

## Regra antiga (MVP)

Arrays hardcoded foram aceitos:

```javascript
const jogos=[]
```

Motivo:

* validar fluxo;
* acelerar desenvolvimento;
* testar conceito.

---

## Regra nova

Arrays podem existir somente como:

* estado temporário;
* transformação de dados;
* cache de renderização.

Nunca como fonte da verdade.

---

Fluxo correto:

Banco:

```
event_rounds
+
event_parts
```

↓

Frontend:

```
jogos[]
```

↓

Renderização.

---

# 🚧 17. Próximos passos imediatos

## Passo 1

Criar função de montagem dos jogos:

Entrada:

```
event_rounds
event_parts
```

Saída:

```javascript
[
 {
   round_uuid,
   a:"QAT",
   b:"SUI",
   valueA:null,
   valueB:null,
   placar:"- x -",
   result:null
 }
]
```

---

## Passo 2

Substituir arrays hardcoded:

Ranking

↓

Banco

Mapa de Palpites

↓

Banco

---

## Passo 3

Criar engine inicial:

```
football_result_engine
```

Responsável por:

```
valueA
valueB

↓

1/X/2
```

---

## Passo 4

Consolidar ranking usando a mesma fonte do mapa.

Resultado esperado:

O mesmo round UUID gera:

* mesma coluna;
* mesmo jogo;
* mesmo resultado;
* mesma pontuação.

---

# 📌 Estado atual

O MVP está funcional.

As próximas alterações não são uma reconstrução.

São uma migração gradual:

```
MVP funcional

        ↓

remoção de gambiarras

        ↓

arquitetura definitiva
```

---

**Fim do documento — MESHWAVE/CANGUESS SYSTEM CONTRACT v0.2**

---

Esse documento agora representa exatamente o momento em que estamos: não é mais "projetar o sistema"; é **tirar o MVP da fase artesanal e colocá-lo nos trilhos da arquitetura que já estava prevista**.

Próximo passo de código: eu atacaria primeiro o **MapaPalpites**, porque ele é administrativo e permite validar a nova montagem de rounds sem mexer imediatamente na tela pública de Ranking. Depois Ranking simplesmente consome a mesma estrutura.

