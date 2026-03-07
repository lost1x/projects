// Initialize sound effects
const clickSound = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
}).toDestination();

function playClickSound() {
    clickSound.triggerAttackRelease("C5", "32n", undefined, 0.1);
}

function vibrate() {
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

function updateResources() {
    fetch('/game')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Update all resource counts
            ['wood', 'stone', 'food', 'leather', 'cloth', 'iron_ore', 'gold'].forEach(resource => {
                const element = document.getElementById(resource);
                if (element) {
                    const newValue = doc.getElementById(resource).textContent;
                    if (element.textContent !== newValue) {
                        element.textContent = newValue;
                        element.classList.add('resource-flash');
                        setTimeout(() => element.classList.remove('resource-flash'), 500);
                    }
                }
            });

            // Update production rates
            ['wood-rate', 'stone-rate', 'food-rate'].forEach(rate => {
                const el = document.getElementById(rate);
                if (el) el.textContent = doc.getElementById(rate).textContent;
            });

            // Update building counts and levels
            ['woodcutter-count', 'woodcutter-level', 'quarry-count', 'quarry-level', 'farm-count', 'farm-level'].forEach(id => {
                const el = document.getElementById(id);
                const newEl = doc.getElementById(id);
                if (el && newEl) {
                    el.textContent = newEl.textContent;
                }
            });

            // Update character stats
            ['level','experience','health','max_health','strength','agility','intelligence'].forEach(stat => {
                const el = document.getElementById(stat);
                if (el) {
                    const newEl = doc.getElementById(stat);
                    if (newEl) el.textContent = newEl.textContent;
                }
            });
            
            // Update health bar
            const healthEl = document.getElementById('health');
            const maxHealthEl = document.getElementById('max_health');
            if (healthEl && maxHealthEl) {
                const healthBar = document.getElementById('health-bar');
                if (healthBar) {
                    const percent = (parseInt(healthEl.textContent) / parseInt(maxHealthEl.textContent)) * 100;
                    healthBar.style.width = percent + '%';
                }
            }
            // inventory is simpler to just reload the table
            const newInv = doc.querySelector('#inventory-table tbody');
            if (newInv) {
                document.querySelector('#inventory-table tbody').innerHTML = newInv.innerHTML;
            }
        });
}

// Handle building buttons
document.querySelectorAll('.build-btn').forEach(button => {
    button.addEventListener('click', function() {
        const building = this.dataset.building;
        fetch(`/api/build/${building}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const countElement = document.getElementById(`${building}-count`);
                countElement.textContent = parseInt(countElement.textContent) + 1;
                updateResources();

                // Add animation to the building card
                this.closest('.card').classList.add('building-upgrade');
                setTimeout(() => {
                    this.closest('.card').classList.remove('building-upgrade');
                }, 700);

                vibrate();
            } else {
                alert(data.message || 'Could not build structure');
            }
        });
    });
});

// Handle upgrade buttons
document.querySelectorAll('.upgrade-btn').forEach(button => {
    button.addEventListener('click', function() {
        const building = this.dataset.building;
        fetch(`/api/upgrade/${building}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const levelElement = document.getElementById(`${building}-level`);
                levelElement.textContent = parseInt(levelElement.textContent) + 1;
                updateResources();

                // Add animation to the building card
                this.closest('.card').classList.add('building-upgrade');
                setTimeout(() => {
                    this.closest('.card').classList.remove('building-upgrade');
                }, 700);

                vibrate();
            } else {
                alert(data.message || 'Could not upgrade building');
            }
        });
    });
});

