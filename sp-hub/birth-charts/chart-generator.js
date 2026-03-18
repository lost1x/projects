// ===== CHART VISUALIZATION =====

class ChartGenerator {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = Math.min(this.centerX, this.centerY) - 40;
    }

    drawChart(birthData) {
        this.clearCanvas();
        this.drawWheel();
        this.drawHouses(birthData.houses);
        this.drawPlanets(birthData.planets);
        this.drawAspects(birthData.aspects);
        this.drawLabels();
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawWheel() {
        // Outer circle
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = '#4C1D95';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Inner circle
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius * 0.8, 0, 2 * Math.PI);
        this.ctx.strokeStyle = '#6D28D9';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Zodiac signs
        zodiacSigns.forEach((sign, index) => {
            const angle = (index * 30 - 90) * (Math.PI / 180);
            const x = this.centerX + Math.cos(angle) * this.radius * 0.9;
            const y = this.centerY + Math.sin(angle) * this.radius * 0.9;

            // Draw symbol
            this.ctx.font = '20px serif';
            this.ctx.fillStyle = '#FFD700';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(sign.symbol, x, y);

            // Draw sign divisions
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.lineTo(
                this.centerX + Math.cos(angle) * this.radius,
                this.centerY + Math.sin(angle) * this.radius
            );
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    }

    drawHouses(houses) {
        houses.forEach((house, index) => {
            const signIndex = zodiacSigns.indexOf(house.sign);
            const angle = (signIndex * 30 - 90) * (Math.PI / 180);
            
            // Draw house line
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.lineTo(
                this.centerX + Math.cos(angle) * this.radius,
                this.centerY + Math.sin(angle) * this.radius
            );
            this.ctx.strokeStyle = 'rgba(124, 58, 237, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw house number
            const textX = this.centerX + Math.cos(angle) * this.radius * 0.7;
            const textY = this.centerY + Math.sin(angle) * this.radius * 0.7;
            this.ctx.font = '14px Arial';
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(house.number.toString(), textX, textY);
        });
    }

    drawPlanets(planets) {
        planets.forEach(planet => {
            if (planet.sign) {
                const signIndex = zodiacSigns.indexOf(planet.sign);
                const angle = (planet.degree - 90) * (Math.PI / 180);
                const distance = this.radius * 0.6;
                
                const x = this.centerX + Math.cos(angle) * distance;
                const y = this.centerY + Math.sin(angle) * distance;

                // Draw planet symbol
                this.ctx.font = '16px serif';
                this.ctx.fillStyle = this.getPlanetColor(planet.name);
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(planet.symbol, x, y);

                // Draw planet circle
                this.ctx.beginPath();
                this.ctx.arc(x, y, 8, 0, 2 * Math.PI);
                this.ctx.strokeStyle = this.getPlanetColor(planet.name);
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.fill();
            }
        });
    }

    drawAspects(aspects) {
        aspects.forEach(aspect => {
            const planet1 = planets.find(p => p.name === aspect.planet1);
            const planet2 = planets.find(p => p.name === aspect.planet2);
            
            if (planet1 && planet2 && planet1.sign && planet2.sign) {
                const angle1 = (planet1.degree - 90) * (Math.PI / 180);
                const angle2 = (planet2.degree - 90) * (Math.PI / 180);
                const distance = this.radius * 0.6;
                
                const x1 = this.centerX + Math.cos(angle1) * distance;
                const y1 = this.centerY + Math.sin(angle1) * distance;
                const x2 = this.centerX + Math.cos(angle2) * distance;
                const y2 = this.centerY + Math.sin(angle2) * distance;

                // Draw aspect line
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.strokeStyle = this.getAspectColor(aspect.type);
                this.ctx.lineWidth = 1;
                this.ctx.setLineDash([5, 5]);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        });
    }

    drawLabels() {
        // Title
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Natal Chart', this.centerX, 30);
    }

    getPlanetColor(planetName) {
        const colors = {
            'Sun': '#FFD700',
            'Moon': '#C0C0C0',
            'Mercury': '#8B7355',
            'Venus': '#FFA500',
            'Mars': '#FF0000',
            'Jupiter': '#DAA520',
            'Saturn': '#F4A460',
            'Uranus': '#4FD0E0',
            'Neptune': '#4169E1',
            'Pluto': '#8B4513'
        };
        return colors[planetName] || '#FFFFFF';
    }

    getAspectColor(type) {
        return type === 'hard' ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 0, 0.3)';
    }

    saveChart() {
        const link = document.createElement('a');
        link.download = 'birth-chart.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartGenerator;
}

// ===== BIRTH CHARTS FUNCTIONALITY =====

class BirthChartGenerator {
    constructor() {
        this.birthData = null;
        this.chartGenerator = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateTimezones();
        this.setMaxDate();
        this.displayZodiacReference();
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('birthForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateChart();
            });
        }

        // Location input with suggestions
        const locationInput = document.getElementById('birth-location');
        if (locationInput) {
            locationInput.addEventListener('input', () => this.showLocationSuggestions());
            locationInput.addEventListener('blur', () => {
                setTimeout(() => this.hideLocationSuggestions(), 200);
            });
        }

        // Timezone change
        const timezoneSelect = document.getElementById('timezone');
        if (timezoneSelect) {
            timezoneSelect.addEventListener('change', () => this.validateForm());
        }
    }

    populateTimezones() {
        const timezoneSelect = document.getElementById('timezone');
        if (!timezoneSelect) return;

        timezones.forEach(tz => {
            const option = document.createElement('option');
            option.value = tz.value;
            option.textContent = tz.label;
            timezoneSelect.appendChild(option);
        });

        // Set user's timezone
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const matchingTz = timezones.find(tz => tz.value.includes(userTimezone.split('/')[0]));
        if (matchingTz) {
            timezoneSelect.value = matchingTz.value;
        }
    }

    setMaxDate() {
        const dateInput = document.getElementById('birth-date');
        if (dateInput) {
            const today = new Date();
            const maxDate = today.toISOString().split('T')[0];
            dateInput.max = maxDate;
        }
    }

    showLocationSuggestions() {
        const input = document.getElementById('birth-location');
        const suggestionsDiv = document.getElementById('locationSuggestions');
        if (!input || !suggestionsDiv) return;

        const value = input.value.toLowerCase();
        if (value.length < 2) {
            this.hideLocationSuggestions();
            return;
        }

        const matches = majorCities.filter(city => 
            city.name.toLowerCase().includes(value)
        );

        if (matches.length > 0) {
            suggestionsDiv.innerHTML = '';
            
            // Add overlay backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'location-suggestion-backdrop';
            backdrop.addEventListener('click', () => {
                this.hideLocationSuggestions();
            });
            suggestionsDiv.appendChild(backdrop);
            
            // Add close button
            const closeBtn = document.createElement('div');
            closeBtn.className = 'location-suggestion-close';
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.addEventListener('click', () => {
                this.hideLocationSuggestions();
            });
            suggestionsDiv.appendChild(closeBtn);
            
            matches.forEach(city => {
                const suggestion = document.createElement('div');
                suggestion.className = 'location-suggestion';
                suggestion.textContent = city.name;
                suggestion.addEventListener('click', () => {
                    input.value = city.name;
                    this.hideLocationSuggestions();
                    this.setTimezone(city.timezone);
                    
                    // Show feedback and email
                    this.showLocationFeedback('Opening email for location request...');
                    this.emailLocationRequest(city.name);
                });
                suggestionsDiv.appendChild(suggestion);
            });
            suggestionsDiv.classList.remove('hidden');
        } else {
            this.hideLocationSuggestions();
        }
    }

    showLocationFeedback(message) {
        const feedback = document.createElement('div');
        feedback.className = 'location-feedback location-feedback-visible';
        feedback.textContent = message;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 2000);
    }

    async emailLocationRequest(location) {
        try {
            // Create email content
            const subject = encodeURIComponent('Location Request - Birth Charts Tool');
            const body = encodeURIComponent(`
Location Request Received:

Requested Location: ${location}
Date: ${new Date().toLocaleString()}
User Agent: ${navigator.userAgent}

---
This location request was submitted from the Birth Charts tool on Spaarow Hub.
            `);
            
            // Create mailto link
            const mailtoLink = `mailto:spaarow@icloud.com?subject=${subject}&body=${body}`;
            
            // Open email client
            window.open(mailtoLink, '_blank');
            
            console.log('Email client opened for location request:', location);
        } catch (error) {
            console.error('Error sending location email:', error);
        }
    }

    hideLocationSuggestions() {
        const suggestionsDiv = document.getElementById('locationSuggestions');
        if (suggestionsDiv) {
            suggestionsDiv.classList.add('hidden');
        }
    }

    setTimezone(timezone) {
        const timezoneSelect = document.getElementById('timezone');
        if (timezoneSelect) {
            timezoneSelect.value = timezone;
        }
    }

    validateForm() {
        const date = document.getElementById('birth-date').value;
        const time = document.getElementById('birth-time').value;
        const location = document.getElementById('birth-location').value;
        const timezone = document.getElementById('timezone').value;

        const submitButton = document.querySelector('.generate-button');
        if (submitButton) {
            const isValid = date && time && location && timezone;
            submitButton.disabled = !isValid;
        }
    }

    async generateChart() {
        console.log('Generating chart...');
        
        const date = document.getElementById('birth-date').value;
        const time = document.getElementById('birth-time').value;
        const location = document.getElementById('birth-location').value;
        const timezone = document.getElementById('timezone').value;
        const name = document.getElementById('name').value;
        const chartType = document.getElementById('chart-type').value;

        console.log('Form data:', { date, time, location, timezone, name, chartType });

        // Show loading state
        const submitButton = document.querySelector('.generate-button');
        const originalContent = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Generating Chart...</span>';

        // Parse birth data
        const birthDateTime = new Date(`${date}T${time}`);
        const cityData = majorCities.find(city => city.name === location) || {
            lat: 0, lon: 0, timezone: timezone
        };

        console.log('Birth data parsed:', { birthDateTime, cityData });

        this.birthData = {
            name: name || 'Seeker',
            date: birthDateTime,
            location: location,
            timezone: timezone,
            chartType: chartType,
            coordinates: cityData
        };

        console.log('Birth data object:', this.birthData);

        // Calculate chart data
        const chartData = this.calculateChartData(this.birthData);
        console.log('Chart data calculated:', chartData);

        // Simulate processing delay
        await this.delay(2000);

        // Display chart
        this.displayChart(chartData);
        console.log('Chart displayed');

        // Restore button
        submitButton.disabled = false;
        submitButton.innerHTML = originalContent;
    }

    calculateChartData(birthData) {
        console.log('Calculating chart data for:', birthData);
        
        try {
            const planets = AstrologyCalculator.calculatePlanetaryPositions(
                birthData.date, 
                birthData.coordinates
            );
            console.log('Planets calculated:', planets);
            
            const houses = AstrologyCalculator.calculateHousePositions(
                birthData.date, 
                birthData.coordinates
            );
            console.log('Houses calculated:', houses);
            
            const aspects = AstrologyCalculator.calculateAspects(planets);
            console.log('Aspects calculated:', aspects);

            const result = {
                birthData: birthData,
                planets: planets,
                houses: houses,
                aspects: aspects
            };
            
            console.log('Final chart data:', result);
            return result;
        } catch (error) {
            console.error('Error calculating chart data:', error);
            return {
                birthData: birthData,
                planets: [],
                houses: [],
                aspects: []
            };
        }
    }

    displayChart(chartData) {
        console.log('Displaying chart with data:', chartData);
        
        // Show chart sections
        const chartDisplay = document.getElementById('chartDisplay');
        const interpretationSection = document.getElementById('interpretationSection');
        
        console.log('Chart display element:', chartDisplay);
        console.log('Interpretation section element:', interpretationSection);
        
        if (chartDisplay) {
            chartDisplay.classList.remove('hidden');
            console.log('Chart display shown');
        }
        if (interpretationSection) {
            interpretationSection.classList.remove('hidden');
            console.log('Interpretation section shown');
        }

        // Generate chart wheel
        this.generateChartWheel(chartData);
        console.log('Chart wheel generated');

        // Display summary information
        this.displaySummary(chartData);
        console.log('Summary displayed');

        // Display planetary positions
        this.displayPlanetaryPositions(chartData.planets);
        console.log('Planetary positions displayed');

        // Generate interpretation
        this.generateInterpretation(chartData);
        console.log('Interpretation generated');

        // Scroll to results
        if (chartDisplay) {
            chartDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
            console.log('Scrolled to results');
        }
    }

    generateChartWheel(chartData) {
        const canvas = document.getElementById('chartCanvas');
        if (!canvas) return;

        if (!this.chartGenerator) {
            this.chartGenerator = new ChartGenerator('chartCanvas');
        }

        this.chartGenerator.drawChart(chartData);
    }

    displaySummary(chartData) {
        const summaryInfo = document.getElementById('summaryInfo');
        if (!summaryInfo) return;

        const sunSign = AstrologyCalculator.getZodiacSign(chartData.birthData.date);
        const ascendant = chartData.houses[0].sign;

        summaryInfo.innerHTML = `
            <div class="summary-item">
                <strong>Sun Sign:</strong> ${sunSign.symbol} ${sunSign.name}
            </div>
            <div class="summary-item">
                <strong>Ascendant:</strong> ${ascendant.symbol} ${ascendant.name}
            </div>
            <div class="summary-item">
                <strong>Birth Time:</strong> ${chartData.birthData.date.toLocaleTimeString()}
            </div>
            <div class="summary-item">
                <strong>Location:</strong> ${chartData.birthData.location}
            </div>
        `;
    }

    displayPlanetaryPositions(planets) {
        const positionsList = document.getElementById('positionsList');
        if (!positionsList) return;

        positionsList.innerHTML = '';
        planets.forEach(planet => {
            if (planet.sign) {
                const positionDiv = document.createElement('div');
                positionDiv.className = 'planet-position';
                positionDiv.innerHTML = `
                    <div class="planet-info">
                        <span class="planet-symbol">${planet.symbol}</span>
                        <span class="planet-name">${planet.name}</span>
                    </div>
                    <div class="planet-details">
                        <span class="planet-sign">${planet.sign.symbol} ${planet.sign.name}</span>
                        <span class="planet-degree">${Math.round(planet.degree)}°</span>
                        <span class="planet-house">House ${planet.house}</span>
                    </div>
                `;
                positionsList.appendChild(positionDiv);
            }
        });
    }

    generateInterpretation(chartData) {
        const interpretationContent = document.getElementById('interpretationContent');
        if (!interpretationContent) return;

        const sunSign = AstrologyCalculator.getZodiacSign(chartData.birthData.date);
        const ascendant = chartData.houses[0].sign;
        const moonSign = chartData.planets.find(p => p.name === 'Moon')?.sign;

        let interpretation = '<div class="interpretation-content">';
        
        interpretation += '<h4>Your Cosmic Blueprint</h4>';
        interpretation += `<p><strong>Sun in ${sunSign.name}:</strong> ${sunSign.description}</p>`;
        interpretation += `<p><strong>Rising in ${ascendant.name}:</strong> You appear to others as ${ascendant.traits.join(', ').toLowerCase()}.</p>`;
        
        if (moonSign) {
            interpretation += `<p><strong>Moon in ${moonSign.name}:</strong> Emotionally, you are ${moonSign.traits.join(', ').toLowerCase()}.</p>`;
        }

        interpretation += '<h4>Key Planetary Placements</h4>';
        
        // Add major aspects
        const majorAspects = chartData.aspects.slice(0, 3);
        if (majorAspects.length > 0) {
            interpretation += '<div class="aspects-summary">';
            interpretation += '<h5>Major Aspects:</h5>';
            majorAspects.forEach(aspect => {
                interpretation += `<p><strong>${aspect.planet1} ${aspect.aspect} ${aspect.planet2}:</strong> ${aspect.meaning}</p>`;
            });
            interpretation += '</div>';
        }

        interpretation += '<h4>Life Themes</h4>';
        interpretation += this.generateLifeThemes(chartData);

        interpretation += '</div>';
        interpretationContent.innerHTML = interpretation;
    }

    generateLifeThemes(chartData) {
        const sunSign = AstrologyCalculator.getZodiacSign(chartData.birthData.date);
        const dominantElement = this.getDominantElement(chartData.planets);
        
        let themes = '<p>With your Sun in ';
        themes += `<strong>${sunSign.name}</strong> and a dominant <strong>${dominantElement}</strong> element, `;
        themes += 'you are naturally drawn to experiences that align with these energies.</p>';
        
        themes += '<p>Your chart reveals a unique blend of ';
        themes += `${sunSign.traits.slice(0, 2).join(' and ')} tendencies, `;
        themes += 'combined with the emotional depth of your Moon sign and the outward expression of your Rising sign.</p>';
        
        themes += '<p>This cosmic configuration suggests that your life journey involves ';
        themes += 'balancing your inner world with your outer expression, finding harmony between your authentic self and how others perceive you.</p>';
        
        return themes;
    }

    getDominantElement(planets) {
        const elementCounts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
        
        planets.forEach(planet => {
            if (planet.sign) {
                elementCounts[planet.sign.element]++;
            }
        });

        return Object.keys(elementCounts).reduce((a, b) => 
            elementCounts[a] > elementCounts[b] ? a : b
        );
    }

    displayZodiacReference() {
        const zodiacGrid = document.getElementById('zodiacGrid');
        if (!zodiacGrid) return;

        zodiacGrid.innerHTML = '';
        zodiacSigns.forEach(sign => {
            const signCard = document.createElement('div');
            signCard.className = 'zodiac-card';
            signCard.innerHTML = `
                <div class="zodiac-symbol">${sign.symbol}</div>
                <div class="zodiac-name">${sign.name}</div>
                <div class="zodiac-dates">${sign.dates}</div>
                <div class="zodiac-element">${sign.element}</div>
            `;
            signCard.addEventListener('click', () => this.showZodiacDetails(sign));
            zodiacGrid.appendChild(signCard);
        });
    }

    showZodiacDetails(sign) {
        const modal = document.createElement('div');
        modal.className = 'zodiac-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="zodiac-details">
                    <div class="zodiac-symbol-large">${sign.symbol}</div>
                    <h3>${sign.name}</h3>
                    <p><strong>Element:</strong> ${sign.element}</p>
                    <p><strong>Quality:</strong> ${sign.quality}</p>
                    <p><strong>Ruler:</strong> ${sign.ruler}</p>
                    <p><strong>Dates:</strong> ${sign.dates}</p>
                    <p><strong>Traits:</strong> ${sign.traits.join(', ')}</p>
                    <p><strong>Description:</strong> ${sign.description}</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    purchasePremium() {
        alert('Premium features coming soon! This will unlock transit predictions, compatibility reports, and detailed lunar analysis.');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    window.birthChartGenerator = new BirthChartGenerator();
});

