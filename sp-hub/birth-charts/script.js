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
            suggestionsDiv.style.display = 'block';
        } else {
            this.hideLocationSuggestions();
        }
    }

    showLocationFeedback(message) {
        const feedback = document.createElement('div');
        feedback.className = 'location-feedback';
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 15px 20px;
            background: rgba(59, 130, 246, 0.9);
            color: white;
            border-radius: 10px;
            font-weight: 500;
            z-index: 10001;
            animation: fadeIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        
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
            suggestionsDiv.style.display = 'none';
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
            chartDisplay.style.display = 'block';
            console.log('Chart display shown');
        }
        if (interpretationSection) {
            interpretationSection.style.display = 'block';
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
