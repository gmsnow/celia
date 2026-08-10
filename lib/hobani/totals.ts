import { asc, desc, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export interface HobaniTotalRow {
  day: Date;
  period: string;
  totalCards: number;
  totalAmount: number;
  totalCardValue: number;
}

export async function getHobaniTotals(): Promise<HobaniTotalRow[]> {
  const rows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${schema.hobaniIncome.createdAt}), 'YYYY-MM-DD')`,
      period: schema.hobaniIncome.period,
      totalCards: sql<number>`coalesce(sum(${schema.hobaniIncome.quantity}), 0)`,
      totalAmount: sql<number>`coalesce(sum(${schema.hobaniIncome.income}), 0)`,
      totalCardValue: sql<number>`coalesce(sum(${schema.hobaniIncome.cardType} * ${schema.hobaniIncome.quantity}), 0)`,
    })
    .from(schema.hobaniIncome)
    .groupBy(
      sql`date_trunc('day', ${schema.hobaniIncome.createdAt})`,
      schema.hobaniIncome.period,
    )
    .orderBy(
      desc(sql`date_trunc('day', ${schema.hobaniIncome.createdAt})`),
      asc(schema.hobaniIncome.period),
    );

  return rows.map((row) => ({
    day: new Date(`${row.day}T00:00:00`),
    period: row.period,
    totalCards: Number(row.totalCards ?? 0),
    totalAmount: Number(row.totalAmount ?? 0),
    totalCardValue: Number(row.totalCardValue ?? 0),
  }));
}
