import { db } from './db';
import { sql } from 'drizzle-orm';

async function updateDatabaseSchema() {
  try {
    console.log('Starting database schema update...');

    // Add new columns to stores table
    await db.execute(sql`
      ALTER TABLE IF EXISTS stores 
      ADD COLUMN IF NOT EXISTS type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS api_url TEXT,
      ADD COLUMN IF NOT EXISTS api_key TEXT,
      ADD COLUMN IF NOT EXISTS update_interval INTEGER,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);
    console.log('Updated stores table');

    // Add new columns to products table
    await db.execute(sql`
      ALTER TABLE IF EXISTS products 
      ADD COLUMN IF NOT EXISTS source VARCHAR(50),
      ADD COLUMN IF NOT EXISTS external_id TEXT,
      ADD COLUMN IF NOT EXISTS attributes JSONB,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);
    console.log('Updated products table');

    // Add new columns to product_prices table
    await db.execute(sql`
      ALTER TABLE IF EXISTS product_prices
      ADD COLUMN IF NOT EXISTS on_sale BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS url TEXT,
      ADD COLUMN IF NOT EXISTS last_checked TIMESTAMP,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);
    console.log('Updated product_prices table');

    console.log('Database schema update completed successfully!');
  } catch (error) {
    console.error('Error updating database schema:', error);
  }
}

// Run the update function
updateDatabaseSchema();