import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme/theme";
import { usePatientAuth } from "../auth/PatientAuthContext";
import { LoginScreen } from "../screens/appointments/LoginScreen";
import { OtpScreen } from "../screens/appointments/OtpScreen";
import { AppointmentsListScreen } from "../screens/appointments/AppointmentsListScreen";
import { LoadingView } from "../components/LoadingView";
import type { AppointmentsStackParamList } from "./types";

const Stack = createNativeStackNavigator<AppointmentsStackParamList>();

/**
 * Renderização condicional pelo estado de autenticação do paciente: sem
 * token, mostra o fluxo de login por telefone+código; com token, mostra
 * a lista direto. É o padrão recomendado pela documentação do React
 * Navigation para telas de auth (troca o conjunto de rotas, não navega
 * manualmente entre elas).
 */
export function AppointmentsNavigator() {
  const { token, isRestoring } = usePatientAuth();

  if (isRestoring) {
    return <LoadingView />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {token ? (
        <Stack.Screen name="List" component={AppointmentsListScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Identifique-se" }} />
          <Stack.Screen name="Otp" component={OtpScreen} options={{ title: "Verificação" }} />
        </>
      )}
    </Stack.Navigator>
  );
}
