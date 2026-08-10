import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createPermissionsSchema } from "@/lib/roles/roles";
import { getRolePermissions, upsertRolePermissions } from "@/lib/roles/queries";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { logger } from "@/lib/logger";

export async function GET() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await getRolePermissions();
  return NextResponse.json({ rows });
}

export async function PUT(request: Request) {
  const session = await getSession();
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const locale = isLocale(acceptLanguage) ? acceptLanguage : "ar";
  const t = getDictionary(locale);

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: t.authorization.unauthorized }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createPermissionsSchema(t).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? t.authorization.saveError },
      { status: 400 },
    );
  }

  try {
    await upsertRolePermissions(parsed.data.role, parsed.data.permissions, session.user.id);
    return NextResponse.json({ success: true, message: t.authorization.saved });
  } catch (error) {
    logger.error("permissions save failed", { error });
    return NextResponse.json({ error: t.authorization.saveError }, { status: 500 });
  }
}
