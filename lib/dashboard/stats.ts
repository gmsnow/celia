import { getCopyPricePerGB } from "@/lib/pricing/copy-price-store";

export interface DayStats {
  completedCopies: number;
  uncompletedCopies: number;
  sizeGB: number;
  hobaniIncome: number;
}

export interface SalesPoint {
  day: string;
  total: number;
}

export interface RevenuePeriod {
  current: number;
  previous: number;
  changePercent: number;
}

export interface RevenueCards {
  daily: RevenuePeriod;
  weekly: RevenuePeriod;
  monthly: RevenuePeriod;
}

export interface MonthlyRevenuePoint {
  month: string;
  profit: number;
  expenses: number;
  advance: number;
}

export interface RevenueChartStats {
  months: MonthlyRevenuePoint[];
}

export interface DashboardStats {
  today: DayStats;
  yesterday: DayStats;
  sales: SalesPoint[];
  revenue: RevenueCards;
  revenueChart: RevenueChartStats;
}

export const REFERENCE_REVENUE_MONTHS: MonthlyRevenuePoint[] = [
  { month: "يناير", profit: 0, expenses: 0, advance: 0 },
  { month: "فبراير", profit: 0, expenses: 0, advance: 0 },
  { month: "مارس", profit: 0, expenses: 0, advance: 0 },
  { month: "أبريل", profit: 0, expenses: 0, advance: 0 },
  { month: "مايو", profit: 0, expenses: 0, advance: 0 },
  { month: "يونيو", profit: 0, expenses: 0, advance: 0 },
  { month: "يوليو", profit: 0, expenses: 0, advance: 0 },
  { month: "أغسطس", profit: 0, expenses: 0, advance: 0 },
  { month: "سبتمبر", profit: 0, expenses: 0, advance: 0 },
  { month: "أكتوبر", profit: 0, expenses: 0, advance: 0 },
  { month: "نوفمبر", profit: 0, expenses: 0, advance: 0 },
  { month: "ديسمبر", profit: 0, expenses: 0, advance: 0 },
];

const EMPTY_DAY: DayStats = {
  completedCopies: 0,
  uncompletedCopies: 0,
  sizeGB: 0,
  hobaniIncome: 0,
};

