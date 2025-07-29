# Replit Project Guide

## Overview

This is a React-based bond trading application called "Moment Bond Screener" that interfaces with Moment's trading APIs. The application provides a comprehensive bond screening, portfolio management, and order management system with real-time market data capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with the following structure:

- **Frontend**: React with TypeScript using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for client-side routing
- **Real-time Communication**: WebSockets for live market data

## Key Components

### Frontend Architecture
- **Component Library**: Uses shadcn/ui for consistent, accessible UI components
- **Theme**: Dark-themed financial interface with custom color variables (cyber-blue, cyber-green, etc.)
- **Layout**: Sidebar navigation with collapsible functionality and top bar
- **Responsive Design**: Mobile-first approach with custom breakpoints

### Backend Architecture
- **API Structure**: RESTful endpoints for bond data, portfolio management, and order operations
- **Authentication**: Simplified authentication middleware (ready for JWT implementation)
- **WebSocket Server**: Real-time market data updates and order status notifications
- **External API Integration**: Moment API service for bond data and trading operations

### Database Schema
The application uses Drizzle ORM with the following main entities:
- **Users**: User accounts with API key storage
- **Bonds**: Bond instruments with market data
- **Portfolio Holdings**: User bond positions
- **Orders**: Buy/sell order management
- **Watchlist**: User-curated bond watchlists

## Data Flow

1. **Bond Discovery**: Users search and filter bonds through the screener interface
2. **Market Data**: Real-time price updates via WebSocket connections
3. **Order Management**: Submit orders through the Moment API and track status
4. **Portfolio Tracking**: Monitor holdings with performance metrics
5. **Analytics**: Portfolio analysis with risk metrics and performance charts

## External Dependencies

### Core Framework Dependencies
- React 18 with TypeScript
- Express.js for server
- Drizzle ORM with PostgreSQL
- TanStack React Query for data fetching
- Wouter for routing

### UI and Styling
- Tailwind CSS for styling
- Radix UI primitives (via shadcn/ui)
- Lucide React for icons
- Custom financial theme variables

### External Services
- **Moment API**: Primary trading API integration
- **Neon Database**: PostgreSQL hosting (@neondatabase/serverless)
- **WebSocket**: Real-time market data feeds

### Development Tools
- Vite for build tooling
- TSX for TypeScript execution
- ESBuild for production builds
- PostCSS with Autoprefixer

## Deployment Strategy

The application is configured for deployment with the following approach:

1. **Development**: Uses Vite dev server with hot module replacement
2. **Build Process**: 
   - Frontend: Vite builds to `dist/public`
   - Backend: ESBuild bundles server to `dist/index.js`
3. **Production**: Single Node.js process serving both API and static files
4. **Database**: Migrations managed through Drizzle Kit
5. **Environment**: Requires `DATABASE_URL` environment variable

### Scripts
- `npm run dev`: Development mode with hot reload
- `npm run build`: Production build for both frontend and backend
- `npm run start`: Production server
- `npm run db:push`: Push database schema changes

## Recent Changes

### July 29, 2025 - API Integration and Data Loading
- **Fixed Select component errors**: Resolved crash issues by replacing empty string values with "all" values
- **Added sample bond data**: Loaded 5 major corporate bonds (Apple, Microsoft, Alphabet, JPMorgan, Bank of America) for development
- **API endpoint investigation**: Current Moment API endpoints returning 404 errors - need correct endpoint documentation
- **Functional bond screener**: All filtering, search, and UI functionality now working with sample data
- **Server startup optimization**: Automatic bond data loading on application startup

### API Status
- **Moment API Base URL**: https://paper.moment-api.com (confirmed working)
- **Authentication**: Bearer token authentication working
- **Issue**: All tested endpoints (/v1/data/instrument/, /v1/data/instruments/, etc.) return 404 Not Found
- **Current solution**: Using representative sample data while investigating correct API endpoints

### Current Functionality
- Bond screener with advanced filtering (type, rating, sector, yield, maturity)
- Real-time WebSocket connections established
- Portfolio management interface ready
- Order management system ready
- Market data center with order book visualization
- Portfolio analytics with risk metrics

The application is fully functional for demonstration purposes and ready to connect to live Moment API data once correct endpoints are identified. The interface provides a comprehensive bond trading experience with real-time updates, portfolio management, and order execution capabilities.