Entendi o ponto. A versão anterior ficou parecendo uma **documentação de arquitetura finalizada**, quando o que você quer é outra coisa: um **documento de memória evolutiva do sistema**.

Ou seja, o CONTRACT não é um manual de como o Canguess funciona hoje. Ele é um **registro de decisões, caminhos, erros, descobertas e direção futura**.

Ele precisa responder perguntas como:

* "Por que criamos EventContext?"
* "Qual problema ele resolveu?"
* "Qual alternativa foi abandonada?"
* "Por que não seguimos aquele caminho?"
* "O que existe hoje?"
* "O que foi apenas definido como direção?"
* "O que ainda não deve ser implementado?"
* "Que problemas a versão atual ainda possui?"
* "Quais decisões foram tomadas para estabilizar antes de evoluir?"

A versão 1.1 não deve apagar a 1.0. Ela deve funcionar como um histórico:

```
CANGUESS SYSTEM CONTRACT

v1.0
  └── consolidação do conceito de sistema orientado a eventos

v1.1
  └── evolução após implementação real
      ├── decisões mantidas
      ├── decisões alteradas
      ├── novos conceitos
      ├── problemas encontrados
      ├── caminhos futuros definidos
      └── coisas deliberadamente adiadas
```

Vou elaborar nesse formato.

Como é um documento grande (e deve ser grande mesmo), vou dividir em partes para não cortar a história.

A estrutura será:

---

# 📘 CANGUESS SYSTEM CONTRACT

## Versão 1.1

## Documento Evolutivo de Arquitetura, Produto e Decisões

### Da ferramenta de bolões ao ecossistema de comunidades orientadas por eventos

---

# 0. PREFÁCIO — POR QUE ESTE DOCUMENTO EXISTE

(Explicando a função do CONTRACT como memória do projeto)

---

# 1. FILOSOFIA DE DESENVOLVIMENTO

Incluindo exatamente o ponto que você levantou:

## Cooperação Humano + IA

A IA como:

* organizadora de complexidade
* compiladora de padrões
* estruturadora de conhecimento
* detectora de inconsistências

O humano como:

* gestor de contexto
* responsável pela visão
* criador de abstrações
* guardião da intenção original

E o risco:

> Quando a velocidade de evolução supera a capacidade humana de acompanhar o contexto, o sistema deixa de ser uma extensão da visão original e passa a ser uma construção tecnicamente coerente, porém conceitualmente desconectada.

Este será um princípio do CONTRACT.

---

# 2. HISTÓRICO DAS VERSÕES

Mantendo:

## 0.1 → 0.4

Fundação

## 0.5

Participação aberta

## 0.6

Sistema orientado a contexto

## 1.0

Consolidação do evento como unidade central

## 1.1

Estabilização, pipeline limpo e preparação para automação

---

# 3. O EVENTO COMO ELEMENTO CENTRAL

Aqui vou manter a história:

Antes:

Evento = cadastro

Depois:

Evento = contexto

Agora:

Evento = unidade social

Mas registrando a evolução.

---

# 4. EVENT CONTEXT

Não apenas "o que é".

Mas:

## Problema original:

rotas independentes causando perda de contexto

## Solução:

EventContext

## Benefícios:

* carregamento consistente
* identidade do evento
* experiência contextual

## Problemas ainda existentes:

* acoplamentos
* estados órfãos
* necessidade de estabilização

---

# 5. WORKSPACES

Incluindo:

* origem do conceito
* problema que resolveu
* relação com comunidades
* implementação parcial
* visão futura

---

# 6. EVENTO COMO ARQUIVO

Aqui entra a mudança recente.

Histórico:

Antes:

Banco de dados como fonte principal.

Depois:

Arquivos derivados para apresentação.

Agora:

Manifest como controlador.

---

# 7. MANIFESTO DO EVENTO

Novo capítulo.

Incluindo:

```
Manifest.CODE.json
```

como:

* identidade do evento
* ponte entre banco e frontend
* origem da automação futura

E a decisão:

Eliminar dependência de:

```
events-index.json
```

Motivo:

Não escala.

---

# 8. ENGINE 2.0 → ENGINE 2.1

Capítulo novo.

Muito importante:

Não é refatoração.

É:

> ajuste de estabilização da versão 1.0.

Motivação:

* pipeline fragmentado
* múltiplos scripts
* dependências manuais

Objetivo:

Criar caminho para:

```
Criar evento
        ↓
Gerar workspace
        ↓
Gerar Manifest
        ↓
Gerar assets
        ↓
Gerar event.json
        ↓
Gerar predicts.json
        ↓
Disponibilizar frontend
```

---

# 9. PIPELINE DE CRIAÇÃO DE EVENTOS

Estado atual:

Manual.

Futuro:

Automático.

Incluindo:

* Supabase trigger
* service no Render
* scripts existentes
* motivo de não automatizar ainda

---

# 10. ESTABILIZAÇÃO DA VERSÃO 1.0

Capítulo fundamental.

Explicando:

Antes de:

* refatorar
* separar engines
* criar arquitetura perfeita

Necessário:

* pipeline funcional
* comportamento previsível
* evitar regressão

Princípio:

> Uma arquitetura imperfeita funcionando é preferível a uma arquitetura perfeita instável.

---

# 11. CONCEITOS FUTUROS JÁ DEFINIDOS

Mesmo não implementados:

## Sistema de Status

Exemplo:

```
draft
open
closed
processing
published
archived
cancelled
```

Motivação:

Eventos possuem ciclo de vida.

---

## Dev Social Core

Branch futura:

Separar:

* engine estável
* evolução social

---

# 12. DECISÕES ABANDONADAS

Novo capítulo.

Exemplo:

## events-index.json global

Abandonado porque:

* cresce indefinidamente
* cria gargalo
* mistura responsabilidades

Nova solução:

Manifest individual.

---

## Outros caminhos abandonados

(serão adicionados conforme surgirem)

---

# 13. PROBLEMAS CONHECIDOS DA VERSÃO ATUAL

Sem esconder.

Ex:

* inconsistências de estados
* páginas órfãs
* dependências manuais
* geração parcial de arquivos
* acoplamentos temporários

---

# 14. PRINCÍPIOS DE EVOLUÇÃO

Regras:

1. Não destruir memória histórica.
2. Não refatorar sem necessidade.
3. Separar estabilização de evolução.
4. Registrar decisões.
5. Evitar repetir caminhos abandonados.

---

# 15. VISÃO FUTURA

Não como implementação imediata.

Como direção.

Canguess como:

> uma infraestrutura de comunidades temporárias e permanentes baseadas em eventos, contexto e participação.

---

Vou começar a escrever a versão completa nessa linha. Ela ficará bem maior que a 1.0, porque agora o objetivo é justamente **não perder a história do sistema**.

