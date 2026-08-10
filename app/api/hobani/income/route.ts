import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db, schema } from "@/lib/db";
import { createHobaniIncomeSchema } from "@/lib/hobani/income";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const session = await getSession();
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const locale = isLocale(acceptLanguage) ? acceptLanguage : "ar";
  const t = getDictionary(locale);

  if (!session?.user) {
    return NextResponse.json({ error: t.hobani.unauthorized }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createHobaniIncomeSchema(t).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? t.hobani.invalidData },
      { status: 400 },
    );
  }

  try {
    const [row] = await db
      .insert(schema.hobaniIncome)
      .values({
        income: parsed.data.income.toString(),
        period: parsed.data.period,
        cardType: parsed.data.cardType ?? null,
        quantity: parsed.data.quantity,
        createdBy: session.user.id,
      })
      .returning({ id: schema.hobaniIncome.id });

    return NextResponse.json({ success: true, message: t.hobani.successMessage, id: row.id });
  } catch (error) {
    logger.error("hobani income insert failed", { error });
    return NextResponse.json({ error: t.hobani.saveError }, { status: 500 });
  }
}
