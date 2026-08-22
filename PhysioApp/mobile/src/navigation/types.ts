import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { LeadResponse, TriageCategory, TriageQuestion } from "../api/types";

export type TriageStackParamList = {
  Home: undefined;
  Consent: { category: TriageCategory };
  Questionnaire: { category: TriageCategory };
  Identification: {
    category: TriageCategory;
    questions: TriageQuestion[];
    answers: Record<string, string>;
  };
  Confirmation: { lead: LeadResponse };
};

export type TriageScreenProps<Screen extends keyof TriageStackParamList> = NativeStackScreenProps<
  TriageStackParamList,
  Screen
>;

export type AppointmentsStackParamList = {
  Login: undefined;
  Otp: { phone: string };
  List: undefined;
};

export type AppointmentsScreenProps<Screen extends keyof AppointmentsStackParamList> = NativeStackScreenProps<
  AppointmentsStackParamList,
  Screen
>;
