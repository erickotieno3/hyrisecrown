import { Router } from "express";
import { db } from "../db";
import { campaigns, campaignSteps, emailTemplates, leadActivities, leads } from "../../shared/schema/leads";
import { eq, desc, and } from "drizzle-orm";
import { insertLeadSchema, insertEmailTemplateSchema, insertCampaignSchema, insertCampaignStepSchema } from "../../shared/schema/leads";

const leadsRouter = Router();

// Get all leads
leadsRouter.get("/leads", async (req, res) => {
  try {
    const allLeads = await db.query.leads.findMany({
      orderBy: [desc(leads.createdAt)],
    });
    
    res.json(allLeads);
  } catch (error: any) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Failed to fetch leads: " + error.message });
  }
});

// Get lead by ID
leadsRouter.get("/leads/:id", async (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    
    if (isNaN(leadId)) {
      return res.status(400).json({ error: "Invalid lead ID" });
    }
    
    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
    
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    
    // Get lead activities
    const activities = await db.select().from(leadActivities).where(eq(leadActivities.leadId, leadId));
    
    res.json({ lead, activities });
  } catch (error: any) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ error: "Failed to fetch lead: " + error.message });
  }
});

// Create a new lead
leadsRouter.post("/leads", async (req, res) => {
  try {
    const validatedData = insertLeadSchema.parse(req.body);
    
    const [newLead] = await db.insert(leads).values(validatedData).returning();
    
    // Record a "lead_created" activity
    await db.insert(leadActivities).values({
      leadId: newLead.id,
      type: "lead_created",
      data: JSON.stringify({ source: newLead.source }),
    });
    
    // Auto-assign the lead to any relevant campaigns
    // This would be implemented in a real application
    
    res.status(201).json(newLead);
  } catch (error: any) {
    console.error("Error creating lead:", error);
    
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid lead data", details: error.errors });
    }
    
    res.status(500).json({ error: "Failed to create lead: " + error.message });
  }
});

// Update a lead
leadsRouter.patch("/leads/:id", async (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    
    if (isNaN(leadId)) {
      return res.status(400).json({ error: "Invalid lead ID" });
    }
    
    const [existingLead] = await db.select().from(leads).where(eq(leads.id, leadId));
    
    if (!existingLead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    
    // Allow partial updates
    const updateData = req.body;
    
    // If status has changed, record this as an activity
    const statusChanged = updateData.status && updateData.status !== existingLead.status;
    
    const [updatedLead] = await db
      .update(leads)
      .set({
        ...updateData,
        updatedAt: new Date(),
        lastActivityAt: new Date(),
      })
      .where(eq(leads.id, leadId))
      .returning();
    
    if (statusChanged) {
      await db.insert(leadActivities).values({
        leadId,
        type: "status_changed",
        data: JSON.stringify({
          previousStatus: existingLead.status,
          newStatus: updatedLead.status,
        }),
      });
    }
    
    res.json(updatedLead);
  } catch (error: any) {
    console.error("Error updating lead:", error);
    res.status(500).json({ error: "Failed to update lead: " + error.message });
  }
});

// Delete a lead
leadsRouter.delete("/leads/:id", async (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    
    if (isNaN(leadId)) {
      return res.status(400).json({ error: "Invalid lead ID" });
    }
    
    // Delete lead activities first to maintain referential integrity
    await db.delete(leadActivities).where(eq(leadActivities.leadId, leadId));
    
    // Delete the lead
    const [deletedLead] = await db.delete(leads).where(eq(leads.id, leadId)).returning();
    
    if (!deletedLead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    
    res.json({ message: "Lead deleted successfully", lead: deletedLead });
  } catch (error: any) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ error: "Failed to delete lead: " + error.message });
  }
});

