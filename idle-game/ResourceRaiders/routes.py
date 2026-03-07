from flask import render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from app import app, db, login_manager
from models import User, Resources, Buildings, PlayerStats, Enemy, Item, EquippedItem, Recipe, Quest, CompletedQuest
from game_logic import GameLogic
import stripe
import json
from datetime import datetime, timedelta

stripe.api_key = app.config['STRIPE_KEY']

@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))

# Seed enemies on startup
def seed_enemies():
    """Initialize game enemies if they don't exist"""
    if Enemy.query.count() > 0:
        return  # Already seeded
    
    enemies_data = [
        # Weak tier
        {
            'name': 'Forest Wolf',
            'description': 'A hungry wolf prowling the woods',
            'tier': 'weak',
            'min_level': 1,
            'max_level': 9,
            'base_health': 15,
            'base_attack': 2,
            'loot_table': json.dumps({'gold': 5, 'leather': 1}),
            'xp_reward': 10
        },
        {
            'name': 'Giant Rat',
            'description': 'A diseased rodent',
            'tier': 'weak',
            'min_level': 1,
            'max_level': 9,
            'base_health': 10,
            'base_attack': 1,
            'loot_table': json.dumps({'gold': 3, 'cloth': 1}),
            'xp_reward': 8
        },
        # Normal tier
        {
            'name': 'Goblin',
            'description': 'A mischievous green creature',
            'tier': 'normal',
            'min_level': 6,
            'max_level': 24,
            'base_health': 30,
            'base_attack': 4,
            'loot_table': json.dumps({'gold': 15, 'cloth': 2, 'leather': 1}),
            'xp_reward': 25
        },
        {
            'name': 'Orc Bandit',
            'description': 'A rough-looking orc warrior',
            'tier': 'normal',
            'min_level': 10,
            'max_level': 24,
            'base_health': 40,
            'base_attack': 5,
            'loot_table': json.dumps({'gold': 20, 'iron_ore': 2}),
            'xp_reward': 30
        },
        # Strong tier
        {
            'name': 'Stone Ogre',
            'description': 'A massive ogre made of stone',
            'tier': 'strong',
            'min_level': 20,
            'max_level': 49,
            'base_health': 60,
            'base_attack': 7,
            'loot_table': json.dumps({'gold': 40, 'iron_ore': 3}),
            'xp_reward': 50
        },
        {
            'name': 'Fire Drake',
            'description': 'A drake whose breath ignites',
            'tier': 'strong',
            'min_level': 25,
            'max_level': 49,
            'base_health': 80,
            'base_attack': 9,
            'loot_table': json.dumps({'gold': 50, 'cloth': 3, 'iron_ore': 2}),
            'xp_reward': 60
        },
        # Boss tier
        {
            'name': 'Dark Lord',
            'description': 'The ultimate evil boss',
            'tier': 'boss',
            'min_level': 40,
            'max_level': 50,
            'base_health': 150,
            'base_attack': 12,
            'loot_table': json.dumps({'gold': 100}),
            'xp_reward': 150
        }
    ]
    
    for enemy_data in enemies_data:
        enemy = Enemy(**enemy_data)
        db.session.add(enemy)
    db.session.commit()

def seed_items_and_recipes():
    """Seed items and crafting recipes"""
    if Item.query.count() > 0:
        return  # Already seeded
    
    # Seed some basic items
    items_data = [
        {'name': 'Iron Sword', 'description': 'A sharp iron sword', 'item_type': 'weapon', 'rarity': 'uncommon', 'stat_bonus': '{"strength": 5}', 'sell_value': 50},
        {'name': 'Leather Armor', 'description': 'Basic leather protection', 'item_type': 'armor', 'rarity': 'common', 'stat_bonus': '{}', 'sell_value': 30},
        {'name': 'Health Potion', 'description': 'Restore 50 health', 'item_type': 'consumable', 'rarity': 'common', 'stat_bonus': '{}', 'sell_value': 10},
        {'name': 'Enchanted Blade', 'description': 'Magically enhanced sword', 'item_type': 'weapon', 'rarity': 'rare', 'stat_bonus': '{"strength": 10, "intelligence": 5}', 'sell_value': 100},
    ]
    
    for item_data in items_data:
        item = Item(**item_data)
        db.session.add(item)
    db.session.commit()
    
    # Seed recipes
    recipes_data = [
        {
            'name': 'Craft Iron Sword',
            'description': 'Craft a sword from iron ore and cloth',
            'result_item_id': 1,
            'result_quantity': 1,
            'ingredients': json.dumps({'iron_ore': 10, 'cloth': 5}),
            'crafting_time': 0,
            'min_level': 5
        },
        {
            'name': 'Craft Leather Armor',
            'description': 'Craft armor from leather and cloth',
            'result_item_id': 2,
            'result_quantity': 1,
            'ingredients': json.dumps({'leather': 15, 'cloth': 10}),
            'crafting_time': 0,
            'min_level': 3
        },
        {
            'name': 'Brew Health Potion',
            'description': 'Brew a potion from food and herbs',
            'result_item_id': 3,
            'result_quantity': 3,
            'ingredients': json.dumps({'food': 10, 'gold': 15}),
            'crafting_time': 0,
            'min_level': 1
        },
    ]
    
    for recipe_data in recipes_data:
        recipe = Recipe(**recipe_data)
        db.session.add(recipe)
    db.session.commit()

