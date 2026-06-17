import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const communityAlertsTable = pgTable("community_alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  district: text("district").notNull(),
  urgency: text("urgency").notNull().default("medium"),
  status: text("status").notNull().default("open"),
  reporterName: text("reporter_name").notNull(),
  reporterPhone: text("reporter_phone").notNull(),
  reporterEmail: text("reporter_email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommunityAlertSchema = createInsertSchema(communityAlertsTable).omit({ id: true, createdAt: true, status: true });
export type InsertCommunityAlert = z.infer<typeof insertCommunityAlertSchema>;
export type CommunityAlert = typeof communityAlertsTable.$inferSelect;