// ===== UTILITY FUNCTIONS =====

// Add CSS animations dynamically
const chartAnimations = `
<style>
.location-suggestion-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
}

.location-suggestions {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 15px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    min-width: 300px;
    max-width: 90vw;
}

.location-suggestion-close {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 5px 8px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
}

.location-suggestion-close:hover {
    background: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 1);
}

.location-suggestion {
    padding: 10px 15px;
    cursor: pointer;
    transition: background 0.3s ease;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.location-suggestion:hover {
    background: rgba(255, 255, 255, 0.2);
}

.planet-position {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.planet-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.planet-symbol {
    font-size: 1.2rem;
    color: #FFD700;
}

.planet-name {
    font-weight: 600;
    color: #FFFFFF;
}

.planet-details {
    display: flex;
    gap: 15px;
    font-size: 0.9rem;
    color: #B8B8B8;
}

.summary-item {
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.zodiac-card {
    background: rgba(76, 29, 149, 0.1);
    border: 1px solid rgba(76, 29, 149, 0.3);
    border-radius: 10px;
    padding: 1.5rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.zodiac-card:hover {
    background: rgba(76, 29, 149, 0.2);
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(76, 29, 149, 0.3);
}

.zodiac-symbol {
    font-size: 2rem;
    color: #FFD700;
    margin-bottom: 0.5rem;
}

.zodiac-name {
    font-family: 'Cinzel', serif;
    font-size: 1.2rem;
    color: #FFFFFF;
    margin-bottom: 0.5rem;
}

.zocard-dates {
    font-size: 0.9rem;
    color: #B8B8B8;
    margin-bottom: 0.5rem;
}

.zodiac-element {
    background: linear-gradient(135deg, #4C1D95, #6D28D9);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    display: inline-block;
}

.zodiac-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
}

.modal-content {
    background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
    border: 2px solid #4C1D95;
    border-radius: 20px;
    padding: 2rem;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    z-index: 1;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    width: 35px;
    height: 35px;
    cursor: pointer;
    color: #FFFFFF;
    font-size: 1.2rem;
    transition: all 0.3s ease;
}

.modal-close:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
}

.zodiac-details {
    text-align: center;
}

.zodiac-symbol-large {
    font-size: 4rem;
    color: #FFD700;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    margin-bottom: 1.5rem;
}

.zodiac-details h3 {
    font-family: 'Cinzel', serif;
    color: #FFD700;
    margin-bottom: 1rem;
}

.zodiac-details p {
    font-family: 'Poppins', sans-serif;
    color: #FFFFFF;
    line-height: 1.6;
    margin-bottom: 1rem;
    text-align: left;
}

.chart-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
}

.chart-wheel {
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(76, 29, 149, 0.1);
    border: 2px solid rgba(76, 29, 149, 0.3);
    border-radius: 15px;
    padding: 1rem;
}

.chart-info {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.chart-summary,
.planetary-positions {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(76, 29, 149, 0.3);
    border-radius: 10px;
    padding: 1.5rem;
}

.chart-summary h4,
.planetary-positions h4 {
    font-family: 'Cinzel', serif;
    color: #FFD700;
    margin-bottom: 1rem;
}

.interpretation-content {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(76, 29, 149, 0.3);
    border-radius: 15px;
    padding: 2rem;
    margin-top: 2rem;
}

.interpretation-content h4 {
    font-family: 'Cinzel', serif;
    color: #FFD700;
    margin-bottom: 1rem;
}

.aspects-summary {
    background: rgba(76, 29, 149, 0.1);
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
}

@media (max-width: 768px) {
    .chart-container {
        grid-template-columns: 1fr;
    }
    
    .location-suggestions {
        position: relative;
        margin-top: 10px;
        max-width: 100%;
        width: 100%;
    }
}

</style>
`;