// Add a note/activity to a lead
leadsRouter.post("/leads/:id/activities", async (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    
    if (isNaN(leadId)) {
      return res.status(400).json({ error: "Invalid lead ID" });
    }
    
    const { type, data } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: "Activity type is required" });
    }
    
    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
    
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    
    const [activity] = await db
      .insert(leadActivities)
      .values({
        leadId,
        type,
        data: data ? JSON.stringify(data) : null,
      })
      .returning();
    
    // Update the lead's lastActivityAt timestamp
    await db
      .update(leads)
      .set({ lastActivityAt: new Date() })
      .where(eq(leads.id, leadId));
    
    res.status(201).json(activity);
  } catch (error: any) {
    console.error("Error adding activity:", error);
    res.status(500).json({ error: "Failed to add activity: " + error.message });
  }
});

// Email Templates Routes
leadsRouter.get("/email-templates", async (req, res) => {
  try {
    const templates = await db.select().from(emailTemplates);
    res.json(templates);
  } catch (error: any) {
    console.error("Error fetching email templates:", error);
    res.status(500).json({ error: "Failed to fetch email templates: " + error.message });
  }
});

leadsRouter.post("/email-templates", async (req, res) => {
  try {
    const validatedData = insertEmailTemplateSchema.parse(req.body);
    
    const [newTemplate] = await db.insert(emailTemplates).values(validatedData).returning();
    
    res.status(201).json(newTemplate);
  } catch (error: any) {
    console.error("Error creating email template:", error);
    
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid template data", details: error.errors });
    }
    
    res.status(500).json({ error: "Failed to create email template: " + error.message });
  }
});

// Campaigns Routes
leadsRouter.get("/campaigns", async (req, res) => {
  try {
    const allCampaigns = await db.query.campaigns.findMany({
      with: {
        steps: {
          with: {
            template: true,
          },
        },
      },
    });
    
    res.json(allCampaigns);
  } catch (error: any) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Failed to fetch campaigns: " + error.message });
  }
});

leadsRouter.post("/campaigns", async (req, res) => {
  try {
    const { name, targetSegment, steps } = req.body;
    
    const validatedCampaignData = insertCampaignSchema.parse({
      name,
      targetSegment,
    });
    
    // Insert the campaign
    const [newCampaign] = await db.insert(campaigns).values(validatedCampaignData).returning();
    
    // Insert campaign steps if provided
    if (steps && Array.isArray(steps) && steps.length > 0) {
      const campaignStepsData = steps.map((step: any, index: number) => ({
        campaignId: newCampaign.id,
        templateId: step.templateId,
        delay: step.delay,
        delayUnit: step.delayUnit || 'days',
        isEnabled: step.enabled !== false,
        order: index,
      }));
      
      await db.insert(campaignSteps).values(campaignStepsData);
    }
    
    // Fetch the complete campaign with steps
    const [completeNewCampaign] = await db.query.campaigns.findMany({
      where: eq(campaigns.id, newCampaign.id),
      with: {
        steps: {
          with: {
            template: true,
          },
        },
      },
    });
    
    res.status(201).json(completeNewCampaign);
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid campaign data", details: error.errors });
    }
    
    res.status(500).json({ error: "Failed to create campaign: " + error.message });
  }
});

// Update campaign status (e.g., activate/pause)
leadsRouter.patch("/campaigns/:id/status", async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    
    if (isNaN(campaignId)) {
      return res.status(400).json({ error: "Invalid campaign ID" });
    }
    
    const { status } = req.body;
    
    if (!status || !['active', 'paused'].includes(status)) {
      return res.status(400).json({ error: "Valid status (active or paused) is required" });
    }
    
    const [updatedCampaign] = await db
      .update(campaigns)
      .set({ status, updatedAt: new Date() })
      .where(eq(campaigns.id, campaignId))
      .returning();
    
    if (!updatedCampaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    res.json(updatedCampaign);
  } catch (error: any) {
    console.error("Error updating campaign status:", error);
    res.status(500).json({ error: "Failed to update campaign status: " + error.message });
  }
});

export default leadsRouter;