# Tesco Price Comparison Platform

## Overview

A global supermarket price comparison platform that allows users to compare prices across multiple stores and countries. The application helps shoppers find the best deals on groceries and household items by aggregating pricing data from retailers like Tesco, Carrefour, Walmart, and others.

The platform includes:
- Price comparison across multiple stores and countries
- Product search and category browsing
- Trending products and featured stores
- Newsletter subscription
- Affiliate marketing click tracking
- Admin dashboard for management
- Vendor portal for store partners
- Mobile-responsive PWA with offline support

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite with React plugin
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state
- **Routing**: Client-side routing (paths configured in Vite)
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (compiled with esbuild for production)
- **API Design**: RESTful endpoints under `/api/`
- **Server Entry**: `server/index.ts`

### Data Storage
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (via Neon serverless)
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Generated in `./migrations` directory

### Project Structure
```
client/           # React frontend application
  src/            # Source files with components, hooks, lib
server/           # Express backend API
shared/           # Shared types and database schema
public/           # Static files (admin pages, vendor portals)
scripts/          # Deployment and automation scripts
mobile-app/       # PWA and mobile wrapper documentation
data/             # JSON data files for paybill system
```

### Key Design Decisions

1. **Monorepo Structure**: Frontend and backend in single repository with shared types for type safety across the stack.

2. **Serverless Database**: Uses Neon's serverless PostgreSQL adapter for connection pooling and edge compatibility.

3. **Component Library**: shadcn/ui components with Radix UI primitives provide accessible, customizable UI elements.

4. **Static Admin Pages**: Admin dashboard and vendor login are served as static HTML files from `/public/` for simplicity.

5. **PWA Support**: Progressive Web App with service worker, manifest, and offline page for mobile experience.

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless Postgres database (`@neondatabase/serverless`)
- **Drizzle ORM**: Type-safe database queries and migrations

### Payment Processing
- **Stripe**: Credit/debit card payments (`@stripe/stripe-js`, `@stripe/react-stripe-js`)
- **PayPal**: Digital wallet integration (`@paypal/react-paypal-js`)
- **M-Pesa**: Mobile money payments (Kenya) via custom paybill system

### Email Services
- **SendGrid**: Transactional email delivery (`@sendgrid/mail`)

### AI Services
- **Anthropic Claude**: AI capabilities (`@anthropic-ai/sdk`)
- **OpenAI**: Content generation for SEO and marketing automation

### Third-Party Integrations
- **Notion**: Content management (`@notionhq/client`)
- **Google Analytics**: Usage tracking (loaded dynamically)

### Infrastructure
- **Replit**: Primary hosting with deployment support
- **Hetzner Cloud**: Backup hosting option documented in deployment guides

## Integration Status Notes

### GitHub Integration
GitHub integration was dismissed by user. To push source code to GitHub in future, either:
1. Complete the GitHub OAuth integration flow in Replit integrations, or
2. Provide a GitHub Personal Access Token (PAT) as `GITHUB_TOKEN` secret