Perfeito — agora sim você está no ponto certo: **antes de código, alinhar o cérebro do sistema**.

Vou fazer exatamente o que você pediu aqui:

✔ atualizar a documentação
✔ com narrativa histórica (não técnica seca)
✔ incluindo o estado atual + evolução + lógica de sessão/workspace
✔ sem cortar contexto
✔ mantendo o “espírito Sofia/Canguess” que você descreveu

📘 CANGUESS SYSTEM
Versão 0.5
A ERA DA PARTICIPAÇÃO, IDENTIDADE E CONTEXTO
🧭 0. PREFÁCIO — O SISTEMA COMO ORGANISMO EM EVOLUÇÃO

O Canguess deixou de ser apenas uma aplicação de palpites.

Durante sua construção, cada camada surgiu de uma necessidade real:

primeiro a necessidade de registrar palpites;
depois organizar eventos;
depois criar engines de processamento;
depois permitir múltiplos ambientes;
depois resolver identidade;
finalmente compreender que participação e identidade são conceitos diferentes.

Este documento registra o momento atual do sistema.

Não é apenas uma especificação técnica.

É a história de como o sistema evoluiu até seu estado atual.

📌 1. HISTÓRICO DAS VERSÕES
Versão 0.1

Nascimento do conceito.

Objetivo inicial:

Permitir que pessoas participem de desafios de previsão e palpites.

A ideia central:

evento;
participantes;
palpites;
resultado;
ranking.
Versão 0.2

Primeira organização estrutural.

Surgem:

eventos;
rounds;
registros de palpites;
primeiros conceitos de engine.

O sistema deixa de ser apenas uma tela de apostas e passa a possuir uma lógica própria de processamento.

Versão 0.3

Separação entre:

Frontend

Responsável por:

experiência do usuário;
coleta dos palpites;
apresentação.
Engine

Responsável por:

processamento;
cálculo;
ranking;
regras específicas.

O Canguess começa a se aproximar de uma plataforma.

Versão 0.4
A ERA DA IDENTIDADE E CONTEXTO

Nesta versão ocorreu a primeira grande mudança conceitual.

O sistema percebeu que o problema principal não era apenas registrar palpites.

Era saber:

quem está participando, em qual contexto e em qual universo operacional.

Foram estabelecidos conceitos:

identidade;
autenticação;
usuário;
sessão;
workspace;
evento ativo.
Versão 0.5 (Atual)
A ERA DA PARTICIPAÇÃO

A principal descoberta desta fase:

Nem todo participante é um usuário.

O sistema passa a separar:

IDENTIDADE
+
PARTICIPAÇÃO
🧠 2. O PRINCÍPIO FUNDAMENTAL

Antes:

Participante = Usuário

Agora:

Participante pode ser:

Usuário autenticado
ou
Guest
ou
futuras categorias

Esta mudança permite que o sistema cresça sem transformar toda participação em cadastro permanente.

🧩 3. IDENTIDADE REAL

Existem agora dois universos:

Usuário real

Tabela:

public.users

Representa:

pessoas cadastradas;
usuários recorrentes;
identidade permanente.

Possui ligação futura com:

auth.users
Guest

Tabela:

public.guest_users

Representa:

participantes ocasionais;
pessoas que receberam um convite;
usuários que apenas querem palpitar.
🔥 4. GUEST NÃO É UM USUÁRIO INCOMPLETO

Esta é uma mudança importante.

O guest não é:

um usuário sem cadastro.

Ele é:

uma modalidade própria de participação.

Características:

não possui autenticação;
não possui sessão persistente;
não entra em Supabase Auth;
não deve poluir users;
pode existir apenas pelo tempo necessário ao evento.
🧾 5. MODELO GUEST_USERS

Tabela:

guest_users

Estrutura:

id uuid
full_name text
user_name text
phone text
email text
created_at timestamp
status text

Exemplo:

{
 "id":"9c1cfdb6...",
 "full_name":"CanGuest",
 "user_name":"user_9c1cf",
 "phone":"6655449988",
 "email":"guest_x82kd91a@canguess.fail",
 "status":"active"
}
🧠 6. CICLO DO GUEST

O fluxo é:

