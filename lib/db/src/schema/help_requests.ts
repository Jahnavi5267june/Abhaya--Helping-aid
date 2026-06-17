import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const helpRequestsTable = pgTable("help_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  location: text("location").notNull(),
  district: text("district"),
  category: text("category").notNull(),
  description: text("description").notNull(),
  urgency: text("urgency").notNull(),
  status: text("status").default("pending").notNull(),
  photoUrl: text("photo_url"),
  validationStatus: text("validation_status").default("unverified").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHelpRequestSchema = createInsertSchema(helpRequestsTable).omit({ id: true, createdAt: true, status: true });
export type InsertHelpRequest = z.infer<typeof insertHelpRequestSchema>;
export type HelpRequest = typeof helpRequestsTable.$inferSelect;
