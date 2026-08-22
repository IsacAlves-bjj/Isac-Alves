// Popula o catálogo de triagem (categorias e perguntas) a partir do
// estudo em PhysioApp/docs/TRIAGEM.md, e cria um usuário de equipe
// padrão para o primeiro acesso ao painel.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// SQLite não tem enum nativo no Prisma (ver prisma/schema.prisma) — os
// valores de `type` de pergunta são strings de contrato, iguais aos
// usados nas rotas/telas de triagem.
const QuestionType = {
  TEXT: "TEXT",
  LONG_TEXT: "LONG_TEXT",
  SINGLE_CHOICE: "SINGLE_CHOICE",
  MULTI_CHOICE: "MULTI_CHOICE",
  SCALE_0_10: "SCALE_0_10",
  BOOLEAN: "BOOLEAN",
  BODY_MAP: "BODY_MAP",
} as const;

const CATEGORIES = [
  { key: "coluna", title: "Coluna", subtitle: "Dor nas costas, pescoço ou lombar", icon: "spine", order: 1 },
  { key: "ombro", title: "Ombro", subtitle: "Dor ou dificuldade para levantar o braço", icon: "shoulder", order: 2 },
  { key: "joelho", title: "Joelho", subtitle: "Dor, inchaço ou instabilidade no joelho", icon: "knee", order: 3 },
  { key: "quadril", title: "Quadril / Pelve", subtitle: "Dor no quadril, virilha ou glúteo", icon: "hip", order: 4 },
  { key: "tornozelo_pe", title: "Tornozelo / Pé", subtitle: "Entorse, dor no pé ou na sola", icon: "foot", order: 5 },
  { key: "cotovelo_punho_mao", title: "Cotovelo / Punho / Mão", subtitle: "Dor ou formigamento no braço, pulso ou mão", icon: "hand", order: 6 },
  { key: "pos_operatorio", title: "Pós-operatório", subtitle: "Fiz ou vou fazer uma cirurgia", icon: "surgery", order: 7 },
  { key: "neurologico", title: "Neurológico", subtitle: "AVC, Parkinson, esclerose múltipla, lesão medular, etc.", icon: "brain", order: 8 },
  { key: "gestante_pos_parto", title: "Gestante / Pós-parto", subtitle: "Gravidez, pós-parto, incontinência", icon: "pregnancy", order: 9 },
  { key: "esportiva_performance", title: "Esportiva / Performance", subtitle: "Quero melhorar performance ou prevenir lesão", icon: "sport", order: 10 },
  { key: "postural_dor_cronica", title: "Postural / Dor crônica", subtitle: "Dor que já dura meses, sem causa clara", icon: "posture", order: 11 },
  { key: "respiratoria", title: "Respiratória", subtitle: "Falta de ar, pós-covid, doença respiratória", icon: "lungs", order: 12 },
  { key: "outro", title: "Outro", subtitle: "Não encontrei minha situação acima", icon: "help", order: 13 },
] as const;

