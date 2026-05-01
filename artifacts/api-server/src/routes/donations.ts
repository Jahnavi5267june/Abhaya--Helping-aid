import { Router } from "express";
import { db, donationsTable, organizationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListDonationsQueryParams,
  CreateDonationBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListDonationsQueryParams.parse(req.query);
    let donations = await db.select().from(donationsTable);

    if (query.organizationId) {
      donations = donations.filter((d) => d.organizationId === query.organizationId);
    }
    if (query.type) {
      donations = donations.filter((d) => d.donationType === query.type);
    }

    const orgs = await db.select().from(organizationsTable);
    const orgMap = new Map(orgs.map((o) => [o.id, o.name]));

    const result = donations.map((d) => ({
      id: d.id,
      donorName: d.donorName,
      donorEmail: d.donorEmail,
      donorPhone: d.donorPhone,
      donorCity: d.donorCity,
      donationType: d.donationType,
      amount: d.amount ? parseFloat(d.amount) : null,
      description: d.description,
      organizationId: d.organizationId,
      organizationName: orgMap.get(d.organizationId) || "",
      status: d.status,
      createdAt: d.createdAt.toISOString(),
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list donations");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateDonationBody.parse(req.body);
    const [donation] = await db
      .insert(donationsTable)
      .values({
        ...body,
        amount: body.amount ? String(body.amount) : null,
        status: "pending",
      })
      .returning();

    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, donation.organizationId));

    res.status(201).json({
      ...donation,
      amount: donation.amount ? parseFloat(donation.amount) : null,
      organizationName: org?.name || "",
      createdAt: donation.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create donation");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
