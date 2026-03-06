// Service data
const serviceData = {
    'after-hours': {
        title: 'After Hours Service',
        icon: 'fas fa-moon',
        description: 'Convenient maintenance services scheduled outside business hours to minimize disruption to your operations.',
        details: [
            'Flexible scheduling between 6 PM - 6 AM',
            'Minimal disruption to your business operations',
            'Secure and professional service',
            'Available 7 days a week',
            'Perfect for retail and office environments'
        ],
        benefits: [
            'No interruption to customer flow',
            'Maintain professional appearance during business hours',
            'Competitive after-hours pricing',
            'Reliable and punctual service'
        ]
    },
    'lot-sweeping': {
        title: 'Lot Sweeping',
        icon: 'fas fa-broom',
        description: 'Professional parking lot and sidewalk sweeping to maintain a clean, welcoming appearance for your customers.',
        details: [
            'Power sweeping equipment for thorough cleaning',
            'Removal of debris, leaves, and litter',
            'Sidewalk and walkway maintenance',
            'Storm drain cleaning',
            'Environmentally responsible disposal'
        ],
        benefits: [
            'Enhanced curb appeal',
            'Improved safety for pedestrians',
            'Prevents drain blockages',
            'Extends pavement life'
        ]
    },
    'lot-weeding': {
        title: 'Lot Weeding',
        icon: 'fas fa-seedling',
        description: 'Thorough weed removal from parking areas, walkways, and landscape beds to maintain professional curb appeal.',
        details: [
            'Manual and chemical weed removal',
            'Crack sealing and pavement protection',
            'Landscape bed maintenance',
            'Preventive treatments available',
            'Eco-friendly herbicide options'
        ],
        benefits: [
            'Professional appearance year-round',
            'Prevents pavement damage',
            'Reduces pest habitat',
            'Maintains property value'
        ]
    },
    'window-cleaning': {
        title: 'Outside Window Cleaning',
        icon: 'fas fa-spray-can',
        description: 'Crystal-clear exterior window cleaning that enhances your building\'s appearance and natural light.',
        details: [
            'Professional-grade cleaning solutions',
            'Streak-free finish guaranteed',
            'Frame and sill cleaning included',
            'Safety equipment for high windows',
            'Weather-resistant scheduling'
        ],
        benefits: [
            'Improved natural light',
            'Enhanced building appearance',
            'Better customer impressions',
            'Extended window life'
        ]
    },
    'window-tinting': {
        title: 'Window Tinting',
        icon: 'fas fa-sliders-h',
        description: 'Professional window tinting installation for energy efficiency, privacy, and UV protection.',
        details: [
            'High-quality tinting films',
            'UV protection up to 99%',
            'Energy efficiency improvements',
            'Glare reduction',
            'Various tint levels available'
        ],
        benefits: [
            'Reduced energy costs',
            'Enhanced privacy',
            'Furniture protection from UV',
            'Improved comfort'
        ]
    },
    'window-art': {
        title: 'Window Art',
        icon: 'fas fa-palette',
        description: 'Custom window graphics and decorative films to enhance your storefront\'s visual impact and branding.',
        details: [
            'Custom design consultation',
            'Brand-consistent graphics',
            'Frosted and decorative films',
            'Promotional window displays',
            'Professional installation'
        ],
        benefits: [
            'Enhanced brand visibility',
            'Increased foot traffic',
            'Privacy without blocking light',
            'Unique storefront identity'
        ]
    }
};

// DOM Elements
const serviceModal = document.getElementById('service-modal');
const quoteModal = document.getElementById('quote-modal');
const loadingOverlay = document.getElementById('loading-overlay');
const toast = document.getElementById('toast');
const quoteForm = document.getElementById('quote-form');
const photosInput = document.getElementById('photos');
const fileList = document.getElementById('file-list');

// Navigation Functions
function scrollToServices() {
    document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
}

