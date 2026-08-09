import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme/theme";
import { HomeScreen } from "../screens/triage/HomeScreen";
import { ConsentScreen } from "../screens/triage/ConsentScreen";
import { QuestionnaireScreen } from "../screens/triage/QuestionnaireScreen";
import { IdentificationScreen } from "../screens/triage/IdentificationScreen";
import { ConfirmationScreen } from "../screens/triage/ConfirmationScreen";
import type { TriageStackParamList } from "./types";

const Stack = createNativeStackNavigator<TriageStackParamList>();

/** Fluxo principal: caixinha → consentimento → questionário → identificação → confirmação. */
export function TriageNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Consent" component={ConsentScreen} options={{ title: "Consentimento" }} />
      <Stack.Screen
        name="Questionnaire"
        component={QuestionnaireScreen}
        options={({ route }) => ({ title: route.params.category.title })}
      />
      <Stack.Screen name="Identification" component={IdentificationScreen} options={{ title: "Seus dados" }} />
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{ title: "Tudo certo", headerBackVisible: false, gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
