export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
  accentSoft: string;
};

export const navItems: NavItem[] = [
  {
    href: "/transaction",
    label: "Transactions",
    shortLabel: "TX",
    description: "Capture income and expenses with cleaner daily tracking.",
    accent: "#7ce0b8",
    accentSoft: "rgba(124, 224, 184, 0.14)",
  },
  {
    href: "/budgets",
    label: "Budgets",
    shortLabel: "BG",
    description: "Set limits once and let transactions track category usage automatically.",
    accent: "#89c2ff",
    accentSoft: "rgba(137, 194, 255, 0.14)",
  },
  {
    href: "/goals",
    label: "Goals",
    shortLabel: "GL",
    description: "Turn savings targets into milestones you can actually follow.",
    accent: "#ffcf79",
    accentSoft: "rgba(255, 207, 121, 0.14)",
  },
  {
    href: "/networth",
    label: "Net Worth",
    shortLabel: "NW",
    description: "See cash, long-term assets, and debt in one cleaner balance sheet.",
    accent: "#d5b2ff",
    accentSoft: "rgba(213, 178, 255, 0.14)",
  },
  {
    href: "/alerts",
    label: "Alerts",
    shortLabel: "AL",
    description: "Surface budget, bill, and momentum signals without noise.",
    accent: "#ff907a",
    accentSoft: "rgba(255, 144, 122, 0.14)",
  },
  {
    href: "/settings",
    label: "Settings",
    shortLabel: "ST",
    description: "Tune currency, guardrails, and your automatic cash starting point.",
    accent: "#8fe3e0",
    accentSoft: "rgba(143, 227, 224, 0.14)",
  },
];