// Perguntas gerais — TRIAGEM.md §4. categoryKey null = aparece para todas.
const GENERAL_QUESTIONS = [
  { section: "geral", text: "Em uma frase, qual é o principal problema hoje?", type: QuestionType.LONG_TEXT, order: 1 },
  { section: "geral", text: "Quando começou?", type: QuestionType.SINGLE_CHOICE, options: ["Hoje/essa semana", "Semanas atrás", "Meses atrás", "Mais de 1 ano"], order: 2 },
  { section: "geral", text: "Começou de forma súbita ou foi piorando aos poucos?", type: QuestionType.SINGLE_CHOICE, options: ["Súbita (trauma/movimento errado)", "Gradual, sem motivo claro"], order: 3 },
  { section: "geral", text: "Está piorando, estável ou melhorando desde que começou?", type: QuestionType.SINGLE_CHOICE, options: ["Piorando", "Estável", "Melhorando"], order: 4 },
  { section: "geral", text: "É a primeira vez, ou já teve episódios parecidos antes?", type: QuestionType.BOOLEAN, order: 5 },
  { section: "dor", text: "De 0 a 10, qual a intensidade da dor hoje?", type: QuestionType.SCALE_0_10, order: 1 },
  { section: "dor", text: "Em qual região do corpo dói mais?", type: QuestionType.BODY_MAP, order: 2 },
  { section: "dor", text: "Como é a dor?", type: QuestionType.SINGLE_CHOICE, options: ["Pontada/aguda", "Queimação", "Latejante", "Peso", "Formigamento/dormência", "Choque"], order: 3 },
  { section: "dor", text: "A dor é constante ou vai e volta?", type: QuestionType.SINGLE_CHOICE, options: ["Constante", "Intermitente"], order: 4 },
  { section: "dor", text: "O que piora a dor?", type: QuestionType.MULTI_CHOICE, options: ["Sentado", "Em pé", "Caminhar", "Subir escada", "Deitar", "À noite", "Ao acordar", "Esforço/exercício"], order: 5 },
  { section: "dor", text: "O que melhora a dor?", type: QuestionType.MULTI_CHOICE, options: ["Repouso", "Calor", "Gelo", "Medicação", "Alongamento", "Nada alivia"], order: 6 },
  { section: "dor", text: "A dor irradia para outro lugar?", type: QuestionType.TEXT, required: false, order: 7 },
  { section: "funcional", text: "O que você não consegue mais fazer, ou faz com dificuldade?", type: QuestionType.MULTI_CHOICE, options: ["Trabalhar", "Dormir bem", "Caminhar", "Dirigir", "Praticar esporte", "Cuidar dos filhos", "Tarefas domésticas"], order: 1 },
  { section: "funcional", text: "Isso está afetando seu sono?", type: QuestionType.BOOLEAN, order: 2 },
  { section: "funcional", text: "Está afastado do trabalho ou de atividades por causa disso?", type: QuestionType.BOOLEAN, order: 3 },
  { section: "historico", text: "Já fez fisioterapia para esse problema antes?", type: QuestionType.TEXT, required: false, order: 1 },
  { section: "historico", text: "Já fez alguma cirurgia relacionada?", type: QuestionType.BOOLEAN, order: 2 },
  { section: "historico", text: "Tem exame de imagem desse local (raio-x, ressonância, ultrassom)?", type: QuestionType.BOOLEAN, order: 3 },
  { section: "historico", text: "Tem alguma condição de saúde relevante?", type: QuestionType.MULTI_CHOICE, options: ["Diabetes", "Hipertensão", "Osteoporose", "Doença reumatológica/autoimune", "Doença cardíaca", "Câncer atual ou prévio", "Gravidez", "Nenhuma"], order: 4 },
  { section: "historico", text: "Usa alguma medicação contínua?", type: QuestionType.TEXT, required: false, order: 5 },
  { section: "objetivo", text: "O que seria sucesso pra você no fim do tratamento?", type: QuestionType.LONG_TEXT, order: 1 },
  { section: "objetivo", text: "Prazo que gostaria de ver resultado", type: QuestionType.SINGLE_CHOICE, options: ["Sem pressa", "Algumas semanas", "Tenho um evento em data específica"], order: 2 },
  { section: "logistica", text: "Cidade/região", type: QuestionType.TEXT, order: 1 },
  { section: "logistica", text: "Dias e turnos de preferência", type: QuestionType.TEXT, required: false, order: 2 },
  { section: "logistica", text: "Particular ou convênio?", type: QuestionType.SINGLE_CHOICE, options: ["Particular", "Convênio"], order: 3 },
] as const;

// Red flags — TRIAGEM.md §6. Aparecem para todas as categorias (categoryKey null).
const RED_FLAG_QUESTIONS = [
  "Perda de peso recente sem explicação",
  "Dor que não melhora em nenhuma posição, nem à noite, nem com repouso",
  "Febre associada ao quadro",
  "Histórico de câncer (atual ou nos últimos 5 anos)",
  "Alteração recente no controle de urina ou intestino associada à dor lombar",
  "Formigamento ou perda de força progressiva em ambas as pernas",
  "Trauma de alto impacto recente (acidente, queda de altura)",
  "Dor no peito, falta de ar súbita ou palpitação associada",
  "Febre, dor e vermelhidão/calor local juntos",
];

