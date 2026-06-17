import { Router } from "express";
import { db, orgRegistrationsTable } from "@workspace/db";
import { CreateOrgRegistrationBody } from "@workspace/api-zod";
import { notifyNewOrgRegistration } from "../lib/email.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { status } = req.query as Record<string, string>;
    let regs = await db.select().from(orgRegistrationsTable);
    if (status) regs = regs.filter((r) => r.status === status);
    const result = regs
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        district: r.district,
        address: r.address,
        phone: r.phone,
        email: r.email,
        contactPerson: r.contactPerson,
        registrationNumber: r.registrationNumber,
        description: r.description,
        capacity: r.capacity,
        documentUrl: r.documentUrl,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list org registrations");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateOrgRegistrationBody.parse(req.body);
    const [reg] = await db
      .insert(orgRegistrationsTable)
      .values({ ...body, status: "pending" })
      .returning();

    res.status(201).json({
      ...reg,
      createdAt: reg.createdAt.toISOString(),
    });

    notifyNewOrgRegistration({
      name: reg.name,
      type: reg.type,
      district: reg.district,
      contactPerson: reg.contactPerson,
      email: reg.email,
      phone: reg.phone,
    }).catch(() => {});
  } catch (err) {
    req.log.error({ err }, "Failed to create org registration");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body as { status: string };
    const valid = ["pending", "approved", "rejected"];
    if (!valid.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    const { eq } = await import("drizzle-orm");
    const [updated] = await db
      .update(orgRegistrationsTable)
      .set({ status })
      .where(eq(orgRegistrationsTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update org registration status");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