def seed_quests():
    """Seed daily quests"""
    if Quest.query.count() > 0:
        return  # Already seeded
    
    quests_data = [
        {
            'name': 'Goblin Slayer',
            'description': 'Defeat 5 goblins',
            'quest_type': 'daily',
            'reward_gold': 50,
            'reward_xp': 30,
            'requirement': 'defeat_enemies_5'
        },
        {
            'name': 'Lumber Jack',
            'description': 'Gather 500 wood',
            'quest_type': 'daily',
            'reward_gold': 40,
            'reward_xp': 25,
            'requirement': 'gather_wood_500'
        },
        {
            'name': 'Craftsman',
            'description': 'Craft 3 items',
            'quest_type': 'daily',
            'reward_gold': 60,
            'reward_xp': 35,
            'requirement': 'craft_3'
        },
        {
            'name': 'Builder',
            'description': 'Build 2 buildings',
            'quest_type': 'daily',
            'reward_gold': 45,
            'reward_xp': 30,
            'requirement': 'build_2'
        },
    ]
    
    for quest_data in quests_data:
        quest = Quest(**quest_data)
        db.session.add(quest)
    db.session.commit()

# Call seed on app startup
with app.app_context():
    seed_enemies()
    seed_items_and_recipes()
    seed_quests()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        user = User(username=request.form['username'],
                   email=request.form['email'])
        user.set_password(request.form['password'])
        
        resources = Resources(wood=100, stone=100, food=50, gold=50)
        buildings = Buildings(woodcutter=1, quarry=1, farm=1)
        stats = PlayerStats()

        user.resources = resources
        user.buildings = buildings
        user.stats = stats
        
        db.session.add(user)
        db.session.commit()
        
        login_user(user)
        return redirect(url_for('game'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form['username']).first()
        if user and user.check_password(request.form['password']):
            login_user(user)
            return redirect(url_for('game'))
        flash('Invalid username or password')
    return render_template('login.html')

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/game')
@login_required
def game():
    GameLogic.update_resources(current_user)
    db.session.commit()
    # compute dynamic costs based on current count and level
    costs = {
        'woodcutter': GameLogic.get_building_costs('woodcutter', current_user.buildings.woodcutter, current_user.buildings.woodcutter_level),
        'quarry': GameLogic.get_building_costs('quarry', current_user.buildings.quarry, current_user.buildings.quarry_level),
        'farm': GameLogic.get_building_costs('farm', current_user.buildings.farm, current_user.buildings.farm_level),
    }
    upgrade_costs = {
        'woodcutter': GameLogic.get_upgrade_costs('woodcutter', current_user.buildings.woodcutter_level),
        'quarry': GameLogic.get_upgrade_costs('quarry', current_user.buildings.quarry_level),
        'farm': GameLogic.get_upgrade_costs('farm', current_user.buildings.farm_level),
    }
    return render_template('game.html', costs=costs, upgrade_costs=upgrade_costs)


@app.route('/api/combat/start', methods=['POST'])
@login_required
def start_combat():
    """Initiate a new combat encounter"""
    enemy_state = GameLogic.start_combat(current_user)
    if not enemy_state:
        return jsonify({'success': False, 'message': 'No enemies found!'})
    
    # Store combat state in session for this encounter
    request.session = request.environ.get('beaker.session', {})
    request.session['combat_enemy'] = enemy_state
    request.session.save()
    
    return jsonify({
        'success': True,
        'enemy_name': enemy_state['name'],
        'enemy_health': enemy_state['health'],
        'enemy_max_health': enemy_state['max_health'],
        'player_health': current_user.stats.health,
        'player_max_health': current_user.stats.max_health,
        'message': f'A {enemy_state["name"]} appears!'
    })

@app.route('/api/combat/action', methods=['POST'])
@login_required
def combat_action():
    """Execute one round of combat"""
    data = request.get_json()
    action = data.get('action', 'attack')
    
    # For now, simple combat session stored in-memory (TODO: improve for production)
    # In production, store in Redis or DB
    combat_key = f"combat_{current_user.id}"
    
    enemy_state = GameLogic.start_combat(current_user)
    if not enemy_state:
        return jsonify({'success': False, 'message': 'Combat failed'})
    
    result = GameLogic.execute_combat_round(current_user, enemy_state, action)
    
    if result['battle_over']:
        if not result['success']:  # Player lost
            db.session.commit()
            return jsonify({
                'success': False,
                'battle_over': True,
                'log': result['round_log'],
                'player_health': current_user.stats.health,
                'enemy_health': result['enemy_health'],
                'message': 'You lost this battle!'
            })
        else:  # Player won
            rewards = GameLogic.resolve_combat_victory(current_user, enemy_state)
            db.session.commit()
            return jsonify({
                'success': True,
                'battle_over': True,
                'log': result['round_log'],
                'player_health': current_user.stats.health,
                'rewards': rewards,
                'message': f'Victory! You earned {rewards["gold"]} gold and {rewards["xp"]} XP!'
            })
    else:  # Combat continues
        db.session.commit()
        return jsonify({
            'success': True,
            'battle_over': False,
            'log': result['round_log'],
            'player_health': current_user.stats.health,
            'enemy_health': result['enemy_health'],
            'message': 'Combat continues...'
        })

@app.route('/api/adventure', methods=['POST'])
@login_required
def adventure():
    """Simple adventure mode (quick combat)"""
    enemy_state = GameLogic.start_combat(current_user)
    if not enemy_state:
        return jsonify({'success': False, 'message': 'No enemies found!'})
    
    # Simulate quick combat: 3 rounds or until enemy is dead
    combat_log = []
    for _ in range(3):
        result = GameLogic.execute_combat_round(current_user, enemy_state, 'attack')
        combat_log.extend(result['round_log'])
        
        if result['battle_over']:
            if not result['success']:  # Player lost
                db.session.commit()
                return jsonify({
                    'success': False,
                    'message': 'You were defeated!',
                    'log': combat_log
                })
            else:  # Player won
                rewards = GameLogic.resolve_combat_victory(current_user, enemy_state)
                db.session.commit()
                return jsonify({
                    'success': True,
                    'message': f'Victory! {rewards["gold"]} gold, {rewards["xp"]} XP',
                    'log': combat_log,
                    'rewards': rewards
                })
    
    # If we reach here, combat is ongoing (shouldn't happen in adventure mode)
    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Combat ongoing...',
        'log': combat_log
    })