// Perguntas específicas por categoria — TRIAGEM.md §5 (amostra inicial,
// expansível pela fisioterapeuta).
const CATEGORY_QUESTIONS: Record<string, string[]> = {
  coluna: [
    "A dor piora ao tossir, espirrar ou fazer força para evacuar?",
    "Sente formigamento ou perda de força em braços ou pernas?",
    "Perdeu força para segurar objetos ou andar na ponta do pé/calcanhar?",
  ],
  ombro: [
    "Consegue levantar o braço acima da cabeça?",
    "A dor piora à noite, principalmente ao deitar sobre o ombro?",
    "Sente estalos, travamentos ou sensação de sair do lugar?",
  ],
  joelho: [
    "O joelho já falseou (deu sensação de ceder) ou travou?",
    "Há inchaço visível?",
    "A dor é mais na frente, atrás, dentro ou fora do joelho?",
  ],
  pos_operatorio: [
    "Qual cirurgia, em que data (ou data prevista)?",
    "Já tem liberação médica para fisioterapia?",
    "Há alguma restrição de movimento informada pelo médico?",
  ],
  gestante_pos_parto: [
    "Quantas semanas de gestação, ou há quanto tempo foi o parto?",
    "Parto normal ou cesárea?",
    "Tem perda de urina ao tossir, espirrar ou pular?",
  ],
  neurologico: [
    "Qual a condição e há quanto tempo?",
    "Consegue andar sem apoio?",
    "Usa alguma órtese, bengala ou cadeira de rodas?",
  ],
  esportiva_performance: [
    "Qual modalidade e nível (lazer, amador competitivo, profissional)?",
    "Objetivo: voltar a treinar, melhorar performance ou prevenir lesão?",
  ],
};

async function main() {
  console.log("Seed: categorias de triagem...");
  const categoryByKey: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const created = await prisma.triageCategory.upsert({
      where: { key: c.key },
      update: c,
      create: c,
    });
    categoryByKey[c.key] = created.id;
  }

  console.log("Seed: perguntas gerais...");
  for (const q of GENERAL_QUESTIONS) {
    const existing = await prisma.triageQuestion.findFirst({
      where: { text: q.text, categoryId: null },
    });
    if (existing) continue;
    await prisma.triageQuestion.create({
      data: {
        categoryId: null,
        section: q.section,
        text: q.text,
        type: q.type,
        options: "options" in q ? JSON.stringify(q.options) : null,
        required: "required" in q ? q.required : true,
        order: q.order,
      },
    });
  }

  console.log("Seed: red flags...");
  for (const [i, text] of RED_FLAG_QUESTIONS.entries()) {
    const existing = await prisma.triageQuestion.findFirst({ where: { text, categoryId: null } });
    if (existing) continue;
    await prisma.triageQuestion.create({
      data: {
        categoryId: null,
        section: "red_flag",
        text,
        type: QuestionType.BOOLEAN,
        isRedFlag: true,
        required: true,
        order: i,
      },
    });
  }

  console.log("Seed: perguntas específicas por categoria...");
  for (const [categoryKey, questions] of Object.entries(CATEGORY_QUESTIONS)) {
    const categoryId = categoryByKey[categoryKey];
    for (const [i, text] of questions.entries()) {
      const existing = await prisma.triageQuestion.findFirst({ where: { text, categoryId } });
      if (existing) continue;
      await prisma.triageQuestion.create({
        data: {
          categoryId,
          section: "especifica",
          text,
          type: QuestionType.TEXT,
          required: false,
          order: i,
        },
      });
    }
  }

  console.log("Seed: usuário de equipe padrão...");
  const email = "fisio@physioapp.local";
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        name: "Dra. Gabrielly Gomes",
        email,
        passwordHash: await bcrypt.hash("mudar123", 10),
        role: "ADMIN",
      },
    });
    console.log(`Usuário padrão criado: ${email} / senha: mudar123 (troque no primeiro acesso)`);
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
