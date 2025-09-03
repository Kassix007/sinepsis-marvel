/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Filter,
  AlertTriangle,
  Info,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { RevenueExpensesTrend } from "@/components/analytics/RevenueExpensesTrend";
import { useStarkledgerData } from "@/hooks/useStarkledgerData";

/* =========================
   CONFIG
========================= */
const CSV_PATH = "/data/starkledger_financial_dataset.csv"; // put the CSV in /public/data

/* =========================
   TYPES
========================= */
interface FinancialDataItem {
  id: string;
  department: string;
  revenue: number;
  expenses: number;
  budget: number;
  utilization: number; // % of budget spent
  profit: number;
  growth: number;
  risk: "low" | "medium" | "high";
  monthLabel: string; // e.g., "Jul-24" or "July 2024"
}

interface AlertItem {
  id: number;
  type: "info" | "warning" | "critical";
  message: string;
  timestamp: string;
}

interface TrendDataItem {
  month: string;
  revenue: number;
  expenses: number;
}

interface ProfitDataItem {
  department: string;
  profit: number;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}
interface CardHeaderProps {
  children: React.ReactNode;
}
interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface FinancialCardProps {
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
}

interface DepartmentSelectorProps {
  departments: string[];
  onDepartmentChange: (department: string) => void;
  selectedDepartment: string; // normalized ("all" or a dept name)
}

interface AlertsPanelProps {
  alerts: AlertItem[];
}

interface TrendChartProps {
  data: TrendDataItem[] | ProfitDataItem[];
  title: string;
  type: "line" | "bar";
  isLoading?: boolean;
}

interface DataState {
  financialData: FinancialDataItem[];
  alertsData: AlertItem[];
  revenueExpenseTrends: TrendDataItem[];
  profitAnalysis: ProfitDataItem[];
  isLoading: boolean;
  lastUpdated: string;
}

/* =========================
   DATE PARSERS
========================= */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function parseMonYY(label: string): Date | null {
  // expects like "Jul-24"
  const m = /^([A-Za-z]{3})-(\d{2})$/.exec(label.trim());
  if (!m) return null;
  const mon = MONTHS.indexOf(m[1] as (typeof MONTHS)[number]);
  if (mon < 0) return null;
  const year = 2000 + Number(m[2]);
  return new Date(year, mon, 1);
}

// Fallbacks: "July 2024", "2024-07", "07/2024", etc.
function parseMonthGeneric(label: string): Date | null {
  const t = label?.trim();
  if (!t) return null;

  // Try native Date first
  const d1 = new Date(t);
  if (!isNaN(d1.getTime())) return new Date(d1.getFullYear(), d1.getMonth(), 1);

  // Try "MonthName YYYY"
  const m2 = /^([A-Za-z]+)\s+(\d{4})$/.exec(t);
  if (m2) {
    const monthIdx = MONTHS.map((m) => m.toLowerCase()).findIndex((m) =>
      m2[1].toLowerCase().startsWith(m)
    );
    if (monthIdx >= 0) return new Date(Number(m2[2]), monthIdx, 1);
  }

  // Try "YYYY-MM"
  const m3 = /^(\d{4})-(\d{1,2})$/.exec(t);
  if (m3) {
    const y = Number(m3[1]);
    const mm = Number(m3[2]) - 1;
    if (y > 1900 && mm >= 0 && mm < 12) return new Date(y, mm, 1);
  }

  return null;
}

function parseMonthLabel(label: string): Date | null {
  return parseMonYY(label) ?? parseMonthGeneric(label);
}

