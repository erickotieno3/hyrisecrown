/**
 * Revision System for Node.js API
 * This module provides functionality to keep unlimited versions of content
 */

import { db } from './db';
import { 
  products,
  stores,
  productPrices,
  type Product,
  type Store,
  type ProductPrice
} from '../shared/schema';

import {
  productRevision,
  storeRevision,
  priceRevision,
  type ProductRevision,
  type StoreRevision,
  type PriceRevision
} from '../shared/schema-revisions';
import { eq, lt } from 'drizzle-orm';

/**
 * Save a revision of a product
 */
export async function saveProductRevision(product: Product): Promise<void> {
  // Create a revision record
  const revision: Omit<ProductRevision, 'id'> = {
    productId: product.id,
    title: product.name,
    description: product.description || null,
    image: product.imageUrl || null,
    categoryId: product.categoryId,
    countryId: null, // Not in original schema
    createdAt: new Date()
  };

  try {
    await db.insert(productRevision).values(revision);
  } catch (error) {
    console.error('Error saving product revision:', error);
    throw error;
  }
}

/**
 * Save a revision of a store
 */
export async function saveStoreRevision(store: Store): Promise<void> {
  // Create a revision record
  const revision: Omit<StoreRevision, 'id'> = {
    storeId: store.id,
    name: store.name,
    description: null, // Not in original schema
    logo: store.logoUrl || null,
    website: store.websiteUrl || null,
    featured: false, // Not in original schema
    countryId: store.countryId,
    createdAt: new Date()
  };

  try {
    await db.insert(storeRevision).values(revision);
  } catch (error) {
    console.error('Error saving store revision:', error);
    throw error;
  }
}

/**
 * Save a revision of a price
 */
export async function savePriceRevision(price: ProductPrice): Promise<void> {
  // Create a revision record
  const revision: Omit<PriceRevision, 'id'> = {
    priceId: price.id,
    productId: price.productId,
    storeId: price.storeId,
    price: price.price,
    currency: price.currency,
    lastUpdated: price.lastUpdated,
    createdAt: new Date()
  };

  try {
    await db.insert(priceRevision).values(revision);
  } catch (error) {
    console.error('Error saving price revision:', error);
    throw error;
  }
}

/**
 * Get revisions for a product
 */
export async function getProductRevisions(productId: number): Promise<ProductRevision[]> {
  try {
    const revisions = await db
      .select()
      .from(productRevision)
      .where(eq(productRevision.productId, productId))
      .orderBy(productRevision.createdAt);
    
    return revisions;
  } catch (error) {
    console.error('Error getting product revisions:', error);
    throw error;
  }
}

/**
 * Get revisions for a store
 */
export async function getStoreRevisions(storeId: number): Promise<StoreRevision[]> {
  try {
    const revisions = await db
      .select()
      .from(storeRevision)
      .where(eq(storeRevision.storeId, storeId))
      .orderBy(storeRevision.createdAt);
    
    return revisions;
  } catch (error) {
    console.error('Error getting store revisions:', error);
    throw error;
  }
}

/**
 * Get revisions for a price
 */
export async function getPriceRevisions(priceId: number): Promise<PriceRevision[]> {
  try {
    const revisions = await db
      .select()
      .from(priceRevision)
      .where(eq(priceRevision.priceId, priceId))
      .orderBy(priceRevision.createdAt);
    
    return revisions;
  } catch (error) {
    console.error('Error getting price revisions:', error);
    throw error;
  }
}

/**
 * Restore a product to a specific revision
 */
export async function restoreProductRevision(revisionId: number): Promise<Product | null> {
  try {
    // Get the revision
    const [revision] = await db
      .select()
      .from(productRevision)
      .where(eq(productRevision.id, revisionId));
    
    if (!revision) {
      return null;
    }
    
    // Update the product with revision data
    await db
      .update(products)
      .set({
        name: revision.title,
        description: revision.description,
        imageUrl: revision.image,
        categoryId: revision.categoryId
        // Note: real schema doesn't have countryId and updatedAt
      })
      .where(eq(products.id, revision.productId));
    
    // Get the updated product
    const [updatedProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, revision.productId));
    
    return updatedProduct;
  } catch (error) {
    console.error('Error restoring product revision:', error);
    throw error;
  }
}

/**
 * Restore a store to a specific revision
 */
export async function restoreStoreRevision(revisionId: number): Promise<Store | null> {
  try {
    // Get the revision
    const [revision] = await db
      .select()
      .from(storeRevision)
      .where(eq(storeRevision.id, revisionId));
    
    if (!revision) {
      return null;
    }
    
    // Update the store with revision data
    await db
      .update(stores)
      .set({
        name: revision.name,
        logoUrl: revision.logo,
        websiteUrl: revision.website,
        countryId: revision.countryId
        // Note: real schema doesn't have description, featured or updatedAt
      })
      .where(eq(stores.id, revision.storeId));
    
    // Get the updated store
    const [updatedStore] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, revision.storeId));
    
    return updatedStore;
  } catch (error) {
    console.error('Error restoring store revision:', error);
    throw error;
  }
}

/**
 * Restore a price to a specific revision
 */
export async function restorePriceRevision(revisionId: number): Promise<ProductPrice | null> {
  try {
    // Get the revision
    const [revision] = await db
      .select()
      .from(priceRevision)
      .where(eq(priceRevision.id, revisionId));
    
    if (!revision) {
      return null;
    }
    
    // Update the price with revision data
    await db
      .update(productPrices)
      .set({
        productId: revision.productId,
        storeId: revision.storeId,
        price: revision.price,
        currency: revision.currency,
        lastUpdated: revision.lastUpdated
      })
      .where(eq(productPrices.id, revision.priceId));
    
    // Get the updated price
    const [updatedPrice] = await db
      .select()
      .from(productPrices)
      .where(eq(productPrices.id, revision.priceId));
    
    return updatedPrice;
  } catch (error) {
    console.error('Error restoring price revision:', error);
    throw error;
  }
}

/**
 * Delete old revisions based on retention policy
 * @param retentionDays Number of days to keep revisions (0 = keep all)
 */
export async function cleanupOldRevisions(retentionDays: number): Promise<void> {
  if (retentionDays <= 0) {
    return; // Keep all revisions
  }
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  try {
    // Delete old product revisions
    await db
      .delete(productRevision)
      .where(lt(productRevision.createdAt, cutoffDate));
      
    // Delete old store revisions
    await db
      .delete(storeRevision)
      .where(lt(storeRevision.createdAt, cutoffDate));
      
    // Delete old price revisions
    await db
      .delete(priceRevision)
      .where(lt(priceRevision.createdAt, cutoffDate));
      
  } catch (error) {
    console.error('Error cleaning up old revisions:', error);
    throw error;
  }
}