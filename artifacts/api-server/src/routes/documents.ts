import { Router } from "express";
import { db, documentsTable, organizationsTable } from "@workspace/db";
import { ListDocumentsQueryParams, CreateDocumentBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListDocumentsQueryParams.parse(req.query);
    let docs = await db.select().from(documentsTable);

    if (query.organizationId) {
      docs = docs.filter((d) => d.organizationId === query.organizationId);
    }
    if (query.category) {
      docs = docs.filter((d) => d.category === query.category);
    }

    const orgs = await db.select().from(organizationsTable);
    const orgMap = new Map(orgs.map((o) => [o.id, o.name]));

    const result = docs.map((d) => ({
      id: d.id,
      organizationId: d.organizationId,
      organizationName: orgMap.get(d.organizationId) || "",
      title: d.title,
      category: d.category,
      year: d.year,
      fileUrl: d.fileUrl,
      verifiedBy: d.verifiedBy,
      description: d.description,
      uploadedAt: d.uploadedAt.toISOString(),
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list documents");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateDocumentBody.parse(req.body);
    const [doc] = await db.insert(documentsTable).values(body).returning();

    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, doc.organizationId));

    res.status(201).json({
      ...doc,
      organizationName: org?.name || "",
      uploadedAt: doc.uploadedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create document");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
