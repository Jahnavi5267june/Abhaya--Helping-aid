import { Router } from "express";
import { db, organizationsTable, donationsTable, helpRequestsTable, disasterReliefTable, communityAlertsTable } from "@workspace/db";
import { eq, sql, count } from "drizzle-orm";

const router = Router();

router.get("/overview", async (req, res) => {
  try {
    const [orgsCount] = await db.select({ count: count() }).from(organizationsTable);
    const [verifiedCount] = await db
      .select({ count: count() })
      .from(organizationsTable)
      .where(eq(organizationsTable.verified, true));

    const [donationsCount] = await db.select({ count: count() }).from(donationsTable);
    const donorEmails = await db
      .selectDistinct({ email: donationsTable.donorEmail })
      .from(donationsTable);

    const [helpCount] = await db.select({ count: count() }).from(helpRequestsTable);
    const [resolvedCount] = await db
      .select({ count: count() })
      .from(helpRequestsTable)
      .where(eq(helpRequestsTable.status, "resolved"));

    const [activeDisaster] = await db
      .select({ count: count() })
      .from(disasterReliefTable)
      .where(eq(disasterReliefTable.status, "active"));

    const fundsResult = await db
      .select({ total: sql<string>`COALESCE(SUM(raised_amount::numeric), 0)` })
      .from(disasterReliefTable);

    const [communityAlertsCount] = await db.select({ count: count() }).from(communityAlertsTable);

    res.json({
      totalOrganizations: orgsCount.count,
      totalDonors: donorEmails.length,
      totalDonations: donationsCount.count,
      totalHelpRequests: helpCount.count,
      resolvedHelpRequests: resolvedCount.count,
      activeDisasterCampaigns: activeDisaster.count,
      totalFundsRaised: parseFloat(fundsResult[0]?.total || "0"),
      verifiedOrganizations: verifiedCount.count,
      totalCommunityAlerts: communityAlertsCount.count,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats overview");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

router.get("/donations-by-type", async (req, res) => {
  try {
    const rows = await db
      .select({
        type: donationsTable.donationType,
        count: count(),
      })
      .from(donationsTable)
      .groupBy(donationsTable.donationType);

    const total = rows.reduce((sum, r) => sum + r.count, 0);

    const result = rows.map((r) => ({
      type: r.type,
      count: r.count,
      percentage: total > 0 ? Math.round((r.count / total) * 100 * 10) / 10 : 0,
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get donations by type");
    res.status(500).json({ error: "Failed to get donation stats" });
  }
});

export default router;
