import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db, schema } from "@/lib/db";
import { createExpenseSchema } from "@/lib/expenses/expense";
import { getExpenses } from "@/lib/expenses/queries";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { logger } from "@/lib/logger";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await getExpenses();
  return NextResponse.json(summary);
}

export async function POST(request: Request) {
  const session = await getSession();
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const locale = isLocale(acceptLanguage) ? acceptLanguage : "ar";
  const t = getDictionary(locale);

  if (!session?.user) {
    return NextResponse.json({ error: t.addExpense.unauthorized }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createExpenseSchema(t).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? t.addExpense.invalidData },
      { status: 400 },
    );
  }

  try {
    const [row] = await db
      .insert(schema.expenses)
      .values({
        type: parsed.data.type,
        amount: parsed.data.amount.toString(),
        paymentMethod: parsed.data.paymentMethod,
        expenseDate: new Date(parsed.data.expenseDate),
        notes: parsed.data.notes,
        createdBy: session.user.id,
      })
      .returning({ id: schema.expenses.id });

    return NextResponse.json({ success: true, message: t.addExpense.successMessage, id: row.id });
  } catch (error) {
    logger.error("expense insert failed", { error });
    return NextResponse.json({ error: t.addExpense.saveError }, { status: 500 });
  }
}
