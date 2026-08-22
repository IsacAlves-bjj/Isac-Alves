import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../theme/theme";
import type { TriageCategory } from "../api/types";

// Mapa do campo `icon` (livre, definido no seed do backend) para um emoji
// simples — suficiente para o escopo desta entrega, sem depender de um
// pacote de ícones externo. Categorias futuras com `icon` desconhecido
// caem no fallback "❓️" em vez de quebrar a tela.
const ICON_BY_KEY: Record<string, string> = {
  spine: "🦴",
  shoulder: "💪",
  knee: "🦵",
  hip: "🦴",
  foot: "🦶",
  hand: "✋",
  surgery: "🏥",
  brain: "🧠",
  pregnancy: "🤰",
  sport: "🏃",
  posture: "🧍",
  lungs: "🫁",
  help: "❓",
  activity: "🩺",
};

interface CategoryCardProps {
  category: TriageCategory;
  onPress: () => void;
}

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  const emoji = ICON_BY_KEY[category.icon] ?? "🩺";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${category.title}. ${category.subtitle}`}
    >
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{emoji}</Text>
      </View>
      <Text style={styles.title}>{category.title}</Text>
      <Text style={styles.subtitle} numberOfLines={3}>
        {category.subtitle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 22,
  },
  title: {
    ...typography.body,
    fontWeight: "700",
    marginBottom: 2,
  },
  subtitle: {
    ...typography.caption,
  },
});
