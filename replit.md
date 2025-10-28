# FluxTrade - Bitcoin Investment Platform

## Overview

FluxTrade is a comprehensive Bitcoin investment and trading platform that enables users to manage cryptocurrency portfolios, make investments, and execute trades. The application features automated wallet generation, real-time Bitcoin price tracking, investment plans with daily returns, and an administrative dashboard for platform management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Styling:**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- TailwindCSS with shadcn/ui component library (New York style)
- Custom CSS variables for theming with dark mode support
- Mobile-first responsive design approach

**State Management:**
- TanStack React Query for server state management and caching
- Custom React Context providers for:
  - Authentication state (AuthContext)
  - Currency preferences (CurrencyContext - USD/GBP toggle)
- Session-based authentication with localStorage fallback

**Routing:**
- Wouter for lightweight client-side routing
- Protected routes that redirect unauthenticated users
- Backdoor admin access via `/Hello10122` route

**Key Pages:**
- Home: Wallet overview and portfolio dashboard
- Trade: Multi-cryptocurrency trading interface with TradingView integration
- Investment: Investment plan selection and management
- Admin: User management, balance adjustments, and system configuration
- Wallet Setup: New user wallet creation flow

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- Session middleware for authentication (express-session)
- RESTful API design pattern
- Custom logging middleware for API requests

**Database Layer:**
- PostgreSQL as the primary database
- Drizzle ORM for type-safe database operations
- Connection via @neondatabase/serverless (supports Neon and standard PostgreSQL)
- Schema-first design with migrations in `/migrations` directory

**Database Schema:**
- `users`: User accounts with Bitcoin wallet credentials
- `investment_plans`: Configurable investment products
- `investments`: User investment records with profit tracking
- `transactions`: Deposit/withdrawal transaction log
- `notifications`: User notification system
- `admin_config`: Platform-wide configuration (vault addresses, rates)

**Bitcoin Integration:**
- bitcoinjs-lib for wallet operations
- BIP32 for hierarchical deterministic wallets
- BIP39 for mnemonic seed phrase generation
- Automatic P2PKH (Legacy) address generation
- Private key management with encryption considerations

**Cryptocurrency Price Data:**
- CoinGecko API integration for real-time Bitcoin and altcoin prices
- Support for multiple currencies (USD, GBP)
- 30-second refresh interval for price updates
- TradingView widget integration for advanced charting

**Investment System:**
- Automated daily profit calculations based on configurable return rates
- Multiple investment tiers with different ROI percentages
- Time-based investment maturity tracking
- Profit distribution to user balances

**Transaction Processing:**
- Two-step transaction verification (pending → confirmed/rejected)
- Admin approval workflow for deposits and withdrawals
- Transaction hash validation for blockchain verification
- Automated balance updates upon confirmation

### External Dependencies

**Third-Party Services:**
- CoinGecko API: Real-time cryptocurrency price data
- TradingView: Advanced trading charts and market data visualization
- Neon Database: Serverless PostgreSQL hosting (configurable)

**Authentication & Security:**
- Session-based authentication with HTTP-only cookies
- Password hashing (implementation in storage layer)
- Private key storage (encrypted at rest recommended)
- Admin backdoor access for emergency management

**Blockchain Libraries:**
- bitcoinjs-lib: Bitcoin transaction and address generation
- tiny-secp256k1: Elliptic curve cryptography
- ecpair: Key pair generation
- bip32: HD wallet derivation
- bip39: Mnemonic seed generation

**UI Component Libraries:**
- Radix UI primitives (accordion, dialog, dropdown, etc.)
- Lucide React for iconography
- class-variance-authority for component variants
- cmdk for command palette functionality

**Development Tools:**
- Replit-specific plugins for development environment
- ESBuild for server-side bundling
- PostCSS with Autoprefixer for CSS processing
- TypeScript for type safety across the stack

**Build & Deployment:**
- Vite for frontend bundling
- ESBuild for backend compilation
- Post-build script to copy static assets
- Environment variable configuration for DATABASE_URL and SESSION_SECRET