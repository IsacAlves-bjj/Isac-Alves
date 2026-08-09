// Paleta única (sem dark mode) — mobile-first, acolhedora, tons de verde-água
// e areia. Deliberadamente não-clínica: quem preenche isto costuma estar
// com dor ou desconforto, então evitamos branco frio/azul hospitalar.
export const colors = {
  background: "#F7F3ED",
  surface: "#FFFFFF",
  surfaceAlt: "#F0EAE0",
  primary: "#2F8F7E",
  primaryDark: "#20655A",
  primarySoft: "#DCEEE9",
  text: "#232B29",
  textMuted: "#6B7570",
  border: "#E4DDD1",
  danger: "#C1502E",
  dangerSoft: "#F6E3DA",
  white: "#FFFFFF",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 24, fontWeight: "700" as const, color: colors.text },
  subtitle: { fontSize: 15, fontWeight: "400" as const, color: colors.textMuted },
  sectionLabel: { fontSize: 13, fontWeight: "600" as const, color: colors.primaryDark, letterSpacing: 0.4 },
  body: { fontSize: 16, fontWeight: "400" as const, color: colors.text },
  caption: { fontSize: 13, fontWeight: "400" as const, color: colors.textMuted },
};
