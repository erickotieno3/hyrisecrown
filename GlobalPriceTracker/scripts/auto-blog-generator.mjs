/**
 * Auto-Blog Generation Service
 * Generates and publishes blog posts automatically using AI
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = new Anthropic();

interface BlogPost {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  keywords: string[];
  category: string;
  publishedAt: string;
  author: string;
  featured: boolean;
}

class AutoBlogGenerator {
  private blogDir = path.join(__dirname, '..', 'public', 'blog');
  private categories = [
    'Price Comparisons',
    'Shopping Tips',
    'Market Analysis',
    'Product Reviews',
    'Deals & Offers'
  ];

  constructor() {
    this.ensureBlogDirectory();
  }

  /**
   * Ensure blog directory exists
   */
  private ensureBlogDirectory(): void {
    if (!fs.existsSync(this.blogDir)) {
      fs.mkdirSync(this.blogDir, { recursive: true });
    }
  }

  /**
   * Generate blog post using AI
   */
  async generateBlogPost(topic?: string): Promise<BlogPost> {
    const category = this.categories[Math.floor(Math.random() * this.categories.length)];
    const topicPrompt = topic || this.generateRandomTopic(category);

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `Generate a blog post about "${topicPrompt}" for a price comparison shopping website.

Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "title": "blog post title",
  "excerpt": "short 2-3 sentence summary",
  "content": "full blog post content (2-3 paragraphs, engaging and informative)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "slug": "blog-post-slug"
}`,
        },
      ],
    });

    try {
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }
      
      const parsed = JSON.parse(content.text);

      const blogPost: BlogPost = {
        title: parsed.title,
        slug: parsed.slug || this.slugify(parsed.title),
        content: parsed.content,
        excerpt: parsed.excerpt,
        keywords: parsed.keywords || [],
        category,
        publishedAt: new Date().toISOString(),
        author: 'Global Price Comparison Bot',
        featured: Math.random() > 0.7, // 30% chance to be featured
      };

      return blogPost;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to generate blog post');
    }
  }

  /**
   * Generate random topic based on category
   */
  private generateRandomTopic(category: string): string {
    const topics: Record<string, string[]> = {
      'Price Comparisons': [
        'Best prices for electronics',
        'Clothing sale comparison',
        'Grocery price trends',
        'Online vs retail prices'
      ],
      'Shopping Tips': [
        'How to find the best deals',
        'Smart shopping strategies',
        'Using price comparison tools',
        'Timing your purchases'
      ],
      'Market Analysis': [
        'Current market trends',
        'Seasonal price patterns',
        'Supply chain insights',
        'Market predictions'
      ],
      'Product Reviews': [
        'Top recommended products',
        'Quality vs price analysis',
        'Product comparison guide',
        'Best value items'
      ],
      'Deals & Offers': [
        'Current hot deals',
        'Flash sale strategies',
        'Coupon optimization',
        'Limited time offers'
      ]
    };

    const categoryTopics = topics[category] || topics['Price Comparisons'];
    return categoryTopics[Math.floor(Math.random() * categoryTopics.length)];
  }

  /**
   * Save blog post to file
   */
  async saveBlogPost(post: BlogPost): Promise<string> {
    const filename = `${post.slug}.json`;
    const filepath = path.join(this.blogDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(post, null, 2));
    console.log(`✅ Blog post saved: ${filepath}`);

    return filepath;
  }

  /**
   * Generate multiple blog posts
   */
  async generateMultiplePosts(count: number = 3): Promise<BlogPost[]> {
    const posts: BlogPost[] = [];

    for (let i = 0; i < count; i++) {
      try {
        console.log(`Generating blog post ${i + 1}/${count}...`);
        const post = await this.generateBlogPost();
        await this.saveBlogPost(post);
        posts.push(post);

        // Add delay between API calls
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Failed to generate blog post ${i + 1}:`, error);
      }
    }

    return posts;
  }

  /**
   * Get all blog posts
   */
  getAllPosts(): BlogPost[] {
    const files = fs.readdirSync(this.blogDir).filter(f => f.endsWith('.json'));
    return files.map(file => {
      const content = fs.readFileSync(path.join(this.blogDir, file), 'utf-8');
      return JSON.parse(content);
    }).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  /**
   * Create blog index
   */
  createBlogIndex(): void {
    const posts = this.getAllPosts();
    const index = {
      total: posts.length,
      lastUpdated: new Date().toISOString(),
      posts: posts.map(p => ({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        publishedAt: p.publishedAt,
        category: p.category,
        featured: p.featured
      }))
    };

    fs.writeFileSync(
      path.join(this.blogDir, 'index.json'),
      JSON.stringify(index, null, 2)
    );
    console.log(`✅ Blog index created with ${posts.length} posts`);
  }

  /**
   * Slugify string
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Starting Auto-Blog Generation...\n');

    const generator = new AutoBlogGenerator();

    // Generate 3 new blog posts
    const posts = await generator.generateMultiplePosts(3);

    console.log(`\n✅ Generated ${posts.length} blog posts`);

    // Create blog index
    generator.createBlogIndex();

    console.log('\n🎉 Auto-Blog Generation Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
