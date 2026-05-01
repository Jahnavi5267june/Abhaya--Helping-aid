import { Router } from "express";
import { db, helpRequestsTable } from "@workspace/db";
import { ListHelpRequestsQueryParams, CreateHelpRequestBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListHelpRequestsQueryParams.parse(req.query);
    let requests = await db.select().from(helpRequestsTable);

    if (query.status) {
      requests = requests.filter((r) => r.status === query.status);
    }
    if (query.category) {
      requests = requests.filter((r) => r.category === query.category);
    }

    const result = requests.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      email: r.email,
      location: r.location,
      district: r.district,
      category: r.category,
      description: r.description,
      urgency: r.urgency,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list help requests");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateHelpRequestBody.parse(req.body);
    const [request] = await db
      .insert(helpRequestsTable)
      .values({ ...body, status: "pending" })
      .returning();

    res.status(201).json({
      ...request,
      createdAt: request.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create help request");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