// Handle resource gathering buttons (instant click)
document.querySelectorAll('.gather-btn').forEach(button => {
    button.addEventListener('click', function() {
        const resource = this.dataset.resource;
        fetch(`/api/gather/${resource}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Directly update the resource counter from the response
                const resourceEl = document.getElementById(resource);
                resourceEl.textContent = data.new_amount;
                resourceEl.classList.add('resource-flash');
                setTimeout(() => resourceEl.classList.remove('resource-flash'), 500);
                playClickSound();
                vibrate();
            }
        });
    });
});

// Handle hunting button
const huntBtn = document.getElementById('hunt-btn');
if (huntBtn) {
    huntBtn.addEventListener('click', function() {
        fetch('/api/hunt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateResources();
                this.disabled = true;
                vibrate();

                // Start cooldown animation
                const overlay = this.querySelector('.cooldown-overlay');
                overlay.style.width = '100%';

                setTimeout(() => {
                    this.disabled = false;
                    overlay.style.width = '0%';
                }, 30000); // Re-enable after 30 seconds
            }
            alert(data.message);
        });
    });
}

// Handle adventure button
const adventureBtn = document.getElementById('adventure-btn');
if (adventureBtn) {
    adventureBtn.addEventListener('click', function() {
        this.disabled = true;
        const logEl = document.getElementById('adventure-log');
        logEl.innerHTML = '<p style="color: #0f0;">⚔️ Adventure starting...</p>';
        
        fetch('/api/adventure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(r => r.json())
        .then(data => {
            // Display combat log
            let logHtml = '';
            if (data.log) {
                data.log.forEach(line => {
                    logHtml += `<p style="color: ${line.includes('You') ? '#0f0' : '#ff6b6b'};">${line}</p>`;
                });
            }
            
            // Show result
            if (data.success) {
                logHtml += `<p style="color: #ffd700;"><strong>✅ ${data.message}</strong></p>`;
            } else {
                logHtml += `<p style="color: #ff6b6b;"><strong>❌ ${data.message}</strong></p>`;
            }
            
            logEl.innerHTML = logHtml;
            
            // Show rewards
            if (data.rewards) {
                const rewardsHtml = `
                    <div class="alert alert-success mt-2">
                        <strong>⭐ Rewards:</strong>
                        <br>Gold: +${data.rewards.gold}
                        <br>XP: +${data.rewards.xp}
                    </div>
                `;
                document.getElementById('adventure-rewards').innerHTML = rewardsHtml;
            }
            
            updateResources();
            vibrate();
            
            setTimeout(() => {
                adventureBtn.disabled = false;
            }, 2000);
        });
    });
}

function getResourceAction(resource) {
    switch(resource) {
        case 'wood': return 'Chop Wood';
        case 'stone': return 'Mine Stone';
        case 'food': return 'Gather Food';
        default: return 'Gather';
    }
}

// Load recipes and display them
function loadRecipes() {
    fetch('/api/recipes')
        .then(r => r.json())
        .then(data => {
            let html = '';
            if (data.recipes.length === 0) {
                html = '<p class="text-muted">No recipes available yet</p>';
            } else {
                data.recipes.forEach(recipe => {
                    const ingredients = Object.entries(recipe.ingredients)
                        .map(([k,v]) => `${v} ${k}`)
                        .join(', ');
                    const btnClass = recipe.can_craft ? 'btn-primary' : 'btn-secondary';
                    const btnDisabled = !recipe.can_craft ? 'disabled' : '';
                    
                    html += `
                        <div class="mb-2">
                            <strong>${recipe.name}</strong> → ${recipe.quantity}x ${recipe.result}
                            <br><small class="text-muted">Cost: ${ingredients}</small>
                            <button class="btn btn-sm ${btnClass} w-100 mt-1 craft-btn" data-recipe-id="${recipe.id}" ${btnDisabled}>
                                ${recipe.can_craft ? 'Craft' : recipe.status}
                            </button>
                        </div>
                    `;
                });
            }
            document.getElementById('recipes-list').innerHTML = html;
            
            // Add craft button handlers
            document.querySelectorAll('.craft-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const recipeId = this.dataset.recipeId;
                    fetch(`/api/craft/${recipeId}`, {method: 'POST', headers: {'Content-Type': 'application/json'}})
                        .then(r => r.json())
                        .then(data => {
                            alert(data.message);
                            if (data.success) {
                                updateResources();
                                loadRecipes();
                                vibrate();
                            }
                        });
                });
            });
        });
}

// Load quests and display them
function loadQuests() {
    fetch('/api/quests')
        .then(r => r.json())
        .then(data => {
            let html = '<div class="mb-3"><strong>Available:</strong></div>';
            
            if (data.available.length === 0) {
                html += '<p class="text-muted text-sm">All quests completed today!</p>';
            } else {
                data.available.forEach(quest => {
                    html += `
                        <div class="mb-2 p-2 border rounded">
                            <strong>${quest.name}</strong>
                            <br><small>${quest.description}</small>
                            <br><small class="text-warning">Reward: ${quest.reward_gold}g, ${quest.reward_xp}xp</small>
                            <button class="btn btn-sm btn-success w-100 mt-1 complete-quest-btn" data-quest-id="${quest.id}">Complete Quest</button>
                        </div>
                    `;
                });
            }
            
            if (data.completed.length > 0) {
                html += '<div class="mt-3"><strong>Completed Today:</strong></div>';
                data.completed.forEach(quest => {
                    html += `<div class="mt-1"><span class="badge bg-success">✓</span> ${quest.name}</div>`;
                });
            }
            
            document.getElementById('quests-list').innerHTML = html;
            
            // Add complete quest handlers
            document.querySelectorAll('.complete-quest-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const questId = this.dataset.questId;
                    fetch(`/api/quest/${questId}/complete`, {method: 'POST', headers: {'Content-Type': 'application/json'}})
                        .then(r => r.json())
                        .then(data => {
                            if (data.success) {
                                alert(data.message + ` (${data.reward_gold}g, ${data.reward_xp}xp)`);
                                updateResources();
                                loadQuests();
                                vibrate();
                            }
                        });
                });
            });
        });
}

// Update resources every second
setInterval(updateResources, 1000);setInterval(updateResources, 1000);
loadRecipes();
loadQuests();
setInterval(loadQuests, 5000);
