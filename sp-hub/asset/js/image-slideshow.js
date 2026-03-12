// ===== MYSTICAL IMAGE SLIDESHOW =====

class MysticalSlideshow {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.options = {
            interval: 4000,
            fadeSpeed: 800,
            showControls: false,
            images: [],
            ...options
        };
        
        this.currentIndex = 0;
        this.isTransitioning = false;
        this.init();
    }
    
    init() {
        this.createSlideshow();
        this.startSlideshow();
    }
    
    createSlideshow() {
        const slideshow = document.createElement('div');
        slideshow.className = 'mystical-slideshow';
        slideshow.innerHTML = `
            <div class="slideshow-container">
                <div class="slideshow-images">
                    ${this.options.images.map((img, index) => `
                        <div class="slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                            <img src="${img.url}" alt="${img.alt}" loading="lazy" decoding="async">
                            <div class="slide-caption">
                                <h4>${img.title}</h4>
                                <p>${img.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.container.appendChild(slideshow);
        this.slides = slideshow.querySelectorAll('.slide');
        
        // Preload images for performance
        this.preloadImages();
    }
    
    preloadImages() {
        this.options.images.forEach(img => {
            const preloadImg = new Image();
            preloadImg.src = img.url;
        });
    }
    
    startSlideshow() {
        if (this.options.images.length <= 1) return;
        
        // Use requestAnimationFrame for smoother performance
        const animate = () => {
            if (!this.isTransitioning) {
                this.nextSlide();
            }
            this.animationFrame = requestAnimationFrame(() => {
                setTimeout(() => {
                    this.animationFrame = requestAnimationFrame(animate);
                }, this.options.interval);
            });
        };
        
        this.animationFrame = requestAnimationFrame(animate);
    }
    
    nextSlide() {
        if (this.isTransitioning) return;
        this.goToSlide((this.currentIndex + 1) % this.options.images.length);
    }
    
    prevSlide() {
        if (this.isTransitioning) return;
        this.goToSlide((this.currentIndex - 1 + this.options.images.length) % this.options.images.length);
    }
    
    goToSlide(index) {
        if (this.isTransitioning || index === this.currentIndex) return;
        
        this.isTransitioning = true;
        
        // Remove active class from current slide
        this.slides[this.currentIndex].classList.remove('active');
        
        // Add active class to new slide
        this.currentIndex = index;
        this.slides[this.currentIndex].classList.add('active');
        
        // Reset transition flag after animation
        setTimeout(() => {
            this.isTransitioning = false;
        }, this.options.fadeSpeed);
    }
    
    pause() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
    
    resume() {
        this.startSlideshow();
    }
    
    destroy() {
        this.pause();
        this.slides = null;
        this.container = null;
    }
}

