import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Lead table
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number"),
  company: text("company"),
  interest: text("interest").notNull(),
  message: text("message"),
  source: text("source").notNull().default("website"),
  status: text("status").notNull().default("new"),
  hasSubscribed: boolean("has_subscribed").notNull().default(true),
  tags: text("tags").array(),
  notes: text("notes"),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email Templates
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  type: text("type").notNull().default("email"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Follow-up Campaigns
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  targetSegment: text("target_segment").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Campaign Steps
export const campaignSteps = pgTable("campaign_steps", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  templateId: integer("template_id").notNull(),
  delay: integer("delay").notNull(),
  delayUnit: text("delay_unit").notNull().default("days"),
  isEnabled: boolean("is_enabled").notNull().default(true),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lead Activities (interactions with leads)
export const leadActivities = pgTable("lead_activities", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull(),
  type: text("type").notNull(), // email_sent, email_opened, note_added, status_changed, etc.
  data: text("data"), // JSON data related to the activity
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const leadsRelations = relations(leads, ({ many }) => ({
  activities: many(leadActivities),
}));

export const campaignsRelations = relations(campaigns, ({ many }) => ({
  steps: many(campaignSteps),
}));

export const campaignStepsRelations = relations(campaignSteps, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignSteps.campaignId],
    references: [campaigns.id],
  }),
  template: one(emailTemplates, {
    fields: [campaignSteps.templateId],
    references: [emailTemplates.id],
  }),
}));

export const leadActivitiesRelations = relations(leadActivities, ({ one }) => ({
  lead: one(leads, {
    fields: [leadActivities.leadId],
    references: [leads.id],
  }),
}));

// Schemas for insertion
export const insertLeadSchema = createInsertSchema(leads, {
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  interest: z.string().min(1, "Please select an area of interest"),
  tags: z.array(z.string()).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true, lastActivityAt: true });

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates, {
  name: z.string().min(2, "Template name must be at least 2 characters"),
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  body: z.string().min(10, "Message body must be at least 10 characters"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertCampaignSchema = createInsertSchema(campaigns, {
  name: z.string().min(2, "Campaign name must be at least 2 characters"),
  targetSegment: z.string().min(1, "Please select a target segment"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertCampaignStepSchema = createInsertSchema(campaignSteps, {
  campaignId: z.number().positive(),
  templateId: z.number().positive(),
  delay: z.number().min(1),
  delayUnit: z.enum(["minutes", "hours", "days", "weeks"]),
  order: z.number().min(0),
}).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type CampaignStep = typeof campaignSteps.$inferSelect;
export type InsertCampaignStep = z.infer<typeof insertCampaignStepSchema>;

export type LeadActivity = typeof leadActivities.$inferSelect;