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
