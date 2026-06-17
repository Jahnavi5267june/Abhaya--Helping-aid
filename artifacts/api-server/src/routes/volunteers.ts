import { Router } from "express";
import { db, volunteersTable } from "@workspace/db";
import { CreateVolunteerBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { district, skills } = req.query as Record<string, string>;
    let volunteers = await db.select().from(volunteersTable);

    if (district) volunteers = volunteers.filter((v) => v.district === district);
    if (skills) volunteers = volunteers.filter((v) =>
      v.skills.toLowerCase().includes(skills.toLowerCase())
    );

    const result = volunteers
      .filter((v) => v.status === "active")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((v) => ({
        id: v.id,
        name: v.name,
        phone: v.phone,
        email: v.email,
        district: v.district,
        skills: v.skills,
        availability: v.availability,
        status: v.status,
        createdAt: v.createdAt.toISOString(),
      }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list volunteers");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateVolunteerBody.parse(req.body);
    const [volunteer] = await db
      .insert(volunteersTable)
      .values({ ...body, status: "active" })
      .returning();

    res.status(201).json({
      ...volunteer,
      createdAt: volunteer.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to register volunteer");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
