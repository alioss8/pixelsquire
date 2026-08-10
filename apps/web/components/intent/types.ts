import type { StreakHistoryPoint } from "../data/types";

export type IntentResult = { intent: string; data?: unknown };

export type StreakStatusData = { streak?: number; history?: StreakHistoryPoint[] };
export type CreateGoalData = {
  ok: boolean;
  goal?: { id: string; title: string; cadence: string };
  message?: string;
};
export type CheckinData = {
  ok: boolean;
  goal?: string;
  streak?: number;
  message?: string;
};
export type DayReviewData = {
  date?: string;
  completed?: { id: string; title: string }[];
  total?: number;
};
export type WeeklyReviewData = { history?: StreakHistoryPoint[] };
export type StreakAnalysisData = { history?: StreakHistoryPoint[] };
export type CompareData = {
  thisWeek?: StreakHistoryPoint[];
  lastWeek?: StreakHistoryPoint[];
  thisWeekTotal?: number;
  lastWeekTotal?: number;
};
export type SuggestGoalData = {
  ok: boolean;
  title?: string;
  reason?: string;
  message?: string;
};
export type TalkToKnightData = { reply?: string };
export type UnknownData = { message?: string; suggestions?: string[] };
