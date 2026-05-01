import { pgTable, serial, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const disasterReliefTable = pgTable("disaster_relief", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  district: text("district").notNull(),
  targetAmount: numeric("target_amount", { precision: 14, scale: 2 }).notNull(),
  raisedAmount: numeric("raised_amount", { precision: 14, scale: 2 }).default("0").notNull(),
  status: text("status").default("active").notNull(),
  urgencyLevel: text("urgency_level").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  contactPhone: text("contact_phone"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDisasterReliefSchema = createInsertSchema(disasterReliefTable).omit({ id: true, createdAt: true, raisedAmount: true, status: true });
export type InsertDisasterRelief = z.infer<typeof insertDisasterReliefSchema>;
export type DisasterRelief = typeof disasterReliefTable.$inferSelect;
