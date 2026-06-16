Perfeito. Fiz uma versão mais rigorosa. A principal mudança em relação ao prompt anterior é que agora o agente recebe **três papéis simultâneos**:

1. **Arquiteto investigador** → entende o sistema.
2. **Documentador histórico** → registra evolução, causas e consequências.
3. **Operador de continuidade** → deixa tudo persistido para o próximo agente.

Também deixei explícito que **o trabalho não termina enquanto não houver arquivos dentro do repositório e rastreáveis pelo Git**.

Segue o prompt de missão:

---

# 📡 MISSÃO — CANGUESS SYSTEM FLOW MAPPER

## Arquitetura, Observabilidade e Memória Evolutiva do Sistema

---

## CONTEXTO DA MISSÃO

Você está assumindo uma missão arquitetural dentro do projeto Canguess.

Sua função não é apenas analisar arquivos.

Você deve construir uma camada permanente de **memória arquitetural do sistema**, capaz de explicar:

* como o sistema funciona hoje;
* como ele chegou neste estado;
* quais decisões foram tomadas;
* quais problemas surgiram;
* quais caminhos de evolução são recomendados.

O resultado desta missão deve permanecer dentro do repositório.

Outro agente, assumindo posteriormente sem qualquer contexto externo, deve conseguir continuar o trabalho apenas lendo os artefatos produzidos.

---

# 🎯 OBJETIVO PRINCIPAL

Construir o:

# CANGUESS SYSTEM FLOW MAPPER

Um sistema de análise arquitetural capaz de transformar o código em uma representação viva de:

* rotas;
* fluxos de navegação;
* dependências;
* layouts;
* componentes;
* estados;
* divergências arquiteturais.

O objetivo não é gerar uma lista de arquivos.

O objetivo é compreender o sistema como uma experiência operacional do usuário.

---

# 🧠 PRINCÍPIO CENTRAL

O código é a fonte da verdade.

Porém:

O código mostra **o que existe**.

O Flow Mapper deve explicar:

* por que existe;
* como se conecta;
* onde existem conflitos;
* onde existe evolução incompleta.

---

# 📁 LOCAL DA MISSÃO

Todos os artefatos desta missão devem existir dentro de:

```
ops/flow-mapper/
```

Caso o diretório não exista:

CRIAR.

A estrutura inicial esperada:

```
ops/

└── flow-mapper/

    ├── README.md

    ├── core/
    │
    ├── output/
    │
    ├── reports/
    │   └── diagrams/
    │
    ├── history/
    │
    └── state/
```

Você possui liberdade para criar novos diretórios caso identifique necessidade de organização.

Toda nova estrutura criada deve ser explicada no relatório.

---

# 🏺 PRINCÍPIO DE MEMÓRIA ARQUEOLÓGICA

Este projeto NÃO utiliza relatórios descartáveis.

Cada análise representa uma fotografia do sistema naquele momento.

Portanto:

## NUNCA:

* apagar relatórios antigos;
* sobrescrever histórico;
* substituir análises anteriores.

## SEMPRE:

* versionar;
* preservar;
* comparar;
* registrar evolução.

---

# 📚 SISTEMA DE VERSIONAMENTO HISTÓRICO

A cada execução:

Criar uma pasta:

```
history/
    YYYY-MM-DD_nome_da_execucao/
```

Exemplo:

```
history/

    2026-06-16_initial_mapping/

        SYSTEM_FLOW_REPORT.md

        system_flow.json

        system_dependencies.json

        diagrams/
```

---

O relatório consolidado atual permanece em:

```
reports/SYSTEM_FLOW_REPORT.md
```

Ele deve sempre representar:

"O estado atual conhecido do sistema"

Enquanto:

```
history/
```

representa:

"Como chegamos até aqui"

---

# 🔍 ÁREAS OBRIGATÓRIAS DE ANÁLISE

Analise:

```
frontend/src/routes/

frontend/src/pages/

frontend/src/pages/admin/

frontend/src/components/

frontend/src/layout/
```

Procure também:

* Route
* Routes
* Link
* NavLink
* navigate()
* useNavigate()
* redirects
* guards
* layouts

---

# 🧭 ANÁLISE DE FLUXOS

Mapear:

## Fluxos públicos

Exemplo:

```
Home

 |
 +-- Ranking

 |
 +-- Palpites

 |
 +-- Login
```

---

## Fluxos administrativos

Exemplo:

```
Admin Login

      ↓

Admin Dashboard

      ↓

Cadastros

      ↓

Eventos
```

---

## Fluxos quebrados

Identificar:

