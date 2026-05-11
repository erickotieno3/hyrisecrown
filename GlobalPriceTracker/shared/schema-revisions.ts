/**
 * Schema definitions for content revisions
 */

import { pgTable, serial, integer, text, boolean, timestamp, date, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { products, stores, productPrices } from './schema';

/**
 * Product Revision Table
 */
export const productRevision = pgTable('product_revision', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id),
  title: text('title').notNull(),
  description: text('description'),
  image: text('image'),
  categoryId: integer('category_id'),
  countryId: integer('country_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ProductRevision = typeof productRevision.$inferSelect;
export const insertProductRevisionSchema = createInsertSchema(productRevision);
export type InsertProductRevision = typeof insertProductRevisionSchema._type;

/**
 * Store Revision Table
 */
export const storeRevision = pgTable('store_revision', {
  id: serial('id').primaryKey(),
  storeId: integer('store_id').notNull().references(() => stores.id),
  name: text('name').notNull(),
  description: text('description'),
  logo: text('logo'),
  website: text('website'),
  featured: boolean('featured').default(false),
  countryId: integer('country_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type StoreRevision = typeof storeRevision.$inferSelect;
export const insertStoreRevisionSchema = createInsertSchema(storeRevision);
export type InsertStoreRevision = typeof insertStoreRevisionSchema._type;

/**
 * Price Revision Table
 */
export const priceRevision = pgTable('price_revision', {
  id: serial('id').primaryKey(),
  priceId: integer('price_id').notNull().references(() => productPrices.id),
  productId: integer('product_id').notNull(),
  storeId: integer('store_id').notNull(),
  price: integer('price').notNull(),
  currency: text('currency').default('$'),
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type PriceRevision = typeof priceRevision.$inferSelect;
export const insertPriceRevisionSchema = createInsertSchema(priceRevision);
export type InsertPriceRevision = typeof insertPriceRevisionSchema._type;

/**
 * Revision Config Table
 */
export const revisionConfig = pgTable('revision_config', {
  id: serial('id').primaryKey(),
  retentionDays: integer('retention_days').default(0), // 0 = unlimited
  autoCleanup: boolean('auto_cleanup').default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type RevisionConfig = typeof revisionConfig.$inferSelect;
export const insertRevisionConfigSchema = createInsertSchema(revisionConfig);
export type InsertRevisionConfig = typeof insertRevisionConfigSchema._type;