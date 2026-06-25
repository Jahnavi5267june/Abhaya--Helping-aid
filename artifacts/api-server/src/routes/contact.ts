import { Router } from "express";
import { db, contactMessagesTable } from "@workspace/db";
import { CreateContactMessageBody } from "@workspace/api-zod";
import { notifyContactMessage } from "../lib/email.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const messages = await db.select().from(contactMessagesTable);
    const result = messages
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        subject: m.subject,
        message: m.message,
        organization: m.organization,
        status: m.status,
        createdAt: m.createdAt.toISOString(),
      }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list contact messages");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateContactMessageBody.parse(req.body);
    const [msg] = await db
      .insert(contactMessagesTable)
      .values({ ...body, status: "new" })
      .returning();

    res.status(201).json({
      ...msg,
      createdAt: msg.createdAt.toISOString(),
    });

    notifyContactMessage({
      name: msg.name,
      email: msg.email,
      phone: msg.phone,
      subject: msg.subject,
      message: msg.message,
      organization: msg.organization,
    }).catch(() => {});
  } catch (err) {
    req.log.error({ err }, "Failed to submit contact message");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
