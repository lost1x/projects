# On TyM Cleanup & Repair

A professional website for commercial cleanup and repair services, featuring modern web technologies and business-focused features.

## 🌟 Features

- **Professional Service Showcase** - High-quality images and detailed service descriptions
- **Interactive Pricing Calculator** - Real-time estimate generation for different services
- **Customer Testimonials** - Social proof with star ratings and business reviews
- **FAQ Section** - Comprehensive answers to common questions
- **Quote Request System** - Contact forms with file upload capability
- **Progressive Web App** - Installable mobile experience with offline capabilities
- **SEO Optimized** - Enhanced meta tags for better search visibility
- **Social Media Integration** - Professional social media presence
- **Google Analytics Ready** - Tracking setup for business insights

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Email**: SendGrid integration
- **Deployment**: Replit-ready with PWA features

## 🚀 Services Offered

- **Lot Sweeping** - Professional parking lot cleaning and maintenance
- **Window Cleaning** - Commercial window cleaning services
- **Lot Weeding** - Landscape maintenance and weed removal
- **After-Hours Maintenance** - Flexible scheduling for business needs
- **Emergency Repairs** - Quick response for urgent maintenance issues

## 📱 Progressive Web App

This website includes PWA features:
- Installable on mobile devices
- Offline functionality with service worker
- Fast loading with caching strategies
- Native app-like experience

## 🔧 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/xlost1foundx/onTym.git
   cd onTym
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Add your SendGrid API key for email functionality
   - Add Google Analytics measurement ID for tracking
   - Configure database connection string

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Visit** `http://localhost:5000`

## 📧 Email Configuration

To enable quote request emails:
1. Sign up for SendGrid account
2. Create an API key
3. Add `SENDGRID_API_KEY` to your environment variables

## 📊 Analytics Setup

To enable Google Analytics:
1. Create a Google Analytics 4 property
2. Get your Measurement ID (starts with "G-")
3. Add `VITE_GA_MEASUREMENT_ID` to your environment variables

## 🎨 Customization

The website uses a professional dark theme with blue accents. Key customization areas:

- **Colors**: Update CSS variables in `styles.css`
- **Content**: Modify service descriptions in `index.html`
- **Images**: Replace Unsplash URLs with your own professional photos
- **Contact Info**: Update phone, email, and address information

## 📁 Project Structure

```
├── index.html          # Main website page
├── styles.css          # CSS styling and responsive design
├── script.js           # Interactive functionality
├── server/            # Backend Express.js application
├── manifest.json      # PWA manifest
├── sw.js             # Service worker for PWA
└── uploads/          # File upload directory
```

## 🌐 Deployment

This project is optimized for deployment on:
- Replit (current setup)
- Vercel
- Netlify
- Traditional hosting providers

## 📞 Contact Information

**On TyM Cleanup & Repair**
- Phone: (555) 123-4567
- Email: info@ontymcleanup.com
- Service Area: Local commercial properties

## 📄 License

This project is created for On TyM Cleanup & Repair business purposes.

---

*Built with modern web technologies for professional commercial services*