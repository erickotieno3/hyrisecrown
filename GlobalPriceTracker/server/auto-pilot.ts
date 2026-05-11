/**
 * Auto-Pilot Service
 * 
 * This module manages all automated tasks in the application including:
 * - Auto-blogging
 * - Price data updates
 * - Promotional content generation
 * - Email newsletters
 * - System maintenance tasks
 * 
 * It schedules and executes these tasks based on their configured schedules
 * and parameters in the database.
 */

import { storage } from "./storage";
import { WebSocketServer, WebSocket } from 'ws';
import { generateAndPublishBlogPost } from './auto-blog';
import { AutoPilotConfig, InsertAutoPilotConfig, InsertAutoPilotLog } from '@shared/schema';
import { formatDate } from '../shared/utils';

// Type for task schedulers
type TaskScheduler = {
  intervalId: NodeJS.Timeout | null;
  nextRun: Date | null;
};

// Map to store active schedulers
const schedulers: Map<string, TaskScheduler> = new Map();

/**
 * Initialize the auto-pilot system
 */
export function initializeAutoPilot(wss: WebSocketServer) {
  console.log('Initializing auto-pilot system...');
  
  // Schedule periodic check for tasks that should run
  setInterval(async () => {
    await checkAndRunScheduledTasks(wss);
  }, 60000); // Check every minute
  
  // Initial check (delayed by 10s to allow system to initialize)
  setTimeout(async () => {
    await ensureDefaultConfigsExist();
    await checkAndRunScheduledTasks(wss);
  }, 10000);
}

/**
 * Ensure default configuration exists for all auto-pilot features
 */
async function ensureDefaultConfigsExist() {
  console.log('Ensuring default auto-pilot configurations exist...');
  
  const defaultConfigs = [
    {
      feature: 'auto-blog-weekly',
      description: 'Weekly price comparison blog post',
      isEnabled: true,
      schedule: { 
        frequency: 'weekly', 
        dayOfWeek: 1, // Monday
        hour: 9,
        minute: 0
      },
      parameters: {
        type: 'weekly-summary',
        tags: ['weekly-update', 'price-comparison', 'deals']
      }
    },
    {
      feature: 'auto-blog-product',
      description: 'Product-specific blog posts for trending products',
      isEnabled: true,
      schedule: { 
        frequency: 'daily', 
        hour: 12,
        minute: 0
      },
      parameters: {
        type: 'product',
        useTopTrending: true,
        count: 1,
        tags: ['product-spotlight', 'price-comparison']
      }
    },
    {
      feature: 'auto-product-updates',
      description: 'Automated product price updates',
      isEnabled: true,
      schedule: { 
        frequency: 'daily', 
        hour: 3,
        minute: 0
      },
      parameters: {
        stores: ['all'],
        updateFrequency: {
          tesco: 6, // hours
          walmart: 4, // hours
          carrefour: 8, // hours
          aldi: 12 // hours
        }
      }
    },
    {
      feature: 'auto-newsletter',
      description: 'Automated weekly newsletter',
      isEnabled: true,
      schedule: { 
        frequency: 'weekly', 
        dayOfWeek: 5, // Friday
        hour: 15,
        minute: 0
      },
      parameters: {
        includeTopDeals: true,
        includeBlogPosts: true,
        maxItems: 5
      }
    }
  ];
  
  for (const config of defaultConfigs) {
    try {
      const existingConfig = await storage.getAutoPilotConfigByFeature(config.feature);
      
      if (!existingConfig) {
        console.log(`Creating default configuration for ${config.feature}...`);
        
        const nextRun = calculateNextRunTime(config.schedule);
        
        const insertConfig: InsertAutoPilotConfig = {
          feature: config.feature,
          description: config.description,
          isEnabled: config.isEnabled,
          schedule: config.schedule,
          parameters: config.parameters,
          nextRun
        };
        
        await storage.createAutoPilotConfig(insertConfig);
      }
    } catch (error) {
      console.error(`Failed to ensure default config for ${config.feature}:`, error);
    }
  }
}

/**
 * Check for and run all tasks that are due to execute
 */
async function checkAndRunScheduledTasks(wss: WebSocketServer) {
  try {
    // Get all enabled features
    const enabledFeatures = await storage.getEnabledAutoPilotConfigs();
    
    for (const feature of enabledFeatures) {
      // Check if task is due to run
      if (isTaskDue(feature)) {
        // Run the task
        runTask(feature, wss);
      }
    }
  } catch (error) {
    console.error('Error checking and running scheduled tasks:', error);
  }
}

/**
 * Check if a task is due to run
 */
function isTaskDue(config: AutoPilotConfig): boolean {
  if (!config.nextRun) return false;
  
  const now = new Date();
  return now >= config.nextRun;
}

/**
 * Run a specific task
 */
