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
  openingCashBalance: number;
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

export type BudgetInsight = BudgetRecord & {
  spent: number;
  remaining: number;
  percentUsed: number;
  suggestedLimit: number;
};

export type CategorySuggestion = {
  category: string;
  spent: number;
  suggestedLimit: number;
};

export type FinanceSnapshot = {
  income: number;
  expenses: number;
  cashFlow: number;
  cashOnHand: number;
  budgetLeft: number;
  totalBudgeted: number;
  totalBudgetSpent: number;
  budgets: BudgetInsight[];
  unbudgetedCategories: CategorySuggestion[];
  manualAssets: number;
  liabilities: number;
  netWorth: number;
  goalSaved: number;
  goalTarget: number;
  goalProgress: number;
};

const STORAGE_KEY = "finance-planner-data";
const CASH_ACCOUNT_PATTERN = /cash|checking|savings|wallet|current account|bank/i;

const defaultData: FinanceData = {
  transactions: [
    { id: "t1", description: "Salary", amount: 2850, type: "income", category: "Income", date: "2026-03-01" },
    { id: "t2", description: "Rent", amount: 1100, type: "expense", category: "Housing", date: "2026-03-03" },
    { id: "t3", description: "Groceries", amount: 84, type: "expense", category: "Food", date: "2026-03-06" },
  ],
  budgets: [
    { id: "b1", category: "Housing", limit: 1400 },
    { id: "b2", category: "Food", limit: 500 },
    { id: "b3", category: "Transport", limit: 300 },
  ],
  goals: [
    { id: "g1", name: "Emergency fund", target: 5000, saved: 3400, dueDate: "2026-08-01" },
    { id: "g2", name: "Vacation", target: 2400, saved: 620, dueDate: "2026-12-15" },
  ],
  netWorth: [
    { id: "n1", name: "Mutual funds", type: "asset", amount: 6200 },
    { id: "n2", name: "Credit card", type: "liability", amount: 1120 },
    { id: "n3", name: "Education loan", type: "liability", amount: 4900 },
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
    openingCashBalance: 4500,
  },
};

const normalizeCategory = (value: string) => value.trim().toLowerCase();

const isCashAccount = (item: NetWorthRecord) => item.type === "asset" && CASH_ACCOUNT_PATTERN.test(item.name);

const startOfMonth = (value: Date) => new Date(value.getFullYear(), value.getMonth(), 1);

const isSameMonth = (dateString: string, referenceDate: Date) => {
  const parsed = new Date(dateString);
  return !Number.isNaN(parsed.getTime()) &&
    parsed.getFullYear() === referenceDate.getFullYear() &&
    parsed.getMonth() === referenceDate.getMonth();
};

const roundBudgetAmount = (value: number) => {
  if (value <= 0) {
    return 0;
  }

  const step = value < 250 ? 10 : value < 1000 ? 50 : 100;
  return Math.ceil(value / step) * step;
};

const buildMonthlyCategorySpend = (transactions: TransactionRecord[], referenceDate: Date) => {
  return transactions.reduce<Record<string, number>>((totals, transaction) => {
    if (transaction.type !== "expense" || !transaction.category || !isSameMonth(transaction.date, referenceDate)) {
      return totals;
    }

    const key = normalizeCategory(transaction.category);
    totals[key] = (totals[key] || 0) + transaction.amount;
    return totals;
  }, {});
};

const getBudgetSuggestion = (transactions: TransactionRecord[], category: string, referenceDate: Date) => {
  const normalizedCategory = normalizeCategory(category);
  const windowStart = new Date(startOfMonth(referenceDate));
  windowStart.setMonth(windowStart.getMonth() - 2);

  const monthlyTotals = new Map<string, number>();

  transactions.forEach((transaction) => {
    const parsedDate = new Date(transaction.date);
    if (
      transaction.type !== "expense" ||
      normalizeCategory(transaction.category) !== normalizedCategory ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate < windowStart
    ) {
      return;
    }

    const monthKey = `${parsedDate.getFullYear()}-${parsedDate.getMonth()}`;
    monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + transaction.amount);
  });

  if (!monthlyTotals.size) {
    return 0;
  }

  const total = Array.from(monthlyTotals.values()).reduce((sum, amount) => sum + amount, 0);
  const averageMonthlySpend = total / monthlyTotals.size;

  return roundBudgetAmount(averageMonthlySpend * 1.1);
};