document.head.insertAdjacentHTML('beforeend', chartAnimations);

// ===== ASTROLOGY DATA =====

const zodiacSigns = [
    {
        name: "Aries",
        symbol: "♈",
        element: "Fire",
        quality: "Cardinal",
        ruler: "Mars",
        dates: "March 21 - April 19",
        traits: ["Courageous", "Confident", "Enthusiastic", "Impulsive"],
        description: "The first sign of the zodiac, representing new beginnings and pioneering spirit."
    },
    {
        name: "Taurus",
        symbol: "♉",
        element: "Earth",
        quality: "Fixed",
        ruler: "Venus",
        dates: "April 20 - May 20",
        traits: ["Reliable", "Patient", "Practical", "Stubborn"],
        description: "An earth sign known for stability, sensuality, and determination."
    },
    {
        name: "Gemini",
        symbol: "♊",
        element: "Air",
        quality: "Mutable",
        ruler: "Mercury",
        dates: "May 21 - June 20",
        traits: ["Adaptable", "Curious", "Communicative", "Nervous"],
        description: "An air sign representing duality, communication, and intellectual curiosity."
    },
    {
        name: "Cancer",
        symbol: "♋",
        element: "Water",
        quality: "Cardinal",
        ruler: "Moon",
        dates: "June 21 - July 22",
        traits: ["Intuitive", "Emotional", "Protective", "Moody"],
        description: "A water sign representing nurturing, emotions, and home life."
    },
    {
        name: "Leo",
        symbol: "♌",
        element: "Fire",
        quality: "Fixed",
        ruler: "Sun",
        dates: "July 23 - August 22",
        traits: ["Creative", "Generous", "Confident", "Arrogant"],
        description: "A fire sign representing creativity, leadership, and self-expression."
    },
    {
        name: "Virgo",
        symbol: "♍",
        element: "Earth",
        quality: "Mutable",
        ruler: "Mercury",
        dates: "August 23 - September 22",
        traits: ["Analytical", "Practical", "Helpful", "Critical"],
        description: "An earth sign representing service, analysis, and perfectionism."
    },
    {
        name: "Libra",
        symbol: "♎",
        element: "Air",
        quality: "Cardinal",
        ruler: "Venus",
        dates: "September 23 - October 22",
        traits: ["Diplomatic", "Fair", "Social", "Indecisive"],
        description: "An air sign representing balance, relationships, and justice."
    },
    {
        name: "Scorpio",
        symbol: "♏",
        element: "Water",
        quality: "Fixed",
        ruler: "Pluto",
        dates: "October 23 - November 21",
        traits: ["Intense", "Passionate", "Secretive", "Jealous"],
        description: "A water sign representing transformation, depth, and power."
    },
    {
        name: "Sagittarius",
        symbol: "♐",
        element: "Fire",
        quality: "Mutable",
        ruler: "Jupiter",
        dates: "November 22 - December 21",
        traits: ["Optimistic", "Adventurous", "Philosophical", "Restless"],
        description: "A fire sign representing exploration, freedom, and higher learning."
    },
    {
        name: "Capricorn",
        symbol: "♑",
        element: "Earth",
        quality: "Cardinal",
        ruler: "Saturn",
        dates: "December 22 - January 19",
        traits: ["Ambitious", "Disciplined", "Responsible", "Pessimistic"],
        description: "An earth sign representing structure, achievement, and responsibility."
    },
    {
        name: "Aquarius",
        symbol: "♒",
        element: "Air",
        quality: "Fixed",
        ruler: "Uranus",
        dates: "January 20 - February 18",
        traits: ["Innovative", "Independent", "Humanitarian", "Detached"],
        description: "An air sign representing innovation, community, and progressive thinking."
    },
    {
        name: "Pisces",
        symbol: "♓",
        element: "Water",
        quality: "Mutable",
        ruler: "Neptune",
        dates: "February 19 - March 20",
        traits: ["Compassionate", "Artistic", "Intuitive", "Escapist"],
        description: "A water sign representing spirituality, empathy, and imagination."
    }
];

