import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const orgRegistrationsTable = pgTable("org_registrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  district: text("district").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  contactPerson: text("contact_person").notNull(),
  registrationNumber: text("registration_number"),
  description: text("description"),
  capacity: text("capacity"),
  documentUrl: text("document_url"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrgRegistrationSchema = createInsertSchema(orgRegistrationsTable).omit({ id: true, createdAt: true, status: true });
export type InsertOrgRegistration = z.infer<typeof insertOrgRegistrationSchema>;
export type OrgRegistration = typeof orgRegistrationsTable.$inferSelect;
