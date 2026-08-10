import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/transfers/api-auth";
import { getDashboardTransferStats, failStaleTransfers } from "@/lib/transfers/queries";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const ZERO_REVENUE = {
  daily: { current: 0, changePercent: 0 },
  weekly: { current: 0, changePercent: 0 },
  monthly: { current: 0, changePercent: 0 },
};

export async function GET() {
  const user = await requireApiUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    await failStaleTransfers();
    const stats = await getDashboardTransferStats();
    return NextResponse.json({ ...stats, revenue: ZERO_REVENUE });
  } catch (error) {
    logger.error("get dashboard transfer stats failed", { error });
    return NextResponse.json({ error: "DASHBOARD_FAILED" }, { status: 500 });
  }
}
