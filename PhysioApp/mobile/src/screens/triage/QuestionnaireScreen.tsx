import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingView } from "../../components/LoadingView";
import { ErrorView } from "../../components/ErrorView";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SecondaryButton } from "../../components/SecondaryButton";
import { ProgressBar } from "../../components/ProgressBar";
import { QuestionField } from "../../components/QuestionField";
import { getTriageQuestions } from "../../api/triage";
import { useAsync } from "../../hooks/useAsync";
import { buildTriageSteps } from "../../utils/triageFlow";
import { colors, spacing, typography } from "../../theme/theme";
import type { TriageScreenProps } from "../../navigation/types";

export function QuestionnaireScreen({ navigation, route }: TriageScreenProps<"Questionnaire">) {
  const { category } = route.params;
  const { data: questions, loading, error, refetch } = useAsync(
    () => getTriageQuestions(category.key),
    [category.key]
  );

  const steps = useMemo(() => (questions ? buildTriageSteps(questions) : []), [questions]);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attemptedAdvance, setAttemptedAdvance] = useState(false);

  if (loading) return <LoadingView message="Preparando as perguntas..." />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;
  if (!questions || steps.length === 0) {
    return <ErrorView message="Não encontramos perguntas para esta categoria no momento." onRetry={refetch} />;
  }
  // Narrowed above (guarded by the early return); rebound so nested
  // closures below keep the non-null type instead of `T | null`.
  const allQuestions = questions;

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const missingRequired = currentStep.questions.filter(
    (q) => q.required && !answers[q.id]
  );

  function setAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function goNext() {
    if (missingRequired.length > 0) {
      setAttemptedAdvance(true);
      return;
    }
    setAttemptedAdvance(false);
    if (isLastStep) {
      navigation.navigate("Identification", { category, questions: allQuestions, answers });
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  function goBack() {
    if (stepIndex === 0) {
      navigation.goBack();
    } else {
      setAttemptedAdvance(false);
      setStepIndex((i) => i - 1);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <View style={styles.header}>
        <ProgressBar currentStep={stepIndex + 1} totalSteps={steps.length} label={currentStep.label} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {currentStep.questions.map((question) => {
          const isMissing = attemptedAdvance && question.required && !answers[question.id];
          return (
            <View key={question.id} style={styles.questionBlock}>
              <Text style={[typography.body, styles.questionText]}>
                {question.text}
                {question.required ? <Text style={styles.required}> *</Text> : null}
              </Text>
              <QuestionField
                question={question}
                value={answers[question.id]}
                onChange={(value) => setAnswer(question.id, value)}
              />
              {isMissing ? <Text style={styles.missingHint}>Essa pergunta é obrigatória.</Text> : null}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <SecondaryButton label="Voltar" onPress={goBack} />
        </View>
        <View style={styles.footerButton}>
          <PrimaryButton label={isLastStep ? "Concluir perguntas" : "Continuar"} onPress={goNext} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  questionBlock: {
    gap: spacing.sm,
  },
  questionText: {
    fontWeight: "600",
  },
  required: {
    color: colors.danger,
  },
  missingHint: {
    color: colors.danger,
    fontSize: 13,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  footerButton: {
    flex: 1,
  },
});
