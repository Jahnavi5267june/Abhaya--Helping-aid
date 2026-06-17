import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const disasterReportsTable = pgTable("disaster_reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  disasterType: text("disaster_type").notNull(),
  location: text("location").notNull(),
  district: text("district").notNull(),
  severity: text("severity").notNull().default("medium"),
  status: text("status").notNull().default("reported"),
  photoUrl: text("photo_url"),
  reporterName: text("reporter_name").notNull(),
  reporterPhone: text("reporter_phone").notNull(),
  reporterEmail: text("reporter_email"),
  affectedCount: text("affected_count"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDisasterReportSchema = createInsertSchema(disasterReportsTable).omit({ id: true, createdAt: true, updatedAt: true, status: true });
export type InsertDisasterReport = z.infer<typeof insertDisasterReportSchema>;
export type DisasterReport = typeof disasterReportsTable.$inferSelect;
