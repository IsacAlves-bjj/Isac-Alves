# PhysioApp

Sistema de gestão para consultório/atendimento particular de
fisioterapia: triagem de novos pacientes, agenda, prontuário/evolução
clínica e gestão financeira (caixa, contas a receber, contas a pagar
a fornecedores).

> Projeto independente dentro deste repositório — sem qualquer relação
> com o `FrameworkX` (VBA/SAP) que vive na raiz. Veja `../CLAUDE.md`
> apenas se for tocar no FrameworkX; para o PhysioApp, comece por aqui.

## Comece por aqui

1. **`docs/TRIAGEM.md`** — o estudo clínico: o que perguntar ao
   paciente/potencial paciente, categorias de problema (as
   "caixinhas"), red flags, e como isso vira uma sugestão de
   tratamento. Leia antes de mexer em qualquer coisa relacionada a
   triagem.
2. **`docs/ARQUITETURA.md`** — visão geral do sistema, módulos, modelo
   de dados e como rodar tudo localmente.

## Estrutura

```
PhysioApp/
├── backend/   API (Node + TypeScript + Express + Prisma) — única fonte de verdade dos dados
├── web/       Painel web da fisioterapeuta (React + Vite)
├── mobile/    App do paciente (Expo/React Native) — fluxo de triagem + agendamentos
└── docs/      Estudo de triagem e arquitetura
```

## Rodando localmente

```bash
# 1) Backend — sobe em http://localhost:3333
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run seed        # carrega categorias/perguntas de triagem + usuário padrão
npm run dev

# 2) Painel web — sobe em http://localhost:5173
cd ../web
npm install
npm run dev

# 3) App mobile
cd ../mobile
npm install
npx expo start
```

Login padrão do painel (criado pelo `npm run seed`, troque depois):
`fisio@physioapp.local` / `mudar123`.

## Estado desta entrega

Ver `docs/ARQUITETURA.md §7` para o que está funcional nesta primeira
entrega e o que fica para uma próxima iteração (envio real de
SMS/WhatsApp, relatórios financeiros avançados, multi-profissional,
pagamento online).
