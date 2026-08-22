# Estudo: Triagem e Pré-Anamnese do Paciente

> Objetivo deste documento: definir **o que perguntar** a um paciente ou
> potencial paciente antes da primeira consulta, de forma estruturada o
> suficiente para (a) a fisioterapeuta entender o problema antes de encontrar
> a pessoa e (b) o sistema conseguir sugerir uma **linha de tratamento
> preliminar** (nunca um diagnóstico fechado — isso continua sendo decisão
> clínica da fisioterapeuta no atendimento presencial).

Este é o conteúdo que alimenta a "caixinha" no app do paciente: ele escolhe
uma categoria, responde um questionário curto e guiado, e a fisioterapeuta
recebe isso já organizado como um **Lead/Pré-Triagem**, com uma sugestão de
abordagem gerada por regras (não é IA/diagnóstico automático — é uma matriz
de decisão clínica simples, auditável e editável pela fisioterapeuta).

## 1. Princípio geral: funil de triagem

```
1. Identificação do contato        → quem é, como falar com essa pessoa
2. Categoria do problema (caixinha) → região/tipo de queixa
3. Perguntas gerais (todas categorias)
4. Perguntas específicas da categoria escolhida
5. Red flags (sinais de alerta)     → sempre, independente da categoria
6. Objetivo do paciente com o tratamento
7. Disponibilidade/logística        → dias, horários, local, convênio/particular
```

Cada etapa é um "step" no formulário mobile. Nenhuma etapa deve ter mais de
5-6 perguntas (evitar abandono do formulário).

## 2. Identificação do contato

- Nome completo
- Telefone/WhatsApp
- E-mail (opcional)
- Como chegou até a fisioterapeuta (indicação, redes sociais, já é
  paciente, convênio) — importante para a fisioterapeuta entender origem de
  captação, mas não bloqueia o fluxo.
- É paciente novo ou já tratou com a fisioterapeuta antes?

## 3. Categorias (as "caixinhas")

O paciente escolhe **uma** caixinha principal (pode indicar uma secundária
opcional). Cada caixinha tem ícone, título curto e uma frase de identificação
para ajudar quem não sabe termo técnico:

| Categoria | Quando escolher |
|---|---|
| **Coluna (cervical/lombar/torácica)** | "Dor nas costas, pescoço ou lombar" |
| **Ombro** | "Dor ou dificuldade para levantar o braço" |
| **Joelho** | "Dor, inchaço ou instabilidade no joelho" |
| **Quadril / Pelve** | "Dor no quadril, virilha ou glúteo" |
| **Tornozelo / Pé** | "Entorse, dor no pé ou na sola" |
| **Cotovelo / Punho / Mão** | "Dor ou formigamento no braço, pulso ou mão" |
| **Pós-operatório** | "Fiz ou vou fazer uma cirurgia" |
| **Neurológico** | "AVC, Parkinson, esclerose múltipla, lesão medular, etc." |
| **Gestante / Pós-parto (uroginecologia)** | "Gravidez, pós-parto, incontinência" |
| **Esportiva / Performance** | "Quero melhorar performance ou prevenir lesão" |
| **Postural / Dor crônica** | "Dor que já dura meses, sem causa clara" |
| **Respiratória** | "Falta de ar, pós-covid, doença respiratória" |
| **Outro** | Campo livre — vira revisão manual pela fisioterapeuta |

## 4. Perguntas gerais (aplicam-se a todas as categorias)

**Queixa e história atual**
1. Em uma frase, qual é o principal problema hoje?
2. Quando começou? (hoje/essa semana, semanas atrás, meses atrás, mais de 1 ano)
3. Começou de forma súbita (acidente, movimento errado, trauma) ou foi
   piorando aos poucos, sem motivo claro?
4. Está piorando, estável ou melhorando desde que começou?
5. É a primeira vez que você tem esse problema, ou já teve episódios
   parecidos antes?

**Dor** (se aplicável — algumas categorias, como pós-operatório preventivo
ou performance esportiva, podem pular)
6. De 0 a 10, qual a intensidade da dor hoje? (escala visual, EVA)
7. Em qual(is) região(ões) do corpo? (mapa corporal clicável, frente/costas)
8. Como é a dor? (aguda/pontada, queimação, latejante, peso, formigamento,
   dormência, choque)
9. A dor é constante ou vai e volta?
10. O que piora? (múltipla escolha: ficar muito tempo sentado, em pé,
    caminhar, subir escada, deitar de determinado lado, à noite, ao acordar,
    esforço/exercício)
11. O que melhora? (repouso, calor, gelo, medicação, alongamento, nada alivia)
12. A dor irradia para outro lugar? (ex.: da lombar para a perna)

**Impacto funcional**
13. O que você não consegue mais fazer por causa disso, ou faz com
    dificuldade? (trabalhar, dormir bem, caminhar, dirigir, praticar esporte,
    cuidar dos filhos, tarefas domésticas)
14. Isso está afetando seu sono?
15. Você está afastado do trabalho ou de atividades por causa disso?

**Histórico relevante**
16. Já fez fisioterapia para esse problema antes? Com que resultado?
17. Já fez alguma cirurgia relacionada?
18. Tem exame de imagem (raio-x, ressonância, ultrassom) desse local? Pode
    anexar o laudo/foto? (upload opcional)
19. Tem alguma condição de saúde relevante? (diabetes, hipertensão,
    osteoporose, doença reumatológica/autoimune, doença cardíaca, câncer
    atual ou prévio, gravidez)
20. Usa alguma medicação contínua?

## 5. Perguntas específicas por categoria (exemplos-chave)

