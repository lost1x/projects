from datetime import datetime, timedelta
from models import Resources, Buildings, Enemy
import json
import random

class GameLogic:
    BASE_GENERATION_RATE = {
        'wood': 1,
        'stone': 1,
        'food': 1
    }

    PRODUCTION_LEVEL_MULTIPLIER = 1.3  # milder growth per level
    COST_LEVEL_MULTIPLIER = 1.25  # even gentler cost growth (was 1.3)
    HUNTING_COOLDOWN = 30  # Seconds between hunts (faster to keep players engaged)
    EXPERIENCE_PER_BUILDING = 10


    @staticmethod
    def calculate_resource_generation(buildings, is_subscribed=False):
        # Calculate base generation rates with level multipliers
        generation = {
            'wood': buildings.woodcutter * GameLogic.BASE_GENERATION_RATE['wood'] * 
                   (GameLogic.PRODUCTION_LEVEL_MULTIPLIER ** (buildings.woodcutter_level - 1)),
            'stone': buildings.quarry * GameLogic.BASE_GENERATION_RATE['stone'] * 
                    (GameLogic.PRODUCTION_LEVEL_MULTIPLIER ** (buildings.quarry_level - 1)),
            'food': buildings.farm * GameLogic.BASE_GENERATION_RATE['food'] * 
                   (GameLogic.PRODUCTION_LEVEL_MULTIPLIER ** (buildings.farm_level - 1))
        }

        # Apply subscription multiplier if subscribed
        if is_subscribed:
            generation = {k: v * 2 for k, v in generation.items()}

        return generation

    @staticmethod
    def update_resources(user):
        now = datetime.utcnow()
        time_diff = (now - user.resources.last_update).total_seconds()

        # Calculate generation with subscription status
        generation_rates = GameLogic.calculate_resource_generation(
            user.buildings, 
            user.is_subscribed
        )

        # Update resources based on time passed
        user.resources.wood += int(generation_rates['wood'] * time_diff)
        user.resources.stone += int(generation_rates['stone'] * time_diff)
        user.resources.food += int(generation_rates['food'] * time_diff)
        user.resources.last_update = now

    @staticmethod
    def get_building_costs(building_type, current_count, current_level=1):
        # Free to build the first building of each type
        if current_count == 0:
            return {'wood': 0, 'stone': 0}
        
        base_costs = {
            'woodcutter': {'wood': 25, 'stone': 15},
            'quarry': {'wood': 15, 'stone': 25},
            'farm': {'wood': 20, 'stone': 20}
        }

        # Costs increase at 1.25x per additional building, then apply level multiplier
        building_multiplier = GameLogic.COST_LEVEL_MULTIPLIER ** (current_count - 1)
        level_multiplier = GameLogic.COST_LEVEL_MULTIPLIER ** (current_level - 1)
        combined_multiplier = building_multiplier * level_multiplier
        
        costs = base_costs.get(building_type, {})
        return {
            resource: max(1, int(amount * combined_multiplier))
            for resource, amount in costs.items()
        }

    @staticmethod
    def get_upgrade_costs(building_type, current_level):
        # Upgrade costs are 2x the building costs at current count=1 (for scaling reference)
        # Use count=1 as baseline since upgrades don't depend on building count, just level
        base_costs = GameLogic.get_building_costs(building_type, 1, current_level)
        return {
            resource: amount * 2
            for resource, amount in base_costs.items()
        }

    @staticmethod
    def can_afford_building(resources, building_type, current_count, current_level=1):
        costs = GameLogic.get_building_costs(building_type, current_count, current_level)
        return (resources.wood >= costs.get('wood', 0) and 
                resources.stone >= costs.get('stone', 0))

    @staticmethod
    def award_experience(user, amount):
        if hasattr(user, 'stats') and user.stats:
            user.stats.gain_experience(amount)


    @staticmethod
    def can_afford_upgrade(resources, building_type, current_level):
        costs = GameLogic.get_upgrade_costs(building_type, current_level)
        return (resources.wood >= costs.get('wood', 0) and 
                resources.stone >= costs.get('stone', 0))

    @staticmethod
    def can_hunt(resources):
        now = datetime.utcnow()
        return (now - resources.last_hunt).total_seconds() >= GameLogic.HUNTING_COOLDOWN

    @staticmethod
    def perform_hunt(user):
        resources = user.resources
        if GameLogic.can_hunt(resources):
            # hunting gives food, materials, and gold
            resources.food += 3
            resources.leather += 2
            resources.cloth += 1
            resources.gold += 10  # small gold reward for hunting
            resources.last_hunt = datetime.utcnow()
            GameLogic.award_experience(user, 5)
            return True
        return False

    # Multi-round combat system
    @staticmethod
    def start_combat(user):
        """Start a combat encounter and return enemy"""
        # Pick enemy based on player level
        player_level = user.stats.level
        # Enemies get harder as player levels
        if player_level < 10:
            enemies = Enemy.query.filter(Enemy.tier == 'weak').all()
        elif player_level < 25:
            enemies = Enemy.query.filter(Enemy.tier.in_(['weak', 'normal'])).all()
        elif player_level < 50:
            enemies = Enemy.query.filter(Enemy.tier.in_(['normal', 'strong'])).all()
        else:
            enemies = Enemy.query.all()
        
        if not enemies:
            return None
        
        enemy = random.choice(enemies)
        # Scale enemy stats to player level
        level_diff = max(1, player_level - enemy.min_level)
        enemy_health = int(enemy.base_health * (1.1 ** level_diff))
        enemy_attack = int(enemy.base_attack * (1.05 ** level_diff))
        
        return {
            'id': enemy.id,
            'name': enemy.name,
            'health': enemy_health,
            'max_health': enemy_health,
            'attack': enemy_attack,
            'xp_reward': enemy.xp_reward + (level_diff * 2),
            'loot_table': json.loads(enemy.loot_table)
        }
    
    @staticmethod
    def execute_combat_round(user, enemy_state, player_action='attack'):
        """Execute one round of combat. Returns round result and updated enemy state."""
        # Player attack
        player_damage = max(1, user.stats.strength + random.randint(-2, 3))
        enemy_state['health'] -= player_damage
        
        combat_log = [f"You attack for {player_damage} damage!"]
        
        # Check if enemy is dead
        if enemy_state['health'] <= 0:
            combat_log.append(f"{enemy_state['name']} has been defeated!")
            return {
                'success': True,
                'round_log': combat_log,
                'enemy_alive': False,
                'enemy_health': 0,
                'battle_over': True
            }
        
        # Enemy counter-attack
        enemy_damage = max(1, enemy_state['attack'] + random.randint(-1, 2))
        user.stats.health -= enemy_damage
        combat_log.append(f"{enemy_state['name']} attacks for {enemy_damage} damage!")
        
        # Check if player died
        if user.stats.health <= 0:
            user.stats.health = 1  # Don't let them die, just leave with 1 HP
            combat_log.append("You were defeated and fled!")
            return {
                'success': False,
                'round_log': combat_log,
                'enemy_alive': True,
                'enemy_health': enemy_state['health'],
                'battle_over': True,
                'player_health': user.stats.health
            }
        
        # Battle continues
        return {
            'success': True,
            'round_log': combat_log,
            'enemy_alive': True,
            'enemy_health': enemy_state['health'],
            'player_health': user.stats.health,
            'battle_over': False
        }
    
    @staticmethod
    def resolve_combat_victory(user, enemy_state):
        """Handle rewards when enemy is defeated"""
        # Base rewards from loot table
        loot = enemy_state['loot_table']
        
        if isinstance(loot, dict):
            user.resources.gold += loot.get('gold', 10)
            if 'cloth' in loot:
                user.resources.cloth += loot.get('cloth', 1)
            if 'leather' in loot:
                user.resources.leather += loot.get('leather', 1)
            if 'iron_ore' in loot:
                user.resources.iron_ore += loot.get('iron_ore', 1)
        
        # Award XP
        GameLogic.award_experience(user, enemy_state['xp_reward'])
        
        return {
            'gold': loot.get('gold', 10) if isinstance(loot, dict) else 10,
            'xp': enemy_state['xp_reward']
        }


    @staticmethod
    def add_manual_resource(resources, resource_type):
        if resource_type == 'wood':
            resources.wood += 1
        elif resource_type == 'stone':
            resources.stone += 1
        elif resource_type == 'food':
            resources.food += 1

    # Crafting system
    @staticmethod
    def can_craft_recipe(user, recipe):
        """Check if player has all materials and meets level requirement"""
        if user.stats.level < recipe.min_level:
            return False, f"Requires level {recipe.min_level}"
        
        ingredients = json.loads(recipe.ingredients)
        for resource, amount in ingredients.items():
            current = getattr(user.resources, resource, 0)
            if current < amount:
                return False, f"Need {amount} {resource}, have {current}"
        
        return True, "Can craft"
    
    @staticmethod
    def craft_recipe(user, recipe):
        """Execute crafting and consume ingredients"""
        can_craft, msg = GameLogic.can_craft_recipe(user, recipe)
        if not can_craft:
            return False, msg
        
        # Consume ingredients
        ingredients = json.loads(recipe.ingredients)
        for resource, amount in ingredients.items():
            current = getattr(user.resources, resource, 0)
            setattr(user.resources, resource, current - amount)
        
        # Award XP for crafting
        GameLogic.award_experience(user, 5)
        
        return True, f"Crafted {recipe.result_quantity}x {recipe.result_item.name}"
    
    # Quest system
    @staticmethod
    def get_daily_quests(user, db):
        """Get today's available quests"""
        today = datetime.utcnow().date()
        from models import CompletedQuest, Quest as QuestModel
        
        completed_today = db.session.query(CompletedQuest).filter(
            CompletedQuest.user_id == user.id,
            db.func.date(CompletedQuest.completed_at) == today
        ).all()
        completed_ids = set(q.quest_id for q in completed_today)
        
        quests = db.session.query(QuestModel).filter(
            QuestModel.quest_type == 'daily'
        ).all()
        
        return {
            'available': [q for q in quests if q.id not in completed_ids],
            'completed': [q for q in quests if q.id in completed_ids]
        }
    
    @staticmethod
    def complete_quest(user, quest, db):
        """Mark a quest as completed and award rewards"""
        from models import CompletedQuest
        
        db.session.add(CompletedQuest(user_id=user.id, quest_id=quest.id))
        user.resources.gold += quest.reward_gold
        GameLogic.award_experience(user, quest.reward_xp)
        return True