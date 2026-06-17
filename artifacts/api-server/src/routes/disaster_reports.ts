import { Router } from "express";
import { db, disasterReportsTable } from "@workspace/db";
import { CreateDisasterReportBody } from "@workspace/api-zod";
import { notifyNewDisasterReport } from "../lib/email.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { district, type, status } = req.query as Record<string, string>;
    let reports = await db.select().from(disasterReportsTable);

    if (district) reports = reports.filter((r) => r.district === district);
    if (type) reports = reports.filter((r) => r.disasterType === type);
    if (status) reports = reports.filter((r) => r.status === status);

    const result = reports
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        disasterType: r.disasterType,
        location: r.location,
        district: r.district,
        severity: r.severity,
        status: r.status,
        photoUrl: r.photoUrl,
        reporterName: r.reporterName,
        reporterPhone: r.reporterPhone,
        reporterEmail: r.reporterEmail,
        affectedCount: r.affectedCount,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list disaster reports");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateDisasterReportBody.parse(req.body);
    const [report] = await db
      .insert(disasterReportsTable)
      .values({ ...body, status: "reported" })
      .returning();

    res.status(201).json({
      ...report,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    });

    notifyNewDisasterReport({
      title: report.title,
      description: report.description,
      disasterType: report.disasterType,
      location: report.location,
      district: report.district,
      severity: report.severity,
      reporterName: report.reporterName,
      reporterPhone: report.reporterPhone,
      affectedCount: report.affectedCount,
    }).catch(() => {});
  } catch (err) {
    req.log.error({ err }, "Failed to create disaster report");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body as { status: string };
    const valid = ["reported", "verified", "responding", "resolved"];
    if (!valid.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    const { eq } = await import("drizzle-orm");
    const [updated] = await db
      .update(disasterReportsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(disasterReportsTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update disaster report status");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
