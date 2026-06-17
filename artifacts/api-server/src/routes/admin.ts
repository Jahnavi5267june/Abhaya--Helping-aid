import { Router } from "express";
import { db, organizationsTable, donationsTable, helpRequestsTable, documentsTable, disasterReliefTable, communityAlertsTable, disasterReportsTable, volunteersTable, orgRegistrationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "abhaya-admin-2024";

router.post("/auth", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: Buffer.from(ADMIN_PASSWORD).toString("base64") });
    return;
  }
  res.status(401).json({ error: "Invalid password" });
});

function requireAdmin(req: any, res: any, next: any) {
  const auth = req.headers["x-admin-token"];
  if (!auth || Buffer.from(auth as string, "base64").toString() !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

router.patch("/organizations/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = z.object({
      name: z.string().optional(),
      type: z.string().optional(),
      district: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      capacity: z.number().optional(),
      currentOccupancy: z.number().optional(),
      description: z.string().optional(),
      verified: z.boolean().optional(),
    }).parse(req.body);

    const [org] = await db
      .update(organizationsTable)
      .set(body)
      .where(eq(organizationsTable.id, id))
      .returning();

    if (!org) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...org, latitude: org.latitude ? parseFloat(org.latitude) : null, longitude: org.longitude ? parseFloat(org.longitude) : null, createdAt: org.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update organization");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.patch("/donations/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = z.object({ status: z.enum(["pending", "confirmed", "delivered"]) }).parse(req.body);
    const [donation] = await db
      .update(donationsTable)
      .set({ status })
      .where(eq(donationsTable.id, id))
      .returning();

    if (!donation) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...donation, amount: donation.amount ? parseFloat(donation.amount) : null, createdAt: donation.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update donation");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.patch("/help-requests/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = z.object({ status: z.enum(["pending", "in_progress", "resolved"]) }).parse(req.body);
    const [request] = await db
      .update(helpRequestsTable)
      .set({ status })
      .where(eq(helpRequestsTable.id, id))
      .returning();

    if (!request) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...request, createdAt: request.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update help request");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.patch("/disaster-relief/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = z.object({ status: z.enum(["active", "closed", "upcoming"]).optional(), urgencyLevel: z.string().optional() }).parse(req.body);
    const [campaign] = await db
      .update(disasterReliefTable)
      .set(body)
      .where(eq(disasterReliefTable.id, id))
      .returning();

    if (!campaign) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...campaign, targetAmount: parseFloat(campaign.targetAmount), raisedAmount: parseFloat(campaign.raisedAmount), createdAt: campaign.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update disaster relief");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.patch("/community-alerts/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = z.object({ status: z.enum(["open", "fulfilled", "closed"]) }).parse(req.body);
    const [alert] = await db
      .update(communityAlertsTable)
      .set({ status })
      .where(eq(communityAlertsTable.id, id))
      .returning();

    if (!alert) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...alert, createdAt: alert.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update community alert");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.delete("/organizations/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(organizationsTable).where(eq(organizationsTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete organization");
    res.status(500).json({ error: "Failed" });
  }
});

router.delete("/help-requests/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(helpRequestsTable).where(eq(helpRequestsTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete help request");
    res.status(500).json({ error: "Failed" });
  }
});

router.delete("/donations/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(donationsTable).where(eq(donationsTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete donation");
    res.status(500).json({ error: "Failed" });
  }
});

router.delete("/documents/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(documentsTable).where(eq(documentsTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete document");
    res.status(500).json({ error: "Failed" });
  }
});

router.delete("/community-alerts/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(communityAlertsTable).where(eq(communityAlertsTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete community alert");
    res.status(500).json({ error: "Failed" });
  }
});

router.patch("/disaster-reports/:id/status", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = z.object({ status: z.enum(["reported", "verified", "responding", "resolved"]) }).parse(req.body);
    const [report] = await db.update(disasterReportsTable).set({ status }).where(eq(disasterReportsTable.id, id)).returning();
    if (!report) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...report, createdAt: report.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update disaster report");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.delete("/disaster-reports/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(disasterReportsTable).where(eq(disasterReportsTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete disaster report");
    res.status(500).json({ error: "Failed" });
  }
});

router.patch("/volunteers/:id/status", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = z.object({ status: z.string() }).parse(req.body);
    const [vol] = await db.update(volunteersTable).set({ status }).where(eq(volunteersTable.id, id)).returning();
    if (!vol) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...vol, createdAt: vol.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update volunteer");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.delete("/volunteers/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(volunteersTable).where(eq(volunteersTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete volunteer");
    res.status(500).json({ error: "Failed" });
  }
});

router.patch("/org-registrations/:id/status", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = z.object({ status: z.enum(["pending", "approved", "rejected"]) }).parse(req.body);
    const [reg] = await db.update(orgRegistrationsTable).set({ status }).where(eq(orgRegistrationsTable.id, id)).returning();
    if (!reg) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...reg, createdAt: reg.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update org registration");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.delete("/org-registrations/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(orgRegistrationsTable).where(eq(orgRegistrationsTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete org registration");
    res.status(500).json({ error: "Failed" });
  }
});

export default router;
