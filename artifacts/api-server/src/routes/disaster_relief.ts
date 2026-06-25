import { Router } from "express";
import { db, disasterReliefTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  ListDisasterReliefQueryParams,
  CreateDisasterReliefBody,
  ContributeToDisasterReliefParams,
  ContributeToDisasterReliefBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListDisasterReliefQueryParams.parse(req.query);
    let campaigns = await db.select().from(disasterReliefTable);

    if (query.status) {
      campaigns = campaigns.filter((c) => c.status === query.status);
    }

    const result = campaigns.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      district: c.district,
      targetAmount: parseFloat(c.targetAmount),
      raisedAmount: parseFloat(c.raisedAmount),
      status: c.status,
      urgencyLevel: c.urgencyLevel,
      startDate: c.startDate?.toISOString() || null,
      endDate: c.endDate?.toISOString() || null,
      contactPhone: c.contactPhone,
      imageUrl: c.imageUrl,
      createdAt: c.createdAt.toISOString(),
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list disaster relief campaigns");
    return res.status(400).json({ error: "Invalid request" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateDisasterReliefBody.parse(req.body);
    const [campaign] = await db
      .insert(disasterReliefTable)
      .values({
        ...body,
        targetAmount: String(body.targetAmount),
        raisedAmount: "0",
        status: "active",
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      })
      .returning();

    res.status(201).json({
      ...campaign,
      targetAmount: parseFloat(campaign.targetAmount),
      raisedAmount: parseFloat(campaign.raisedAmount),
      startDate: campaign.startDate?.toISOString() || null,
      endDate: campaign.endDate?.toISOString() || null,
      createdAt: campaign.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create disaster relief campaign");
    return res.status(400).json({ error: "Invalid request" });
  }
});

router.post("/:id/contribute", async (req, res) => {
  try {
    const params = ContributeToDisasterReliefParams.parse({ id: Number(req.params.id) });
    const body = ContributeToDisasterReliefBody.parse(req.body);

    await db
      .update(disasterReliefTable)
      .set({
        raisedAmount: sql`${disasterReliefTable.raisedAmount} + ${String(body.amount)}`,
      })
      .where(eq(disasterReliefTable.id, params.id));

    const [campaign] = await db
      .select()
      .from(disasterReliefTable)
      .where(eq(disasterReliefTable.id, params.id));

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.json({
      ...campaign,
      targetAmount: parseFloat(campaign.targetAmount),
      raisedAmount: parseFloat(campaign.raisedAmount),
      startDate: campaign.startDate?.toISOString() || null,
      endDate: campaign.endDate?.toISOString() || null,
      createdAt: campaign.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to contribute to disaster relief");
    return res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