Usuário acessa evento
        |
        |
informa telefone
        |
        |
Sistema procura users
        |
        |
Existe?
        |
   SIM ---------> usa users.id
        |
        |
       NÃO
        |
        |
cria guest_users
        |
        |
usa guest_users.id

Cada participação guest gera um novo registro.

Não existe:

guest login
guest sessão
guest reaproveitado
📌 7. FILOSOFIA DO GUEST

O sistema aceita que:

uma pessoa pode participar hoje como guest;

amanhã participar novamente como guest;

e futuramente decidir criar uma conta real.

Nesse momento ocorre a migração:

guest
 |
 |
cadastro real
 |
 |
users
+
auth.users
🔐 8. AUTHENTICATION

O Supabase Auth continua sendo reservado para usuários reais.

Regra:

auth.users
=
identidade autenticada

Não existe:

guest_users → auth.users

O guest participa.

O usuário autentica.

🧠 9. USERS NÃO É MAIS PARTICIPAÇÃO

Antes:

users
 |
 + login
 + perfil
 + participação

Agora:

auth.users
 |
 identidade

users
 |
 perfil

guest_users
 |
 participação temporária
🚀 10. PREDICTS COMO CAMADA UNIVERSAL

A tabela:

predicts

não representa usuários.

Ela representa:

participantes realizando previsões.

Estrutura:

predicts

event_uuid
user_uuid
round_uuid
prediction
status
created_at

O campo:

user_uuid

passa a representar:

identidade do participante dentro daquele contexto.

A engine não deve assumir:

user_uuid = users.id

A resolução deve acontecer no serviço responsável.

🧠 11. RESOLUÇÃO DE PARTICIPANTE

A lógica passa a ser:

recebe participant_id

        |
        |

procura segmento

        |
        |

users?

        |
        |

guest_users?

        |
        |

outros segmentos futuros?

A engine continua independente.

Ela não precisa saber se o participante é:

usuário;
guest;
teste;
parceiro.



🌐 12. WORKSPACE COMO CAMADA DE REALIDADE

O conceito de workspace deixa de ser apenas uma divisão administrativa.

Ele passa a representar um ambiente operacional ativo.

O Canguess deixa de pensar em páginas isoladas e passa a pensar em:

WORKSPACE
    ↓
EVENTO
    ↓
AÇÃO DO USUÁRIO
    ↓
RESULTADO
Antes

O usuário navegava buscando funcionalidades:

/ranking

/palpites

/eventos

/login
Agora

O usuário entra em um contexto:

workspace:
    Bolão do Zé

evento:
    Final do Campeonato

ações:
    palpitar
    acompanhar ranking
    compartilhar

A página deixa de ser o centro da experiência.

O centro passa a ser:

o contexto onde o usuário está inserido.

🎯 13. O EVENTO COMO PORTA DE ENTRADA PRINCIPAL

Durante a evolução do sistema surgiu uma percepção importante:

O usuário provavelmente não irá navegar procurando eventos.

O comportamento real será:

amigo envia link
        ↓
QR Code
        ↓
código do evento
        ↓
usuário entra diretamente
        ↓
faz o palpite

Portanto o fluxo principal deixa de ser:

Entrar → Procurar evento → Escolher → Participar

e passa a ser:

Receber convite → Abrir evento → Participar

Isso muda uma decisão importante:

O evento deixa de ser um objeto secundário.

Ele passa a ser:

a porta principal de entrada no sistema.

📱 14. O USUÁRIO GUEST COMO PARTICIPANTE VÁLIDO

A criação do conceito guest_users resolve uma questão fundamental.

Nem todo participante precisa imediatamente ser um usuário autenticado.

O sistema passa a reconhecer dois universos:

Usuário real

Tabela:

users

Características:

possui identidade permanente
pode autenticar
possui conta Supabase Auth
pode acessar histórico
pode receber recursos personalizados
Usuário convidado

Tabela:

guest_users

Características:

identidade temporária
criada durante participação
não possui Auth
não possui senha
não representa uma conta definitiva

O guest não é um erro.

Ele é um estado natural de entrada no sistema.

🧩 15. A REGRA DO GUEST

O guest possui uma regra clara:

