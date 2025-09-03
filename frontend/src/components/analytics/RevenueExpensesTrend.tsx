/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/analytics/RevenueExpensesTrend.tsx
"use client";

import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { exportToCSV, type Row as ExportRow } from "@/utils/exporters";

type Row = Record<string, any>;
type Timeframe = 6 | 12 | "all";

interface RevenueExpensesTrendProps {
  rows?: Row[];
  selectedDepartment: string; // "all" or dept
  deptKey?: string;           // default: "Department"
  currency?: string;          // default: "MUR"
}

function formatMoney(n: number, currency: string) {
  if (!isFinite(n)) return "-";
  return new Intl.NumberFormat("en-MU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

function getUniqueOrder<T>(arr: T[]) {
  const seen = new Set<T>();
  const order: T[] = [];
  for (const x of arr) {
    if (!seen.has(x)) {
      seen.add(x);
      order.push(x);
    }
  }
  return order;
}

function aggregateByMonth(
  rows: Row[],
  dept: string,
  deptKey: string
): { month: string; revenue: number; expenses: number; profit: number }[] {
  const filtered =
    dept === "all" ? rows : rows.filter((r) => String(r?.[deptKey]) === dept);

  const monthOrder = getUniqueOrder<string>(filtered.map((r) => String(r?.Month)));

  const map = new Map<string, { month: string; revenue: number; expenses: number }>();
  for (const r of filtered) {
    const month = String(r?.Month);
    const revenue = Number(r?.["Revenue"]) || 0;
    const expenses = Number(r?.["Expenses"]) || 0;
    const bucket = map.get(month) ?? { month, revenue: 0, expenses: 0 };
    bucket.revenue += revenue;
    bucket.expenses += expenses;
    map.set(month, bucket);
  }

  const data = monthOrder
    .map((m) => map.get(m))
    .filter(Boolean)
    .map((x) => ({
      month: x!.month,
      revenue: x!.revenue,
      expenses: x!.expenses,
      profit: x!.revenue - x!.expenses,
    }));

  return data;
}

function lastN<T>(arr: T[], n: number | "all"): T[] {
  if (n === "all") return arr;
  return arr.slice(Math.max(0, arr.length - n));
}

function pctDelta(curr: number, prev: number): number | null {
  if (!isFinite(curr) || !isFinite(prev) || prev === 0) return null;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

const TrendStat: React.FC<{
  label: string;
  value: string;
  sub?: string;
  positive?: boolean | null;
}> = ({ label, value, sub, positive }) => (
  <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
    <div className="space-y-1">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold text-foreground">{value}</div>
      {typeof sub === "string" && (
        <div className="text-xs text-muted-foreground">{sub}</div>
      )}
    </div>
    {positive != null && (
      <div
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
          positive
            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
            : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
        }`}
      >
        {positive ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
        {positive ? "Up" : "Down"}
      </div>
    )}
  </div>
);

const CustomTooltip = ({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  currency: string;
}) => {
  if (active && payload && payload.length) {
    const rec: any = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-sm">
        <div className="font-medium text-foreground">{label}</div>
        <div className="mt-1 space-y-0.5 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Revenue</span>
            <span className="font-medium">{formatMoney(rec.revenue, currency)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Expenses</span>
            <span className="font-medium">{formatMoney(rec.expenses, currency)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Profit</span>
            <span className="font-medium">{formatMoney(rec.profit, currency)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const RevenueExpensesTrend: React.FC<RevenueExpensesTrendProps> = ({
  rows = [],
  selectedDepartment,
  deptKey = "Department",
  currency = "MUR",
}) => {
  const [timeframe, setTimeframe] = React.useState<Timeframe>(12);
  const [showRevenue, setShowRevenue] = React.useState(true);
  const [showExpenses, setShowExpenses] = React.useState(true);

  const base = React.useMemo(
    () => aggregateByMonth(rows, selectedDepartment, deptKey),
    [rows, selectedDepartment, deptKey]
  );

  const data = React.useMemo(() => lastN(base, timeframe), [base, timeframe]);

  const totals = React.useMemo(() => {
    const rev = data.reduce((s, d) => s + d.revenue, 0);
    const exp = data.reduce((s, d) => s + d.expenses, 0);
    const prof = rev - exp;

    const last = data.at(-1);
    const prev = data.length > 1 ? data[data.length - 2] : undefined;
    const revDelta = last && prev ? pctDelta(last.revenue, prev.revenue) : null;
    const expDelta = last && prev ? pctDelta(last.expenses, prev.expenses) : null;

    return { rev, exp, prof, revDelta, expDelta };
  }, [data]);

  const exportView = () => {
    const exportRows: ExportRow[] = data.map((d) => ({
      Department: selectedDepartment === "all" ? "All" : selectedDepartment,
      Month: d.month,
      Revenue: d.revenue,
      Expenses: d.expenses,
      Profit: d.profit,
    }));
    const date = new Date().toISOString().slice(0, 10);
    const suffix =
      selectedDepartment === "all"
        ? "all-departments"
        : selectedDepartment.replace(/\s+/g, "-").toLowerCase();
    exportToCSV(exportRows, `trend-${suffix}-${timeframe}-${date}.csv`);
  };

  return (
    <Card className="w-full border border-border bg-card rounded-xl p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="text-base font-semibold text-foreground">
            Revenue & Expenses Trend
          </div>
          <div className="text-sm text-muted-foreground">
            {selectedDepartment === "all" ? "All departments" : selectedDepartment}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex gap-1 rounded-lg border border-border p-1">
            <Button
              variant={timeframe === 6 ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeframe(6)}
            >
              6M
            </Button>
            <Button
              variant={timeframe === 12 ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeframe(12)}
            >
              12M
            </Button>
            <Button
              variant={timeframe === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeframe("all")}
            >
              All
            </Button>
          </div>

          <div className="inline-flex gap-1 rounded-lg border border-border p-1">
            <Button
              variant={showRevenue ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowRevenue((s) => !s)}
            >
              Revenue
            </Button>
            <Button
              variant={showExpenses ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowExpenses((s) => !s)}
            >
              Expenses
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={exportView}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Export view (CSV)
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <TrendStat
          label="Total Revenue"
          value={formatMoney(totals.rev, currency)}
          sub={
            totals.revDelta == null
              ? "—"
              : `${totals.revDelta > 0 ? "+" : ""}${totals.revDelta.toFixed(1)}% vs prev month`
          }
          positive={totals.revDelta == null ? null : totals.revDelta >= 0}
        />
        <TrendStat
          label="Total Expenses"
          value={formatMoney(totals.exp, currency)}
          sub={
            totals.expDelta == null
              ? "—"
              : `${totals.expDelta > 0 ? "+" : ""}${totals.expDelta.toFixed(1)}% vs prev month`
          }
          positive={totals.expDelta == null ? null : totals.expDelta < 0 ? false : true}
        />
        <TrendStat
          label="Net Profit"
          value={formatMoney(totals.prof, currency)}
          sub={data.length ? `Across ${data.length} month(s)` : "No data"}
          positive={totals.prof >= 0}
        />
      </div>

      {/* Chart */}
      <div className="mt-6 h-[280px] w-full rounded-lg border border-border bg-background/50 p-2 md:p-4">
        {data.length === 0 ? (
          <div className="h-full grid place-items-center text-sm text-muted-foreground">
            No data available for this selection.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) =>
                  new Intl.NumberFormat("en-MU", { notation: "compact" }).format(v as number)
                }
                width={68}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Legend />
              {showRevenue && (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="hsl(var(--primary))"
                  fill="url(#rev)"
                />
              )}
              {showExpenses && (
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="hsl(var(--muted-foreground))"
                  fill="url(#exp)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
