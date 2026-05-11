import { pgTable, text, serial, integer, boolean, varchar, timestamp, jsonb, real, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Countries schema
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: varchar("code", { length: 2 }).notNull().unique(),
  flagUrl: text("flag_url").notNull(),
  continent: text("continent").notNull(),
  active: boolean("active").default(true).notNull(),
  comingSoon: boolean("coming_soon").default(false).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
});

export const insertCountrySchema = createInsertSchema(countries).omit({
  id: true,
});

// Stores schema
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url").notNull(),
  websiteUrl: text("website_url"),
  countryId: integer("country_id").notNull(),
  active: boolean("active").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  type: varchar("type", { length: 50 }),
  apiUrl: text("api_url"),
  apiKey: text("api_key"),
  updateInterval: integer("update_interval"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
});

// Categories schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  parentId: integer("parent_id"),
  displayOrder: integer("display_order").default(0).notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

// Products schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  categoryId: integer("category_id").notNull(),
  barcode: text("barcode"),
  brand: text("brand"),
  active: boolean("active").default(true).notNull(),
  featured: boolean("featured").default(false).notNull(),
  source: varchar("source", { length: 50 }),
  externalId: text("external_id"),
  attributes: jsonb("attributes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

// Product Prices schema
export const productPrices = pgTable("product_prices", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  storeId: integer("store_id").notNull(),
  price: real("price").notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  originalPrice: real("original_price"),
  discountPercentage: real("discount_percentage"),
  inStock: boolean("in_stock").default(true).notNull(),
  onSale: boolean("on_sale").default(false),
  url: text("url"),
  lastChecked: timestamp("last_checked"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const productPricesPK = primaryKey(
  productPrices.productId,
  productPrices.storeId
);

export const insertProductPriceSchema = createInsertSchema(productPrices).omit({
  id: true,
  lastUpdated: true,
});

// Newsletter subscribers schema
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  subscribed: boolean("subscribed").default(true).notNull(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  countryCode: varchar("country_code", { length: 2 }),
  language: varchar("language", { length: 5 }),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).pick({
  email: true,
  countryCode: true,
  language: true,
});

// Languages schema
export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 5 }).notNull().unique(),
  name: text("name").notNull(),
  nativeName: text("native_name").notNull(),
  active: boolean("active").default(true).notNull(),
});

export const insertLanguageSchema = createInsertSchema(languages).omit({
  id: true,
});

// Define types
export type Country = typeof countries.$inferSelect;
export type InsertCountry = z.infer<typeof insertCountrySchema>;

export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type ProductPrice = typeof productPrices.$inferSelect;
export type InsertProductPrice = z.infer<typeof insertProductPriceSchema>;

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;

export type Language = typeof languages.$inferSelect;
export type InsertLanguage = z.infer<typeof insertLanguageSchema>;

// Extended types for frontend use
export type ProductWithPrices = Product & {
  prices: (ProductPrice & { store: Store })[];
  category: Category;
};

export type StoreWithCountry = Store & {
  country: Country;
};

export type CountryWithStores = Country & {
  stores: Store[];
};

// Blog Posts schema
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  imageUrl: text("image_url"),
  authorName: text("author_name").default("Tesco Price Comparison").notNull(),
  categoryId: integer("category_id"),
  tags: text("tags").array(),
  publishedDate: timestamp("published_date").defaultNow().notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  isAutomated: boolean("is_automated").default(false).notNull(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  relatedProductIds: integer("related_product_ids").array(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  publishedDate: true,
});

export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  category: one(categories, {
    fields: [blogPosts.categoryId],
    references: [categories.id],
  }),
}));

// Auto-Pilot Configuration schema
export const autoPilotConfig = pgTable("auto_pilot_config", {
  id: serial("id").primaryKey(),
  feature: text("feature").notNull().unique(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  schedule: jsonb("schedule").notNull(),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  parameters: jsonb("parameters").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAutoPilotConfigSchema = createInsertSchema(autoPilotConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Auto-Pilot Run Logs schema
export const autoPilotLogs = pgTable("auto_pilot_logs", {
  id: serial("id").primaryKey(),
  featureId: integer("feature_id").notNull(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  status: text("status").notNull(),
  details: jsonb("details"),
  error: text("error"),
});

export const insertAutoPilotLogSchema = createInsertSchema(autoPilotLogs).omit({
  id: true,
  startTime: true,
});

// Define new types
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type AutoPilotConfig = typeof autoPilotConfig.$inferSelect;
export type InsertAutoPilotConfig = z.infer<typeof insertAutoPilotConfigSchema>;

export type AutoPilotLog = typeof autoPilotLogs.$inferSelect;
export type InsertAutoPilotLog = z.infer<typeof insertAutoPilotLogSchema>;

// Savings Challenges schema
export const savingsChallenges = pgTable("savings_challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetAmount: real("target_amount").notNull(),
  deadline: timestamp("deadline").notNull(),
  category: text("category").default("general").notNull(),
  difficultyLevel: text("difficulty_level").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isCustom: boolean("is_custom").default(false).notNull(),
  createdBy: integer("created_by"),
});

export const insertSavingsChallengeSchema = createInsertSchema(savingsChallenges).omit({
  id: true,
  createdAt: true,
});

// Rewards schema
export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  type: text("type").notNull(), // badge, voucher, discount, special
  challengeId: integer("challenge_id").notNull(),
  value: real("value"),
  code: text("code"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
  createdAt: true,
});

// User Challenges schema
export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  currentAmount: real("current_amount").default(0).notNull(),
  status: text("status").default("active").notNull(), // active, completed, failed
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  startedAt: true,
});

// User Rewards schema
export const userRewards = pgTable("user_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  rewardId: integer("reward_id").notNull(),
  challengeId: integer("challenge_id").notNull(), // Added to track which challenge earned the reward
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
});

export const insertUserRewardSchema = createInsertSchema(userRewards).omit({
  id: true,
  earnedAt: true,
});

// Define relations
export const savingsChallengesRelations = relations(savingsChallenges, ({ many }) => ({
  rewards: many(rewards),
  userChallenges: many(userChallenges),
}));

export const rewardsRelations = relations(rewards, ({ one, many }) => ({
  challenge: one(savingsChallenges, {
    fields: [rewards.challengeId],
    references: [savingsChallenges.id],
  }),
  userRewards: many(userRewards),
}));

export const userChallengesRelations = relations(userChallenges, ({ one }) => ({
  challenge: one(savingsChallenges, {
    fields: [userChallenges.challengeId],
    references: [savingsChallenges.id],
  }),
}));

export const userRewardsRelations = relations(userRewards, ({ one }) => ({
  reward: one(rewards, {
    fields: [userRewards.rewardId],
    references: [rewards.id],
  }),
  challenge: one(savingsChallenges, {
    fields: [userRewards.challengeId],
    references: [savingsChallenges.id],
  }),
}));

// Define types for savings challenge features
export type SavingsChallenge = typeof savingsChallenges.$inferSelect;
export type InsertSavingsChallenge = z.infer<typeof insertSavingsChallengeSchema>;

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;

export type UserReward = typeof userRewards.$inferSelect;
export type InsertUserReward = z.infer<typeof insertUserRewardSchema>;
