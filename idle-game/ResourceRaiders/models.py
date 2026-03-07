from datetime import datetime
from app import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    is_subscribed = db.Column(db.Boolean, default=False)
    subscription_end = db.Column(db.DateTime)
    resources = db.relationship('Resources', backref='user', uselist=False)
    buildings = db.relationship('Buildings', backref='user', uselist=False)
    stats = db.relationship('PlayerStats', backref='user', uselist=False)
    inventory_items = db.relationship('Inventory', backref='user')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Resources(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    wood = db.Column(db.Integer, default=0)
    stone = db.Column(db.Integer, default=0)
    food = db.Column(db.Integer, default=0)
    leather = db.Column(db.Integer, default=0)
    last_update = db.Column(db.DateTime, default=datetime.utcnow)
    last_hunt = db.Column(db.DateTime, default=datetime.utcnow)

class Buildings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    woodcutter = db.Column(db.Integer, default=0)
    woodcutter_level = db.Column(db.Integer, default=1)
    quarry = db.Column(db.Integer, default=0)
    quarry_level = db.Column(db.Integer, default=1)
    farm = db.Column(db.Integer, default=0)
    farm_level = db.Column(db.Integer, default=1)


# new models for RPG expansion
class PlayerStats(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    level = db.Column(db.Integer, default=1)
    experience = db.Column(db.Integer, default=0)
    health = db.Column(db.Integer, default=100)
    max_health = db.Column(db.Integer, default=100)
    strength = db.Column(db.Integer, default=5)
    agility = db.Column(db.Integer, default=5)
    intelligence = db.Column(db.Integer, default=5)

    def gain_experience(self, amount):
        self.experience += amount
        # simple level up formula: 100xp per level
        while self.experience >= self.level * 100:
            self.experience -= self.level * 100
            self.level += 1
            self.max_health += 10
            self.health = self.max_health


class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    type = db.Column(db.String(50))  # e.g. "weapon", "armor", "consumable"
    rarity = db.Column(db.String(20), default="common")
    # simple stat bonuses stored as JSON string for flexibility
    bonuses = db.Column(db.String(255))
    base_value = db.Column(db.Integer, default=0)


class Inventory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'))
    quantity = db.Column(db.Integer, default=1)
    item = db.relationship('Item')


class Enemy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    health = db.Column(db.Integer, default=50)
    attack = db.Column(db.Integer, default=5)
    loot = db.Column(db.String(255))  # JSON list of (item_id, chance)


class Quest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    reward_wood = db.Column(db.Integer, default=0)
    reward_stone = db.Column(db.Integer, default=0)
    reward_food = db.Column(db.Integer, default=0)
    reward_xp = db.Column(db.Integer, default=0)
    requirement = db.Column(db.String(255))  # simple text requirement
