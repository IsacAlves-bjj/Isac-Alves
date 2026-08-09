/**
 * Dados de apresentação da fisioterapeuta na tela inicial do app.
 *
 * O backend ainda não expõe um endpoint público de perfil/branding (ver
 * PhysioApp/backend/src/routes) — quando existir, trocar este arquivo
 * estático por uma chamada de API é a única mudança necessária, já que
 * HomeScreen só consome este objeto.
 */
export const physioProfile = {
  name: "Fisioterapeuta",
  greeting: "Como posso te ajudar?",
  intro:
    "Conte rapidamente o que você está sentindo. Suas respostas chegam direto para mim, para eu já entender seu caso antes da nossa conversa.",
  initials: "FT",
};
