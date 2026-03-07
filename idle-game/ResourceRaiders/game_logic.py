from datetime import datetime, timedelta
from models import Resources, Buildings

class GameLogic:
    BASE_GENERATION_RATE = {
        'wood': 1,
        'stone': 1,
        'food': 1
    }

    PRODUCTION_LEVEL_MULTIPLIER = 1.3  # milder growth per level
    COST_LEVEL_MULTIPLIER = 1.3
    HUNTING_COOLDOWN = 60  # Seconds between hunts
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
    def get_building_costs(building_type, current_level):
        base_costs = {
            'woodcutter': {'wood': 50, 'stone': 30},
            'quarry': {'wood': 30, 'stone': 50},
            'farm': {'wood': 40, 'stone': 40}
        }

        # Costs increase moderately per level
        level_multiplier = GameLogic.COST_LEVEL_MULTIPLIER ** (current_level - 1)
        costs = base_costs.get(building_type, {})
        return {
            resource: max(1, int(amount * level_multiplier))
            for resource, amount in costs.items()
        }

    @staticmethod
    def get_upgrade_costs(building_type, current_level):
        # Upgrade costs are 2x the building costs at the current level
        base_costs = GameLogic.get_building_costs(building_type, current_level)
        return {
            resource: amount * 2
            for resource, amount in base_costs.items()
        }

    @staticmethod
    def can_afford_building(resources, building_type, current_level=1):
        costs = GameLogic.get_building_costs(building_type, current_level)
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
            # simple combat simulation against wild animal
            resources.food += 2
            resources.leather += 1
            resources.last_hunt = datetime.utcnow()
            GameLogic.award_experience(user, 5)
            return True
        return False

    # combat helper for future use
    @staticmethod
    def attack_enemy(user, enemy):
        # naive combat: subtract strength from enemy health and enemy attack from user health
        if user.stats.health <= 0:
            return {'success': False, 'message': 'You are too weak to fight.'}
        enemy.health -= user.stats.strength
        user.stats.health -= enemy.attack
        if enemy.health <= 0:
            # TODO: loot handling
            GameLogic.award_experience(user, 20)
            return {'success': True, 'message': 'Enemy defeated!'}
        if user.stats.health <= 0:
            user.stats.health = 1
            return {'success': False, 'message': 'You were wounded and escaped.'}
        return {'success': True, 'message': 'You hit the enemy!'}

    @staticmethod
    def add_manual_resource(resources, resource_type):
        if resource_type == 'wood':
            resources.wood += 1
        elif resource_type == 'stone':
            resources.stone += 1
        elif resource_type == 'food':
            resources.food += 1