Implementadas como um conjunto de perguntas adicionais por categoria,
configurável no banco (tabela `TriageQuestion`, ver `ARQUITETURA.md`), não
hardcoded — a fisioterapeuta pode editar/expandir depois. Exemplos de partida:

**Coluna**
- A dor piora ao tossir, espirrar ou fazer força para evacuar?
- Sente formigamento ou perda de força em braços ou pernas?
- Perdeu força para segurar objetos ou para andar na ponta do pé/calcanhar?

**Ombro**
- Consegue levantar o braço acima da cabeça?
- A dor piora à noite, principalmente ao deitar sobre o ombro?
- Sente estalos, travamentos ou sensação de "sair do lugar"?

**Joelho**
- O joelho já "falseou" (deu a sensação de ceder) ou travou?
- Há inchaço visível?
- A dor é mais na frente, atrás, dentro ou fora do joelho?

**Pós-operatório**
- Qual cirurgia, em que data (ou data prevista)?
- Já tem liberação médica para fisioterapia? Tem alguma restrição de
  movimento informada pelo médico?

**Gestante / Pós-parto**
- Quantas semanas de gestação, ou há quanto tempo foi o parto?
- Parto normal ou cesárea?
- Tem perda de urina ao tossir, espirrar ou pular?

**Neurológico**
- Qual a condição (AVC, Parkinson, lesão medular, outra)? Há quanto tempo?
- Consegue andar sem apoio? Usa alguma órtese, bengala ou cadeira de rodas?

**Esportiva / Performance**
- Qual modalidade e nível (lazer, amador competitivo, profissional)?
- Objetivo: voltar a treinar, melhorar performance, ou prevenir lesão?

## 6. Red flags (sinais de alerta) — sempre perguntar

Estas perguntas aparecem para **todas** as categorias de dor
musculoesquelética. Uma resposta positiva não impede o agendamento, mas
**marca o lead com alerta visual** para a fisioterapeuta avaliar prioridade
de encaminhamento médico antes/junto do tratamento:

- Perda de peso recente sem explicação
- Dor que não melhora em nenhuma posição, inclusive à noite, e que não
  alivia com repouso
- Febre associada ao quadro
- Histórico de câncer (atual ou nos últimos 5 anos)
- Alteração recente no controle de urina ou intestino associada à dor lombar
- Formigamento ou perda de força progressiva em ambas as pernas
- Trauma de alto impacto recente (acidente de carro, queda de altura)
- Dor no peito, falta de ar súbita ou palpitação associada
- Febre + dor + vermelhidão/calor local (suspeita de infecção articular)

> Regra de negócio: se **qualquer** red flag for marcada, o lead recebe o
> selo `ATENÇÃO CLÍNICA` no painel e vem no topo da fila de revisão, com
> texto explicando qual sinal foi identificado. O sistema nunca bloqueia o
> contato nem diz ao paciente "vá a um pronto-socorro" — isso é call
> clínica da fisioterapeuta, o app apenas sinaliza prioridade.

## 7. Objetivo do paciente

- O que seria "sucesso" pra você no fim do tratamento? (voltar a correr,
  dormir sem dor, voltar ao trabalho, evitar cirurgia, melhorar postura,
  outro — campo livre)
- Prazo que gostaria de ver resultado (sem pressa, semanas, tenho um evento
  em uma data específica)

## 8. Logística

- Cidade/região, presencial ou também aceita domiciliar/telefisioterapia
- Dias e turnos de preferência
- Particular ou convênio (e qual)

## 9. Da triagem à sugestão de tratamento

A "sugestão de tratamento" gerada automaticamente **não é um plano
terapêutico fechado** — é um resumo estruturado que acelera a decisão da
fisioterapeuta, com três blocos:

1. **Resumo clínico automático**: concatena categoria + queixa + tempo de
   evolução + intensidade de dor + impacto funcional em um parágrafo legível
   ("Paciente relata dor lombar há 3 semanas, início gradual, EVA 7/10,
   piora ao ficar sentado, sem red flags.").
2. **Linha de cuidado sugerida por categoria** (tabela de regras simples,
   mantida pela fisioterapeuta em `Configurações → Linhas de Cuidado`):
   mapeia categoria + red flag/ausência de red flag → texto de sugestão de
   abordagem inicial e número estimado de sessões/avaliação inicial. Exemplo:
   *Coluna, sem red flag → "Avaliação postural e funcional, terapia manual,
   fortalecimento de core, reavaliação em 4 sessões."*
3. **Prioridade de atendimento**: `Normal` / `Atenção Clínica` (com red
   flag) / `Revisão manual` (categoria "Outro" ou resposta muito incompleta).

Esse conteúdo vira o `Prontuário Inicial` do paciente assim que a
fisioterapeuta aceita o lead e agenda a primeira consulta — evitando
retrabalho de digitar tudo de novo presencialmente.

## 10. Consentimento e dados sensíveis

Por lidar com dado de saúde (sensível, LGPD art. 11), a triagem deve:
- Ter uma tela de consentimento explícito antes da primeira pergunta
  ("Seus dados serão usados exclusivamente para avaliação fisioterapêutica
  por [Nome da Fisioterapeuta] e não serão compartilhados com terceiros.")
- Permitir que o paciente solicite exclusão dos dados depois
  (`Configurações → Privacidade` no app, ou pedido direto à fisioterapeuta).
- Nunca expor dados de um paciente para outro — cada lead/prontuário só é
  visível para a fisioterapeuta (e, futuramente, outros profissionais da
  mesma clínica, se o sistema crescer para multi-profissional).
