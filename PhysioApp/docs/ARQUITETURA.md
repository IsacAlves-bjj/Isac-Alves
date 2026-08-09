# Arquitetura — PhysioApp

Sistema de gestão para consultório/atendimento particular de fisioterapia.
Projeto isolado do FrameworkX (VBA/SAP) que vive na raiz deste repositório —
sem nenhuma dependência entre os dois.

## 1. Visão geral

```
┌──────────────────────┐        ┌──────────────────────┐
│   App Mobile          │        │   Painel Web          │
│   (paciente)           │        │   (fisioterapeuta)     │
│   Expo / React Native  │        │   React + Vite         │
│                        │        │                        │
│  - Caixinhas/triagem   │        │  - Dashboard           │
│  - Meus agendamentos   │        │  - Leads/Triagens      │
│  - Contato             │        │  - Pacientes           │
└──────────┬─────────────┘        │  - Agenda              │
           │                      │  - Prontuário/Evolução │
           │        REST/JSON     │  - Financeiro           │
           │        (JWT)         └──────────┬─────────────┘
           │                                  │
           ▼                                  ▼
        ┌────────────────────────────────────────┐
        │            Backend API                   │
        │      Node.js + Express + TypeScript       │
        │            Prisma ORM                      │
        └───────────────────┬────────────────────┘
                             ▼
                    ┌──────────────────┐
                    │  PostgreSQL        │
                    │  (SQLite em dev)   │
                    └──────────────────┘
```

Um único backend serve os dois clientes. O app do paciente usa um
subconjunto restrito da API (sem acesso a dados financeiros nem a
prontuário de outros pacientes); o painel web usa a API completa,
autenticado como fisioterapeuta/admin.

## 2. Módulos do sistema

| Módulo | Responsabilidade |
|---|---|
| **Auth** | Login da fisioterapeuta/equipe (painel) e identificação leve do paciente (telefone + código, painel mobile) |
| **Triagem (Leads)** | Captura da pré-anamnese vinda do app, geração de sugestão de tratamento, fila de revisão |
| **Pacientes** | Cadastro completo, histórico, conversão de lead → paciente |
| **Agenda** | Agendamento de sessões, status (agendado/confirmado/realizado/faltou/cancelado) |
| **Prontuário/Evolução** | Registro clínico por sessão (SOAP simplificado), anexos, plano terapêutico |
| **Financeiro** | Caixa (sessões de abertura/fechamento), Contas a Receber (por paciente/sessão ou pacote), Contas a Pagar (fornecedores), Fornecedores |
| **Notificações** (stub v1) | Lembrete de sessão, aviso de novo lead — hook pronto, envio real (WhatsApp/SMS/e-mail) fica para integração futura |

## 3. Modelo de dados (Prisma)

Ver `backend/prisma/schema.prisma` para a fonte de verdade. Resumo das
entidades principais:

- **User** — fisioterapeuta/equipe do painel (login, role).
- **Patient** — cadastro definitivo, com link opcional para o `Lead` que o originou.
- **TriageCategory** / **TriageQuestion** — catálogo configurável das
  "caixinhas" e perguntas (gerais + por categoria), conforme `TRIAGEM.md`.
- **Lead** — pré-triagem enviada pelo app: identificação, categoria,
  respostas (`LeadAnswer`), flags de red flag, status
  (`novo/em_revisao/agendado/descartado`), sugestão de tratamento gerada.
- **LeadAnswer** — resposta individual a uma `TriageQuestion` dentro de um `Lead`.
- **Appointment** — sessão agendada, vinculada a `Patient`, com status e horário.
- **ClinicalRecord** — evolução clínica de uma sessão realizada (SOAP:
  subjetivo, objetivo, avaliação, plano), vinculada a `Appointment`.
- **TreatmentPlan** — plano terapêutico vigente do paciente (objetivo,
  linha de cuidado, nº de sessões previstas).
- **CashSession** — abertura/fechamento de caixa (data, saldo inicial,
  saldo final, responsável).
- **Transaction** — lançamento financeiro genérico: `type`
  (`receivable`/`payable`), status (`pending/paid/overdue/cancelled`),
  valor, vencimento, vinculado opcionalmente a `Patient` (recebível) ou
  `Supplier` (pagável) e a `CashSession` quando baixado em caixa.
- **Supplier** — fornecedores (nome, categoria de despesa, contato).

## 4. Fluxo ponta a ponta

1. Potencial paciente abre o app → escolhe uma caixinha → responde
   triagem → app envia para `POST /leads`.
2. Backend calcula red flags e sugestão de tratamento (regras de
   `TRIAGEM.md §9`) e salva o `Lead` com status `novo`.
3. Fisioterapeuta vê o lead no painel (`Leads`), com resumo clínico e
   prioridade. Decide: agendar (cria `Patient` + `Appointment` a partir do
   lead) ou descartar (spam/fora de escopo).
4. Sessão realizada → fisioterapeuta preenche `ClinicalRecord` na tela do
   paciente.
5. Sessão também gera (ou não, se pacote fechado) um `Transaction` do tipo
   `receivable`. Ao ser paga, é baixada dentro de uma `CashSession` aberta.
6. Despesas com fornecedores entram como `Transaction` do tipo `payable`,
   vinculada a `Supplier`.
7. Dashboard consolida: leads pendentes, sessões do dia, saldo de caixa,
   contas a vencer (receber/pagar) nos próximos 7 dias.

## 5. Stack e decisões técnicas

- **Backend**: Node.js + TypeScript + Express + Prisma. SQLite em
  desenvolvimento (zero setup), PostgreSQL em produção — o schema Prisma é
  o mesmo, só troca o `provider`/`DATABASE_URL`.
- **Auth**: JWT stateless. Painel usa login e-mail/senha (bcrypt). App do
  paciente usa fluxo simplificado telefone + código de verificação (mock
  em dev — hook pronto para SMS real depois).
- **Web**: React + Vite + TypeScript + React Router + React Query para
  chamadas à API.
- **Mobile**: Expo (React Native) + TypeScript + React Navigation.
- **Validação**: Zod, compartilhado entre rotas do backend (contratos de
  entrada) para consistência.
- **Por que não reaproveitar nada do FrameworkX**: FrameworkX é uma
  biblioteca VBA para SAP GUI Scripting, domínio e stack completamente
  diferentes (VBA vs. TypeScript/Node); os dois projetos coexistem no
  mesmo repositório apenas por conveniência de espaço, sem acoplamento.

## 6. Como rodar (dev)

```bash
# Backend
cd PhysioApp/backend
npm install
npx prisma migrate dev
npm run seed      # carrega categorias e perguntas de triagem
npm run dev        # http://localhost:3333

# Web
cd PhysioApp/web
npm install
npm run dev        # http://localhost:5173

# Mobile
cd PhysioApp/mobile
npm install
npx expo start
```

## 7. Estado desta entrega e próximos passos

Esta primeira entrega cobre o sistema completo em amplitude (todos os
módulos pedidos: triagem, agenda, prontuário, financeiro) com backend e
banco de dados funcionais de ponta a ponta, painel web operacional e app
mobile com o fluxo principal de triagem. Pontos que ficam como próxima
iteração natural (fora do escopo de "estrutura funcional inicial"):

- Envio real de SMS/WhatsApp/e-mail (hoje: hook pronto, envio mockado).
- Relatórios financeiros avançados (DRE, fluxo de caixa projetado).
- Multi-profissional / multi-clínica (hoje: 1 fisioterapeuta dona dos dados).
- Pagamento online integrado (Pix/cartão) — hoje o registro é manual.
