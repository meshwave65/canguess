# Canguess System Flow Mapper

## Objetivo
O **Canguess System Flow Mapper** é uma ferramenta de observabilidade arquitetural projetada para mapear, documentar e monitorar a evolução dos fluxos de navegação e dependências do projeto Canguess. Ele transforma o código-fonte em uma representação viva da arquitetura do sistema.

## Funcionamento
O sistema opera através de análise estática do código-fonte frontend, identificando:
- Definições de rotas (`react-router-dom`).
- Gatilhos de navegação (`Link`, `useNavigate`).
- Guards de autenticação e Layouts.
- Inconsistências (Drifts, Órfãos, Redundâncias).

## Estrutura de Diretórios
- `/core/`: Scripts de extração e análise.
- `/output/`: Dados estruturados (JSON) do grafo e dependências.
- `/reports/`: Relatórios narrativos e diagramas visuais.
- `/state/`: Estado atual da última análise para continuidade.
- `/history/`: Registro histórico de todas as execuções anteriores.

## Regras para Próximos Agentes
1. **Nunca sobrescrever**: Use o sistema de versionamento histórico em `/history/`.
2. **Código é a Verdade**: Sempre valide as descobertas contra o código-fonte atual.
3. **Persistência**: Garanta que todos os artefatos sejam commitados no repositório GitHub.
4. **Continuidade**: Leia o `state/state.json` e o último `SYSTEM_FLOW_REPORT.md` antes de iniciar.
5. **Protocolo de Missão**: Procure por arquivos `.md` na raiz de `/ops/`, execute a missão e renomeie para `.done` ao finalizar.
