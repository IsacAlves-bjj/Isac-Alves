import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { colors } from "../theme/theme";
import { TriageNavigator } from "./TriageNavigator";
import { AppointmentsNavigator } from "./AppointmentsNavigator";

type RootTabParamList = {
  TriagemTab: undefined;
  AgendamentosTab: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tab.Screen
        name="TriagemTab"
        component={TriageNavigator}
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="AgendamentosTab"
        component={AppointmentsNavigator}
        options={{
          title: "Agendamentos",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📅</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