const planets = [
    {
        name: "Sun",
        symbol: "☉",
        type: "star",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Core identity, ego, life purpose"
    },
    {
        name: "Moon",
        symbol: "☽",
        type: "satellite",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Emotions, instincts, subconscious"
    },
    {
        name: "Mercury",
        symbol: "☿",
        type: "planet",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Communication, thinking, learning"
    },
    {
        name: "Venus",
        symbol: "♀",
        type: "planet",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Love, values, relationships"
    },
    {
        name: "Mars",
        symbol: "♂",
        type: "planet",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Action, desire, aggression"
    },
    {
        name: "Jupiter",
        symbol: "♃",
        type: "planet",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Expansion, luck, philosophy"
    },
    {
        name: "Saturn",
        symbol: "♄",
        type: "planet",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Structure, discipline, limitations"
    },
    {
        name: "Uranus",
        symbol: "♅",
        type: "planet",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Innovation, rebellion, change"
    },
    {
        name: "Neptune",
        symbol: "♆",
        type: "planet",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Spirituality, dreams, illusion"
    },
    {
        name: "Pluto",
        symbol: "♇",
        type: "dwarf",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Transformation, power, regeneration"
    }
];

const houses = [
    {
        number: 1,
        name: "House of Self",
        sign: null,
        meaning: "Identity, appearance, first impressions"
    },
    {
        number: 2,
        name: "House of Values",
        sign: null,
        meaning: "Money, possessions, self-worth"
    },
    {
        number: 3,
        name: "House of Communication",
        sign: null,
        meaning: "Thinking, learning, siblings"
    },
    {
        number: 4,
        name: "House of Home",
        sign: null,
        meaning: "Family, roots, private life"
    },
    {
        number: 5,
        name: "House of Creativity",
        sign: null,
        meaning: "Romance, children, self-expression"
    },
    {
        number: 6,
        name: "House of Service",
        sign: null,
        meaning: "Work, health, daily routines"
    },
    {
        number: 7,
        name: "House of Partnership",
        sign: null,
        meaning: "Relationships, marriage, contracts"
    },
    {
        number: 8,
        name: "House of Transformation",
        sign: null,
        meaning: "Death, taxes, shared resources"
    },
    {
        number: 9,
        name: "House of Philosophy",
        sign: null,
        meaning: "Travel, education, beliefs"
    },
    {
        number: 10,
        name: "House of Career",
        sign: null,
        meaning: "Public life, reputation, achievement"
    },
    {
        number: 11,
        name: "House of Friends",
        sign: null,
        meaning: "Social groups, hopes, dreams"
    },
    {
        number: 12,
        name: "House of Subconscious",
        sign: null,
        meaning: "Secrets, spirituality, endings"
    }
];

