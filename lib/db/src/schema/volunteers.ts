import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const volunteersTable = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  district: text("district").notNull(),
  skills: text("skills").notNull(),
  availability: text("availability").notNull().default("weekends"),
  status: text("status").notNull().default("active"),
  aadhaarRef: text("aadhaar_ref"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVolunteerSchema = createInsertSchema(volunteersTable).omit({ id: true, createdAt: true, status: true });
export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type Volunteer = typeof volunteersTable.$inferSelect;
