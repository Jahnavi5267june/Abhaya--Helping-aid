import { Router } from "express";
import { db, communityAlertsTable } from "@workspace/db";
import { CreateCommunityAlertBody, ListCommunityAlertsQueryParams } from "@workspace/api-zod";
import { notifyNewCommunityAlert } from "../lib/email.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListCommunityAlertsQueryParams.parse(req.query);
    let alerts = await db.select().from(communityAlertsTable);

    if (query.status) alerts = alerts.filter((a) => a.status === query.status);
    if (query.district) alerts = alerts.filter((a) => a.district === query.district);
    if (query.category) alerts = alerts.filter((a) => a.category === query.category);

    const result = alerts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        location: a.location,
        district: a.district,
        urgency: a.urgency,
        status: a.status,
        reporterName: a.reporterName,
        reporterPhone: a.reporterPhone,
        reporterEmail: a.reporterEmail,
        createdAt: a.createdAt.toISOString(),
      }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list community alerts");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateCommunityAlertBody.parse(req.body);
    const [alert] = await db
      .insert(communityAlertsTable)
      .values({ ...body, status: "open" })
      .returning();

    res.status(201).json({
      ...alert,
      createdAt: alert.createdAt.toISOString(),
    });

    notifyNewCommunityAlert({
      title: alert.title,
      description: alert.description,
      category: alert.category,
      location: alert.location,
      district: alert.district,
      urgency: alert.urgency,
      reporterName: alert.reporterName,
      reporterPhone: alert.reporterPhone,
    }).catch(() => {});
  } catch (err) {
    req.log.error({ err }, "Failed to create community alert");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