* links sem rota;
* rotas sem origem;
* páginas inacessíveis;
* caminhos abandonados.

---

# 🔗 ANÁLISE DE DEPENDÊNCIAS

Criar mapa:

```
Página

 ↓

Componentes

 ↓

Layouts

 ↓

Rotas
```

Identificar:

* componentes compartilhados;
* duplicações;
* versões antigas;
* estruturas concorrentes.

---

# ⚠️ CLASSIFICAÇÃO DOS PROBLEMAS

Toda inconsistência deve ser classificada:

---

## DRIFT

Quando intenção e implementação divergem.

Exemplo:

Botão aponta para uma rota inexistente.

---

## ÓRFÃO

Quando algo existe mas não possui caminho de acesso.

Exemplo:

Página criada mas sem link.

---

## REDUNDÂNCIA

Quando existem múltiplas versões da mesma função.

Exemplo:

Dois AdminLogin.jsx.

---

## BLOQUEIO

Quando impede evolução futura.

Exemplo:

Layout incompatível.

---

# 📦 ARTEFATOS OBRIGATÓRIOS

Ao final da missão devem existir:

---

## 1. Documento operacional

```
ops/flow-mapper/README.md
```

Explicando:

* objetivo;
* funcionamento;
* regras para próximos agentes.

---

## 2. Grafo estruturado

```
ops/flow-mapper/output/system_flow.json
```

Contendo:

* nodes;
* edges;
* rotas;
* componentes;
* problemas encontrados.

---

## 3. Mapa de dependências

```
ops/flow-mapper/output/system_dependencies.json
```

---

## 4. Estado atual

```
ops/flow-mapper/state/state.json
```

Informando:

* data;
* versão;
* arquivos analisados;
* limitações;
* próximos passos.

---

## 5. Relatório arquitetural

```
ops/flow-mapper/reports/SYSTEM_FLOW_REPORT.md
```

Este é o documento principal.

Ele NÃO deve ser apenas técnico.

Ele deve ser narrativo.

Deve conter:

---

# Visão geral

Como o sistema está organizado.

---

# Evolução percebida

O que parece ter acontecido durante o desenvolvimento.

Exemplo:

* criação inicial;
* migração administrativa;
* surgimento de duplicidades;
* tentativas de reorganização.

---

# Estado atual

Como o sistema funciona hoje.

---

# Problemas encontrados

Separados por:

* drift;
* órfãos;
* redundâncias;
* bloqueios.

---

# Recomendações

Com:

* causa;
* impacto;
* possível solução.

---

# Histórico de versões

Exemplo:

```
v1.0

Primeiro mapeamento.

Estado encontrado:

- rotas X
- divergência Y


v1.1

Após migração AppShell:

Alterações:

- Header centralizado
- BottomNav consolidado

Impacto:

- redução de duplicidade
```

---

# 6. Representação visual

Criar:

```
ops/flow-mapper/reports/diagrams/
```

Com:

* PNG;
* SVG;
* Mermaid;
* ou formato equivalente.

O objetivo é permitir entendimento visual rápido.

---

# 🔁 PROTOCOLO PARA PRÓXIMOS AGENTES

Antes de iniciar qualquer análise futura:

LER:

```
ops/flow-mapper/README.md

ops/flow-mapper/state/state.json

ops/flow-mapper/reports/SYSTEM_FLOW_REPORT.md
```

Depois:

1. comparar com histórico anterior;
2. identificar mudanças;
3. criar nova versão;
4. atualizar documentação.

Nunca iniciar do zero.

---

# 🚨 ETAPA FINAL OBRIGATÓRIA

Antes de declarar missão concluída:

Confirmar:

[ ] diretórios criados no repositório
[ ] arquivos persistidos
[ ] artefatos dentro de ops/flow-mapper
[ ] histórico criado
[ ] relatório atualizado
[ ] próximo agente consegue continuar

Se qualquer arquivo existir apenas em memória temporária ou sandbox:

COPIAR PARA O REPOSITÓRIO.

A missão NÃO está concluída sem persistência física.

---

# RESULTADO ESPERADO

Ao final desta missão o Canguess deverá possuir:

Uma sala de comando arquitetural onde qualquer agente consiga responder:

* Onde estou?
* Como cheguei aqui?
* O que está quebrado?
* Qual o próximo passo?
* Quais decisões anteriores levaram ao estado atual?

O Flow Mapper deve se tornar a memória evolutiva permanente do projeto.

---

Este é o prompt que eu usaria agora com o próximo agente. Ele deve produzir algo muito mais próximo daquele primeiro relatório rico, mas sem repetir o problema de perder os artefatos.
