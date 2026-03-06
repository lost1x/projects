# On TyM Cleanup & Repair - Business Website

## Overview

This is a professional commercial services website for "On TyM Cleanup & Repair," a company specializing in commercial maintenance services like lot sweeping, window cleaning, and after-hours maintenance. The project is built as a full-stack application with a static frontend and an Express.js backend for handling contact forms and quote requests.

## System Architecture

### Frontend Architecture
- **Static HTML/CSS/JavaScript**: Traditional web technologies for the main website
- **Responsive Design**: Mobile-first approach using CSS Grid and Flexbox
- **Modern UI Components**: Utilizes Font Awesome icons and custom CSS styling
- **Interactive Elements**: JavaScript-powered modals, form handling, and smooth scrolling

### Backend Architecture
- **Express.js Server**: Node.js web server handling API requests
- **File Upload System**: Multer middleware for handling image uploads (up to 10MB, max 10 files)
- **Static File Serving**: Express serves the frontend files directly
- **RESTful API Design**: Structured endpoints for business operations

### Database Strategy
- **Drizzle ORM**: Modern TypeScript ORM for database operations
- **Neon Database**: Serverless PostgreSQL database for scalability
- **Connection Pooling**: Uses @neondatabase/serverless for efficient connections

## Key Components

### Frontend Components
1. **Landing Page** (`index.html`): Hero section, services overview, contact information
2. **Styling System** (`styles.css`): Dark theme with professional color palette
3. **Interactive Features** (`script.js`): Service modals, quote forms, navigation

### Backend Components
1. **Server Entry Point** (`server.js`): Express application setup and configuration
2. **File Upload Handler**: Multer configuration for image processing
3. **API Endpoints**: Quote requests, contact forms, service inquiries

### UI Framework Integration
- **Radix UI Components**: Comprehensive React component library for future React migration
- **React Query**: Data fetching and caching for dynamic content
- **React Hook Form**: Form validation and management

## Data Flow

1. **User Interaction**: Visitors browse services and request quotes through the website
2. **Form Submission**: Contact forms and quote requests are processed by the Express backend
3. **File Uploads**: Images can be uploaded with quote requests (property photos, damage documentation)
4. **Email Integration**: SendGrid handles email notifications for new inquiries
5. **Data Persistence**: Quote and contact data stored in Neon PostgreSQL database

## External Dependencies

### Core Framework Dependencies
- **Express.js**: Web server framework
- **Drizzle ORM**: Database operations and migrations
- **Neon Database**: Serverless PostgreSQL hosting

### UI and Styling
- **Font Awesome**: Icon library for professional UI elements
- **Radix UI**: Accessible React components (for future migration)
- **Class Variance Authority**: Utility for managing CSS class variations

### Communication Services
- **SendGrid**: Email delivery service for contact forms and notifications
- **Multer**: File upload middleware for handling customer images

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and better development experience
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Build Process
- **Frontend Build**: Vite compiles and optimizes static assets
- **Backend Build**: ESBuild bundles the Express server for production
- **Database Migration**: Drizzle handles schema updates and migrations

### Production Configuration
- **Environment Variables**: Separate configs for development and production
- **Static Asset Serving**: Express serves built frontend files
- **Process Management**: Node.js application ready for containerization or serverless deployment

### Scalability Considerations
- **Serverless Database**: Neon provides automatic scaling
- **File Storage**: Local uploads directory (can be migrated to cloud storage)
- **Session Management**: PostgreSQL-based session storage with connect-pg-simple

## Recent Major Features Added

### Professional Enhancement Updates (June 29, 2025)

**Visual & Content Improvements:**
- Added professional hero background image showcasing commercial cleaning services
- Enhanced service cards with high-quality Unsplash photos for each service type
- Centered service icons for better visual balance
- Added work showcase section with before/after style imagery
- Implemented lazy loading for improved performance

**Customer Trust & Social Proof:**
- Customer testimonials section with 4-5 star ratings from local businesses
- Social media integration (Facebook, Instagram, LinkedIn, Google)
- Professional footer with brand links and contact information

**Business Features:**
- Interactive pricing guide with transparent cost ranges
- Smart estimate calculator for instant quotes
- Comprehensive FAQ section with expandable answers
- Enhanced navigation with pricing and FAQ sections

**Technical Enhancements:**
- Progressive Web App (PWA) features with service worker
- Google Analytics integration ready for measurement ID
- Enhanced SEO with Open Graph and Twitter Card meta tags
- Web app manifest for mobile installation
- Advanced user interaction tracking

**User Experience:**
- Smooth scrolling and enhanced animations
- Mobile-responsive design improvements
- Interactive FAQ toggles
- Real-time estimate calculations
- Enhanced form validation

## Changelog

```
Changelog:
- June 29, 2025. Major professional enhancement update - Added testimonials, pricing calculator, FAQ, PWA features, social media integration, and Google Analytics
- June 29, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```