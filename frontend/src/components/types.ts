export type Progress = {
  consumedMl: number;
  targetMl: number;
  remainingMl: number;
  percent: number;
  lastDrinkAt: string | null;
  user: {
    telegramId: string;
    dailyTargetMl: number;
    reminderIntervalMinutes: number;
    activeStartTime: string;
    activeEndTime: string;
    reminderEnabled: boolean;
    settings?: {
      defaultDrinkAmountMl: number;
      snoozeMinutes: number;
      weeklyReportEnabled: boolean;
    };
  };
  logs: Array<{ id: string; amountMl: number; createdAt: string; source: string }>;
};

export type HistoryResponse = {
  logs: Array<{ id: string; amountMl: number; createdAt: string; source: string }>;
  summary: Array<{ date: string; amountMl: number }>;
};
