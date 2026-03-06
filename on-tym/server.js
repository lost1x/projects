import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 10 // Maximum 10 files
    },
    fileFilter: function (req, file, cb) {
        // Only allow image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.', {
    index: 'index.html'
}));

// In-memory storage for quotes (in production, use a database)
let quotes = [];
let nextQuoteId = 1;

// SendGrid configuration
let sgMail = null;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@ontymcleanup.com';
const TO_EMAIL = process.env.TO_EMAIL || 'info@ontymcleanup.com';

async function initializeSendGrid() {
    if (SENDGRID_API_KEY) {
        try {
            const { default: sendgridMail } = await import('@sendgrid/mail');
            sgMail = sendgridMail;
            sgMail.setApiKey(SENDGRID_API_KEY);
            console.log('SendGrid configured successfully');
        } catch (error) {
            console.warn('SendGrid not available. Install with: npm install @sendgrid/mail');
        }
    } else {
        console.warn('SENDGRID_API_KEY not set. Email functionality will be disabled.');
    }
}

// Helper function to send emails
async function sendQuoteEmail(quote) {
    if (!sgMail) {
        console.log('SendGrid not configured, skipping email send');
        return false;
    }

    try {
        const servicesList = quote.services.length > 0 ? 
            quote.services.map(service => `• ${service.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`).join('\n') :
            'No services specified';

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">New Quote Request - On TyM Cleanup & Repair</h2>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">Contact Information</h3>
                    <p><strong>Business Name:</strong> ${quote.businessName}</p>
                    <p><strong>Contact Name:</strong> ${quote.contactName}</p>
                    <p><strong>Email:</strong> ${quote.email}</p>
                    <p><strong>Phone:</strong> ${quote.phone}</p>
                    <p><strong>Address:</strong> ${quote.address}</p>
                </div>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">Service Details</h3>
                    <p><strong>Services Requested:</strong></p>
                    <pre style="background-color: white; padding: 10px; border-radius: 4px;">${servicesList}</pre>
                    ${quote.frequency ? `<p><strong>Frequency:</strong> ${quote.frequency}</p>` : ''}
                </div>

                ${quote.details ? `
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">Additional Details</h3>
                    <p>${quote.details}</p>
                </div>
                ` : ''}

                ${quote.photos.length > 0 ? `
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">Photos</h3>
                    <p>${quote.photos.length} photo(s) uploaded</p>
                </div>
                ` : ''}

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="color: #666; font-size: 14px;">
                        This quote request was submitted on ${quote.createdAt.toLocaleDateString()} at ${quote.createdAt.toLocaleTimeString()}.
                    </p>
                </div>
            </div>
        `;

        const emailText = `
New Quote Request - On TyM Cleanup & Repair

Contact Information:
Business Name: ${quote.businessName}
Contact Name: ${quote.contactName}
Email: ${quote.email}
Phone: ${quote.phone}
Address: ${quote.address}

Services Requested:
${servicesList}

${quote.frequency ? `Frequency: ${quote.frequency}` : ''}

${quote.details ? `Additional Details: ${quote.details}` : ''}

${quote.photos.length > 0 ? `Photos: ${quote.photos.length} photo(s) uploaded` : ''}

Submitted on ${quote.createdAt.toLocaleDateString()} at ${quote.createdAt.toLocaleTimeString()}
        `;

        // Send notification email to business
        await sgMail.send({
            to: TO_EMAIL,
            from: FROM_EMAIL,
            subject: `New Quote Request from ${quote.businessName}`,
            text: emailText,
            html: emailHtml,
        });

        // Send confirmation email to customer
        await sgMail.send({
            to: quote.email,
            from: FROM_EMAIL,
            subject: 'Quote Request Received - On TyM Cleanup & Repair',
            text: `Thank you for your quote request, ${quote.contactName}. We have received your request and will contact you within 24 hours to discuss your needs.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3b82f6;">Thank You for Your Quote Request</h2>
                    <p>Hello ${quote.contactName},</p>
                    <p>We have received your quote request for ${quote.businessName} and will contact you within 24 hours to discuss your commercial maintenance needs.</p>
                    <p>Our team will review your requirements and provide you with a customized quote that fits your business schedule and budget.</p>
                    <p>If you have any immediate questions, please don't hesitate to contact us.</p>
                    <p>Best regards,<br>On TyM Cleanup & Repair Team</p>
                </div>
            `
        });

        return true;
    } catch (error) {
        console.error('SendGrid email error:', error);
        return false;
    }
}

// Routes
app.post('/api/quotes', upload.array('photos', 10), async (req, res) => {
    try {
        // Extract form data
        const {
            businessName,
            contactName,
            email,
            phone,
            address,
            frequency,
            details
        } = req.body;

        // Parse services (can be a single value or array)
        let services = req.body.services || [];
        if (typeof services === 'string') {
            services = [services];
        }

        // Validate required fields
        if (!businessName || !contactName || !email || !phone || !address) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Get uploaded file paths
        const photos = req.files ? req.files.map(file => file.path) : [];

        // Create quote object
        const quote = {
            id: nextQuoteId++,
            businessName,
            contactName,
            email,
            phone,
            address,
            services,
            frequency: frequency || null,
            details: details || null,
            photos,
            createdAt: new Date()
        };

        // Store quote
        quotes.push(quote);

        // Send email notification
        const emailSent = await sendQuoteEmail(quote);

        if (!emailSent) {
            console.error('Failed to send quote email');
        }

        res.json({
            success: true,
            message: 'Quote request submitted successfully',
            quoteId: quote.id
        });

    } catch (error) {
        console.error('Quote submission error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to submit quote request'
        });
    }
});

// Get all quotes (for admin purposes)
app.get('/api/quotes', (req, res) => {
    try {
        res.json(quotes);
    } catch (error) {
        console.error('Failed to fetch quotes:', error);
        res.status(500).json({ message: 'Failed to fetch quotes' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        sendgridConfigured: !!sgMail
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum is 10 files.'
            });
        }
    }
    
    if (error.message === 'Only image files are allowed') {
        return res.status(400).json({
            success: false,
            message: 'Only image files are allowed.'
        });
    }

    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
async function startServer() {
    await initializeSendGrid();
    
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
        console.log(`SendGrid configured: ${!!sgMail}`);
    });
}

startServer().catch(console.error);

export default app;