Um guest nunca é autenticado.

Ele pode:

✔ participar de evento
✔ enviar palpites
✔ aparecer em ranking
✔ gerar estatísticas

Mas não:

❌ possuir sessão permanente
❌ acessar área privada
❌ substituir um usuário real

O processo é:

Usuário chega como guest

        ↓

Sistema cria guest_users

        ↓

Participa do evento

        ↓

Se desejar:

converte para usuário real
🔄 16. CONVERSÃO FUTURA DE GUEST PARA USER

A existência de guest_users cria uma possibilidade estratégica.

O sistema passa a conhecer:

frequência de participação
quantidade de eventos
comportamento
recorrência
interesse

Um usuário que participa uma única vez permanece como guest.

Mas um usuário que:

participa de 10 eventos

+
volta frequentemente

+
usa sempre o mesmo telefone


pode receber uma abordagem:

"Você já participa bastante do CanGuess. Gostaria de criar sua conta e guardar seu histórico?"

A conversão deixa de ser uma barreira inicial.

Ela passa a ser uma evolução natural.









17. A DESCOBERTA DO USUÁRIO CONVIDADO (GUEST)

Durante a evolução do produto surgiu um comportamento que não se encaixava no modelo tradicional de usuários:

O usuário recebe um convite.

Ele:

escaneia um QR Code;
acessa diretamente um evento;
escolhe participar;
faz seu palpite;
acompanha o resultado.

Ele não quer:

criar conta;
escolher senha;
confirmar email;
preencher cadastro.

Ele quer apenas participar.

A conclusão foi:

Nem todo participante precisa ser imediatamente um usuário autenticado.

18. NASCE O CONCEITO DE GUEST USER

O sistema passa a reconhecer dois tipos distintos de participantes:

👤 Usuário Real

Tabela:

users

Características:

possui identidade permanente;
pode possuir autenticação;
pode acessar diversos eventos;
possui histórico completo;
pode receber benefícios e recursos futuros.
👥 Usuário Guest

Tabela:

guest_users

Características:

identidade temporária;
criada apenas para uma participação;
não possui autenticação;
não possui sessão persistente;
serve para vincular uma ação real dentro do sistema.
19. REGRA FUNDAMENTAL DO GUEST

Um guest não é um usuário incompleto.

Ele é uma categoria própria.

Portanto:

❌ errado:

users
   |
   +-- is_guest=true

Porque mistura:

identidade permanente;
identidade efêmera;
histórico;
marketing;
autenticação.

O modelo adotado:

users

guest_users

São entidades diferentes.

20. COMPORTAMENTO DO GUEST

O guest nasce quando:

usuário acessa evento;
informa telefone;
sistema procura usuário real;
usuário real não existe;
sistema cria guest_users.

Fluxo:

telefone informado

        |
        v

buscar users

        |
        |
    existe?
      / \
    sim  não
    |      |
    |      v
    |   criar guest_users
    |
    v

continuar aposta
21. O GUEST NÃO POSSUI LOGIN

Esta regra é importante:

Guest nunca gera:

auth.users

Não existe:

senha;
token;
sessão;
recuperação de conta.

O guest apenas representa:

alguém que realizou uma ação dentro do sistema.

22. IDENTIDADE GUEST

A tabela:

guest_users

possui:

id
full_name
user_name
phone
email
created_at
status

Exemplo:

{
"id":"9c1cfdb6-d95f-40b8-bb51-d942cc88f393",
"full_name":"CanGuest",
"user_name":"user_9c1cfdb6",
"phone":"6655449988",
"email":"guest_a83k92jd@canguess.fail",
"status":"active"
}
23. FALLBACKS AUTOMÁTICOS

Como o sistema precisa sempre apresentar uma identidade humana:

quando faltarem dados:

Nome

Entrada:

full_name vazio

Resultado:

CanGuest
Username

Entrada:

user_name vazio

Resultado:

user_[bloco inicial do id]

Exemplo:

user_9c1cfdb6
Email

Como campos futuros podem exigir compatibilidade:

gera:

guest_[8 caracteres aleatórios]@canguess.fail

Exemplo:

guest_a83k92jd@canguess.fail

Este email:

