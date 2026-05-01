import { Router } from "express";
import { db, organizationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListOrganizationsQueryParams,
  CreateOrganizationBody,
  GetOrganizationParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListOrganizationsQueryParams.parse(req.query);
    let orgs = await db.select().from(organizationsTable);

    if (query.type && query.type !== "all") {
      orgs = orgs.filter((o) => o.type === query.type);
    }
    if (query.district) {
      orgs = orgs.filter((o) =>
        o.district.toLowerCase().includes(query.district!.toLowerCase())
      );
    }

    const result = orgs.map((o) => ({
      id: o.id,
      name: o.name,
      type: o.type,
      district: o.district,
      address: o.address,
      phone: o.phone,
      email: o.email,
      latitude: o.latitude ? parseFloat(o.latitude) : null,
      longitude: o.longitude ? parseFloat(o.longitude) : null,
      capacity: o.capacity,
      currentOccupancy: o.currentOccupancy,
      description: o.description,
      established: o.established,
      verified: o.verified,
      imageUrl: o.imageUrl,
      createdAt: o.createdAt.toISOString(),
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list organizations");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateOrganizationBody.parse(req.body);
    const [org] = await db
      .insert(organizationsTable)
      .values({
        ...body,
        latitude: String(body.latitude),
        longitude: String(body.longitude),
        verified: false,
      })
      .returning();

    res.status(201).json({
      ...org,
      latitude: org.latitude ? parseFloat(org.latitude) : null,
      longitude: org.longitude ? parseFloat(org.longitude) : null,
      createdAt: org.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create organization");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const params = GetOrganizationParams.parse({ id: Number(req.params.id) });
    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, params.id));

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.json({
      ...org,
      latitude: org.latitude ? parseFloat(org.latitude) : null,
      longitude: org.longitude ? parseFloat(org.longitude) : null,
      createdAt: org.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get organization");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
