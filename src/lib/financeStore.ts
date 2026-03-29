import { useEffect, useRef, useState } from "react";
import { getStoredUser, setStoredUser } from "./auth";

export type TransactionRecord = {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
};

export type BudgetRecord = {
  id: string;
  category: string;
  limit: number;
  spent: number;
};

export type GoalRecord = {
  id: string;
  name: string;
  target: number;
  saved: number;
  dueDate: string;
};

export type NetWorthRecord = {
  id: string;
  name: string;
  type: "asset" | "liability";
  amount: number;
};

export type SettingsRecord = {
  baseCurrencyCode: string;
  budgetReminderDay: string;
  goalContributionRule: "Enabled" | "Disabled";
  alertThreshold: number;
  themeMode: "light" | "dark";
};

export type AlertRecord = {
  id: string;
  title: string;
  detail: string;
  type: "Budget" | "Bill" | "Goal" | "General";
  status: "Active" | "Resolved";
};

export type FinanceData = {
  transactions: TransactionRecord[];
  budgets: BudgetRecord[];
  goals: GoalRecord[];
  netWorth: NetWorthRecord[];
  alerts: AlertRecord[];
  settings: SettingsRecord;
};

const STORAGE_KEY = "finance-planner-data";

const defaultData: FinanceData = {
  transactions: [
    { id: "t1", description: "Salary", amount: 2850, type: "income", category: "Income", date: "2026-03-01" },
    { id: "t2", description: "Rent", amount: 1100, type: "expense", category: "Housing", date: "2026-03-03" },
    { id: "t3", description: "Groceries", amount: 84, type: "expense", category: "Food", date: "2026-03-06" },
  ],
  budgets: [
    { id: "b1", category: "Housing", limit: 1400, spent: 1240 },
    { id: "b2", category: "Food", limit: 500, spent: 460 },
    { id: "b3", category: "Transport", limit: 300, spent: 190 },
  ],
  goals: [
    { id: "g1", name: "Emergency fund", target: 5000, saved: 3400, dueDate: "2026-08-01" },
    { id: "g2", name: "Vacation", target: 2400, saved: 620, dueDate: "2026-12-15" },
  ],
  netWorth: [
    { id: "n1", name: "Checking", type: "asset", amount: 3200 },
    { id: "n2", name: "Savings", type: "asset", amount: 6220 },
    { id: "n3", name: "Credit card", type: "liability", amount: 1120 },
    { id: "n4", name: "Education loan", type: "liability", amount: 4900 },
  ],
  alerts: [
    {
      id: "a1",
      title: "Dining budget is almost full",
      detail: "You have used 92% of your dining category.",
      type: "Budget",
      status: "Active",
    },
    {
      id: "a2",
      title: "Internet bill due soon",
      detail: "Your monthly internet bill is due in 2 days.",
      type: "Bill",
      status: "Active",
    },
    {
      id: "a3",
      title: "Emergency fund milestone reached",
      detail: "You are close to the next goal checkpoint.",
      type: "Goal",
      status: "Resolved",
    },
  ],
  settings: {
    baseCurrencyCode: "INR",
    budgetReminderDay: "Sunday",
    goalContributionRule: "Enabled",
    alertThreshold: 85,
    themeMode: "dark",
  },
};

const loadFinanceData = (): FinanceData => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultData;
  }

  const parsed = JSON.parse(raw) as Partial<FinanceData>;

  return {
    transactions: parsed.transactions || defaultData.transactions,
    budgets: parsed.budgets || defaultData.budgets,
    goals: parsed.goals || defaultData.goals,
    netWorth: parsed.netWorth || defaultData.netWorth,
    alerts: parsed.alerts || defaultData.alerts,
    settings: { ...defaultData.settings, ...parsed.settings },
  };
};

const parseStoredData = (): FinanceData => {
  try {
    return loadFinanceData();
  } catch {
    return defaultData;
  }
};

export const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const formatCurrency = (amount: number, currencyCode = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);

export const useFinanceData = () => {
  const [data, setData] = useState<FinanceData>(parseStoredData);
  const isExternalSync = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    document.documentElement.setAttribute("data-theme", data.settings.themeMode);
    if (isExternalSync.current) {
      isExternalSync.current = false;
    } else {
      window.dispatchEvent(new Event("finance-data-updated"));
    }

    const user = getStoredUser();
    if (user && user.base_currency_code !== data.settings.baseCurrencyCode) {
      setStoredUser({ ...user, base_currency_code: data.settings.baseCurrencyCode });
    }
  }, [data]);

  useEffect(() => {
    const syncData = () => {
      isExternalSync.current = true;
      setData(parseStoredData());
    };

    window.addEventListener("storage", syncData);
    window.addEventListener("finance-data-updated", syncData);

    return () => {
      window.removeEventListener("storage", syncData);
      window.removeEventListener("finance-data-updated", syncData);
    };
  }, []);

  return { data, setData };
};