não é comunicado;
não é usado pelo usuário;
não representa contato.

É apenas um identificador técnico.

24. PREDICTS COMO CAMADA UNIVERSAL

A tabela:

predicts

não pertence a usuários.

Ela pertence às ações.

Ela registra:

evento
round
participante
predição
status
data

Estrutura:

predicts

id

event_uuid

user_uuid

round_uuid

prediction

status

created_at

updated_at
25. user_uuid COMO IDENTIFICADOR UNIVERSAL DE PARTICIPANTE

O campo:

predicts.user_uuid

não significa obrigatoriamente:

users.id

Ele significa:

identidade do participante que realizou a ação.

Hoje:

users.id

ou

guest_users.id

No futuro:

poderão existir:

test_users

partner_users

anonymous_users

campaign_users

A camada de serviço decide onde buscar.

26. RESOLUÇÃO DE IDENTIDADE

A decisão sobre origem do usuário não pertence ao banco.

Pertence ao serviço.

Exemplo conceitual:

recebe user_uuid

        |
        v

buscar em users

        |
        |
 encontrou?
     /     \
   sim      não
   |         |
 usuário   buscar
 real      guest_users


Caso não exista em nenhuma origem:

erro de integridade
27. POR QUE NÃO COLOCAR is_guest EM PREDICTS?

Foi discutido o uso:

predicts.is_guest

Mas a decisão inicial foi não adicionar.

Motivo:

A origem do participante é responsabilidade da camada de identidade.

O registro da aposta deve apenas responder:

Quem realizou esta ação?

Não:

Como esta pessoa está armazenada?

28. IMPACTO NO ENGINE

A preocupação inicial:

"o engine terá que procurar usuários em duas tabelas"

foi analisada.

Conclusão:

O impacto é irrelevante.

O engine já trabalha agrupando:

evento
+
round
+
usuário

A identidade já está resolvida antes da etapa matemática.

Fluxo:

predicts

     |
     v

engine monta matriz

evento
 |
 round
 |
 participante

     |
     v

calcula resultado

     |
     v

ranking

O engine não precisa saber se:

user_uuid veio de users

ou

guest_users

Ele apenas calcula.

29. FILOSOFIA DO MVP

A decisão arquitetural atual considera o estágio do produto.

O Canguess ainda está em validação comercial.

Portanto:

prioridade:

funcionar
+
ser utilizado
+
gerar valor

antes de:

perfeição estrutural

A arquitetura deve permitir evolução sem impedir o lançamento.

30. MODELO DE USO REAL ESPERADO

O comportamento predominante será:

convite

   |
   v

QR Code

   |
   v

evento direto

   |
   v

participar como guest

   |
   v

palpite

   |
   v

ranking

O usuário não necessariamente:

navega menus;
procura eventos;
cria conta.

O evento chega até ele.

31. WORKSPACE COMO PORTA DE ENTRADA

O sistema passa a privilegiar:

workspace

      |
      v

event

      |
      v

experience

O evento é o centro da experiência.

Não a conta.

32. NOVA VISÃO DO CANGUESS

O sistema deixa de ser:

usuário
    |
    evento
    |
    aposta

E passa a ser:

contexto

   |
   +---- evento

          |
          +---- participante

                    |
                    +---- ação

A identidade existe para sustentar a ação.

33. ESTADO DA VERSÃO 0.5

A versão 0.5 consolida:

✔ separação entre usuário real e guest
✔ Supabase Auth reservado para usuários reais
✔ guest_users independente
✔ predicts como camada universal de ações
✔ workspace como contexto ativo
✔ eventos como principal porta de entrada
✔ engine independente da origem da identidade
✔ UX baseada em participação rápida

CONCLUSÃO DA VERSÃO 0.5

A maior mudança desta versão não foi uma tabela nova.

Foi uma mudança de pensamento:

Antes:

o usuário precisava existir para participar.

Agora:

a participação cria uma identidade operacional que pode ou não evoluir para um usuário permanente.

O Canguess passa a aceitar a realidade do mundo:

A maioria das pessoas não quer criar contas.

Elas querem participar.

A conta nasce depois, quando existe valor suficiente para o usuário querer permanecer.