@app.route('/api/recipes', methods=['GET'])
@login_required
def get_recipes():
    """Get all recipes player can craft"""
    recipes = Recipe.query.filter(Recipe.min_level <= current_user.stats.level).all()
    recipes_list = []
    
    for recipe in recipes:
        can_craft, msg = GameLogic.can_craft_recipe(current_user, recipe)
        recipes_list.append({
            'id': recipe.id,
            'name': recipe.name,
            'result': recipe.result_item.name,
            'quantity': recipe.result_quantity,
            'ingredients': json.loads(recipe.ingredients),
            'can_craft': can_craft,
            'status': msg
        })
    
    return jsonify({'recipes': recipes_list})

@app.route('/api/craft/<int:recipe_id>', methods=['POST'])
@login_required
def craft_recipe_endpoint(recipe_id):
    """Craft an item"""
    recipe = Recipe.query.get(recipe_id)
    if not recipe:
        return jsonify({'success': False, 'message': 'Recipe not found'})
    
    success, msg = GameLogic.craft_recipe(current_user, recipe)
    db.session.commit()
    
    return jsonify({'success': success, 'message': msg})

@app.route('/api/quests', methods=['GET'])
@login_required
def get_quests():
    """Get daily quests"""
    quests_data = GameLogic.get_daily_quests(current_user, db)
    
    available = []
    for quest in quests_data['available']:
        available.append({
            'id': quest.id,
            'name': quest.name,
            'description': quest.description,
            'reward_gold': quest.reward_gold,
            'reward_xp': quest.reward_xp
        })
    
    completed = []
    for quest in quests_data['completed']:
        completed.append({
            'id': quest.id,
            'name': quest.name,
            'description': quest.description
        })
    
    return jsonify({
        'available': available,
        'completed': completed
    })