// Stock mystical images data
const mysticalImageSets = {
    general: [
        {
            url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=400&fit=crop',
            alt: 'Mystical night sky with stars',
            title: 'Cosmic Wisdom',
            description: 'Unlock the secrets of the universe'
        },
        {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
            alt: 'Crystal ball and tarot cards',
            title: 'Divination Tools',
            description: 'Ancient methods of seeing the future'
        },
        {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
            alt: 'Mystical forest with fog',
            title: 'Nature Magic',
            description: 'The power of natural elements'
        },
        {
            url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
            alt: 'Ancient crystals and gemstones',
            title: 'Crystal Energy',
            description: 'Healing properties of stones'
        },
        {
            url: 'https://images.unsplash.com/photo-1573845547344-4d5b9c8c5a31?w=800&h=400&fit=crop',
            alt: 'Astrology chart and stars',
            title: 'Astrological Insights',
            description: 'Your personal cosmic blueprint'
        },
        {
            url: 'https://images.unsplash.com/photo-1446776811954-b23d579212c5?w=800&h=400&fit=crop',
            alt: 'Night sky with constellations',
            title: 'Stellar Wisdom',
            description: 'Messages from the stars'
        },
        {
            url: 'https://images.unsplash.com/photo-1516214104703-d870798faf8f?w=800&h=400&fit=crop',
            alt: 'Mystical mountain landscape',
            title: 'Sacred Mountains',
            description: 'Ancient wisdom from peaks'
        },
        {
            url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=400&fit=crop',
            alt: 'Ocean waves at sunset',
            title: 'Ocean Mysteries',
            description: 'Deep wisdom from waters'
        },
        {
            url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=400&fit=crop',
            alt: 'Aurora borealis night sky',
            title: 'Northern Lights',
            description: 'Magical polar phenomena'
        },
        {
            url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=400&fit=crop',
            alt: 'Mystical desert landscape',
            title: 'Desert Wisdom',
            description: 'Ancient secrets from sands'
        }
    ],
    
    runes: [
        {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
            alt: 'Viking runes on ancient stone',
            title: 'Ancient Wisdom',
            description: 'Norse divination through runes'
        },
        {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
            alt: 'Nordic landscape with mountains',
            title: 'Viking Heritage',
            description: 'Connect with Norse traditions'
        },
        {
            url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=400&fit=crop',
            alt: 'Northern lights and stars',
            title: 'Aurora Mystica',
            description: 'Magical northern phenomena'
        },
        {
            url: 'https://images.unsplash.com/photo-1446776811954-b23d579212c5?w=800&h=400&fit=crop',
            alt: 'Viking ship at sea',
            title: 'Norse Voyages',
            description: 'Ancient seafaring wisdom'
        },
        {
            url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=400&fit=crop',
            alt: 'Ancient stone circle',
            title: 'Sacred Circles',
            description: 'Mystical stone formations'
        },
        {
            url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=400&fit=crop',
            alt: 'Winter forest landscape',
            title: 'Norse Wilderness',
            description: 'Power of Nordic nature'
        },
        {
            url: 'https://images.unsplash.com/photo-1516214104703-d870798faf8f?w=800&h=400&fit=crop',
            alt: 'Mountain peak with clouds',
            title: 'Mountain Spirits',
            description: 'Ancient mountain wisdom'
        },
        {
            url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=400&fit=crop',
            alt: 'Fjord landscape',
            title: 'Norse Fjords',
            description: 'Sacred waters of the north'
        },
        {
            url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=400&fit=crop',
            alt: 'Ancient Viking artifacts',
            title: 'Viking Artifacts',
            description: 'Historical Norse treasures'
        },
        {
            url: 'https://images.unsplash.com/photo-1573845547344-4d5b9c8c5a31?w=800&h=400&fit=crop',
            alt: 'Nordic constellations',
            title: 'Norse Stars',
            description: 'Celestial Norse mythology'
        }
    ],
    
    astrology: [
        {
            url: 'https://images.unsplash.com/photo-1573845547344-4d5b9c8c5a31?w=800&h=400&fit=crop',
            alt: 'Birth chart and zodiac wheel',
            title: 'Birth Chart Analysis',
            description: 'Your complete astrological profile'
        },
        {
            url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
            alt: 'Planets and stars in space',
            title: 'Planetary Alignment',
            description: 'Cosmic influences on your life'
        },
        {
            url: 'https://images.unsplash.com/photo-1446776811954-b23d579212c5?w=800&h=400&fit=crop',
            alt: 'Night sky with constellations',
            title: 'Stellar Wisdom',
            description: 'Messages from the stars'
        },
        {
            url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=400&fit=crop',
            alt: 'Cosmic nebula and stars',
            title: 'Cosmic Energy',
            description: 'Universal forces at work'
        },
        {
            url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=400&fit=crop',
            alt: 'Aurora borealis night sky',
            title: 'Aurora Magic',
            description: 'Northern lights phenomena'
        },
        {
            url: 'https://images.unsplash.com/photo-1516214104703-d870798faf8f?w=800&h=400&fit=crop',
            alt: 'Milky way galaxy',
            title: 'Galactic Wisdom',
            description: 'Your place in the cosmos'
        },
        {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
            alt: 'Full moon over mountains',
            title: 'Lunar Power',
            description: 'Moon phases and emotions'
        },
        {
            url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=400&fit=crop',
            alt: 'Desert night sky',
            title: 'Desert Stars',
            description: 'Ancient celestial knowledge'
        },
        {
            url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=400&fit=crop',
            alt: 'Ocean stars reflection',
            title: 'Ocean Cosmos',
            description: 'Water and celestial connection'
        },
        {
            url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=400&fit=crop',
            alt: 'Ancient observatory',
            title: 'Ancient Astronomy',
            description: 'Historical star watching'
        }
    ],
    
    crystals: [
        {
            url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
            alt: 'Various crystals and gemstones',
            title: 'Crystal Collection',
            description: 'Healing stones and their properties'
        },
        {
            url: 'https://images.unsplash.com/photo-1573845547344-4d5b9c8c5a31?w=800&h=400&fit=crop',
            alt: 'Amethyst crystal cluster',
            title: 'Amethyst Energy',
            description: 'Spiritual healing and intuition'
        },
        {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
            alt: 'Crystal in natural setting',
            title: 'Earth Magic',
            description: 'Natural crystal formations'
        },
        {
            url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=400&fit=crop',
            alt: 'Rose quartz crystals',
            title: 'Rose Quartz Love',
            description: 'Heart healing and compassion'
        },
        {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
            alt: 'Clear quartz formation',
            title: 'Clear Quartz Power',
            description: 'Amplification and clarity'
        },
        {
            url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=400&fit=crop',
            alt: 'Citrine crystals',
            title: 'Citrine Abundance',
            description: 'Prosperity and manifestation'
        },
        {
            url: 'https://images.unsplash.com/photo-1446776811954-b23d579212c5?w=800&h=400&fit=crop',
            alt: 'Black tourmaline',
            title: 'Tourmaline Protection',
            description: 'Grounding and shielding'
        },
        {
            url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=400&fit=crop',
            alt: 'Selenite crystal',
            title: 'Selenite Light',
            description: 'Spiritual connection and cleansing'
        },
        {
            url: 'https://images.unsplash.com/photo-1516214104703-d870798faf8f?w=800&h=400&fit=crop',
            alt: 'Labradorite stones',
            title: 'Labradorite Magic',
            description: 'Transformation and intuition'
        },
        {
            url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=400&fit=crop',
            alt: 'Crystal healing grid',
            title: 'Crystal Grids',
            description: 'Sacred geometric arrangements'
        }
    ],
    
    love: [
        {
            url: 'https://images.unsplash.com/photo-1516574187841-cb9162c35ec8?w=800&h=400&fit=crop',
            alt: 'Romantic sunset with hearts',
            title: 'Love Language',
            description: 'Understanding your emotional needs'
        },
        {
            url: 'https://images.unsplash.com/photo-1517457378417-1525729389280?w=800&h=400&fit=crop',
            alt: 'Couple in romantic setting',
            title: 'Relationship Harmony',
            description: 'Building stronger connections'
        },
        {
            url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=400&fit=crop',
            alt: 'Hearts and flowers',
            title: 'Romantic Energy',
            description: 'The power of love and attraction'
        },
        {
            url: 'https://images.unsplash.com/photo-1516214104703-d870798faf8f?w=800&h=400&fit=crop',
            alt: 'Rose petals and romance',
            title: 'Passionate Love',
            description: 'Deep emotional connections'
        },
        {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
            alt: 'Romantic beach sunset',
            title: 'Sunset Romance',
            description: 'Perfect moments together'
        },
        {
            url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=400&fit=crop',
            alt: 'Candlelight dinner',
            title: 'Intimate Moments',
            description: 'Creating lasting memories'
        },
        {
            url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=400&fit=crop',
            alt: 'Love birds together',
            title: 'Soulmates',
            description: 'Finding your perfect match'
        },
        {
            url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=400&fit=crop',
            alt: 'Romantic garden setting',
            title: 'Garden of Love',
            description: 'Growing together in harmony'
        },
        {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
            alt: 'Wedding rings',
            title: 'Commitment',
            description: 'Building a life together'
        },
        {
            url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
            alt: 'Romantic lake scene',
            title: 'Peaceful Love',
            description: 'Tranquil relationship waters'
        }
    ],
    
    tarot: [
        {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
            alt: 'Tarot cards spread',
            title: 'Tarot Reading',
            description: 'Ancient wisdom through cards'
        },
        {
            url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=400&fit=crop',
            alt: 'Mystical tarot deck',
            title: 'Card Divination',
            description: 'Insights from the tarot'
        },
        {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
            alt: 'Crystal ball with cards',
            title: 'Fortune Telling',
            description: 'Mystical arts of divination'
        },
        {
            url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=400&fit=crop',
            alt: 'Ancient tarot illustrations',
            title: 'Tarot History',
            description: 'Centuries of card wisdom'
        },
        {
            url: 'https://images.unsplash.com/photo-1516214104703-d870798faf8f?w=800&h=400&fit=crop',
            alt: 'Tarot reader hands',
            title: 'Card Reading',
            description: 'The art of interpretation'
        },
        {
            url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=400&fit=crop',
            alt: 'Mystical symbols',
            title: 'Sacred Symbols',
            description: 'Universal tarot language'
        },
        {
            url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=400&fit=crop',
            alt: 'Candlelit tarot session',
            title: 'Ritual Reading',
            description: 'Sacred space for divination'
        },
        {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
            alt: 'Major arcana cards',
            title: 'Major Arcana',
            description: 'Life journey through cards'
        },
        {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
            alt: 'Tarot spread patterns',
            title: 'Card Layouts',
            description: 'Different reading patterns'
        },
        {
            url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=400&fit=crop',
            alt: 'Tarot and crystals',
            title: 'Combined Arts',
            description: 'Multiple divination methods'
        }
    ],
    
    dreams: [
        {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
            alt: 'Dreamy landscape',
            title: 'Dream Analysis',
            description: 'Understanding your subconscious'
        },
        {
            url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
            alt: 'Moonlit night',
            title: 'Lunar Dreams',
            description: 'Moon influence on dreams'
        },
        {
            url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=400&fit=crop',
            alt: 'Foggy morning',
            title: 'Morning Dreams',
            description: 'Waking state insights'
        },
        {
            url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=400&fit=crop',
            alt: 'Mystical forest',
            title: 'Forest Dreams',
            description: 'Nature symbolism in dreams'
        },
        {
            url: 'https://images.unsplash.com/photo-1516214104703-d870798faf8f?w=800&h=400&fit=crop',
            alt: 'Starry night sky',
            title: 'Cosmic Dreams',
            description: 'Universal dream messages'
        },
        {
            url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=400&fit=crop',
            alt: 'Aurora borealis',
            title: 'Northern Dream Lights',
            description: 'Magical dream phenomena'
        },
        {
            url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=400&fit=crop',
            alt: 'Ocean waves',
            title: 'Ocean Dreams',
            description: 'Deep subconscious waters'
        },
        {
            url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=400&fit=crop',
            alt: 'Ancient symbols',
            title: 'Dream Symbols',
            description: 'Ancient dream interpretation'
        },
        {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
            alt: 'Sleeping person',
            title: 'Sleep State',
            description: 'The science of dreaming'
        },
        {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
            alt: 'Dream journal',
            title: 'Dream Journaling',
            description: 'Recording dream insights'
        }
    ],
    
    fortune: [
        {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
            alt: 'Crystal ball fortune telling',
            title: 'Fortune Telling',
            description: 'Glimpses into the future'
        },
        {
            url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=400&fit=crop',
            alt: 'Mystical symbols',
            title: 'Divination Arts',
            description: 'Ancient fortune methods'
        },
        {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
            alt: 'Tea leaf reading',
            title: 'Tea Reading',
            description: 'Ancient leaf divination'
        },
        {
            url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=400&fit=crop',
            alt: 'Palm reading hands',
            title: 'Palmistry',
            description: 'Reading lines of destiny'
        },
        {
            url: 'https://images.unsplash.com/photo-1516214104703-d870798faf8f?w=800&h=400&fit=crop',
            alt: 'Crystal gazer',
            title: 'Scrying',
            description: 'Crystal ball visions'
        },
        {
            url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=400&fit=crop',
            alt: 'Ancient oracle cards',
            title: 'Oracle Cards',
            description: 'Divine card guidance'
        },
        {
            url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=400&fit=crop',
            alt: 'Rune stones',
            title: 'Rune Casting',
            description: 'Norse fortune methods'
        },
        {
            url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=400&fit=crop',
            alt: 'I Ching coins',
            title: 'I Ching',
            description: 'Chinese wisdom coins'
        },
        {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
            alt: 'Astrolabe instrument',
            title: 'Ancient Tools',
            description: 'Historical fortune devices'
        },
        {
            url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
            alt: 'Mystical smoke',
            title: 'Smoke Reading',
            description: 'Air divination arts'
        }
    ],
    
    numerology: [
        {
            url: 'https://images.unsplash.com/photo-1573845547344-4d5b9c8c5a31?w=800&h=400&fit=crop',
            alt: 'Sacred geometry patterns',
            title: 'Number Wisdom',
            description: 'Power of numerological patterns'
        },
        {
            url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
            alt: 'Mathematical patterns',
            title: 'Life Numbers',
            description: 'Your personal numerology'
        },
        {
            url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=400&fit=crop',
            alt: 'Ancient number symbols',
            title: 'Sacred Numbers',
            description: 'Ancient number wisdom'
        },
        {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
            alt: 'Number sequences',
            title: 'Number Patterns',
            description: 'Hidden number meanings'
        },
        {
            url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=400&fit=crop',
            alt: 'Numerology charts',
            title: 'Birth Numbers',
            description: 'Your life path number'
        },
        {
            url: 'https://images.unsplash.com/photo-1516214104703-d870798faf8f?w=800&h=400&fit=crop',
            alt: 'Golden ratio patterns',
            title: 'Divine Proportions',
            description: 'Sacred geometry in nature'
        },
        {
            url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=400&fit=crop',
            alt: 'Number mandalas',
            title: 'Sacred Mandalas',
            description: 'Geometric number art'
        },
        {
            url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=400&fit=crop',
            alt: 'Ancient numerology texts',
            title: 'Ancient Wisdom',
            description: 'Historical number systems'
        },
        {
            url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=400&fit=crop',
            alt: 'Number calculations',
            title: 'Number Magic',
            description: 'Calculating destiny numbers'
        },
        {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
            alt: 'Cosmic number patterns',
            title: 'Universal Numbers',
            description: 'Cosmic number connections'
        }
    ],
    
    zodiac: [
        {
            url: 'https://images.unsplash.com/photo-1573845547344-4d5b9c8c5a31?w=800&h=400&fit=crop',
            alt: 'Zodiac constellations',
            title: 'Zodiac Signs',
            description: 'Your astrological identity'
        },
        {
            url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
            alt: 'Star constellations',
            title: 'Star Wisdom',
            description: 'Messages from your zodiac sign'
        },
        {
            url: 'https://images.unsplash.com/photo-1446776811954-b23d579212c5?w=800&h=400&fit=crop',
            alt: 'Night sky with stars',
            title: 'Celestial Messages',
            description: 'Cosmic zodiac guidance'
        },
        {
            url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=400&fit=crop',
            alt: 'Zodiac wheel',
            title: 'Zodiac Wheel',
            description: 'Complete astrological cycle'
        },
        {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
            alt: 'Planetary alignment',
            title: 'Planetary Signs',
            description: 'Ruling planets of zodiac'
        },
        {
            url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=400&fit=crop',
            alt: 'Aries constellation',
            title: 'Aries Energy',
            description: 'Fire sign leadership'
        },
        {
            url: 'https://images.unsplash.com/photo-1516214104703-d870798faf8f?w=800&h=400&fit=crop',
            alt: 'Taurus constellation',
            title: 'Taurus Stability',
            description: 'Earth sign grounding'
        },
        {
            url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=400&fit=crop',
            alt: 'Gemini constellation',
            title: 'Gemini Duality',
            description: 'Air sign communication'
        },
        {
            url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=400&fit=crop',
            alt: 'Cancer constellation',
            title: 'Cancer Intuition',
            description: 'Water sign emotions'
        },
        {
            url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=400&fit=crop',
            alt: 'Leo constellation',
            title: 'Leo Leadership',
            description: 'Fire sign creativity'
        }
    ]
};

// Initialize slideshows globally
window.mysticalSlideshows = {};

// Function to add slideshow to any page
function addMysticalSlideshow(containerId, imageSet = 'general') {
    const images = mysticalImageSets[imageSet] || mysticalImageSets.general;
    const slideshow = new MysticalSlideshow(containerId, { images });
    window.mysticalSlideshows[containerId] = slideshow;
    return slideshow;
}

// Auto-initialize slideshows on page load
document.addEventListener('DOMContentLoaded', () => {
    // Look for slideshow containers and auto-initialize
    const containers = document.querySelectorAll('[data-slideshow]');
    containers.forEach(container => {
        const imageSet = container.dataset.slideshow || 'general';
        addMysticalSlideshow(container.id, imageSet);
    });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MysticalSlideshow,
        mysticalImageSets,
        addMysticalSlideshow
    };
}