export const buildFinanceSnapshot = (data: FinanceData, referenceDate = new Date()): FinanceSnapshot => {
  const income = data.transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = data.transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const cashFlow = income - expenses;
  const cashOnHand = data.settings.openingCashBalance + cashFlow;

  const currentMonthSpend = buildMonthlyCategorySpend(data.transactions, referenceDate);
  const budgetNames = new Set(data.budgets.map((item) => normalizeCategory(item.category)));
  const budgets = data.budgets.map((item) => {
    const spent = currentMonthSpend[normalizeCategory(item.category)] || 0;
    const remaining = item.limit - spent;
    const percentUsed = item.limit ? Math.min(100, Math.round((spent / item.limit) * 100)) : 0;

    return {
      ...item,
      spent,
      remaining,
      percentUsed,
      suggestedLimit: getBudgetSuggestion(data.transactions, item.category, referenceDate),
    };
  });

  const unbudgetedCategories = Object.entries(currentMonthSpend)
    .filter(([category]) => !budgetNames.has(category))
    .map(([category, spent]) => ({
      category,
      spent,
      suggestedLimit: getBudgetSuggestion(data.transactions, category, referenceDate) || roundBudgetAmount(spent * 1.1),
    }))
    .sort((left, right) => right.spent - left.spent);

  const totalBudgeted = budgets.reduce((sum, item) => sum + item.limit, 0);
  const totalBudgetSpent = budgets.reduce((sum, item) => sum + item.spent, 0);
  const budgetLeft = budgets.reduce((sum, item) => sum + item.remaining, 0);

  const manualAssets = data.netWorth.filter((item) => item.type === "asset").reduce((sum, item) => sum + item.amount, 0);
  const liabilities = data.netWorth.filter((item) => item.type === "liability").reduce((sum, item) => sum + item.amount, 0);
  const netWorth = cashOnHand + manualAssets - liabilities;

  const goalSaved = data.goals.reduce((sum, item) => sum + item.saved, 0);
  const goalTarget = data.goals.reduce((sum, item) => sum + item.target, 0);
  const goalProgress = goalTarget ? Math.round((goalSaved / goalTarget) * 100) : 0;

  return {
    income,
    expenses,
    cashFlow,
    cashOnHand,
    budgetLeft,
    totalBudgeted,
    totalBudgetSpent,
    budgets,
    unbudgetedCategories,
    manualAssets,
    liabilities,
    netWorth,
    goalSaved,
    goalTarget,
    goalProgress,
  };
};

const loadFinanceData = (): FinanceData => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultData;
  }

  const parsed = JSON.parse(raw) as Partial<FinanceData>;
  const savedNetWorth = parsed.netWorth || defaultData.netWorth;
  const migratedOpeningCashBalance = savedNetWorth.filter(isCashAccount).reduce((sum, item) => sum + item.amount, 0);
  const cleanNetWorth = savedNetWorth.filter((item) => !isCashAccount(item));

  return {
    transactions: parsed.transactions || defaultData.transactions,
    budgets: (parsed.budgets || defaultData.budgets).map((item) => ({
      id: item.id,
      category: item.category,
      limit: item.limit,
    })),
    goals: parsed.goals || defaultData.goals,
    netWorth: cleanNetWorth,
    alerts: parsed.alerts || defaultData.alerts,
    settings: {
      ...defaultData.settings,
      ...parsed.settings,
      openingCashBalance:
        parsed.settings?.openingCashBalance ??
        (migratedOpeningCashBalance || defaultData.settings.openingCashBalance),
    },
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