async function runTask(config: AutoPilotConfig, wss: WebSocketServer) {
  console.log(`Running auto-pilot task: ${config.feature}`);
  
  try {
    // Record the task start
    const logEntry: InsertAutoPilotLog = {
      featureId: config.id,
      status: 'running',
      details: { startedAt: new Date().toISOString() },
      endTime: null,
      error: null
    };
    
    const log = await storage.createAutoPilotLog(logEntry);
    
    // Run different tasks based on the feature
    let result: any = null;
    
    switch (config.feature) {
      case 'auto-blog-weekly':
        result = await generateAndPublishBlogPost({
          topic: `Weekly Price Comparison Update: ${formatDate(new Date())}`,
          tags: config.parameters ? (config.parameters as any).tags || [] : []
        });
        break;
        
      case 'auto-blog-product':
        // Get a trending product ID
        const count = config.parameters ? (config.parameters as any).count || 1 : 1;
        const trendingProducts = await storage.getTrendingProducts(count);
        if (trendingProducts.length > 0) {
          result = await generateAndPublishBlogPost({
            productId: trendingProducts[0].id,
            tags: config.parameters ? (config.parameters as any).tags || [] : []
          });
        } else {
          throw new Error('No trending products found');
        }
        break;
        
      case 'auto-newsletter':
        // This would be implemented separately
        result = { status: 'pending-implementation' };
        break;
        
      default:
        console.log(`No implementation for feature: ${config.feature}`);
    }
    
    // Update log with success
    const detailsObj = typeof log.details === 'object' && log.details !== null 
      ? log.details 
      : {};
    
    await storage.updateAutoPilotLog(log.id, {
      status: 'success',
      details: {
        result,
        completedAt: new Date().toISOString(),
        ...detailsObj
      },
      endTime: new Date()
    });
    
    // Update the next run time
    const nextRun = calculateNextRunTime(config.schedule);
    await storage.updateAutoPilotConfig(config.id, { 
      lastRun: new Date(),
      nextRun
    });
    
    // Broadcast to WebSocket if appropriate
    broadcastTaskCompletion(config.feature, result, wss);
    
  } catch (error) {
    console.error(`Error running auto-pilot task ${config.feature}:`, error);
    
    // Log the error
    await storage.updateAutoPilotLog(config.id, {
      status: 'error',
      details: { 
        error: error instanceof Error ? error.message : String(error),
        completedAt: new Date().toISOString()
      },
      endTime: new Date(),
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Still update the next run time (even on failure)
    const nextRun = calculateNextRunTime(config.schedule);
    await storage.updateAutoPilotConfig(config.id, { nextRun });
  }
}

/**
 * Calculate when a task should next run based on its schedule
 */
function calculateNextRunTime(schedule: any): Date {
  const now = new Date();
  const nextRun = new Date();
  
  switch (schedule.frequency) {
    case 'minutely':
      // Every X minutes
      nextRun.setMinutes(now.getMinutes() + (schedule.minutes || 5));
      break;
      
    case 'hourly':
      // Every X hours, at the specified minute
      nextRun.setHours(now.getHours() + (schedule.hours || 1));
      nextRun.setMinutes(schedule.minute || 0);
      nextRun.setSeconds(0);
      break;
      
    case 'daily':
      // Every day at the specified hour and minute
      nextRun.setDate(now.getDate() + 1);
      nextRun.setHours(schedule.hour || 0);
      nextRun.setMinutes(schedule.minute || 0);
      nextRun.setSeconds(0);
      break;
      
    case 'weekly':
      // Every week on the specified day, hour, and minute
      const dayOfWeek = schedule.dayOfWeek || 1; // Default to Monday
      const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      let daysToAdd = dayOfWeek - currentDayOfWeek;
      if (daysToAdd <= 0) {
        daysToAdd += 7; // Move to next week
      }
      
      nextRun.setDate(now.getDate() + daysToAdd);
      nextRun.setHours(schedule.hour || 0);
      nextRun.setMinutes(schedule.minute || 0);
      nextRun.setSeconds(0);
      break;
      
    case 'monthly':
      // Every month on the specified day, hour, and minute
      const dayOfMonth = schedule.dayOfMonth || 1;
      nextRun.setMonth(now.getMonth() + 1);
      nextRun.setDate(dayOfMonth);
      nextRun.setHours(schedule.hour || 0);
      nextRun.setMinutes(schedule.minute || 0);
      nextRun.setSeconds(0);
      break;
      
    default:
      // Default to daily
      nextRun.setDate(now.getDate() + 1);
      nextRun.setHours(0);
      nextRun.setMinutes(0);
      nextRun.setSeconds(0);
  }
  
  // If the calculated time is in the past, add the appropriate interval
  if (nextRun <= now) {
    switch (schedule.frequency) {
      case 'minutely':
        nextRun.setMinutes(now.getMinutes() + (schedule.minutes || 5));
        break;
      case 'hourly':
        nextRun.setHours(now.getHours() + (schedule.hours || 1));
        break;
      case 'daily':
        nextRun.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(now.getMonth() + 1);
        break;
    }
  }
  
  return nextRun;
}

/**
 * Broadcast task completion to connected clients
 */
function broadcastTaskCompletion(feature: string, result: any, wss: WebSocketServer) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'auto-pilot-task-completed',
        feature,
        result,
        timestamp: new Date().toISOString()
      }));
    }
  });
}

/**
 * Manually trigger a task to run immediately
 */
export async function manuallyTriggerTask(feature: string, wss: WebSocketServer): Promise<any> {
  try {
    const config = await storage.getAutoPilotConfigByFeature(feature);
    
    if (!config) {
      throw new Error(`Auto-pilot feature '${feature}' not found`);
    }
    
    return await runTask(config, wss);
  } catch (error) {
    console.error(`Error manually triggering task ${feature}:`, error);
    throw error;
  }
}