@app.route('/api/quest/<int:quest_id>/complete', methods=['POST'])
@login_required
def complete_quest_endpoint(quest_id):
    """Mark a quest as completed"""
    quest = Quest.query.get(quest_id)
    if not quest:
        return jsonify({'success': False, 'message': 'Quest not found'})
    
    GameLogic.complete_quest(current_user, quest, db)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'Completed {quest.name}!',
        'reward_gold': quest.reward_gold,
        'reward_xp': quest.reward_xp
    })

@app.route('/subscribe')
@login_required
def subscribe():
    return render_template('subscribe.html')

@app.route('/create-checkout-session', methods=['POST'])
@login_required
def create_checkout_session():
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'Game Subscription',
                    },
                    'unit_amount': 299,
                },
                'quantity': 1,
            }],
            mode='subscription',
            success_url=url_for('game', _external=True),
            cancel_url=url_for('subscribe', _external=True),
        )
        return jsonify({'id': checkout_session.id})
    except Exception as e:
        return jsonify({'error': str(e)}), 403

@app.route('/webhook', methods=['POST'])
def webhook():
    event = None
    payload = request.data
    sig_header = request.headers['STRIPE_SIGNATURE']

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, app.config['STRIPE_WEBHOOK_SECRET']
        )
    except ValueError as e:
        return '', 400
    except stripe.error.SignatureVerificationError as e:
        return '', 400

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        customer_email = session['customer_details']['email']
        user = User.query.filter_by(email=customer_email).first()
        if user:
            user.is_subscribed = True
            user.subscription_end = datetime.utcnow() + timedelta(days=30)
            db.session.commit()

    return ''

@app.route('/api/gather/<resource_type>', methods=['POST'])
@login_required
def gather_resource(resource_type):
    if resource_type in ['wood', 'stone', 'food']:
        GameLogic.add_manual_resource(current_user.resources, resource_type)
        db.session.commit()
        # Return the updated count
        amount = getattr(current_user.resources, resource_type)
        return jsonify({'success': True, 'new_amount': amount})
    return jsonify({'success': False, 'message': 'Invalid resource type'})

@app.route('/api/build/<building_type>', methods=['POST'])
@login_required
def build(building_type):
    # determine current count and level for cost calculation
    current_count = 0
    current_level = 1
    if building_type == 'woodcutter':
        current_count = current_user.buildings.woodcutter
        current_level = current_user.buildings.woodcutter_level
    elif building_type == 'quarry':
        current_count = current_user.buildings.quarry
        current_level = current_user.buildings.quarry_level
    elif building_type == 'farm':
        current_count = current_user.buildings.farm
        current_level = current_user.buildings.farm_level

    if GameLogic.can_afford_building(current_user.resources, building_type, current_count, current_level):
        costs = GameLogic.get_building_costs(building_type, current_count, current_level)
        current_user.resources.wood -= costs.get('wood', 0)
        current_user.resources.stone -= costs.get('stone', 0)
        
        if building_type == 'woodcutter':
            current_user.buildings.woodcutter += 1
        elif building_type == 'quarry':
            current_user.buildings.quarry += 1
        elif building_type == 'farm':
            current_user.buildings.farm += 1

        GameLogic.award_experience(current_user, GameLogic.EXPERIENCE_PER_BUILDING)
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Not enough resources'})

@app.route('/api/upgrade/<building_type>', methods=['POST'])
@login_required
def upgrade_building(building_type):
    current_level = 1
    if building_type == 'woodcutter':
        current_level = current_user.buildings.woodcutter_level
    elif building_type == 'quarry':
        current_level = current_user.buildings.quarry_level
    elif building_type == 'farm':
        current_level = current_user.buildings.farm_level
    else:
        return jsonify({'success': False, 'message': 'Invalid building type'})

    if GameLogic.can_afford_upgrade(current_user.resources, building_type, current_level):
        costs = GameLogic.get_upgrade_costs(building_type, current_level)
        current_user.resources.wood -= costs.get('wood', 0)
        current_user.resources.stone -= costs.get('stone', 0)

        if building_type == 'woodcutter':
            current_user.buildings.woodcutter_level += 1
        elif building_type == 'quarry':
            current_user.buildings.quarry_level += 1
        elif building_type == 'farm':
            current_user.buildings.farm_level += 1

        GameLogic.award_experience(current_user, GameLogic.EXPERIENCE_PER_BUILDING)
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Not enough resources'})

@app.route('/api/hunt', methods=['POST'])
@login_required
def hunt():
    if GameLogic.can_hunt(current_user.resources):
        if GameLogic.perform_hunt(current_user):
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Hunt successful! You gained food, leather and XP.'
            })
    return jsonify({
        'success': False,
        'message': 'Hunting is on cooldown'
    })