/* =========================
   CSV HELPERS
========================= */
function toNumber(v: string | number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalizeDept(d: string): string {
  const t = (d || "").trim();
  if (!t || t === "-" || t.toLowerCase() === "nil") return "Unassigned";
  return t;
}

async function fetchCsvText(path: string): Promise<string> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load CSV (${res.status})`);
  return await res.text();
}

// Simple CSV splitter (assumes no quoted commas). Use Papa if your data is complex.
function simpleCsvParse(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = lines[i].split(",").map((c) => c.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] ?? "";
    });
    rows.push(obj);
  }
  return rows;
}

/* =========================
   DATA BUILDERS
========================= */
async function loadFinancialFromCsv(): Promise<{
  financialData: FinancialDataItem[];
  revenueExpenseTrends: TrendDataItem[];
  profitAnalysis: ProfitDataItem[];
  alertsData: AlertItem[];
}> {
  const text = await fetchCsvText(CSV_PATH);
  const rows = simpleCsvParse(text);

  // CSV columns:
  // Department, Month, Revenue, Expenses, Profit/Loss, Budget Allocation, Forecasted Growth %, Risk Flag
  type Raw = {
    Department: string;
    Month: string;
    Revenue: string;
    Expenses: string;
    "Profit/Loss": string;
    "Budget Allocation": string;
    "Forecasted Growth %": string;
    "Risk Flag": string;
  };

  // Group by department, keep latest Month row
  const latestByDept = new Map<string, Raw>();
  for (const r0 of rows as Raw[]) {
    const dept = normalizeDept(r0.Department);
    const dNew = parseMonthLabel(r0.Month);
    if (!dNew) continue;
    const prev = latestByDept.get(dept);
    if (!prev) {
      latestByDept.set(dept, r0);
    } else {
      const dPrev = parseMonthLabel(prev.Month);
      if (!dPrev || dNew > dPrev) latestByDept.set(dept, r0);
    }
  }

  const financialData: FinancialDataItem[] = [];
  for (const [dept, r] of latestByDept) {
    const revenue = toNumber(r.Revenue);
    const expenses = toNumber(r.Expenses);
    const profit = toNumber((r as any)["Profit/Loss"]);
    const budget = toNumber((r as any)["Budget Allocation"]);
    const growth = toNumber((r as any)["Forecasted Growth %"]);
    const riskRaw = ((r as any)["Risk Flag"] || "").toLowerCase();
    const risk: "low" | "medium" | "high" = riskRaw.includes("high")
      ? "high"
      : riskRaw.includes("medium")
      ? "medium"
      : "low";
    const utilization = budget > 0 ? Math.min(100, Math.round((expenses / budget) * 100)) : 0;

    financialData.push({
      id: `${dept}-${r.Month}`,
      department: dept,
      revenue,
      expenses,
      budget,
      utilization,
      profit,
      growth,
      risk,
      monthLabel: r.Month,
    });
  }

  // Trends: sum totals by month across all departments, keep most recent 8
  const byMonth = new Map<string, { revenue: number; expenses: number; d: Date }>();
  for (const r of rows as Raw[]) {
    const d = parseMonthLabel(r.Month);
    if (!d) continue;
    const key = r.Month;
    const entry = byMonth.get(key) || { revenue: 0, expenses: 0, d };
    entry.revenue += toNumber(r.Revenue);
    entry.expenses += toNumber(r.Expenses);
    byMonth.set(key, entry);
  }
  const monthAgg = Array.from(byMonth.entries())
    .sort((a, b) => a[1].d.getTime() - b[1].d.getTime())
    .slice(-8)
    .map(([label, agg]) => ({
      month: label,
      revenue: agg.revenue,
      expenses: agg.expenses,
    }));

  // Profit analysis: use the same departments surfaced (latest month’s profit)
  const profitAnalysis: ProfitDataItem[] = financialData
    .map((f) => ({ department: f.department, profit: f.profit }))
    .sort((a, b) => b.profit - a.profit);

  // Alerts
  const alerts: AlertItem[] = [];
  let id = 1;
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  // Over-budget warnings
  for (const f of financialData) {
    if (f.budget > 0 && f.expenses > f.budget) {
      const overPct = ((f.expenses - f.budget) / f.budget) * 100;
      alerts.push({
        id: id++,
        type: "warning",
        message: `${f.department} expenses exceeded budget by ${overPct.toFixed(1)}% (${f.monthLabel})`,
        timestamp: now,
      });
    }
  }
  // Critical risks
  for (const f of financialData) {
    if (f.risk === "high") {
      alerts.push({
        id: id++,
        type: "critical",
        message: `${f.department} flagged as HIGH operational risk (${f.monthLabel})`,
        timestamp: now,
      });
    }
  }
  // Info: top growth
  const topGrowth = [...financialData].sort((a, b) => b.growth - a.growth)[0];
  if (topGrowth) {
    alerts.push({
      id: id++,
      type: "info",
      message: `${topGrowth.department} shows strongest growth (+${topGrowth.growth}%)`,
      timestamp: now,
    });
  }

  return {
    financialData: financialData.sort((a, b) => a.department.localeCompare(b.department)),
    revenueExpenseTrends: monthAgg,
    profitAnalysis,
    alertsData: alerts,
  };
}

/* =========================
   UI PRIMITIVES
========================= */
const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`bg-gray-900/50 border border-gray-800 rounded-lg ${className}`}>{children}</div>
);
const CardHeader: React.FC<CardHeaderProps> = ({ children }) => (
  <div className="p-4 sm:p-6 pb-2 sm:pb-3">{children}</div>
);
const CardTitle: React.FC<CardTitleProps> = ({ children, className = "" }) => (
  <h3 className={`font-semibold ${className}`}>{children}</h3>
);
const CardContent: React.FC<CardContentProps> = ({ children, className = "" }) => (
  <div className={`p-4 sm:p-6 pt-0 ${className}`}>{children}</div>
);
const LoadingSpinner: React.FC<{ size?: "sm" | "md" | "lg" }> = ({ size = "md" }) => {
  const sizeClasses = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return (
    <div className="flex items-center justify-center">
      <RefreshCw className={`${sizeClasses[size]} animate-spin text-red-500`} />
    </div>
  );
};

/* =========================
   CARDS / PANELS
========================= */
const FinancialCard: React.FC<FinancialCardProps> = ({ title, value, trend }) => {
  const getTrendIcon = (): React.ReactElement => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />;
    }
  };
  return (
    <Card className="hover:bg-gray-800/30 transition-all duration-300 transform hover:scale-[1.02]">
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-400 truncate mb-1">{title}</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">{value}</p>
          </div>
          <div className="flex-shrink-0 ml-2">{getTrendIcon()}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  departments,
  onDepartmentChange,
  selectedDepartment,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    onDepartmentChange(e.target.value);
  return (
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
      <select
        value={selectedDepartment}
        onChange={handleChange}
        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
      >
        <option value="all">All Departments</option>
        {departments.map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </select>
    </div>
  );
};

const ExportPanel: React.FC<{ onExport: () => void; onRefresh: () => void; isLoading: boolean }> = ({
  onExport,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white p-2 rounded-lg transition-colors duration-200"
        title="Refresh Data"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
      </button>
      <Download className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
      <button
        onClick={onExport}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
      >
        Export Report
      </button>
    </div>
  );
};

const AlertsPanel: React.FC<AlertsPanelProps & { isLoading: boolean }> = ({
  alerts,
  isLoading,
}) => {
  const getAlertIcon = (type: AlertItem["type"]): React.ReactElement => {
    switch (type) {
      case "critical":
        return <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />;
    }
  };
  const getAlertBorderColor = (type: AlertItem["type"]): string => {
    switch (type) {
      case "critical":
        return "border-l-red-500";
      case "warning":
        return "border-l-yellow-500";
      default:
        return "border-l-blue-500";
    }
  };
  return (
    <Card className="mb-6 sm:mb-8">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl text-white flex items-center gap-2">
          System Alerts
          {isLoading && <LoadingSpinner size="sm" />}
        </CardTitle>
      </CardHeader>
<CardContent>
  {isLoading ? (
    <div className="flex justify-center py-8">
      <LoadingSpinner />
    </div>
  ) : (
    <div className="space-y-3">
      {/* peer checkbox to toggle expansion (no React state needed) */}
      <input id="alerts_expand" type="checkbox" className="peer sr-only" />

      {alerts.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No alerts available</p>
      ) : (
        <>
          {/* always show first 3 */}
          {alerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 sm:p-4 bg-gray-800/40 rounded-lg border-l-4 ${getAlertBorderColor(
                alert.type
              )}`}
            >
              {getAlertIcon(alert.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-white leading-relaxed">
                  {alert.message}
                </p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  {alert.timestamp}
                </p>
              </div>
            </div>
          ))}

          {/* the rest are hidden until expanded */}
          {alerts.length > 3 && (
            <>
              <div className="hidden peer-checked:block space-y-3">
                {alerts.slice(3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 sm:p-4 bg-gray-800/40 rounded-lg border-l-4 ${getAlertBorderColor(
                      alert.type
                    )}`}
                  >
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base text-white leading-relaxed">
                        {alert.message}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400 mt-1">
                        {alert.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* toggle buttons */}
              <div className="mt-2 flex justify-center">
                {/* Show more (visible when collapsed) */}
                <label
                  htmlFor="alerts_expand"
                  role="button"
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-gray-700 hover:bg-gray-600 transition-colors peer-checked:hidden"
                >
                  Show more
                </label>

                {/* Show less (visible when expanded) */}
                <label
                  htmlFor="alerts_expand"
                  role="button"
                  className="hidden peer-checked:inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  Show less
                </label>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )}
</CardContent>

    </Card>
  );
};

/* =========================
   MAIN
========================= */
const Starkledger: React.FC = () => {
  // Use a normalized internal form: "all" or the exact department string
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const [dataState, setDataState] = useState<DataState>({
    financialData: [],
    alertsData: [],
    revenueExpenseTrends: [],
    profitAnalysis: [],
    isLoading: true,
    lastUpdated: "",
  });

  // Lightweight CSV loader for charts (Papa-based hook)
  const { rows, loading, error } = useStarkledgerData(); // loads /data/starkledger_financial_dataset.csv

  // Fetch and build richer aggregates for cards/table/alerts
  const fetchAllData = async () => {
    setDataState((prev) => ({ ...prev, isLoading: true }));
    try {
      const { financialData, revenueExpenseTrends, profitAnalysis, alertsData } =
        await loadFinancialFromCsv();
      setDataState({
        financialData,
        alertsData,
        revenueExpenseTrends,
        profitAnalysis,
        isLoading: false,
        lastUpdated: new Date().toLocaleString(),
      });
    } catch (err) {
      console.error("Error loading CSV:", err);
      setDataState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading data…</div>;
  if (error) return <div className="p-6 text-sm text-red-500">Error: {error}</div>;

  // Build a department list from state (ensures same ordering as rest of UI)
  const departments = Array.from(
    new Set(dataState.financialData.map((item) => item.department))
  ).sort();

  // Filtering
  const filteredFinancialData =
    selectedDepartment === "all"
      ? dataState.financialData
      : dataState.financialData.filter((item) => item.department === selectedDepartment);

  // Totals
  const totalRevenue = filteredFinancialData.reduce((acc, d) => acc + d.revenue, 0);
  const totalExpenses = filteredFinancialData.reduce((acc, d) => acc + d.expenses, 0);
  const totalProfit = filteredFinancialData.reduce((acc, d) => acc + d.profit, 0);
  const profitMargin =
    totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  // Risk index
  const riskLevels = filteredFinancialData.map((d) => d.risk);
  let riskIndex = "Low";
  if (riskLevels.includes("high")) riskIndex = "High";
  else if (riskLevels.includes("medium")) riskIndex = "Medium";

  const getRiskBadgeClass = (risk: FinancialDataItem["risk"]): string => {
    switch (risk) {
      case "low":
        return "bg-green-900 text-green-300";
      case "medium":
        return "bg-yellow-900 text-yellow-300";
      case "high":
        return "bg-red-900 text-red-300";
      default:
        return "bg-gray-900 text-gray-300";
    }
  };

  // Export (current filter)
  const handleExport = () => {
    const rows = filteredFinancialData;
    const headers = [
      "Department",
      "Month",
      "Revenue",
      "Expenses",
      "Budget",
      "Utilization(%)",
      "Profit",
      "Growth(%)",
      "Risk",
    ];
    const lines = [
      headers.join(","),
      ...rows.map((r) =>
        [
          r.department,
          r.monthLabel,
          r.revenue,
          r.expenses,
          r.budget,
          r.utilization,
          r.profit,
          r.growth,
          r.risk,
        ].join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const suffix =
      selectedDepartment === "all"
        ? "all"
        : selectedDepartment.replace(/\s+/g, "_");
    a.download = `starkledger_export_${suffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDepartmentChange = (department: string) => {
    // normalize "All"/"all"/"ALL" → "all"
    const v = department.trim().toLowerCase() === "all" ? "all" : department;
    setSelectedDepartment(v);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-[2000px] mx-auto">
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden mb-8">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
                backgroundSize: "12px 12px",
              }}
            />
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "conic-gradient(from 0deg, rgba(255,0,0,0.5), rgba(255,200,0,0.5), rgba(0,200,255,0.5), rgba(255,0,0,0.5))",
                maskImage:
                  "radial-gradient(circle at center, rgba(0,0,0,1) 65%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(circle at center, rgba(0,0,0,1) 65%, transparent 100%)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-extrabold uppercase tracking-tight text-yellow-300 drop-shadow-[3px_3px_0px_rgba(0,0,0,0.7)] sm:text-5xl md:text-6xl">
                <span className="bg-gradient-to-r from-red-500 via-yellow-400 to-sky-400 bg-[length:200%_auto] bg-clip-text text-transparent [animation:shine_6s_linear_infinite]">
                  Stark Dashboard
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg font-comic">
                Assemble your insights like Earth&apos;s mightiest heroes — bold,
                colorful, and ready for action.
                {dataState.lastUpdated && (
                  <span className="block mt-2 text-sm text-gray-400">
                    Last updated: {dataState.lastUpdated}
                  </span>
                )}
              </p>
            </div>
          </div>

          <style jsx>{`
            @keyframes shine {
              0% {
                background-position: 0% 50%;
              }
              100% {
                background-position: 200% 50%;
              }
            }
            .font-comic {
              font-family: "Comic Sans MS", "Comic Neue", cursive;
            }
          `}</style>
        </section>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="order-1 sm:order-2">
            <ExportPanel
              onExport={handleExport}
              onRefresh={fetchAllData}
              isLoading={dataState.isLoading}
            />
          </div>

        </div>

        {/* Alerts */}
        <AlertsPanel alerts={dataState.alertsData} isLoading={dataState.isLoading} />

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <FinancialCard
            title="Total Revenue"
            value={`$${(totalRevenue / 1_000_000).toFixed(1)}M`}
            trend="up"
          />
          <FinancialCard
            title="Expenses"
            value={`$${(totalExpenses / 1_000_000).toFixed(1)}M`}
            trend="down"
          />
          <FinancialCard
            title="Profit Margin"
            value={`${profitMargin}%`}
            trend="up"
          />
          <FinancialCard title="Risk Index" value={riskIndex} trend="neutral" />
        </div>

        {/* Trend Chart (passes normalized department) */}
        <RevenueExpensesTrend
          rows={rows}
          selectedDepartment={selectedDepartment} // "all" or department name
          deptKey="Department"
          currency="MUR"
        />

        {/* Table */}
        <Card className="overflow-hidden mt-6">
          <CardHeader>
      
            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-white flex items-center gap-2">
              Financial Data by Department
              {selectedDepartment !== "all" && (
                <span className="text-sm font-normal text-gray-400">
                  (Filtered: {selectedDepartment})
                </span>
              )}
              {dataState.isLoading && <LoadingSpinner size="sm" />}
            </CardTitle><br></br> 
                                    <DepartmentSelector
              departments={departments}
              onDepartmentChange={handleDepartmentChange}
              selectedDepartment={selectedDepartment}
            />
               
          </CardHeader>
          <CardContent className="p-0">
            {dataState.isLoading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm md:text-base">
                  <thead className="bg-gray-800 text-gray-300 sticky top-0">
                    <tr>
                      <th className="p-2 sm:p-3 md:p-4 text-left font-medium">
                        Department
                      </th>
                      <th className="p-2 sm:p-3 md:p-4 text-right font-medium whitespace-nowrap">
                        Revenue
                      </th>
                      <th className="p-2 sm:p-3 md:p-4 text-right font-medium whitespace-nowrap">
                        Expenses
                      </th>
                      <th className="p-2 sm:p-3 md:p-4 text-right font-medium whitespace-nowrap">
                        Budget
                      </th>
                      <th className="p-2 sm:p-3 md:p-4 text-center font-medium whitespace-nowrap">
                        Util%
                      </th>
                      <th className="p-2 sm:p-3 md:p-4 text-right font-medium whitespace-nowrap">
                        Profit
                      </th>
                      <th className="p-2 sm:p-3 md:p-4 text-center font-medium whitespace-nowrap">
                        Growth
                      </th>
                      <th className="p-2 sm:p-3 md:p-4 text-center font-medium">
                        Risk
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFinancialData.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-400">
                          No data available for selected department
                        </td>
                      </tr>
                    ) : (
                      filteredFinancialData.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-gray-700 hover:bg-gray-800/40 transition-colors duration-200"
                        >
                          <td className="p-2 sm:p-3 md:p-4 font-medium text-white">
                            <div className="truncate max-w-[120px] sm:max-w-none">
                              {row.department}
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 text-right text-green-400 font-medium">
                            ${(row.revenue / 1_000_000).toFixed(1)}M
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 text-right text-red-400 font-medium">
                            ${(row.expenses / 1_000_000).toFixed(1)}M
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 text-right text-gray-300">
                            ${(row.budget / 1_000_000).toFixed(1)}M
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 text-center text-yellow-400 font-medium">
                            {row.utilization}%
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 text-right text-blue-400 font-medium">
                            ${(row.profit / 1000).toFixed(0)}K
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 text-center text-green-400 font-medium">
                            {row.growth >= 0 ? `+${row.growth}%` : `${row.growth}%`}
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRiskBadgeClass(
                                row.risk
                              )}`}
                            >
                              {row.risk}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Starkledger;