function startOfLocalDay(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

async function loadTodayTransferDayStats(day: Date): Promise<DayStats> {
  try {
    const { db, schema } = await import("@/lib/db");
    const { gte, count, sql } = await import("drizzle-orm");
    const rows = await db
      .select({
        status: schema.transferJobs.status,
        files: count(),
        bytes: sql<number>`coalesce(sum(${schema.transferJobs.transferredSize}), 0)`,
      })
      .from(schema.transferJobs)
      .where(gte(schema.transferJobs.createdAt, day))
      .groupBy(schema.transferJobs.status);

    const stats: DayStats = { ...EMPTY_DAY };
    for (const row of rows) {
      if (row.status === "COMPLETED") {
        stats.completedCopies = row.files;
        stats.sizeGB = Number((Number(row.bytes ?? 0) / 1024 ** 3).toFixed(2));
      }
      if (row.status === "FAILED" || row.status === "CANCELLED") {
        stats.uncompletedCopies += row.files;
      }
    }
    return stats;
  } catch {
    return EMPTY_DAY;
  }
}

async function loadHobaniIncomeFor(day: Date): Promise<number> {
  try {
    const { db, schema } = await import("@/lib/db");
    const { gte, lt, and, sql } = await import("drizzle-orm");
    const end = new Date(day);
    end.setDate(end.getDate() + 1);
    const [row] = await db
      .select({ income: sql<number>`coalesce(sum(${schema.hobaniIncome.income}), 0)` })
      .from(schema.hobaniIncome)
      .where(and(gte(schema.hobaniIncome.createdAt, day), lt(schema.hobaniIncome.createdAt, end)));
    return Number(row?.income ?? 0);
  } catch {
    return 0;
  }
}

function changePercent(current: number, previous: number): number {
  if (previous <= 0) return 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

async function loadCopyRevenueFor(from: Date, to: Date, pricePerGB: number): Promise<number> {
  try {
    const { db, schema } = await import("@/lib/db");
    const { gte, lt, and, eq, sql } = await import("drizzle-orm");
    const [row] = await db
      .select({ bytes: sql<number>`coalesce(sum(${schema.transferJobs.transferredSize}), 0)` })
      .from(schema.transferJobs)
      .where(
        and(
          eq(schema.transferJobs.status, "COMPLETED"),
          gte(schema.transferJobs.createdAt, from),
          lt(schema.transferJobs.createdAt, to),
        ),
      );
    const sizeGB = Number(row?.bytes ?? 0) / 1024 ** 3;
    return sizeGB * pricePerGB;
  } catch {
    return 0;
  }
}

async function loadRevenueFor(from: Date, to: Date, pricePerGB: number): Promise<number> {
  try {
    const { db, schema } = await import("@/lib/db");
    const { gte, lt, and, sql } = await import("drizzle-orm");
    const [copies, hobani, sales, wallet] = await Promise.all([
      loadCopyRevenueFor(from, to, pricePerGB),
      db
        .select({ total: sql<number>`coalesce(sum(${schema.hobaniIncome.income}), 0)` })
        .from(schema.hobaniIncome)
        .where(and(gte(schema.hobaniIncome.createdAt, from), lt(schema.hobaniIncome.createdAt, to))),
      db
        .select({ total: sql<number>`coalesce(sum(${schema.productSales.total}), 0)` })
        .from(schema.productSales)
        .where(and(gte(schema.productSales.createdAt, from), lt(schema.productSales.createdAt, to))),
      db
        .select({ total: sql<number>`coalesce(sum(${schema.balanceCharge.amount}), 0)` })
        .from(schema.balanceCharge)
        .where(and(gte(schema.balanceCharge.createdAt, from), lt(schema.balanceCharge.createdAt, to))),
    ]);

    return (
      Number(copies ?? 0) +
      Number(hobani[0]?.total ?? 0) +
      Number(sales[0]?.total ?? 0) +
      Number(wallet[0]?.total ?? 0)
    );
  } catch {
    return 0;
  }
}

async function loadMonthlyAdvances(months: MonthlyRevenuePoint[]): Promise<MonthlyRevenuePoint[]> {
  try {
    const { db, schema } = await import("@/lib/db");
    const { eq, sql } = await import("drizzle-orm");
    const year = new Date().getFullYear();
    const rows = await db
      .select({
        month: sql<number>`extract(month from ${schema.advances.advanceDate})`,
        total: sql<number>`coalesce(sum(${schema.advances.amount}::numeric), 0)`,
      })
      .from(schema.advances)
      .where(eq(sql`extract(year from ${schema.advances.advanceDate})`, year))
      .groupBy(sql`extract(month from ${schema.advances.advanceDate})`);

    const result = months.map((m) => ({ ...m }));
    for (const row of rows) {
      const index = Number(row.month) - 1;
      if (result[index]) result[index].advance = Number(row.total ?? 0);
    }
    return result;
  } catch {
    return months;
  }
}

async function computeRevenueCards(
  periodRevenue: (from: Date, to: Date, pricePerGB: number) => Promise<number>,
): Promise<RevenueCards> {
  const todayStart = startOfLocalDay();
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  const prevMonthStart = new Date(monthStart);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

  const pricePerGB = await getCopyPricePerGB();

  const [todayRevenue, yesterdayRevenue, weekRevenue, prevWeekRevenue, monthRevenue, prevMonthRevenue] =
    await Promise.all([
      periodRevenue(todayStart, tomorrowStart, pricePerGB),
      periodRevenue(yesterdayStart, todayStart, pricePerGB),
      periodRevenue(weekStart, tomorrowStart, pricePerGB),
      periodRevenue(prevWeekStart, weekStart, pricePerGB),
      periodRevenue(monthStart, tomorrowStart, pricePerGB),
      periodRevenue(prevMonthStart, monthStart, pricePerGB),
    ]);

  return {
    daily: {
      current: todayRevenue,
      previous: yesterdayRevenue,
      changePercent: changePercent(todayRevenue, yesterdayRevenue),
    },
    weekly: {
      current: weekRevenue,
      previous: prevWeekRevenue,
      changePercent: changePercent(weekRevenue, prevWeekRevenue),
    },
    monthly: {
      current: monthRevenue,
      previous: prevMonthRevenue,
      changePercent: changePercent(monthRevenue, prevMonthRevenue),
    },
  };
}

export async function getRevenueCards(): Promise<RevenueCards> {
  return computeRevenueCards(loadRevenueFor);
}

export async function getCopyRevenueCards(): Promise<RevenueCards> {
  return computeRevenueCards(loadCopyRevenueFor);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const todayStart = startOfLocalDay();
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const today = await loadTodayTransferDayStats(todayStart);
  today.hobaniIncome = await loadHobaniIncomeFor(todayStart);

  const yesterday = await loadTodayTransferDayStats(yesterdayStart);
  yesterday.hobaniIncome = await loadHobaniIncomeFor(yesterdayStart);

  const [revenue, revenueChartMonths] = await Promise.all([
    getRevenueCards(),
    loadMonthlyAdvances(REFERENCE_REVENUE_MONTHS),
  ]);

  return {
    today,
    yesterday,
    sales: [],
    revenue,
    revenueChart: {
      months: revenueChartMonths,
    },
  };
}
