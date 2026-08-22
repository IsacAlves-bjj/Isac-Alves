import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { LoadingView } from "../../components/LoadingView";
import { ErrorView } from "../../components/ErrorView";
import { CategoryCard } from "../../components/CategoryCard";
import { getTriageCategories } from "../../api/triage";
import { useAsync } from "../../hooks/useAsync";
import { colors, radius, spacing, typography } from "../../theme/theme";
import { physioProfile } from "../../config/physioProfile";
import type { TriageScreenProps } from "../../navigation/types";

export function HomeScreen({ navigation }: TriageScreenProps<"Home">) {
  const { data: categories, loading, error, refetch } = useAsync(() => getTriageCategories(), []);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{physioProfile.initials}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={typography.title}>{physioProfile.greeting}</Text>
          <Text style={[typography.subtitle, styles.intro]}>{physioProfile.intro}</Text>
        </View>
      </View>

      <Text style={[typography.sectionLabel, styles.sectionLabel]}>ESCOLHA O QUE MAIS SE PARECE COM VOCÊ</Text>

      {loading ? <LoadingView message="Carregando opções..." /> : null}

      {error ? <ErrorView message={error} onRetry={refetch} /> : null}

      {!loading && !error && categories ? (
        <View style={styles.grid}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onPress={() => navigation.navigate("Consent", { category })}
            />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 18,
  },
  headerText: {
    flex: 1,
  },
  intro: {
    marginTop: 4,
  },
  sectionLabel: {
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
});
