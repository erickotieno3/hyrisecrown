import { apiRequest } from "@/lib/queryClient";

/**
 * Get AI-powered product recommendations
 * 
 * @param userId - Optional user ID for personalized recommendations
 * @param productId - Optional product ID for similar item recommendations
 * @param category - Optional category name to filter recommendations by category
 * @returns Promise with recommendations data
 */
export async function getProductRecommendations(
  userId?: string,
  productId?: number,
  category?: string
): Promise<{ recommendations: any[] }> {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (productId) params.append('productId', productId.toString());
    if (category) params.append('category', category);

    const response = await apiRequest(
      'GET',
      `/api/ai/recommendations?${params.toString()}`
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching recommendations: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return { recommendations: [] };
  }
}

/**
 * Get AI-powered price insights for a product
 * 
 * @param productId - The product ID to analyze
 * @returns Promise with price insights data
 */
export async function getPriceInsights(productId: number): Promise<any> {
  try {
    const response = await apiRequest(
      'GET',
      `/api/ai/price-insights/${productId}`
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching price insights: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to get price insights:', error);
    return null;
  }
}

/**
 * Compare two products using AI
 * 
 * @param product1Id - First product ID
 * @param product2Id - Second product ID
 * @returns Promise with comparison data
 */
export async function compareProducts(
  product1Id: number,
  product2Id: number
): Promise<any> {
  try {
    const response = await apiRequest(
      'POST',
      '/api/ai/compare-products',
      { product1Id, product2Id }
    );
    
    if (!response.ok) {
      throw new Error(`Error comparing products: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to compare products:', error);
    return null;
  }
}

/**
 * Get AI-generated shopping guide
 * 
 * @param userId - User ID to personalize the shopping guide
 * @returns Promise with shopping guide data
 */
export async function getShoppingGuide(userId: string): Promise<any> {
  try {
    const response = await apiRequest(
      'GET',
      `/api/ai/shopping-guide/${userId}`
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching shopping guide: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to get shopping guide:', error);
    return null;
  }
}

/**
 * Extract product features from description
 * 
 * @param description - Product description text
 * @returns Promise with extracted features
 */
export async function extractProductFeatures(description: string): Promise<any> {
  try {
    const response = await apiRequest(
      'POST',
      '/api/ai/extract-features',
      { description }
    );
    
    if (!response.ok) {
      throw new Error(`Error extracting features: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to extract features:', error);
    return null;
  }
}

/**
 * Generate personalized content
 * 
 * @param prompt - The prompt for content generation
 * @param context - Additional context information
 * @returns Promise with generated content
 */
export async function generateContent(
  prompt: string,
  context?: Record<string, any>
): Promise<any> {
  try {
    const response = await apiRequest(
      'POST',
      '/api/ai/generate-content',
      { prompt, context }
    );
    
    if (!response.ok) {
      throw new Error(`Error generating content: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to generate content:', error);
    return null;
  }
}

/**
 * Natural language search for products
 * 
 * @param query - Natural language query string
 * @returns Promise with search results
 */
export async function naturalLanguageSearch(query: string): Promise<any> {
  try {
    const response = await apiRequest(
      'GET',
      `/api/ai/search?q=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error(`Error performing search: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to search:', error);
    return { products: [] };
  }
}