import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireApiUser } from "@/lib/transfers/api-auth";
import { db, schema } from "@/lib/db";
import { logAudit } from "@/lib/transfers/audit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: Context) {
  const user = await requireApiUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const [job] = await db
      .select({ id: schema.transferJobs.id, status: schema.transferJobs.status })
      .from(schema.transferJobs)
      .where(eq(schema.transferJobs.id, id));

    if (!job) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    const now = new Date();
    if (job.status === "PENDING" || job.status === "PAUSED") {
      await db
        .update(schema.transferJobs)
        .set({ status: "CANCELLED", endTime: now, updatedAt: now })
        .where(eq(schema.transferJobs.id, id));
    } else if (job.status === "RUNNING") {
      await db
        .update(schema.transferJobs)
        .set({ cancelRequestedAt: now, updatedAt: now })
        .where(eq(schema.transferJobs.id, id));
    } else {
      return NextResponse.json({ error: "NOT_CANCELLABLE" }, { status: 409 });
    }

    await logAudit({
      action: "TRANSFER_CANCELLED",
      entityType: "TRANSFER_JOB",
      entityId: id,
      userId: user.id,
      metadata: { status: job.status },
    });
    logger.info("transfer cancel requested", { jobId: id, userId: user.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("cancel transfer failed", { error });
    return NextResponse.json({ error: "CANCEL_FAILED" }, { status: 500 });
  }
}