// Service Modal Functions
function openServiceModal(serviceKey) {
    const service = serviceData[serviceKey];
    if (!service) return;

    // Populate modal content
    document.getElementById('modal-service-title').textContent = service.title;
    document.getElementById('modal-service-icon').className = service.icon;
    document.getElementById('modal-service-description').textContent = service.description;

    // Populate details list
    const detailsList = document.getElementById('modal-service-details');
    detailsList.innerHTML = '';
    service.details.forEach(detail => {
        const li = document.createElement('li');
        li.textContent = detail;
        detailsList.appendChild(li);
    });

    // Populate benefits list
    const benefitsList = document.getElementById('modal-service-benefits');
    benefitsList.innerHTML = '';
    service.benefits.forEach(benefit => {
        const li = document.createElement('li');
        li.textContent = benefit;
        benefitsList.appendChild(li);
    });

    // Show modal
    serviceModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeServiceModal() {
    serviceModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Quote Modal Functions
function openQuoteModal() {
    quoteModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeQuoteModal() {
    quoteModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    quoteForm.reset();
    updateFileList();
}

// File Upload Functions
function updateFileList() {
    const files = photosInput.files;
    fileList.innerHTML = '';
    
    if (files.length > 0) {
        Array.from(files).forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="fas fa-image"></i>
                <span>${file.name}</span>
                <span style="margin-left: auto; color: var(--text-secondary); font-size: 0.875rem;">
                    ${(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
            `;
            fileList.appendChild(fileItem);
        });
    }
}

// Toast Notification Functions
function showToast(title, message, isError = false) {
    const toastIcon = document.getElementById('toast-icon');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');

    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    if (isError) {
        toast.classList.add('error');
        toastIcon.className = 'fas fa-exclamation-circle toast-icon';
    } else {
        toast.classList.remove('error');
        toastIcon.className = 'fas fa-check-circle toast-icon';
    }

    toast.classList.add('active');

    // Auto hide after 5 seconds
    setTimeout(() => {
        toast.classList.remove('active');
    }, 5000);
}

// Form Submission
async function submitQuoteForm(event) {
    event.preventDefault();
    
    const formData = new FormData(quoteForm);
    
    // Validate required fields
    const businessName = formData.get('businessName');
    const contactName = formData.get('contactName');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const address = formData.get('address');
    
    if (!businessName || !contactName || !email || !phone || !address) {
        showToast('Missing Information', 'Please fill in all required fields.', true);
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Invalid Email', 'Please enter a valid email address.', true);
        return;
    }

    // Show loading overlay
    loadingOverlay.classList.add('active');

    try {
        const response = await fetch('/api/quotes', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showToast('Quote Request Submitted!', "We'll contact you within 24 hours to discuss your needs.");
            closeQuoteModal();
        } else {
            throw new Error(result.message || 'Failed to submit quote request');
        }
    } catch (error) {
        console.error('Quote submission error:', error);
        showToast('Submission Failed', 'There was an error submitting your quote request. Please try again.', true);
    } finally {
        loadingOverlay.classList.remove('active');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // File input change handler
    photosInput.addEventListener('change', updateFileList);
    
    // Form submission handler
    quoteForm.addEventListener('submit', submitQuoteForm);
    
    // Close modals when clicking outside
    serviceModal.addEventListener('click', function(e) {
        if (e.target === serviceModal) {
            closeServiceModal();
        }
    });
    
    quoteModal.addEventListener('click', function(e) {
        if (e.target === quoteModal) {
            closeQuoteModal();
        }
    });
    
    // Close toast when clicked
    toast.addEventListener('click', function() {
        toast.classList.remove('active');
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (serviceModal.classList.contains('active')) {
                closeServiceModal();
            }
            if (quoteModal.classList.contains('active')) {
                closeQuoteModal();
            }
            if (toast.classList.contains('active')) {
                toast.classList.remove('active');
            }
        }
    });
    
    // Mobile navigation toggle (if needed)
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Additional utility functions
function validateForm(formData) {
    const errors = [];
    
    if (!formData.get('businessName')) errors.push('Business name is required');
    if (!formData.get('contactName')) errors.push('Contact name is required');
    if (!formData.get('email')) errors.push('Email is required');
    if (!formData.get('phone')) errors.push('Phone number is required');
    if (!formData.get('address')) errors.push('Property address is required');
    
    const email = formData.get('email');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Please enter a valid email address');
    }
    
    return errors;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Animation helpers
function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const opacity = Math.min(progress / duration, 1);
        
        element.style.opacity = opacity;
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

function fadeOut(element, duration = 300) {
    let start = null;
    const initialOpacity = parseFloat(getComputedStyle(element).opacity);
    
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const opacity = Math.max(initialOpacity - (progress / duration), 0);
        
        element.style.opacity = opacity;
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }
    
    requestAnimationFrame(animate);
}
// FAQ Functionality
function toggleFaq(questionElement) {
    const faqItem = questionElement.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't already active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Price Calculator Functionality
function calculateEstimate() {
    const propertySize = parseInt(document.getElementById('property-size').value) || 0;
    const serviceType = document.getElementById('service-type').value;
    const frequency = document.getElementById('frequency').value;
    
    if (!propertySize || !serviceType || !frequency) {
        showToast('Missing Information', 'Please fill in all fields to calculate an estimate.', true);
        return;
    }
    
    let basePrice = 0;
    let frequencyMultiplier = 1;
    
    // Base pricing calculations
    switch (serviceType) {
        case 'lot-sweeping':
            basePrice = Math.max(75, propertySize * 0.05);
            break;
        case 'window-cleaning':
            basePrice = Math.max(200, propertySize * 0.15);
            break;
        case 'lot-weeding':
            basePrice = Math.max(100, propertySize * 0.08);
            break;
        case 'maintenance-package':
            basePrice = Math.max(300, propertySize * 0.12);
            break;
    }
    
    // Frequency adjustments
    switch (frequency) {
        case 'weekly':
            frequencyMultiplier = 1;
            break;
        case 'bi-weekly':
            frequencyMultiplier = 0.6;
            break;
        case 'monthly':
            frequencyMultiplier = 0.4;
            break;
        case 'quarterly':
            frequencyMultiplier = 0.2;
            break;
    }
    
    const estimatedPrice = Math.round(basePrice * frequencyMultiplier);
    
    // Show result
    document.getElementById('estimate-amount').textContent = estimatedPrice;
    document.getElementById('estimate-result').style.display = 'block';
    
    // Smooth scroll to result
    document.getElementById('estimate-result').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
    
    // Track analytics event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'calculate_estimate', {
            'service_type': serviceType,
            'frequency': frequency,
            'property_size': propertySize,
            'estimate': estimatedPrice
        });
    }
}

// Enhanced Analytics Tracking
function trackUserInteraction(action, category = 'engagement', label = '') {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// Track page scrolling for engagement
let scrollTracked = false;
window.addEventListener('scroll', function() {
    if (!scrollTracked && window.scrollY > window.innerHeight * 0.5) {
        trackUserInteraction('scroll_50_percent', 'engagement');
        scrollTracked = true;
    }
});

// Initialize enhanced features when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add click tracking to important elements
    document.querySelectorAll('.btn-primary').forEach(button => {
        button.addEventListener('click', function() {
            trackUserInteraction('button_click', 'conversion', this.textContent.trim());
        });
    });
    
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('click', function() {
            trackUserInteraction('social_click', 'social', this.href);
        });
    });
});
