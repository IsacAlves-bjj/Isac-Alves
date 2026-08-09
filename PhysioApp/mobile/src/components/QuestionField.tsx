import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, spacing, typography } from "../theme/theme";
import type { TriageQuestion } from "../api/types";

interface QuestionFieldProps {
  question: TriageQuestion;
  /** Valor bruto já serializado (o mesmo formato que vai no payload de /leads). */
  value: string | undefined;
  onChange: (value: string) => void;
}

function parseOptions(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parseMultiValue(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

const SCALE_VALUES = Array.from({ length: 11 }, (_, i) => i);

/**
 * Renderiza o campo certo conforme `question.type`. Único ponto do app
 * que conhece a lista de tipos de pergunta — telas apenas montam
 * `<QuestionField>` e recebem o valor já serializado do jeito que
 * `POST /leads` espera em `answers[].value`.
 */
export function QuestionField({ question, value, onChange }: QuestionFieldProps) {
  switch (question.type) {
    case "TEXT":
      return (
        <TextInput
          style={styles.input}
          value={value ?? ""}
          onChangeText={onChange}
          placeholder="Digite aqui"
          placeholderTextColor={colors.textMuted}
        />
      );

    case "LONG_TEXT":
      return (
        <TextInput
          style={[styles.input, styles.multiline]}
          value={value ?? ""}
          onChangeText={onChange}
          placeholder="Digite aqui"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      );

    case "BODY_MAP":
      // Limitação conhecida desta entrega: um mapa corporal clicável de
      // verdade (TRIAGEM.md §4, pergunta 7) fica fora de escopo — usamos
      // um campo de texto descritivo no lugar. Ver README do mobile.
      return (
        <TextInput
          style={[styles.input, styles.multiline]}
          value={value ?? ""}
          onChangeText={onChange}
          placeholder="Ex.: lombar, ombro direito, atrás do joelho..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      );

    case "BOOLEAN": {
      const options: Array<"Sim" | "Não"> = ["Sim", "Não"];
      return (
        <View style={styles.row}>
          {options.map((option) => {
            const selected = value === option;
            return (
              <Pressable
                key={option}
                onPress={() => onChange(option)}
                style={[styles.choiceButton, styles.choiceButtonHalf, selected && styles.choiceButtonSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.choiceLabel, selected && styles.choiceLabelSelected]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      );
    }

    case "SINGLE_CHOICE": {
      const options = parseOptions(question.options);
      return (
        <View style={styles.optionsList}>
          {options.map((option) => {
            const selected = value === option;
            return (
              <Pressable
                key={option}
                onPress={() => onChange(option)}
                style={[styles.choiceButton, selected && styles.choiceButtonSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.choiceLabel, selected && styles.choiceLabelSelected]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      );
    }

    case "MULTI_CHOICE": {
      const options = parseOptions(question.options);
      const selectedValues = parseMultiValue(value);
      const toggle = (option: string) => {
        const next = selectedValues.includes(option)
          ? selectedValues.filter((item) => item !== option)
          : [...selectedValues, option];
        onChange(JSON.stringify(next));
      };
      return (
        <View style={styles.optionsList}>
          {options.map((option) => {
            const selected = selectedValues.includes(option);
            return (
              <Pressable
                key={option}
                onPress={() => toggle(option)}
                style={[styles.choiceButton, selected && styles.choiceButtonSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.choiceLabel, selected && styles.choiceLabelSelected]}>
                  {selected ? "✓ " : ""}
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      );
    }

    case "SCALE_0_10": {
      const selected = value !== undefined ? Number(value) : null;
      return (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scaleRow}>
            {SCALE_VALUES.map((n) => {
              const isSelected = selected === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => onChange(String(n))}
                  style={[styles.scaleCircle, isSelected && styles.scaleCircleSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.scaleLabel, isSelected && styles.scaleLabelSelected]}>{n}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.scaleHint}>
            <Text style={typography.caption}>Sem dor</Text>
            <Text style={typography.caption}>Pior dor possível</Text>
          </View>
        </View>
      );
    }

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
    color: colors.text,
  },
  multiline: {
    minHeight: 90,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  optionsList: {
    gap: spacing.sm,
  },
  choiceButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  choiceButtonHalf: {
    flex: 1,
    alignItems: "center",
  },
  choiceButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  choiceLabel: {
    fontSize: 15,
    color: colors.text,
  },
  choiceLabelSelected: {
    color: colors.primaryDark,
    fontWeight: "700",
  },
  scaleRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  scaleCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  scaleCircleSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scaleLabel: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "600",
  },
  scaleLabelSelected: {
    color: colors.white,
  },
  scaleHint: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
});