const aspects = [
    {
        name: "Conjunction",
        angle: 0,
        orb: 8,
        type: "hard",
        meaning: "Fusion of energies, new beginnings"
    },
    {
        name: "Sextile",
        angle: 60,
        orb: 6,
        type: "soft",
        meaning: "Harmonious opportunities, communication"
    },
    {
        name: "Square",
        angle: 90,
        orb: 8,
        type: "hard",
        meaning: "Challenges, tension, growth opportunities"
    },
    {
        name: "Trine",
        angle: 120,
        orb: 8,
        type: "soft",
        meaning: "Flow, ease, natural talent"
    },
    {
        name: "Opposition",
        angle: 180,
        orb: 8,
        type: "hard",
        meaning: "Balance, relationships, awareness"
    }
];

const timezones = [
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
    { value: "Europe/Paris", label: "Central European Time (CET)" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
    { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" }
];

const majorCities = [
    { name: "New York, USA", lat: 40.7128, lon: -74.0060, timezone: "America/New_York" },
    { name: "Los Angeles, USA", lat: 34.0522, lon: -118.2437, timezone: "America/Los_Angeles" },
    { name: "Chicago, USA", lat: 41.8781, lon: -87.6298, timezone: "America/Chicago" },
    { name: "London, UK", lat: 51.5074, lon: -0.1278, timezone: "Europe/London" },
    { name: "Paris, France", lat: 48.8566, lon: 2.3522, timezone: "Europe/Paris" },
    { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503, timezone: "Asia/Tokyo" },
    { name: "Sydney, Australia", lat: -33.8688, lon: 151.2093, timezone: "Australia/Sydney" },
    { name: "Mumbai, India", lat: 19.0760, lon: 72.8777, timezone: "Asia/Kolkata" },
    { name: "Beijing, China", lat: 39.9042, lon: 116.4074, timezone: "Asia/Shanghai" },
    { name: "Moscow, Russia", lat: 55.7558, lon: 37.6173, timezone: "Europe/Moscow" }
];

// Chart calculation functions
class AstrologyCalculator {
    static getZodiacSign(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return zodiacSigns[0]; // Aries
        if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return zodiacSigns[1]; // Taurus
        if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return zodiacSigns[2]; // Gemini
        if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return zodiacSigns[3]; // Cancer
        if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return zodiacSigns[4]; // Leo
        if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return zodiacSigns[5]; // Virgo
        if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return zodiacSigns[6]; // Libra
        if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return zodiacSigns[7]; // Scorpio
        if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return zodiacSigns[8]; // Sagittarius
        if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return zodiacSigns[9]; // Capricorn
        if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return zodiacSigns[10]; // Aquarius
        return zodiacSigns[11]; // Pisces
    }
    
    static calculateHousePositions(date, location) {
        // Simplified house calculation - in real implementation would use complex astronomical calculations
        const houses = [...houses];
        const ascendantSign = this.getZodiacSign(date);
        
        houses.forEach((house, index) => {
            house.sign = zodiacSigns[(zodiacSigns.indexOf(ascendantSign) + index) % 12];
        });
        
        return houses;
    }
    
    static calculatePlanetaryPositions(date, location) {
        // Simplified planetary calculation - in real implementation would use ephemeris data
        const positions = [...planets];
        const baseDegree = (date.getTime() / 1000) % 360; // Simplified calculation
        
        positions.forEach((planet, index) => {
            planet.degree = (baseDegree + index * 30) % 360;
            planet.sign = zodiacSigns[Math.floor(planet.degree / 30)];
            planet.house = Math.floor(planet.degree / 30) + 1;
        });
        
        return positions;
    }
    
    static calculateAspects(planets) {
        const foundAspects = [];
        
        for (let i = 0; i < planets.length; i++) {
            for (let j = i + 1; j < planets.length; j++) {
                const planet1 = planets[i];
                const planet2 = planets[j];
                const angle = Math.abs(planet1.degree - planet2.degree);
                
                aspects.forEach(aspect => {
                    const diff = Math.abs(angle - aspect.angle);
                    if (diff <= aspect.orb || diff >= 360 - aspect.orb) {
                        foundAspects.push({
                            planet1: planet1.name,
                            planet2: planet2.name,
                            aspect: aspect.name,
                            angle: angle,
                            type: aspect.type,
                            meaning: aspect.meaning
                        });
                    }
                });
            }
        }
        
        return foundAspects;
    }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        zodiacSigns,
        planets,
        houses,
        aspects,
        timezones,
        majorCities,
        AstrologyCalculator
    };
}
